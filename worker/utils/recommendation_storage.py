from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()


def get_mongo_client():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
    return MongoClient(mongo_uri)


def check_existing_recommendations(upload_id: str) -> Optional[Dict[str, Any]]:
    """
    Check if recommendations already exist for an upload.
    
    Args:
        upload_id: ResumeUpload document ID
        
    Returns:
        Existing recommendation document or None
    """
    client = get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db["recommendations"]
        
        upload_oid = ObjectId(upload_id)
        doc = collection.find_one({"upload_id": upload_oid})
        
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["upload_id"] = str(doc["upload_id"])
            if doc.get("resume_id"):
                doc["resume_id"] = str(doc["resume_id"])
        
        return doc
    finally:
        client.close()


def save_recommendations(
    upload_id: str,
    user_email: str,
    recommendations: List[Dict[str, Any]],
    resume_id: Optional[str] = None,
) -> str:
    """
    Save recommendations to MongoDB (synchronous version for worker).
    
    Args:
        upload_id: ResumeUpload document ID
        user_email: User's email
        recommendations: List of job recommendation dictionaries
        resume_id: Optional resume document ID
        
    Returns:
        Recommendation document ID
    """
    client = get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db["recommendations"]
        
        upload_oid = ObjectId(upload_id)
        resume_oid = ObjectId(resume_id) if resume_id else None
        
        match_scores = [
            rec.get("Match Score", 0)
            for rec in recommendations
            if isinstance(rec.get("Match Score"), (int, float))
        ]
        avg_match_score = sum(match_scores) / len(match_scores) if match_scores else None
        
        doc = {
            "upload_id": upload_oid,
            "user_email": user_email,
            "resume_id": resume_oid,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "avg_match_score": avg_match_score,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        result = collection.insert_one(doc)
        recommendation_id = result.inserted_id
        
        print(f"[RECOMMENDATION_STORAGE] Saved recommendations: recommendation_id={recommendation_id} upload_id={upload_id} count={len(recommendations)}")
        
        return str(recommendation_id)
    finally:
        client.close()


def update_upload_with_recommendation_id(upload_id: str, recommendation_id: str):
    """
    Update ResumeUpload document with recommendation_id.
    
    Args:
        upload_id: ResumeUpload document ID
        recommendation_id: Recommendation document ID
    """
    client = get_mongo_client()
    try:
        db = client["jobs_db"]
        collection = db["resume_uploads"]
        
        upload_oid = ObjectId(upload_id)
        rec_oid = ObjectId(recommendation_id)
        
        collection.update_one(
            {"_id": upload_oid},
            {"$set": {"recommendation_id": rec_oid, "updated_at": datetime.utcnow()}}
        )
        
        print(f"[RECOMMENDATION_STORAGE] Updated upload with recommendation_id: upload_id={upload_id} recommendation_id={recommendation_id}")
    finally:
        client.close()


