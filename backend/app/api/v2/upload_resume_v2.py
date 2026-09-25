from __future__ import annotations

import hashlib

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.config.v2.task_dispatcher import enqueue_parse_resume
from app.models.v2.upload_models import UploadResumeResponse
from app.models.v2.upload_db_models import UploadStatus
from app.services.v2.file_storage_service import FileStorageService
from app.services.v2 import resume_upload_service
from app.services.v2 import quota_service
from app.utils.logger_v2 import get_v2_logger


router = APIRouter(prefix="/resume", tags=["Resume Upload v2"])
logger = get_v2_logger("resume_v2.api.upload")


@router.post("/upload", response_model=UploadResumeResponse)
async def upload_resume_v2(
    file: UploadFile = File(...),
    user_email: str = Form(...),
):
    logger.info("Received v2 upload request for user=%s, filename=%s", user_email, file.filename)

    if not file.filename.lower().endswith(".pdf"):
        logger.warning("Rejected non-PDF upload for user=%s, filename=%s", user_email, file.filename)
        raise HTTPException(status_code=400, detail="Only PDF files are supported in v2.")

    raw = await file.read()
    file_content_hash = hashlib.sha256(raw).hexdigest()
    await file.seek(0)

    reusable_id = await resume_upload_service.find_reusable_completed_upload_id(
        user_email=user_email,
        file_content_hash=file_content_hash,
    )
    if reusable_id:
        logger.info(
            "Returning existing upload for duplicate file user=%s upload_id=%s",
            user_email,
            reusable_id,
        )
        return JSONResponse(
            content=UploadResumeResponse(
                upload_id=reusable_id,
                parse_task_id="",
                status="completed",
                message="This file was already processed today. Using your existing recommendations.",
            ).model_dump()
        )

    quota = await quota_service.get_quota_status(user_email=user_email)
    if quota.get("uploads_used", 0) >= quota.get("uploads_limit", 3):
        date_key = quota.get("date_key")
        resets_at = None
        if isinstance(date_key, str) and len(date_key) == 10:
            try:
                from datetime import datetime, timedelta, timezone

                today = datetime.strptime(date_key, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                resets_at = (today + timedelta(days=1)).isoformat()
            except Exception:
                resets_at = None

        detail = "Daily upload quota exceeded. Try again tomorrow."
        if resets_at:
            detail = f"{detail} Resets at {resets_at}."
        logger.info("Upload blocked by quota for user=%s uploads_used=%s", user_email, quota.get("uploads_used"))
        raise HTTPException(status_code=429, detail=detail)

    storage = FileStorageService()
    file_id = await storage.save_file(file, user_email=user_email)
    logger.info("Saved file to GridFS: file_id=%s for user=%s", file_id, user_email)

    file_size = len(raw)

    upload_id = await resume_upload_service.create_upload(
        user_email=user_email,
        file_name=file.filename or "resume.pdf",
        file_size=int(file_size),
        file_path=file_id,
        file_content_hash=file_content_hash,
    )
    logger.info("Created ResumeUpload record: upload_id=%s", upload_id)

    if not upload_id:
        logger.error("create_upload returned empty upload_id for user=%s file_id=%s", user_email, file_id)
        raise HTTPException(status_code=500, detail="Failed to create upload record")

    # enqueue parse_resume_v2 (Celery local / Modal prod)
    task_id = enqueue_parse_resume(upload_id, file_id, user_email)
    logger.info("Enqueued parse_resume_v2 task: task_id=%s for upload_id=%s", task_id, upload_id)

    await resume_upload_service.update_status(
        upload_id,
        UploadStatus.PENDING,
        parse_task_id=task_id,
    )
    await resume_upload_service.add_activity_event(
        upload_id,
        "Resume Uploaded",
        "Your resume has been uploaded and queued for processing",
        "pending",
    )

    response = UploadResumeResponse(
        upload_id=upload_id,
        parse_task_id=task_id,
        status="queued",
        message="Resume upload queued for processing",
    )
    return JSONResponse(content=response.model_dump())


