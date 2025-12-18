from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel


class UploadResumeResponse(BaseModel):
    upload_id: str
    parse_task_id: str
    status: str
    message: str


class UploadStatusProgress(BaseModel):
    parsing: Optional[str] = None
    embedding: Optional[str] = None
    recommendations: Optional[str] = None


class UploadStatusResponse(BaseModel):
    upload_id: str
    status: str
    progress: UploadStatusProgress
    resume_id: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class UploadListItem(BaseModel):
    upload_id: str
    file_name: str
    status: str
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class UploadHistoryResponse(BaseModel):
    uploads: List[UploadListItem]
    total: int
    limit: int
    offset: int



