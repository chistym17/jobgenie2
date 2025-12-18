from celery_app import celery_app
from services.recommender_service import RecommenderService
from utils.upload_status import update_upload_status
from utils.logger_v2 import get_v2_logger


logger = get_v2_logger("resume_v2.worker.recommend")

@celery_app.task(name='generate_recommendations')
def generate_recommendations_task(user_email: str, upload_id: str | None = None):
    try:
        if upload_id:
            update_upload_status(upload_id, "recommendations")
            logger.info("Recommendations started for upload_id=%s user_email=%s", upload_id, user_email)
        
        service = RecommenderService()
        recommendations = service.generate_recommendations(user_email)
        
        if upload_id:
            update_upload_status(upload_id, "completed")
            logger.info("Recommendations completed for upload_id=%s user_email=%s", upload_id, user_email)
        return recommendations
    except Exception as e:
        print(f"Error in recommendation task: {e}")
        if upload_id:
            update_upload_status(upload_id, "failed", error_message=str(e))
            logger.error("Recommendations failed for upload_id=%s user_email=%s err=%s", upload_id, user_email, e)
        raise 