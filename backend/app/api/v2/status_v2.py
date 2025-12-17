from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.config.v2 import celery_client
from app.models.v2.upload_db_models import UploadStatus
from app.models.v2.upload_models import (
    UploadStatusResponse,
    UploadStatusProgress,
    UploadHistoryResponse,
    UploadListItem,
)
from app.services.v2 import resume_upload_service
from app.utils.logger_v2 import get_v2_logger


router = APIRouter(prefix="/resume", tags=["Resume Upload Status v2"])
logger = get_v2_logger("resume_v2.api.status")


def _compute_progress(status: str) -> UploadStatusProgress:
    parsing = None
    embedding = None
    recommendations = None

    if status in (
        UploadStatus.PENDING,
        UploadStatus.PARSING,
        UploadStatus.PARSING_FAILED,
    ):
        parsing = status
    elif status in (
        UploadStatus.EMBEDDING,
        UploadStatus.EMBEDDING_COMPLETED,
        UploadStatus.EMBEDDING_FAILED,
    ):
        parsing = UploadStatus.PARSED
        embedding = status
    elif status in (
        UploadStatus.RECOMMENDATIONS,
        UploadStatus.COMPLETED,
        UploadStatus.FAILED,
    ):
        parsing = UploadStatus.PARSED
        embedding = UploadStatus.EMBEDDING_COMPLETED
        recommendations = status

    return UploadStatusProgress(
        parsing=parsing,
        embedding=embedding,
        recommendations=recommendations,
    )


@router.get("/upload/{upload_id}/status", response_model=UploadStatusResponse)
async def get_upload_status(upload_id: str):
    doc = await resume_upload_service.get_upload(upload_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")

    progress = _compute_progress(doc.get("status", ""))

    return UploadStatusResponse(
        upload_id=upload_id,
        status=doc.get("status", ""),
        progress=progress,
        resume_id=str(doc.get("resume_id")) if doc.get("resume_id") else None,
        error_message=doc.get("error_message"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
        completed_at=doc.get("completed_at"),
    )


@router.post("/upload/{upload_id}/retry", response_model=UploadStatusResponse)
async def retry_upload(upload_id: str):
    doc = await resume_upload_service.get_upload(upload_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")

    status = doc.get("status")
    if status not in (UploadStatus.FAILED, UploadStatus.PARSING_FAILED):
        raise HTTPException(
            status_code=400,
            detail="Retry is only allowed for failed uploads",
        )

    success, new_retry_count = await resume_upload_service.increment_retry_count(upload_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update retry count")

    file_id = doc.get("file_path")
    user_email = doc.get("user_email")
    if not file_id or not user_email:
        raise HTTPException(status_code=500, detail="Upload record is missing file or user information")

    logger.info("Retrying upload_id=%s with status=%s, new_retry_count=%s", upload_id, status, new_retry_count)

    task = celery_client.send_task(
        "parse_resume_v2",
        args=[upload_id, file_id, user_email],
    )

    await resume_upload_service.update_status(
        upload_id,
        UploadStatus.PENDING,
        parse_task_id=task.id,
        retry_count=new_retry_count,
        error_message=None,
    )

    updated = await resume_upload_service.get_upload(upload_id)
    progress = _compute_progress(updated.get("status", "")) if updated else UploadStatusProgress()

    return UploadStatusResponse(
        upload_id=upload_id,
        status=updated.get("status", "") if updated else "",
        progress=progress,
        resume_id=str(updated.get("resume_id")) if updated and updated.get("resume_id") else None,
        error_message=updated.get("error_message") if updated else None,
        created_at=updated.get("created_at") if updated else None,
        updated_at=updated.get("updated_at") if updated else None,
        completed_at=updated.get("completed_at") if updated else None,
    )


@router.get("/uploads", response_model=UploadHistoryResponse)
async def list_uploads(
    user_email: str = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    result = await resume_upload_service.list_uploads(
        user_email=user_email,
        limit=limit,
        offset=offset,
    )

    items = []
    for doc in result["uploads"]:
        items.append(
            UploadListItem(
                upload_id=str(doc.get("_id") or doc.get("id")),
                file_name=doc.get("file_name", ""),
                status=doc.get("status", ""),
                created_at=doc.get("created_at"),
                completed_at=doc.get("completed_at"),
            )
        )

    return UploadHistoryResponse(
        uploads=items,
        total=result["total"],
        limit=result["limit"],
        offset=result["offset"],
    )


