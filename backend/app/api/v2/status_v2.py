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
    StartRecommendationsResponse,
)
from app.services.v2 import resume_upload_service, quota_service, recommendation_service
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


@router.post("/upload/{upload_id}/recommendations", response_model=StartRecommendationsResponse)
async def start_recommendations(
    upload_id: str,
    user_email: str = Query(..., description="User email (must own the upload)"),
):
    doc = await resume_upload_service.get_upload(upload_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")
    if doc.get("user_email") != user_email:
        raise HTTPException(status_code=403, detail="Forbidden")

    st = doc.get("status", "")
    if st == UploadStatus.COMPLETED:
        return StartRecommendationsResponse(
            upload_id=upload_id,
            status="completed",
            task_id=None,
            message="Recommendations already exist for this upload.",
        )
    if st == UploadStatus.RECOMMENDATIONS:
        return StartRecommendationsResponse(
            upload_id=upload_id,
            status="recommendations",
            task_id=str(doc.get("recommendation_task_id") or "") or None,
            message="Recommendation generation already in progress.",
        )

    if st not in (UploadStatus.EMBEDDING_COMPLETED, UploadStatus.FAILED):
        raise HTTPException(
            status_code=400,
            detail="Recommendations can only be started after embeddings are ready.",
        )
    if st == UploadStatus.FAILED and not doc.get("resume_id"):
        raise HTTPException(
            status_code=400,
            detail="Upload cannot create recommendations in its current state.",
        )

    allowed, _meta = await quota_service.can_consume_upload_completion(user_email, upload_id)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Daily recommendation quota exceeded. Try again tomorrow.",
        )

    async_result = celery_client.send_task(
        "generate_recommendations",
        args=[user_email, upload_id],
    )
    claimed = await resume_upload_service.claim_recommendations_start(
        upload_id, user_email, async_result.id
    )
    if not claimed:
        async_result.revoke(terminate=True)
        doc2 = await resume_upload_service.get_upload(upload_id)
        if doc2 and doc2.get("status") == UploadStatus.COMPLETED:
            return StartRecommendationsResponse(
                upload_id=upload_id,
                status="completed",
                task_id=None,
                message="Recommendations already exist for this upload.",
            )
        if doc2 and doc2.get("status") == UploadStatus.RECOMMENDATIONS:
            return StartRecommendationsResponse(
                upload_id=upload_id,
                status="recommendations",
                task_id=str(doc2.get("recommendation_task_id") or "") or None,
                message="Recommendation generation already in progress.",
            )
        raise HTTPException(status_code=409, detail="Could not start recommendations. Try again.")

    await resume_upload_service.add_activity_event(
        upload_id,
        "Starting Recommendations",
        "Starting recommendations...",
        "in_progress",
    )

    logger.info(
        "Started recommendations upload_id=%s user_email=%s task_id=%s",
        upload_id,
        user_email,
        async_result.id,
    )

    return StartRecommendationsResponse(
        upload_id=upload_id,
        status="recommendations",
        task_id=async_result.id,
        message="Recommendation generation started.",
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


@router.get("/quota/status")
async def get_quota_status(
    user_email: str = Query(...),
):
    return await quota_service.get_quota_status(user_email=user_email)


@router.get("/upload/{upload_id}/activity")
async def get_upload_activity(upload_id: str):
    """Get activity timeline for an upload."""
    doc = await resume_upload_service.get_upload(upload_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")

    activity_timeline = doc.get("activity_timeline", [])
    return {"upload_id": upload_id, "activity_timeline": activity_timeline}


@router.delete("/upload/{upload_id}")
async def delete_upload(upload_id: str):
    doc = await resume_upload_service.get_upload(upload_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")

    user_email = doc.get("user_email")
    await recommendation_service.delete_recommendations_for_upload(upload_id)
    await resume_upload_service.delete_match_coach_cache_for_upload(upload_id)
    if user_email:
        await quota_service.release_upload_quota_slot(user_email, upload_id)

    resume_id = doc.get("resume_id")
    if resume_id:
        await resume_upload_service.delete_resume_for_upload(resume_id)

    file_id = doc.get("file_path")
    if file_id:
        from app.services.v2.file_storage_service import FileStorageService
        storage = FileStorageService()
        await storage.delete_file(file_id)
        logger.info("Deleted file from GridFS: file_id=%s for upload_id=%s", file_id, upload_id)

    success = await resume_upload_service.delete_upload(upload_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete upload")

    logger.info("Deleted upload_id=%s", upload_id)
    return {"message": "Upload deleted successfully", "upload_id": upload_id}


