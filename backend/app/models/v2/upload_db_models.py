from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class UploadStatus:
    """String constants for resume upload lifecycle statuses."""

    PENDING = "pending"
    PARSING = "parsing"
    PARSED = "parsed"
    PARSING_FAILED = "parsing_failed"

    EMBEDDING = "embedding"
    EMBEDDING_COMPLETED = "embedding_completed"
    EMBEDDING_FAILED = "embedding_failed"

    RECOMMENDATIONS = "recommendations"
    COMPLETED = "completed"
    FAILED = "failed"


RESUME_UPLOADS_COLLECTION = "resume_uploads"


class ResumeUpload(BaseModel):
    """MongoDB model for tracking the lifecycle of a resume upload."""

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    user_email: str

    file_path: str
    file_name: str
    file_size: int

    status: str = Field(default=UploadStatus.PENDING)

    resume_id: Optional[ObjectId] = None

    parse_task_id: Optional[str] = None
    embedding_task_id: Optional[str] = None
    recommendation_task_id: Optional[str] = None
    recommendation_id: Optional[ObjectId] = None

    error_message: Optional[str] = None
    retry_count: int = 0

    activity_timeline: List[Dict[str, Any]] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}


