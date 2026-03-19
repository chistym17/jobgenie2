import time
from datetime import datetime
import asyncio
from typing import Dict, List
import os
from dotenv import load_dotenv

from db import fetch_all_jobs
from utils.crawler import JobCrawler
from utils.local_embedder import get_embedding
from utils.qdrant_service import init_collection, insert_document
from domain.jobs.manual_parser import manual_parse_job

load_dotenv()

REQUESTS_PER_MINUTE = 2
MINUTE = 60
RATE_LIMIT_DELAY = 30


class JobProcessor:
    def __init__(self):
        self.crawler = JobCrawler()
        self.processed_jobs = []
        self.failed_jobs = []
        self.start_time = None
        self.end_time = None

    def _log(self, message: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {message}")

    def _create_embedding(self, job_data: Dict) -> List[float]:
        title = str(job_data.get("title", "") or "")
        desc = str(job_data.get("description", "") or "")
        text_to_embed = f"{title}\n{desc}".strip()

        try:
            max_chars = int(os.getenv("JOB_EMBED_MAX_CHARS", "6000"))
        except Exception:
            max_chars = 6000
        max_chars = max(500, min(50000, max_chars))
        if len(text_to_embed) > max_chars:
            text_to_embed = text_to_embed[: max_chars - 1] + "…"

        embedding = get_embedding(text_to_embed)
        if not embedding:
            self._log("Failed to get embedding")
            return []

        return embedding

    async def process_job(self, job: Dict) -> None:
        job_title = job.get('title', 'Unknown')

        self._log(f"Starting to process job: {job_title}")

        try:
            self._log(f"Scraping URL: {job['url']}")
            scrape_result = self.crawler.scrape_job_details(job['url'])

            if not scrape_result:
                self._log(f"Failed to scrape job: {job_title}")
                self.failed_jobs.append({
                    'title': job_title,
                    'error': 'Scraping failed'
                })
                return

            processed_data = manual_parse_job(
                scrape_result,
                fallback_title=str(job.get("title", "") or ""),
                fallback_company=str(job.get("company", "") or ""),
                fallback_url=str(job.get("url", "") or ""),
            )
            if not processed_data:
                self._log(f"Skipping job (feed/gated/too-short): {job_title}")
                self.failed_jobs.append({
                    'title': job_title,
                    'error': 'Skipped (feed/gated/too-short scrape)'
                })
                return

            self._log(f"Creating embedding for: {job_title}")
            embedding = self._create_embedding(processed_data)

            if not embedding:
                self._log(f"Failed to create embedding for: {job_title}")
                self.failed_jobs.append({
                    'title': job_title,
                    'error': 'Embedding failed'
                })
                return

            self._log(f"Uploading to Qdrant: {job_title}")
            init_collection()
            try:
                job_id = job.get('id') or str(job.get('_id', ''))
                payload = {
                    'title': processed_data.get("title") or job_title,
                    'content': processed_data,
                    'job_id': job_id,
                    'url': job.get('url', ''),
                    'company': job.get('company', ''),
                    'date': job.get('date', '')
                }

                qdrant_id = hash(str(job.get('id') or job.get('url') or job_title)) % 1000000

                insert_document(
                    id=qdrant_id,
                    embedding=embedding,
                    payload=payload
                )

                self.processed_jobs.append({
                    'title': job_title,
                    'data': processed_data
                })
            except Exception as e:
                self._log(f"Failed to upload to Qdrant for {job_title}: {str(e)}")
                self.failed_jobs.append({
                    'title': job_title,
                    'error': f'Qdrant upload failed: {str(e)}'
                })

        except Exception as e:
            self._log(f"Error processing job {job_title}: {str(e)}")
            self.failed_jobs.append({
                'title': job_title,
                'error': str(e)
            })

        time.sleep(RATE_LIMIT_DELAY)

    async def process_and_upload_jobs(self) -> None:
        self.start_time = datetime.now()
        self._log("Starting job processing pipeline...")

        try:
            jobs = fetch_all_jobs()
            self._log(f"Found {len(jobs)} jobs in MongoDB")

            jobs_to_process = jobs
            self._log(f"Processing first {len(jobs_to_process)} jobs for testing")

            for job in jobs_to_process:
                await self.process_job(job)

        except Exception as e:
            self._log(f"Pipeline failed with error: {str(e)}")
        finally:
            self.end_time = datetime.now()
            self._log(\"\\nPipeline Summary:\")
            self._log(f\"Total jobs processed: {len(self.processed_jobs)}\")
            self._log(f\"Total jobs failed: {len(self.failed_jobs)}\")
            self._log(f\"Total time taken: {self.end_time - self.start_time}\")


def main():
    processor = JobProcessor()
    asyncio.run(processor.process_and_upload_jobs())

