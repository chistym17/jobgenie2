#!/usr/bin/env python3
"""
Mark all existing Mongo jobs as already ingested into Qdrant.

Use once after deploying incremental ingest, when jobs are already in Qdrant
but missing the qdrant_ingested flag.

  cd worker
  python scripts/backfill_qdrant_ingested_flag.py
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

WORKER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKER_ROOT))
load_dotenv(WORKER_ROOT / ".env")

from db import get_mongodb_client


def main() -> int:
    client = get_mongodb_client()
    try:
        collection = client["jobs_db"]["jobs"]
        now = datetime.now(timezone.utc).isoformat()
        result = collection.update_many(
            {
                "$or": [
                    {"qdrant_ingested": {"$exists": False}},
                    {"qdrant_ingested": False},
                ]
            },
            {
                "$set": {
                    "qdrant_ingested": True,
                    "qdrant_ingested_at": now,
                    "qdrant_ingested_backfill": True,
                }
            },
        )
        print(f"matched={result.matched_count} modified={result.modified_count}")
        remaining = collection.count_documents(
            {
                "$or": [
                    {"qdrant_ingested": {"$exists": False}},
                    {"qdrant_ingested": False},
                ]
            }
        )
        print(f"still_pending={remaining}")
        return 0
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
