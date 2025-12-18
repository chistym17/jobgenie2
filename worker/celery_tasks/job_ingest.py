from celery_app import celery_app
from job_processor import JobProcessor
import asyncio


@celery_app.task(name="process_jobs_to_qdrant")
def process_jobs_to_qdrant():
    processor = JobProcessor()
    asyncio.run(processor.process_and_upload_jobs())



