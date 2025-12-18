from celery_app import celery_app
from db import fetch_resume_data
from utils.local_embedder import get_embedding
from utils.qdrant_service import insert_resume_embedding
from fetch_recommendations import extract_relevant_resume_text, chunk_text
from celery_tasks.recommendation_task import generate_recommendations_task
from utils.upload_status import update_upload_status
from utils.logger_v2 import get_v2_logger
import numpy as np


logger = get_v2_logger("resume_v2.worker.embedding")

@celery_app.task(name='precompute_resume_embedding')
def precompute_resume_embedding_task(user_email: str, upload_id: str | None = None):

    try:
        if upload_id:
            update_upload_status(upload_id, "embedding")
            logger.info("Embedding started for upload_id=%s user_email=%s", upload_id, user_email)

        resume = fetch_resume_data(user_email)
        if not resume:
            print(f"No resume data found for {user_email}")
            if upload_id:
                update_upload_status(upload_id, "embedding_failed", error_message=f"No resume data for {user_email}")
                logger.error("Embedding failed for upload_id=%s user_email=%s reason=no_resume", upload_id, user_email)
            return None

        relevant_text = extract_relevant_resume_text(resume)
        chunks = chunk_text(relevant_text, max_length=500)
        
        embeddings = []
        for chunk in chunks:
            if chunk.strip():
                emb = get_embedding(chunk)
                if emb:  
                    embeddings.append(emb)
        
        if not embeddings:
            print(f"Failed to compute embeddings for {user_email}")
            if upload_id:
                update_upload_status(upload_id, "embedding_failed", error_message="No embeddings generated")
                logger.error("Embedding failed for upload_id=%s user_email=%s reason=no_embeddings", upload_id, user_email)
            return None

        final_embedding = np.mean(embeddings, axis=0).tolist()
        
        result = insert_resume_embedding(final_embedding, {"email": user_email})
        
        if not result:
            if upload_id:
                update_upload_status(upload_id, "embedding_failed", error_message="Failed to insert embedding")
                logger.error("Embedding failed for upload_id=%s user_email=%s reason=insert_failed", upload_id, user_email)
            return None

        if upload_id:
            update_upload_status(upload_id, "embedding_completed")
            logger.info("Embedding completed for upload_id=%s user_email=%s", upload_id, user_email)
            rec_task = generate_recommendations_task.delay(user_email, upload_id)
            update_upload_status(upload_id, "recommendations", recommendation_task_id=rec_task.id)
            logger.info(
                "Triggered generate_recommendations_task for upload_id=%s task_id=%s user_email=%s",
                upload_id,
                rec_task.id,
                user_email,
            )

        return {"status": "success", "email": user_email}

    except Exception as e:
        print(f"Error in precompute_resume_embedding_task: {e}")
        if upload_id:
            update_upload_status(upload_id, "embedding_failed", error_message=str(e))
            logger.error("Embedding exception for upload_id=%s user_email=%s err=%s", upload_id, user_email, e)
        raise
