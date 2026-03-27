from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


USER_DAILY_QUOTA_COLLECTION = "user_daily_quota"


class UserDailyQuota(BaseModel):
    user_email: str
    date_key: str

    upload_ids_charged: List[str] = Field(default_factory=list)
    coach_keys_charged: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
