from datetime import datetime
from typing import Optional

from bson import ObjectId

from db import get_mongodb_client


def update_upload_status(upload_id: str, status: str, **extra_fields):
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        collection = db["resume_uploads"]
        update = {"status": status, "updated_at": datetime.utcnow()}
        if extra_fields:
            update.update(extra_fields)
        collection.update_one({"_id": ObjectId(upload_id)}, {"$set": update})
    finally:
        client.close()


def add_activity_event(
    upload_id: str,
    step: str,
    message: str,
    status: str,
    error_message: Optional[str] = None,
):
    """
    Add an activity event to the timeline (synchronous version for worker).
    
    Args:
        upload_id: Upload document ID
        step: Step name (e.g., "Resume Uploaded", "Parsing Started")
        message: Activity message
        status: Status type ("completed", "in_progress", "failed", "pending")
        error_message: Optional error message for failed statuses
    """
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        collection = db["resume_uploads"]
        
        activity_event = {
            "step": step,
            "message": message,
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if error_message:
            activity_event["error_message"] = error_message

        collection.update_one(
            {"_id": ObjectId(upload_id)},
            {
                "$push": {"activity_timeline": activity_event},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
    finally:
        client.close()



