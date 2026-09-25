"""
Enqueue background jobs.

JOB_RUNNER=celery (default) → Celery/Redis (local)
JOB_RUNNER=modal           → Modal (prod)

Used by FastAPI and by in-worker chaining (parse → embed).
"""
from __future__ import annotations

import os
import uuid
from typing import Any


def job_runner() -> str:
    return (os.getenv("JOB_RUNNER") or "celery").strip().lower()


def _modal_spawn(function_name: str, *args: Any) -> str:
    import modal

    fn = modal.Function.from_name("jobgenie-worker", function_name)
    call = fn.spawn(*args)
    # FunctionCall object_id is a stable handle for logs/status
    return getattr(call, "object_id", None) or getattr(call, "object_id", None) or str(call)


def enqueue_parse_resume(upload_id: str, file_id: str, user_email: str) -> str:
    if job_runner() == "modal":
        return _modal_spawn("parse_resume_v2", upload_id, file_id, user_email)

    from celery_app import celery_app

    async_result = celery_app.send_task(
        "parse_resume_v2",
        args=[upload_id, file_id, user_email],
    )
    return async_result.id


def enqueue_precompute_embedding(user_email: str, upload_id: str | None = None) -> str:
    if job_runner() == "modal":
        return _modal_spawn("precompute_resume_embedding", user_email, upload_id)

    from celery_tasks.precompute_embedding import precompute_resume_embedding_task

    async_result = precompute_resume_embedding_task.delay(user_email, upload_id)
    return async_result.id


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

    from celery_app import celery_app

    async_result = celery_app.send_task(
        "generate_recommendations",
        args=[user_email, upload_id, force_refresh],
    )
    return async_result.id


def enqueue_process_jobs_to_qdrant() -> str:
    if job_runner() == "modal":
        return _modal_spawn("process_jobs_to_qdrant")

    from celery_app import celery_app

    async_result = celery_app.send_task("process_jobs_to_qdrant")
    return async_result.id


def enqueue_warmup() -> str:
    """Fire-and-forget container wake (Modal). Local: no-op id."""
    if job_runner() != "modal":
        return f"local-warmup-skip-{uuid.uuid4().hex[:8]}"
    return _modal_spawn("warmup")
