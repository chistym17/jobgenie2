from pymongo import MongoClient
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
