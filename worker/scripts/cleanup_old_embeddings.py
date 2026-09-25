#!/usr/bin/env python3
"""
Delete job embeddings older than DAYS_TO_KEEP from Qdrant.

  cd worker
  python scripts/cleanup_old_embeddings.py
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client.http import models

WORKER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKER_ROOT))
load_dotenv(WORKER_ROOT / ".env")

from utils.qdrant_service import client, COLLECTION_NAME

DAYS_TO_KEEP = 7
BATCH_SIZE = 256


def is_older_than_cutoff(date_value, cutoff):
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


def cleanup_old_embeddings():
    if not COLLECTION_NAME:
        print("QDRANT_COLLECTION is not set")
        return

    cutoff = datetime.utcnow() - timedelta(days=DAYS_TO_KEEP)
    offset = None
    total_checked = 0
    total_deleted = 0

    while True:
        points, offset = client.scroll(
            collection_name=COLLECTION_NAME,
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
            date_value = payload.get("date")
            if is_older_than_cutoff(date_value, cutoff):
                ids_to_delete.append(point.id)

        if ids_to_delete:
            client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.PointIdsList(points=ids_to_delete),
            )
            total_deleted += len(ids_to_delete)
            print(f"Deleted {len(ids_to_delete)} points in this batch")

        if offset is None:
            break

    print(f"Checked {total_checked} points")
    print(f"Deleted {total_deleted} points older than {DAYS_TO_KEEP} days")


if __name__ == "__main__":
    cleanup_old_embeddings()
