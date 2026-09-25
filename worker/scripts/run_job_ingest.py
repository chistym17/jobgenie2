#!/usr/bin/env python3
"""
Enqueue Celery job-ingest task (local JOB_RUNNER=celery).

  cd worker
  python scripts/run_job_ingest.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

WORKER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKER_ROOT))
load_dotenv(WORKER_ROOT / ".env")

from celery_tasks.job_ingest import process_jobs_to_qdrant


def main():
    task = process_jobs_to_qdrant.delay()
    print(f"Enqueued job ingestion task with id={task.id}")


if __name__ == "__main__":
    main()
