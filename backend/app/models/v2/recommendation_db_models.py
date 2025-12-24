from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from bson import ObjectId
from pydantic import BaseModel, Field


RECOMMENDATIONS_COLLECTION = "recommendations"


class Recommendation(BaseModel):
    """MongoDB model for storing job recommendations."""

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    upload_id: ObjectId
    user_email: str
    resume_id: Optional[ObjectId] = None

    recommendations: List[Dict[str, Any]] = Field(default_factory=list)

    total_recommendations: int = 0
    avg_match_score: Optional[float] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}




