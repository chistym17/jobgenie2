from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

from app.models.v2.upload_db_models import (
    RESUME_UPLOADS_COLLECTION,
    ResumeUpload,
)


def _get_mongo_client() -> AsyncIOMotorClient:
    import os
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return AsyncIOMotorClient(mongo_uri)


_client: AsyncIOMotorClient = _get_mongo_client()
_db = _client.jobs_db
_collection: AsyncIOMotorCollection = _db[RESUME_UPLOADS_COLLECTION]


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
    doc = upload.model_dump(by_alias=True)
    result = await _collection.insert_one(doc)
    return str(result.inserted_id)


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

    result = await _collection.update_one(
        {"_id": ObjectId(upload_id)},
        {"$set": update},
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


