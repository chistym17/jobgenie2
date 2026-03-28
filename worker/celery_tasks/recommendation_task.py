from celery_app import celery_app
from services.recommender_service import RecommenderService
from utils.upload_status import update_upload_status, add_activity_event
from utils.logger_v2 import get_v2_logger
from utils.funcs import sanitize_error_message
from utils.recommendation_storage import (
    check_existing_recommendations,
    save_recommendations,
    update_upload_with_recommendation_id,
)
from db import get_mongodb_client
from bson import ObjectId
from utils.quota_service import (
    can_consume_upload_completion,
    consume_upload_completion_success,
)


logger = get_v2_logger("resume_v2.worker.recommend")

@celery_app.task(name='generate_recommendations')
def generate_recommendations_task(user_email: str, upload_id: str | None = None, force_refresh: bool = False):
    try:
        if upload_id:
            update_upload_status(upload_id, "recommendations")
            logger.info("Recommendations started for upload_id=%s user_email=%s", upload_id, user_email)
            
            if not force_refresh:
                existing = check_existing_recommendations(upload_id)
                if existing:
                    logger.info("Found existing recommendations for upload_id=%s", upload_id)
                    recommendations = existing.get("recommendations", [])
                    if upload_id:
                        update_upload_status(upload_id, "completed")
                        consume_upload_completion_success(user_email, upload_id)
                    return recommendations

            if upload_id:
                allowed, meta = can_consume_upload_completion(user_email, upload_id)
                if not allowed:
                    sanitized = sanitize_error_message("Daily upload quota exceeded")
                    update_upload_status(upload_id, "failed", error_message=sanitized)
                    add_activity_event(upload_id, "Quota Exceeded", "Daily resume quota exceeded. Try again tomorrow.", "failed", sanitized)
                    logger.warning(
                        "Upload quota exceeded for user_email=%s upload_id=%s meta=%s",
                        user_email,
                        upload_id,
                        meta,
                    )
                    return []
        
        service = RecommenderService()
        recommendations = service.generate_recommendations(user_email)

        if upload_id:
            client = get_mongodb_client()
            try:
                db = client["jobs_db"]
                uploads_collection = db["resume_uploads"]
                upload_doc = uploads_collection.find_one({"_id": ObjectId(upload_id)})
                resume_id = str(upload_doc.get("resume_id", "")) if upload_doc and upload_doc.get("resume_id") else None
            finally:
                client.close()

            recommendation_id = save_recommendations(
                upload_id=upload_id,
                user_email=user_email,
                recommendations=recommendations,
                resume_id=resume_id,
            )

            update_upload_with_recommendation_id(upload_id, recommendation_id)
            logger.info("Saved recommendations: recommendation_id=%s upload_id=%s", recommendation_id, upload_id)
        
        if upload_id:
            update_upload_status(upload_id, "completed")
            event_message = (
                "Your personalized job recommendations are ready!"
                if recommendations
                else "No job recommendations could be generated for this resume yet."
            )
            add_activity_event(upload_id, "Recommendations Ready", event_message, "completed")
            consume_upload_completion_success(user_email, upload_id)
            logger.info("Recommendations completed for upload_id=%s user_email=%s", upload_id, user_email)
        return recommendations
    except Exception as e:
        print(f"Error in recommendation task: {e}")
        if upload_id:
            sanitized_error = sanitize_error_message(e)
            update_upload_status(upload_id, "failed", error_message=sanitized_error)
            add_activity_event(upload_id, "Processing Failed", "An error occurred during processing", "failed", sanitized_error)
            logger.error("Recommendations failed for upload_id=%s user_email=%s err=%s", upload_id, user_email, e)
        raise 