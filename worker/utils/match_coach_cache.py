from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from db import get_mongodb_client

COLLECTION = "match_coach_cache"
_index_ensured = False


def coach_key_from_job(job: dict) -> str:
    job_id = job.get("job_id") or job.get("jobId") or job.get("id") or ""
    if job_id:
        return str(job_id)
    title = (job.get("title") or job.get("Job Title") or "").strip()
    company = (job.get("company") or job.get("Company Name") or "").strip()
    return f"{title}|{company}"


def _ensure_index() -> None:
    global _index_ensured
    if _index_ensured:
        return
    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][COLLECTION]
        coll.create_index(
            [("upload_id", 1), ("coach_key", 1)],
            unique=True,
            name="upload_id_coach_key_unique",
        )
        _index_ensured = True
    finally:
        client.close()


def get_cached_match_coach(upload_id: str, coach_key: str) -> Optional[Dict[str, Any]]:
    if not upload_id or not coach_key:
        return None
    _ensure_index()
    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][COLLECTION]
        doc = coll.find_one({"upload_id": upload_id, "coach_key": coach_key})
        if not doc:
            return None
        return {
            "why_good_match": doc.get("why_good_match") or [],
            "improvements": doc.get("improvements") or [],
        }
    finally:
        client.close()


def save_match_coach_cache(
    upload_id: str,
    coach_key: str,
    user_email: str,
    why_good_match: List[str],
    improvements: List[str],
) -> None:
    if not upload_id or not coach_key:
        return
    _ensure_index()
    now = datetime.utcnow()
    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][COLLECTION]
        coll.update_one(
            {"upload_id": upload_id, "coach_key": coach_key},
            {
                "$set": {
                    "user_email": user_email,
                    "why_good_match": why_good_match,
                    "improvements": improvements,
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
    finally:
        client.close()
