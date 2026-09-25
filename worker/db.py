from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
load_dotenv()

def get_mongodb_client():
    """Create and return MongoDB client connection"""
    client = MongoClient(os.getenv("MONGODB_URI"))
    return client

def check_mongodb_connection():
    """Check if MongoDB connection is successful"""
    try:
        client = get_mongodb_client()
        client.close()
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False

def fetch_all_jobs():
    """Fetch all jobs from the jobs collection in db-jobgeniem"""
    client = get_mongodb_client()
    db = client['jobs_db']
    collection = db['jobs']
    
    jobs = list(collection.find({}))
    
    client.close()
    
    return jobs


def fetch_jobs_pending_ingest():
    """Jobs not yet successfully written to Qdrant."""
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        return list(
            db["jobs"].find(
                {
                    "$or": [
                        {"qdrant_ingested": {"$exists": False}},
                        {"qdrant_ingested": False},
                    ]
                }
            )
        )
    finally:
        client.close()


def mark_job_qdrant_ingested(job_id: str) -> None:
    """Mark a job as successfully ingested into Qdrant."""
    if not job_id:
        return
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        from datetime import datetime, timezone

        db["jobs"].update_one(
            {"id": job_id},
            {
                "$set": {
                    "qdrant_ingested": True,
                    "qdrant_ingested_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
    finally:
        client.close()

def fetch_single_job_details(job_id:str):
    client=get_mongodb_client()
    db = client['jobs_db']
    collection = db['jobs']

    job=collection.find_one({
        "id":job_id

    })

    client.close()

    return job


def fetch_resume_data(user_email: str) -> dict:
    client = get_mongodb_client()
    db = client['jobs_db']
    collection = db['resumes']
    
    resume = collection.find_one({"user_email": user_email})
    
    client.close()

    return resume


def fetch_resume_data_by_upload_id(upload_id: str) -> dict:
    client = get_mongodb_client()
    db = client["jobs_db"]
    uploads = db["resume_uploads"]
    resumes = db["resumes"]
    try:
        upload = uploads.find_one({"_id": ObjectId(upload_id)})
        if not upload:
            return {}

        resume_id = upload.get("resume_id")
        if resume_id:
            resume = resumes.find_one({"_id": resume_id})
            if resume:
                return resume

        user_email = upload.get("user_email")
        if user_email:
            resume = resumes.find_one({"user_email": user_email})
            if resume:
                return resume

        return {}
    finally:
        client.close()
