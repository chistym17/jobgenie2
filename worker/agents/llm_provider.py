from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()

gemini_llm = LLM(
    model="gemini/gemini-2.0-flash",
    provider="google_ai",  
    api_key=os.getenv("GOOGLE_API_KEY"),
    verbose=True, 
    model_kwargs={"temperature": 0.5} 
)
