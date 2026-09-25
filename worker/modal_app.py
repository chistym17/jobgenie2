"""
Modal app for JobGenie background jobs (prod only).

Local still uses Celery. Deploy with:
  modal deploy modal_app.py

Test warmup:
  modal run modal_app.py
"""
from __future__ import annotations

import modal

APP_NAME = "jobgenie-worker"
SECRET_NAME = "jobgenie-worker-secrets"

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "python-dotenv",
        "pymongo",
        "qdrant-client",
        "openai",
        "numpy",
        "cohere",
        "PyPDF2",
        "requests",
        "rank-bm25",
        "firecrawl-py",
        "beautifulsoup4",
        "fake-useragent",
        "celery",
        "redis",
        "json-repair",
    )
    .add_local_dir(
        ".",
        remote_path="/root/worker",
        ignore=[
            "venv",
            ".venv",
            "__pycache__",
            ".env",
            "*.pyc",
            ".git",
            "scripts",
        ],
    )
)

app = modal.App(APP_NAME, image=image)
secrets = [modal.Secret.from_name(SECRET_NAME)]

# Inside Modal containers, always enqueue follow-up jobs via Modal
_modal_env = {"JOB_RUNNER": "modal", "APP_ENV": "prod"}


def _prepare_path() -> None:
    import sys

    if "/root/worker" not in sys.path:
        sys.path.insert(0, "/root/worker")


@app.function(
    secrets=secrets,
    env=_modal_env,
    timeout=120,
    memory=1024,
)
def warmup() -> dict:
    """Cheap wake-up: ping Mongo + Qdrant."""
    _prepare_path()
    import os

    from db import get_mongodb_client
    from utils.qdrant_service import check_qdrant_connection, list_collections

    mongo_ok = False
    qdrant_ok = False
    collections: list[str] = []

    client = get_mongodb_client()
    try:
        client.admin.command("ping")
        mongo_ok = True
    finally:
        client.close()

    qdrant_ok = bool(check_qdrant_connection())
    if qdrant_ok:
        collections = list_collections() or []

    return {
        "ok": mongo_ok and qdrant_ok,
        "app_env": os.getenv("APP_ENV"),
        "job_runner": os.getenv("JOB_RUNNER"),
        "mongo_ok": mongo_ok,
        "qdrant_ok": qdrant_ok,
        "qdrant_collections": collections,
    }


@app.function(
    secrets=secrets,
    env=_modal_env,
    timeout=60 * 10,
    memory=2048,
    retries=2,
)
def parse_resume_v2(upload_id: str, file_id: str, user_email: str):
    _prepare_path()
    from celery_tasks.parse_resume_v2 import parse_resume_v2 as task

    return task.run(upload_id, file_id, user_email)


@app.function(
    secrets=secrets,
    env=_modal_env,
    timeout=60 * 10,
    memory=2048,
    retries=2,
)
def precompute_resume_embedding(user_email: str, upload_id: str | None = None):
    _prepare_path()
    from celery_tasks.precompute_embedding import precompute_resume_embedding_task as task

    return task.run(user_email, upload_id)


@app.function(
    secrets=secrets,
    env=_modal_env,
    timeout=60 * 15,
    memory=2048,
    retries=1,
)
def generate_recommendations(
    user_email: str,
    upload_id: str | None = None,
    force_refresh: bool = False,
):
    _prepare_path()
    from celery_tasks.recommendation_task import generate_recommendations_task as task

    return task.run(user_email, upload_id, force_refresh)


@app.function(
    secrets=secrets,
    env=_modal_env,
    timeout=60 * 60,
    memory=2048,
    retries=1,
)
def process_jobs_to_qdrant():
    _prepare_path()
    from celery_tasks.job_ingest import process_jobs_to_qdrant as task

    return task.run()


@app.local_entrypoint()
def main() -> None:
    print("Running warmup on Modal...")
    result = warmup.remote()
    print(result)
