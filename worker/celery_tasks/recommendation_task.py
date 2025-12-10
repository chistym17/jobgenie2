from celery_app import celery_app
from agents.initialize_crews import run_crew_for_recommendations

@celery_app.task(name='generate_recommendations')
def generate_recommendations_task(user_email: str):
    """
    Celery task to generate job recommendations
    """
    try:
        recommendations = run_crew_for_recommendations(user_email)
        return recommendations
    except Exception as e:
        print(f"Error in recommendation task: {e}")
        raise 