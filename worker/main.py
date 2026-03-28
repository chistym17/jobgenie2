from fastapi import FastAPI, WebSocket, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from services.explainer_service import ExplainerService
from services.resume_advisor_service import ResumeAdvisorService
from services.match_coach_service import MatchCoachService
from db import fetch_resume_data, fetch_resume_data_by_upload_id, get_mongodb_client
import datetime
from db import check_mongodb_connection
from utils.qdrant_service import check_qdrant_connection
from celery_tasks.recommendation_task import generate_recommendations_task
from celery_tasks.precompute_embedding import precompute_resume_embedding_task
from celery.result import AsyncResult
from celery_app import celery_app
from bson import ObjectId
from utils.quota_service import can_consume_coach_call, consume_coach_call_success
from utils.match_coach_cache import (
    coach_key_from_job,
    get_cached_match_coach,
    save_match_coach_cache,
)

app = FastAPI()

recommended_jobs_cache = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    mongodb_connection = check_mongodb_connection()
    qdrant_connection = check_qdrant_connection()
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "service": "JobGenie Worker",
        "mongodb_connection": mongodb_connection,
        "qdrant_connection": qdrant_connection
    }



def find_job_by_title_and_company(job_title: str, company_name: str):
    """
    Search the recommended_jobs_cache for a job matching the given title and company name.
    Returns the matched job object or None if not found.
    """
    global recommended_jobs_cache
    if not recommended_jobs_cache:
        return None
    for job in recommended_jobs_cache:
        title = job.get("Job Title", "").strip().lower()
        company = job.get("Company Name", "").strip().lower()
        if title == job_title.strip().lower() and company == company_name.strip().lower():
            return job
    return None

@app.post("/recommendations")
async def get_recommendations(request: Request):
    """
    Endpoint to get job recommendations.
    """
    global recommended_jobs_cache
    try:
        data = await request.json()
        user_email = data.get("email", "demouser17@gmail.com")

        if recommended_jobs_cache is not None:
            jobs = recommended_jobs_cache
            return {"jobs": jobs, "message": "Recommendation task completed"}
        else:
            task = generate_recommendations_task.delay(user_email)

        return {"task_id": task.id, "message": "Recommendation task submitted"}

    
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/{task_id}")
def get_task_result(task_id: str):
    try:
        result = AsyncResult(task_id, app=celery_app)
        
        if not result.ready():
            return {
                "status": "pending",
                "task_id": task_id
            }
            
        if result.failed():
            return {
                "status": "failed",
                "error": str(result.result)  
            }
            
        if result.successful():
            return {
                "status": "completed",
                "data": result.result
            }
            
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@app.post("/match-coach")
async def match_coach(request: Request):
    try:
        payload = await request.json()
        upload_id = payload.get("upload_id")
        job = payload.get("job")

        if not upload_id:
            raise HTTPException(status_code=400, detail="upload_id is required")
        if not isinstance(job, dict) or not job:
            raise HTTPException(status_code=400, detail="job payload is required")

        user_resume = fetch_resume_data_by_upload_id(upload_id)
        if not user_resume:
            raise HTTPException(status_code=404, detail="Resume not found for upload")

        client = get_mongodb_client()
        try:
            db = client["jobs_db"]
            uploads = db["resume_uploads"]
            upload_doc = uploads.find_one({"_id": ObjectId(upload_id)})
        finally:
            client.close()

        user_email = upload_doc.get("user_email") if upload_doc else None
        if not user_email:
            raise HTTPException(status_code=404, detail="User not found for upload")

        coach_key = coach_key_from_job(job)

        cached = get_cached_match_coach(upload_id, coach_key)
        if cached:
            return {
                "upload_id": upload_id,
                "why_good_match": cached["why_good_match"],
                "improvements": cached["improvements"],
                "cached": True,
            }

        can_consume, meta = can_consume_coach_call(user_email, coach_key)
        if not can_consume:
            raise HTTPException(
                status_code=429,
                detail="Daily coach quota exceeded for today. Try again tomorrow.",
            )

        service = MatchCoachService()
        result = service.explain_and_improve(job, user_resume)

        save_match_coach_cache(
            upload_id,
            coach_key,
            user_email,
            result["why_good_match"],
            result["improvements"],
        )
        consume_coach_call_success(user_email, coach_key)
        return {
            "upload_id": upload_id,
            "why_good_match": result["why_good_match"],
            "improvements": result["improvements"],
            "cached": False,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/match-coach/cache")
async def match_coach_cache_get(
    upload_id: str = Query(...),
    job_id: str = Query(...),
):
    if not upload_id.strip() or not job_id.strip():
        raise HTTPException(status_code=400, detail="upload_id and job_id are required")
    coach_key = str(job_id)
    cached = get_cached_match_coach(upload_id, coach_key)
    if not cached:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "why_good_match": cached["why_good_match"],
        "improvements": cached["improvements"],
        "cached": True,
    }


@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                print(payload)
                msg_type = payload.get("type", "general")
                message = payload.get("message", "")
                job = payload.get("job", None)
                if msg_type == "explain":
                    email = job.get("email") if job else None
                    if not email:
                        reply = "[ERROR] No email provided in job payload."
                    else:
                        user_resume = fetch_resume_data(email)
                        job_obj = find_job_by_title_and_company(job.get("title"), job.get("company"))

                        if not user_resume:
                            reply = f"[ERROR] Resume not found for {email}."
                        else:
                            service = ExplainerService()
                            explanation = service.explain_job_match(job_obj, user_resume)
                            reply = explanation
                elif msg_type == "suggest":
                    email = job.get("email") if job else None
                    if not email:
                        reply = "[ERROR] No email provided in job payload."
                    else:
                        user_resume = fetch_resume_data(email)
                        job_obj = find_job_by_title_and_company(job.get("title"), job.get("company"))
                        if not user_resume:
                            reply = f"[ERROR] Resume not found for {email}."
                        else:
                            service = ResumeAdvisorService()
                            advice = service.provide_resume_advice(job_obj, user_resume)
                            reply = advice
                else:
                    reply = f"[MOCK] You said: {message}"
            except Exception as e:
                reply = f"[MOCK] Sorry, I could not process your message. ({e})"
            await websocket.send_json({"reply": reply})
    except Exception as e:
        print(f"WebSocket error (chat): {e}")
        await websocket.close()


@app.post("/precompute-embedding")
async def trigger_precompute_embedding(request: Request):
    """
    Endpoint to trigger precomputation of resume embeddings.
    """
    try:
        data = await request.json()
        user_email = data.get("email")
        
        if not user_email:
            raise HTTPException(status_code=400, detail="Email is required")
            
        task = precompute_resume_embedding_task.delay(user_email)
        return {"task_id": task.id, "message": "Embedding precomputation task submitted"}
        
    except Exception as e:
        print(f"Error triggering embedding precomputation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/precompute-embedding/{task_id}")
async def get_precompute_status(task_id: str):
    """
    Endpoint to check the status of a precomputation task.
    """
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        if task_result.ready():
            if task_result.successful():
                result = task_result.result
                if result:
                    return {"status": "completed", "result": result}
                else:
                    return {"status": "failed", "error": "No embedding was generated"}
            else:
                return {"status": "failed", "error": str(task_result.result)}
        else:
            return {"status": "processing"}
            
    except Exception as e:
        print(f"Error checking precomputation status: {e}")
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)