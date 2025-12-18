from datetime import datetime

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



