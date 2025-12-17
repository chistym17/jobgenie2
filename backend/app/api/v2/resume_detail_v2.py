from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.v2 import resume_upload_service
from app.services.v2 import resume_detail_service


router = APIRouter(prefix="/resume", tags=["Resume Detail v2"])


@router.get("/upload/{upload_id}/detail")
async def get_resume_detail(upload_id: str):
    upload = await resume_upload_service.get_upload(upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    resume_id = upload.get("resume_id")
    if not resume_id:
        raise HTTPException(status_code=404, detail="Parsed resume not available yet")
    resume = await resume_detail_service.get_resume_by_id(str(resume_id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume data not found")
    return resume


