from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

from app.models.v2.upload_db_models import (
    RESUME_UPLOADS_COLLECTION,
    ResumeUpload,
)
from app.utils.logger_v2 import get_v2_logger


def _get_mongo_client() -> AsyncIOMotorClient:
    import os

    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return AsyncIOMotorClient(mongo_uri)


_client: AsyncIOMotorClient = _get_mongo_client()
_db = _client.jobs_db
_collection: AsyncIOMotorCollection = _db[RESUME_UPLOADS_COLLECTION]
_logger = get_v2_logger("resume_v2.service.uploads")


async def create_upload(
    user_email: str,
    file_name: str,
    file_size: int,
    file_path: str,
) -> str:
    upload = ResumeUpload(
        user_email=user_email,
        file_name=file_name,
        file_size=file_size,
        file_path=file_path,
    )
    doc = upload.model_dump(by_alias=True, exclude_none=True)
    if "_id" in doc:
        doc.pop("_id", None)
    _logger.info(
        "Creating ResumeUpload for user=%s file_name=%s file_size=%s",
        user_email,
        file_name,
        file_size,
    )
    result = await _collection.insert_one(doc)
    inserted_id = result.inserted_id
    if not inserted_id:
        _logger.error("Insert into %s returned no inserted_id", RESUME_UPLOADS_COLLECTION)
        raise RuntimeError("Failed to create upload record")
    upload_id = str(inserted_id)
    _logger.info("Created ResumeUpload with _id=%s", upload_id)
    return upload_id


async def update_status(
    upload_id: str,
    status: str,
    **extra_fields: Any,
) -> bool:
    """
    Update the status (and optional extra fields) for a given upload.
    """
    update: Dict[str, Any] = {"status": status, "updated_at": datetime.utcnow()}

    if "error_message" in extra_fields and extra_fields["error_message"] is not None:
        update["error_message"] = extra_fields["error_message"]

    if "resume_id" in extra_fields and extra_fields["resume_id"] is not None:
        resume_id = extra_fields["resume_id"]
        update["resume_id"] = (
            ObjectId(resume_id) if isinstance(resume_id, str) else resume_id
        )

    for key in ("parse_task_id", "embedding_task_id", "recommendation_task_id"):
        if key in extra_fields and extra_fields[key] is not None:
            update[key] = extra_fields[key]

    if "completed" in extra_fields and extra_fields["completed"]:
        update["completed_at"] = datetime.utcnow()

    if "retry_count" in extra_fields and extra_fields["retry_count"] is not None:
        update["retry_count"] = int(extra_fields["retry_count"])

    try:
        oid = ObjectId(upload_id)
    except Exception as exc:
        _logger.error("Invalid upload_id passed to update_status: %s err=%s", upload_id, exc)
        raise

    result = await _collection.update_one(
        {"_id": oid},
        {"$set": update},
    )
    if result.matched_count != 1:
        _logger.warning(
            "update_status did not match any document upload_id=%s matched=%s",
            upload_id,
            result.matched_count,
        )
    return result.matched_count == 1


async def get_upload(upload_id: str) -> Optional[Dict[str, Any]]:
    doc = await _collection.find_one({"_id": ObjectId(upload_id)})
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return doc


async def list_uploads(
    user_email: str,
    limit: int = 10,
    offset: int = 0,
) -> Dict[str, Any]:
    cursor = (
        _collection.find({"user_email": user_email})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )

    items = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        items.append(doc)

    total = await _collection.count_documents({"user_email": user_email})

    return {
        "uploads": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


async def increment_retry_count(upload_id: str) -> Tuple[bool, int]:
    result = await _collection.find_one_and_update(
        {"_id": ObjectId(upload_id)},
        {"$inc": {"retry_count": 1}, "$set": {"updated_at": datetime.utcnow()}},
        return_document=True,
    )

    if not result:
        return False, 0

    return True, int(result.get("retry_count", 0))


async def add_activity_event(
    upload_id: str,
    step: str,
    message: str,
    status: str,
    error_message: Optional[str] = None,
) -> bool:
    """
    Add an activity event to the timeline.
    
    Args:
        upload_id: Upload document ID
        step: Step name (e.g., "Resume Uploaded", "Parsing Started")
        message: Activity message
        status: Status type ("completed", "in_progress", "failed", "pending")
        error_message: Optional error message for failed statuses
    """
    try:
        oid = ObjectId(upload_id)
    except Exception as exc:
        _logger.error("Invalid upload_id passed to add_activity_event: %s err=%s", upload_id, exc)
        return False

    activity_event = {
        "step": step,
        "message": message,
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
    }
    if error_message:
        activity_event["error_message"] = error_message

    result = await _collection.update_one(
        {"_id": oid},
        {
            "$push": {"activity_timeline": activity_event},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return result.matched_count == 1


async def delete_upload(upload_id: str) -> bool:
    try:
        oid = ObjectId(upload_id)
    except Exception as exc:
        _logger.error("Invalid upload_id passed to delete_upload: %s err=%s", upload_id, exc)
        return False

    result = await _collection.delete_one({"_id": oid})
    if result.deleted_count == 1:
        _logger.info("Deleted upload_id=%s", upload_id)
        return True
    else:
        _logger.warning("delete_upload did not delete any document upload_id=%s", upload_id)
        return False


