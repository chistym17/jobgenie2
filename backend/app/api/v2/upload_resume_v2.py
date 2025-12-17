from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.config.v2 import celery_client
from app.models.v2.upload_models import UploadResumeResponse
from app.models.v2.upload_db_models import UploadStatus
from app.services.v2.file_storage_service import FileStorageService
from app.services.v2 import resume_upload_service
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

    storage = FileStorageService()
    file_id = await storage.save_file(file, user_email=user_email)
    logger.info("Saved file to GridFS: file_id=%s for user=%s", file_id, user_email)

    # UploadFile may not always have size; default to 0 if missing
    file_size = getattr(file, "size", 0) or 0

    upload_id = await resume_upload_service.create_upload(
        user_email=user_email,
        file_name=file.filename or "resume.pdf",
        file_size=int(file_size),
        file_path=file_id,
    )
    logger.info("Created ResumeUpload record: upload_id=%s", upload_id)

    # enqueue parse_resume_v2 task in worker
    task = celery_client.send_task(
        "parse_resume_v2",
        args=[upload_id, file_id, user_email],
    )
    logger.info("Enqueued parse_resume_v2 task: task_id=%s for upload_id=%s", task.id, upload_id)

    await resume_upload_service.update_status(
        upload_id,
        UploadStatus.PENDING,
        parse_task_id=task.id,
    )

    response = UploadResumeResponse(
        upload_id=upload_id,
        parse_task_id=task.id,
        status="queued",
        message="Resume upload queued for processing",
    )
    return JSONResponse(content=response.model_dump())


