#!/usr/bin/env python3
"""
Initialize Qdrant collections used by Job Genie:
  - job_embeddings (or QDRANT_COLLECTION)
  - resume_embeddings

Both: vector size 384, Cosine distance.
Safe to re-run: skips collections that already exist.

  cd worker
  python scripts/init_qdrant_collections.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

WORKER_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(WORKER_ROOT / ".env")

VECTOR_SIZE = 384


def ensure_collection(client: QdrantClient, name: str) -> None:
    existing = {c.name for c in client.get_collections().collections}
    if name in existing:
        info = client.get_collection(name)
        print(f"OK  exists  '{name}' (points={info.points_count})")
        return

    client.create_collection(
        collection_name=name,
        vectors_config=models.VectorParams(
            size=VECTOR_SIZE,
            distance=models.Distance.COSINE,
        ),
    )
    print(f"OK  created '{name}' (size={VECTOR_SIZE}, distance=cosine)")


def main() -> int:
    url = (os.getenv("QDRANT_URL") or "").strip()
    api_key = (os.getenv("QDRANT_API_KEY") or "").strip()
    job_collection = (os.getenv("QDRANT_COLLECTION") or "job_embeddings").strip()

    if not url:
        print("ERROR: QDRANT_URL is not set in .env")
        return 1
    if not api_key:
        print("ERROR: QDRANT_API_KEY is not set in .env")
        return 1

    print(f"Connecting to {url} ...")
    client = QdrantClient(url=url, api_key=api_key)

    try:
        cols = client.get_collections()
        print(f"Connected. Existing: {[c.name for c in cols.collections]}")
    except Exception as e:
        print(f"ERROR: connection failed: {e}")
        return 1

    ensure_collection(client, job_collection)
    ensure_collection(client, "resume_embeddings")

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
