"""
Backend job dispatcher: Celery (local) vs Modal (prod).

Set JOB_RUNNER=celery|modal (default celery).
For Modal, also set MODAL_TOKEN_ID + MODAL_TOKEN_SECRET on the API host.
"""
from __future__ import annotations

import os
import uuid
from typing import Any

from pathlib import Path

from dotenv import load_dotenv

# Always load backend/.env (not cwd-dependent)
load_dotenv(Path(__file__).resolve().parents[3] / ".env")
load_dotenv()  # also allow cwd overrides



def job_runner() -> str:
    return (os.getenv("JOB_RUNNER") or "celery").strip().lower()


def _modal_spawn(function_name: str, *args: Any) -> str:
    try:
        import modal
    except ImportError as e:
        raise RuntimeError(
            "JOB_RUNNER=modal but the 'modal' package is not installed in the backend env. "
            "Run: pip install modal"
        ) from e

    fn = modal.Function.from_name("jobgenie-worker", function_name)
    call = fn.spawn(*args)
    return getattr(call, "object_id", None) or str(call)


def enqueue_parse_resume(upload_id: str, file_id: str, user_email: str) -> str:
    if job_runner() == "modal":
        return _modal_spawn("parse_resume_v2", upload_id, file_id, user_email)

    from app.config.v2.celery_client import celery_client

    task = celery_client.send_task(
        "parse_resume_v2",
        args=[upload_id, file_id, user_email],
    )
    return task.id


def enqueue_generate_recommendations(
    user_email: str,
    upload_id: str | None = None,
    force_refresh: bool = False,
) -> str:
    if job_runner() == "modal":
        return _modal_spawn(
            "generate_recommendations",
            user_email,
            upload_id,
            force_refresh,
        )

    from app.config.v2.celery_client import celery_client

    task = celery_client.send_task(
        "generate_recommendations",
        args=[user_email, upload_id, force_refresh],
    )
    return task.id


def enqueue_process_jobs_to_qdrant() -> str:
    if job_runner() == "modal":
        return _modal_spawn("process_jobs_to_qdrant")

    from app.config.v2.celery_client import celery_client

    task = celery_client.send_task("process_jobs_to_qdrant")
    return task.id


def enqueue_warmup() -> str:
    if job_runner() != "modal":
        return f"local-warmup-skip-{uuid.uuid4().hex[:8]}"
    return _modal_spawn("warmup")
