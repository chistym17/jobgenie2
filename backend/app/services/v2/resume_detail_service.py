from __future__ import annotations

from typing import Any, Dict, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection


def _get_mongo_client() -> AsyncIOMotorClient:
    import os

    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return AsyncIOMotorClient(mongo_uri)


_client: AsyncIOMotorClient = _get_mongo_client()
_db = _client.jobs_db
_collection: AsyncIOMotorCollection = _db["resumes"]


async def get_resume_by_id(resume_id: str) -> Optional[Dict[str, Any]]:
    doc = await _collection.find_one({"_id": ObjectId(resume_id)})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


