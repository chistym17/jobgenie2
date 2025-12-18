import os
import json
import re
from google import genai
from dotenv import load_dotenv
from fetch_recommendations import fetch_recommendations

load_dotenv()

class RecommendationService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY in environment variables.")
        self.genai_client = genai.Client(api_key=self.api_key)
        
        model_name_raw = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
        self.model_name = model_name_raw.lower().replace(" ", "-").strip()
        if self.model_name != model_name_raw:
            print(f"[RECOMMENDATION_SERVICE] Model name normalized from '{model_name_raw}' to '{self.model_name}'")

    def generate_recommendations(self, user_email: str) -> list:
        job_chunks = fetch_recommendations(user_email)
        
        if not job_chunks:
            return []
        
        jobs_text = "\n\n".join([str(chunk) for chunk in job_chunks[:20]])
        
        prompt = f"""You are a job recommendation formatter. Transform the following job listings into a structured JSON array.

Job Listings:
{jobs_text}

Transform each job into a JSON object with these fields:
- Job Title
- Company Name
- Location
- Job Type
- Salary
- Posted Date
- Application Deadline
- Key Requirements
- Bonus Skills
- Stack
- Description
- How to Apply
- Direct Link
- Match Score (as a percentage, e.g., 55 for 55%)

Return ONLY a valid JSON array with up to 5 best matching jobs. Each job should be a JSON object.
Do not include any markdown, explanations, or text outside the JSON array.
The Match Score should be a number representing the percentage match (0-100).

Example format:
[
  {{
    "Job Title": "...",
    "Company Name": "...",
    "Location": "...",
    "Job Type": "...",
    "Salary": "...",
    "Posted Date": "...",
    "Application Deadline": "...",
    "Key Requirements": "...",
    "Bonus Skills": "...",
    "Stack": "...",
    "Description": "...",
    "How to Apply": "...",
    "Direct Link": "...",
    "Match Score": 85
  }}
]
"""

        try:
            response = self.genai_client.models.generate_content(
                model=self.model_name,
                contents=[prompt]
            )
            
            response_text = response.text.strip()
            
            match = re.search(r"```json(.*?)```", response_text, re.DOTALL)
            json_str = match.group(1).strip() if match else response_text
            
            cleaned_str = (
                json_str
                .replace("'", '"')
                .replace('None', 'null')
                .replace('True', 'true')
                .replace('False', 'false')
            )
            
            recommendations = json.loads(cleaned_str)
            
            if not isinstance(recommendations, list):
                recommendations = [recommendations]
            
            return recommendations[:5]
            
        except Exception as e:
            print(f"[RECOMMENDATION_SERVICE] Error generating recommendations: {e}")
            raise ValueError(f"Failed to generate recommendations: {e}")

