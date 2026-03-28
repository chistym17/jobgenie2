from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

from app.models.v2.recommendation_db_models import Recommendation, RECOMMENDATIONS_COLLECTION
from app.utils.logger_v2 import get_v2_logger

load_dotenv()

logger = get_v2_logger("resume_v2.service.recommendation")


def _get_mongo_client() -> AsyncIOMotorClient:
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return AsyncIOMotorClient(mongo_uri)


async def save_recommendations(
    upload_id: str,
    user_email: str,
    recommendations: List[Dict[str, Any]],
    resume_id: Optional[str] = None,
) -> str:
    """
    Save recommendations to MongoDB.
    
    Args:
        upload_id: ResumeUpload document ID
        user_email: User's email
        recommendations: List of job recommendation dictionaries
        resume_id: Optional resume document ID
        
    Returns:
        Recommendation document ID
    """
    client = _get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db[RECOMMENDATIONS_COLLECTION]
        
        upload_oid = ObjectId(upload_id)
        resume_oid = ObjectId(resume_id) if resume_id else None
        
        match_scores = [
            rec.get("Match Score", 0)
            for rec in recommendations
            if isinstance(rec.get("Match Score"), (int, float))
        ]
        avg_match_score = sum(match_scores) / len(match_scores) if match_scores else None
        
        recommendation_doc = Recommendation(
            upload_id=upload_oid,
            user_email=user_email,
            resume_id=resume_oid,
            recommendations=recommendations,
            total_recommendations=len(recommendations),
            avg_match_score=avg_match_score,
        )
        
        doc_dict = recommendation_doc.model_dump(exclude={"id"}, by_alias=True)
        if doc_dict.get("_id") is None:
            doc_dict.pop("_id", None)
        
        result = await collection.insert_one(doc_dict)
        recommendation_id = result.inserted_id
        
        logger.info(
            "Saved recommendations: recommendation_id=%s upload_id=%s user_email=%s count=%d",
            recommendation_id,
            upload_id,
            user_email,
            len(recommendations),
        )
        
        return str(recommendation_id)
        
    finally:
        client.close()


async def get_recommendations_by_upload(upload_id: str) -> Optional[Dict[str, Any]]:
    """
    Get recommendations for a specific upload.
    
    Args:
        upload_id: ResumeUpload document ID
        
    Returns:
        Recommendation document or None
    """
    client = _get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db[RECOMMENDATIONS_COLLECTION]
        
        upload_oid = ObjectId(upload_id)
        doc = await collection.find_one({"upload_id": upload_oid})
        
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["upload_id"] = str(doc["upload_id"])
            if doc.get("resume_id"):
                doc["resume_id"] = str(doc["resume_id"])
        
        return doc
        
    finally:
        client.close()


async def get_recommendations_by_user(user_email: str) -> List[Dict[str, Any]]:
    """
    Get all recommendations for a user (history).
    
    Args:
        user_email: User's email
        
    Returns:
        List of recommendation documents
    """
    client = _get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db[RECOMMENDATIONS_COLLECTION]
        
        cursor = collection.find({"user_email": user_email}).sort("created_at", -1)
        docs = await cursor.to_list(length=100)
        
        for doc in docs:
            doc["_id"] = str(doc["_id"])
            doc["upload_id"] = str(doc["upload_id"])
            if doc.get("resume_id"):
                doc["resume_id"] = str(doc["resume_id"])
        
        return docs
        
    finally:
        client.close()


async def check_existing_recommendations(upload_id: str) -> Optional[Dict[str, Any]]:
    """
    Check if recommendations already exist for an upload.
    
    Args:
        upload_id: ResumeUpload document ID
        
    Returns:
        Existing recommendation document or None
    """
    return await get_recommendations_by_upload(upload_id)


async def delete_recommendation_by_id(recommendation_id: str) -> bool:
    client = _get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db[RECOMMENDATIONS_COLLECTION]
        result = await collection.delete_one({"_id": ObjectId(recommendation_id)})
        return result.deleted_count > 0
    finally:
        client.close()


async def delete_recommendations_for_upload(upload_id: str) -> int:
    client = _get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db[RECOMMENDATIONS_COLLECTION]
        result = await collection.delete_many({"upload_id": ObjectId(upload_id)})
        n = int(result.deleted_count)
        if n:
            logger.info("Deleted %s recommendation doc(s) for upload_id=%s", n, upload_id)
        return n
    finally:
        client.close()




