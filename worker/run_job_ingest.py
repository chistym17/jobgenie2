import os
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

from celery_tasks.job_ingest import process_jobs_to_qdrant


def main():
    task = process_jobs_to_qdrant.delay()
    print(f"Enqueued job ingestion task with id={task.id}")


if __name__ == "__main__":
    main()



