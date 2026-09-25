from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Query

from app.config.v2.task_dispatcher import enqueue_process_jobs_to_qdrant
from app.services import jobs

router = APIRouter(prefix="/maintenance", tags=["Job Maintenance"])


def _run_fetch_jobs() -> None:
    jobs.main()


def _run_cleanup_qdrant(days: int) -> None:
    from app.services.qdrant_cleanup import cleanup_old_qdrant_embeddings

    cleanup_old_qdrant_embeddings(days_to_keep=days)


@router.api_route("/fetch-jobs", methods=["GET", "POST"])
async def trigger_fetch_jobs(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_fetch_jobs)
    return {
        "status": "started",
        "job": "fetch_jobs",
        "message": "Fetching jobs from feeds and saving to MongoDB",
    }


@router.api_route("/delete-old-jobs", methods=["GET", "POST"])
async def trigger_delete_old_jobs(days: int = Query(7, ge=1, le=365)):
    jobs.delete_jobs_older_than(days)
    return {
        "status": "completed",
        "job": "delete_old_jobs",
        "days": days,
        "message": f"Deleted jobs older than {days} days from MongoDB",
    }


@router.api_route("/ingest-qdrant", methods=["GET", "POST"])
async def trigger_ingest_qdrant():
    task_id = enqueue_process_jobs_to_qdrant()
    return {
        "status": "queued",
        "job": "ingest_qdrant",
        "task_id": task_id,
        "message": "Job ingestion to Qdrant queued",
    }


@router.api_route("/cleanup-qdrant", methods=["GET", "POST"])
async def trigger_cleanup_qdrant(
    background_tasks: BackgroundTasks,
    days: int = Query(7, ge=1, le=365),
):
    background_tasks.add_task(_run_cleanup_qdrant, days)
    return {
        "status": "started",
        "job": "cleanup_qdrant",
        "days": days,
        "message": f"Removing Qdrant points older than {days} days",
    }
