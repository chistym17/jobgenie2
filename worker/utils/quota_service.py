from __future__ import annotations

from datetime import datetime, timezone
import os
from typing import Any, Dict, Optional, Tuple

from pymongo.errors import DuplicateKeyError

from db import get_mongodb_client


QUOTA_COLLECTION = "user_daily_quota"


def _daily_upload_limit() -> int:
    raw = os.getenv("DAILY_UPLOAD_COMPLETION_LIMIT", "3")
    try:
        n = int(raw)
        return max(1, n)
    except ValueError:
        return 3


def _daily_coach_limit() -> int:
    raw = os.getenv("DAILY_COACH_CALL_LIMIT", "3")
    try:
        n = int(raw)
        return max(1, n)
    except ValueError:
        return 3


def utc_date_key(now: Optional[datetime] = None) -> str:
    dt = now or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%d")


def ensure_quota_indexes() -> None:
    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][QUOTA_COLLECTION]
        coll.create_index(
            [("user_email", 1), ("date_key", 1)],
            unique=True,
            name="user_email_date_key_unique",
        )
    finally:
        client.close()


def get_quota_doc(user_email: str, now: Optional[datetime] = None) -> Dict[str, Any]:
    date_key = utc_date_key(now)
    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][QUOTA_COLLECTION]
        doc = coll.find_one({"user_email": user_email, "date_key": date_key}) or {}
        return doc
    finally:
        client.close()


def can_consume_upload_completion(
    user_email: str,
    upload_id: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, Dict[str, Any]]:
    limit = _daily_upload_limit()
    date_key = utc_date_key(now)
    doc = get_quota_doc(user_email, now=now)
    ids = list(doc.get("upload_ids_charged") or [])
    if upload_id in ids:
        return True, {"upload_used": len(ids), "upload_limit": limit, "date_key": date_key}
    if len(ids) < limit:
        return True, {"upload_used": len(ids), "upload_limit": limit, "date_key": date_key}
    return False, {"upload_used": len(ids), "upload_limit": limit, "date_key": date_key}


def consume_upload_completion_success(
    user_email: str,
    upload_id: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, Dict[str, Any]]:
    ensure_quota_indexes()
    date_key = utc_date_key(now)
    ts = datetime.utcnow()
    limit = _daily_upload_limit()

    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][QUOTA_COLLECTION]
        doc = coll.find_one({"user_email": user_email, "date_key": date_key}) or {}
        ids = list(doc.get("upload_ids_charged") or [])
        if upload_id in ids:
            return True, {"upload_used": len(ids), "upload_limit": limit, "date_key": date_key, "idempotent": True}
        if len(ids) >= limit:
            return False, {"upload_used": len(ids), "upload_limit": limit, "date_key": date_key}

        coll.update_one(
            {"user_email": user_email, "date_key": date_key},
            {
                "$addToSet": {"upload_ids_charged": upload_id},
                "$set": {"updated_at": ts},
                "$setOnInsert": {
                    "user_email": user_email,
                    "date_key": date_key,
                    "created_at": ts,
                },
            },
            upsert=True,
        )
        doc2 = coll.find_one({"user_email": user_email, "date_key": date_key}) or {}
        ids2 = list(doc2.get("upload_ids_charged") or [])
        return True, {"upload_used": len(ids2), "upload_limit": limit, "date_key": date_key, "idempotent": False}
    finally:
        client.close()


def can_consume_coach_call(
    user_email: str,
    coach_key: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, Dict[str, Any]]:
    limit = _daily_coach_limit()
    date_key = utc_date_key(now)
    doc = get_quota_doc(user_email, now=now)
    keys = list(doc.get("coach_keys_charged") or [])
    if coach_key in keys:
        return False, {"coach_used": len(keys), "coach_limit": limit, "date_key": date_key, "already_used": True}
    if len(keys) < limit:
        return True, {"coach_used": len(keys), "coach_limit": limit, "date_key": date_key, "already_used": False}
    return False, {"coach_used": len(keys), "coach_limit": limit, "date_key": date_key, "already_used": False}


def consume_coach_call_success(
    user_email: str,
    coach_key: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, Dict[str, Any]]:
    ensure_quota_indexes()
    date_key = utc_date_key(now)
    ts = datetime.utcnow()
    limit = _daily_coach_limit()

    client = get_mongodb_client()
    try:
        coll = client["jobs_db"][QUOTA_COLLECTION]
        doc = coll.find_one({"user_email": user_email, "date_key": date_key}) or {}
        keys = list(doc.get("coach_keys_charged") or [])
        if coach_key in keys:
            return True, {"coach_used": len(keys), "coach_limit": limit, "date_key": date_key, "idempotent": True}
        if len(keys) >= limit:
            return False, {"coach_used": len(keys), "coach_limit": limit, "date_key": date_key}

        coll.update_one(
            {"user_email": user_email, "date_key": date_key},
            {
                "$addToSet": {"coach_keys_charged": coach_key},
                "$set": {"updated_at": ts},
                "$setOnInsert": {
                    "user_email": user_email,
                    "date_key": date_key,
                    "created_at": ts,
                },
            },
            upsert=True,
        )
        doc2 = coll.find_one({"user_email": user_email, "date_key": date_key}) or {}
        keys2 = list(doc2.get("coach_keys_charged") or [])
        return True, {"coach_used": len(keys2), "coach_limit": limit, "date_key": date_key, "idempotent": False}
    finally:
        client.close()

