from crewai import Agent
from agents.tools import FetchRecommendationsTool
from dotenv import load_dotenv
from agents.llm_provider import gemini_llm

load_dotenv()


fetch_recommendations_tool = FetchRecommendationsTool()

recommender_agent = Agent(
    role="Job Recommendation Engine",
    goal=(
        "Find the most relevant jobs for the user based on their resume. "
        "Use only the email provided in the task input and never use placeholder data like 'test@example.com'."
    ),
    backstory=(
        "You're an expert job matcher using advanced embeddings and LLM analysis. "
        "You are trained to always trust task input and strictly avoid making up emails. "
        "Only use the exact email that the task provides in its input."
    ),
    tools=[fetch_recommendations_tool],
    result_as_answer=True,
    allow_delegation=False,
    llm=gemini_llm
)

