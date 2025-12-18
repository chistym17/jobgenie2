## api to upload and parse users resume via gemini llm

import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from app.services.resume_parser import ResumeParser
from app.db.models import ResumeResponse
import tempfile
import shutil
from bson import ObjectId
from datetime import datetime
import json
from typing import Dict, Any

router = APIRouter(prefix="/resume", tags=["Resume Parsing"])
parser = ResumeParser()

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError ("Type %s not serializable" % type(obj))

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), user_email: str = Form(...)) -> Dict[str, Any]:
    print(f"[UPLOAD_API] Received upload request from user: {user_email}")
    print(f"[UPLOAD_API] File name: {file.filename}")
    print(f"[UPLOAD_API] File content type: {file.content_type}")
    
    if not file.filename.endswith(".pdf"):
        print("[UPLOAD_API] ERROR: File is not PDF")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        print("[UPLOAD_API] Creating temporary file...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        print(f"[UPLOAD_API] Temporary file created: {tmp_path}")

        print("[UPLOAD_API] Calling parser.process_resume...")
        resume_id, task_id = await parser.process_resume(tmp_path, user_email=user_email)
        print(f"[UPLOAD_API] Process resume completed. Resume ID: {resume_id}, Task ID: {task_id}")
        
        try:
            os.unlink(tmp_path)
            print(f"[UPLOAD_API] Temporary file cleaned up: {tmp_path}")
        except Exception as cleanup_err:
            print(f"[UPLOAD_API] Warning: Failed to clean up temporary file: {cleanup_err}")

        print("[UPLOAD_API] Fetching resume data from MongoDB...")
        resume_data = await parser.resumes_collection.find_one({"_id": ObjectId(resume_id)})
        if not resume_data:
            print("[UPLOAD_API] ERROR: Resume data not found in MongoDB")
            raise HTTPException(status_code=500, detail="Failed to retrieve saved resume data")
        print("[UPLOAD_API] Resume data retrieved successfully")
            
        resume_data["_id"] = str(resume_data["_id"])
        resume_data["created_at"] = resume_data["created_at"].isoformat()
        resume_data["updated_at"] = resume_data["updated_at"].isoformat()
        
        response_data = {
            "resume": resume_data,
            "task_id": task_id,
            "message": "Resume uploaded and processing started"
        }
        
        print("[UPLOAD_API] Returning success response")
        return JSONResponse(content=response_data)
        
    except Exception as e:
        print(f"[UPLOAD_API] ERROR: {str(e)}")
        print(f"[UPLOAD_API] Error type: {type(e)}")
        import traceback
        print(f"[UPLOAD_API] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
