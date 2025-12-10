import json
from agents.recommender_agent import recommender_agent
from agents.explainer_agent import explainer_agent
from agents.resume_advisor_agent import resume_advisor_agent
from agents.Tasks import create_recommendation_task, create_explanation_task, create_resume_advice_task
from utils.funcs import clean_crew_output, sanitize_resume
from crewai import Crew




def run_crew_for_recommendations(email: str):
    recommendation_task = create_recommendation_task(email)
    recommender_crew = Crew(
        agents=[recommender_agent],
        tasks=[recommendation_task],
    )
    result = recommender_crew.kickoff(inputs={"email": email})
    jobs_str = result.final_answer if hasattr(result, "final_answer") else str(result.raw)
    jobs_str = clean_crew_output(jobs_str)
    try:
        jobs = json.loads(jobs_str)
    except Exception:
        jobs = []
    return jobs


def run_crew_for_explanation(job_object, user_resume):
    user_resume = sanitize_resume(user_resume)
    explanation_task = create_explanation_task(job_object, user_resume)
    explainer_crew = Crew(
        agents=[explainer_agent],
        tasks=[explanation_task],
    )
    result = explainer_crew.kickoff(inputs={"job_object": job_object, "user_resume": user_resume})
    explanation = result.final_answer if hasattr(result, "final_answer") else str(result.raw)
    return explanation

def run_crew_for_advice(job_object, user_resume):
    user_resume = sanitize_resume(user_resume)
    advice_task = create_resume_advice_task(job_object, user_resume)
    advisor_crew = Crew(
        agents=[resume_advisor_agent],
        tasks=[advice_task],
    )
    result = advisor_crew.kickoff(inputs={"job_object": job_object, "user_resume": user_resume})
    advice = result.final_answer if hasattr(result, "final_answer") else str(result.raw)
    return advice