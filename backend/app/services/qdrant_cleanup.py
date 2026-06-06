from __future__ import annotations

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

DAYS_TO_KEEP = 7
BATCH_SIZE = 256


def _get_client() -> QdrantClient:
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )


def _collection_name() -> str | None:
    return os.getenv("QDRANT_COLLECTION")


def _is_older_than_cutoff(date_value, cutoff: datetime) -> bool:
    if not date_value:
        return False
    try:
        if isinstance(date_value, (int, float)):
            dt = datetime.fromtimestamp(date_value)
        else:
            text = str(date_value)
            try:
                dt = datetime.fromisoformat(text)
            except ValueError:
                dt = datetime.fromisoformat(text[:10])
        return dt < cutoff
    except Exception:
        return False


def cleanup_old_qdrant_embeddings(days_to_keep: int = DAYS_TO_KEEP) -> dict:
    collection = _collection_name()
    if not collection:
        return {"error": "QDRANT_COLLECTION is not set", "checked": 0, "deleted": 0}

    client = _get_client()
    cutoff = datetime.utcnow() - timedelta(days=days_to_keep)
    offset = None
    total_checked = 0
    total_deleted = 0

    while True:
        points, offset = client.scroll(
            collection_name=collection,
            limit=BATCH_SIZE,
            offset=offset,
            with_payload=True,
            with_vectors=False,
        )

        if not points:
            break

        ids_to_delete = []
        for point in points:
            total_checked += 1
            payload = point.payload or {}
            if _is_older_than_cutoff(payload.get("date"), cutoff):
                ids_to_delete.append(point.id)

        if ids_to_delete:
            client.delete(
                collection_name=collection,
                points_selector=models.PointIdsList(points=ids_to_delete),
            )
            total_deleted += len(ids_to_delete)

        if offset is None:
            break

    return {
        "collection": collection,
        "days_to_keep": days_to_keep,
        "checked": total_checked,
        "deleted": total_deleted,
    }
