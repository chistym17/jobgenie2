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

    def explain_job_match(self, job_object: dict, user_resume: dict) -> str:
        from utils.funcs import sanitize_resume
        
        sanitized_resume = sanitize_resume(user_resume)
        job_str = json.dumps(job_object, indent=2)
        resume_str = json.dumps(sanitized_resume, indent=2)
        
        prompt = f"""You are an expert job match explainer.
You will receive a job object and a user's resume as input.
Analyze the job requirements, responsibilities, and desired skills from the job object: {job_str}, and compare them carefully with the user's experience, skills, and background from the resume: {resume_str}.
Write a clear, concise explanation that *directly compares* the job posting with the user's profile: for each major requirement, explain how the user meets it, referencing specific experiences, skills, or achievements.
Your explanation should follow this pattern: "The job requires [requirement], and you have [matching skill/experience]."
Always address the user directly as "you" — do not use their name, and do not refer to them as "the candidate" or "he/she."
If the user lacks any skills, explain how their transferable skills can help cover the gap.
Your final output MUST be a single, well-structured paragraph (no bullet points, no markdown, no extraneous text).
Only return the explanation text, and nothing else.
"""

        try:
            response = self.genai_client.models.generate_content(
                model=self.model_name,
                contents=[prompt]
            )
            
            explanation = response.text.strip()
            return explanation
            
        except Exception as e:
            print(f"[RECOMMENDATION_SERVICE] Error generating explanation: {e}")
            raise ValueError(f"Failed to generate explanation: {e}")

    def provide_resume_advice(self, job_object: dict, user_resume: dict) -> str:
        from utils.funcs import sanitize_resume
        
        sanitized_resume = sanitize_resume(user_resume)
        job_str = json.dumps(job_object, indent=2)
        resume_str = json.dumps(sanitized_resume, indent=2)
        
        prompt = f"""You are an expert resume advisor.
You will receive a job description and a user's resume as input.
Analyze the job requirements, responsibilities, and desired skills from the job description: {job_str}, and carefully review the user's resume: {resume_str}.
Identify any gaps, weaknesses, or areas for improvement that would make the resume better aligned with the job.
Provide clear, specific suggestions on how the user can improve their resume — such as adding missing skills, emphasizing relevant experiences, adjusting wording to better match the job description, or reordering sections to highlight strengths.
Your advice should directly reference elements from the resume and job description.
Always address the user directly as "you" — do not refer to them as "the candidate" or "he/she."
Your final output MUST be a single, clear paragraph (no bullet points, no markdown, no extraneous text), offering constructive and actionable feedback.
Only return the advice text, and nothing else.
"""

        try:
            response = self.genai_client.models.generate_content(
                model=self.model_name,
                contents=[prompt]
            )
            
            advice = response.text.strip()
            return advice
            
        except Exception as e:
            print(f"[RECOMMENDATION_SERVICE] Error generating advice: {e}")
            raise ValueError(f"Failed to generate advice: {e}")

