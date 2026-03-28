from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from pymongo.errors import DuplicateKeyError

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

from app.models.v2.quota_db_models import USER_DAILY_QUOTA_COLLECTION
from app.utils.logger_v2 import get_v2_logger

_logger = get_v2_logger("resume_v2.service.quota")

_client: Optional[AsyncIOMotorClient] = None
_db: Any = None
_collection: Optional[AsyncIOMotorCollection] = None
_indexes_ensured = False


def _get_mongo_client() -> AsyncIOMotorClient:
    import os as _os

    mongo_uri = _os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return AsyncIOMotorClient(mongo_uri)


def _get_collection() -> AsyncIOMotorCollection:
    global _client, _db, _collection
    if _collection is None:
        _client = _get_mongo_client()
        _db = _client.jobs_db
        _collection = _db[USER_DAILY_QUOTA_COLLECTION]
    return _collection


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


async def ensure_quota_indexes() -> None:
    global _indexes_ensured
    if _indexes_ensured:
        return
    coll = _get_collection()
    await coll.create_index(
        [("user_email", 1), ("date_key", 1)],
        unique=True,
        name="user_email_date_key_unique",
    )
    _indexes_ensured = True
    _logger.info("Ensured indexes on %s", USER_DAILY_QUOTA_COLLECTION)


async def can_consume_upload_completion(
    user_email: str,
    upload_id: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, Dict[str, Any]]:
    await ensure_quota_indexes()
    coll = _get_collection()
    date_key = utc_date_key(now)
    doc = await coll.find_one({"user_email": user_email, "date_key": date_key})
    ids = list(doc.get("upload_ids_charged") or []) if doc else []
    limit = _daily_upload_limit()
    if upload_id in ids:
        return True, {
            "uploads_used": len(ids),
            "uploads_limit": limit,
            "date_key": date_key,
        }
    if len(ids) < limit:
        return True, {
            "uploads_used": len(ids),
            "uploads_limit": limit,
            "date_key": date_key,
        }
    return False, {
        "uploads_used": len(ids),
        "uploads_limit": limit,
        "date_key": date_key,
    }


async def try_consume_upload_completion(
    user_email: str,
    upload_id: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, str, Dict[str, Any]]:
    await ensure_quota_indexes()
    coll = _get_collection()
    date_key = utc_date_key(now)
    limit = _daily_upload_limit()
    ts = datetime.utcnow()

    for attempt in range(4):
        doc = await coll.find_one({"user_email": user_email, "date_key": date_key})
        if doc:
            ids = list(doc.get("upload_ids_charged") or [])
            if upload_id in ids:
                return True, "ok", {
                    "uploads_used": len(ids),
                    "uploads_limit": limit,
                    "date_key": date_key,
                    "idempotent": True,
                }
            if len(ids) >= limit:
                return False, "daily_upload_quota_exceeded", {
                    "uploads_used": len(ids),
                    "uploads_limit": limit,
                    "date_key": date_key,
                }
            res = await coll.update_one(
                {"_id": doc["_id"], "upload_ids_charged": {"$size": len(ids)}},
                {
                    "$addToSet": {"upload_ids_charged": upload_id},
                    "$set": {"updated_at": ts},
                },
            )
            if res.modified_count == 1:
                new_len = len(ids) + 1
                return True, "ok", {
                    "uploads_used": new_len,
                    "uploads_limit": limit,
                    "date_key": date_key,
                    "idempotent": False,
                }
            continue

        try:
            await coll.insert_one(
                {
                    "user_email": user_email,
                    "date_key": date_key,
                    "upload_ids_charged": [upload_id],
                    "coach_keys_charged": [],
                    "created_at": ts,
                    "updated_at": ts,
                }
            )
            return True, "ok", {
                "uploads_used": 1,
                "uploads_limit": limit,
                "date_key": date_key,
                "idempotent": False,
            }
        except DuplicateKeyError:
            _logger.info(
                "DuplicateKey on quota insert, retrying user=%s date=%s attempt=%s",
                user_email,
                date_key,
                attempt,
            )

    return False, "daily_upload_quota_exceeded", {
        "uploads_used": limit,
        "uploads_limit": limit,
        "date_key": date_key,
    }


async def try_consume_coach_call(
    user_email: str,
    coach_key: str,
    now: Optional[datetime] = None,
) -> Tuple[bool, str, Dict[str, Any]]:
    await ensure_quota_indexes()
    coll = _get_collection()
    date_key = utc_date_key(now)
    limit = _daily_coach_limit()
    ts = datetime.utcnow()

    for attempt in range(4):
        doc = await coll.find_one({"user_email": user_email, "date_key": date_key})
        if doc:
            keys = list(doc.get("coach_keys_charged") or [])
            if coach_key in keys:
                return True, "ok", {
                    "coach_used": len(keys),
                    "coach_limit": limit,
                    "date_key": date_key,
                    "idempotent": True,
                }
            if len(keys) >= limit:
                return False, "daily_coach_quota_exceeded", {
                    "coach_used": len(keys),
                    "coach_limit": limit,
                    "date_key": date_key,
                }
            res = await coll.update_one(
                {"_id": doc["_id"], "coach_keys_charged": {"$size": len(keys)}},
                {
                    "$addToSet": {"coach_keys_charged": coach_key},
                    "$set": {"updated_at": ts},
                },
            )
            if res.modified_count == 1:
                new_len = len(keys) + 1
                return True, "ok", {
                    "coach_used": new_len,
                    "coach_limit": limit,
                    "date_key": date_key,
                    "idempotent": False,
                }
            continue

        try:
            await coll.insert_one(
                {
                    "user_email": user_email,
                    "date_key": date_key,
                    "upload_ids_charged": [],
                    "coach_keys_charged": [coach_key],
                    "created_at": ts,
                    "updated_at": ts,
                }
            )
            return True, "ok", {
                "coach_used": 1,
                "coach_limit": limit,
                "date_key": date_key,
                "idempotent": False,
            }
        except DuplicateKeyError:
            _logger.info(
                "DuplicateKey on coach quota insert, retrying user=%s date=%s attempt=%s",
                user_email,
                date_key,
                attempt,
            )

    return False, "daily_coach_quota_exceeded", {
        "coach_used": limit,
        "coach_limit": limit,
        "date_key": date_key,
    }


async def get_quota_status(
    user_email: str,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    await ensure_quota_indexes()
    coll = _get_collection()
    date_key = utc_date_key(now)
    doc = await coll.find_one({"user_email": user_email, "date_key": date_key})
    upload_limit = _daily_upload_limit()
    coach_limit = _daily_coach_limit()
    uploads = doc.get("upload_ids_charged") or [] if doc else []
    coach_keys = doc.get("coach_keys_charged") or [] if doc else []
    return {
        "user_email": user_email,
        "date_key": date_key,
        "uploads_used": len(uploads),
        "uploads_limit": upload_limit,
        "coach_used": len(coach_keys),
        "coach_limit": coach_limit,
    }
