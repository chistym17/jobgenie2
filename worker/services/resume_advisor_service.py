import json
from services.base_gemini_service import BaseGeminiService
from services.prompts import get_resume_advice_prompt
from utils.funcs import sanitize_resume

class ResumeAdvisorService(BaseGeminiService):
    def provide_resume_advice(self, job_object: dict, user_resume: dict) -> str:
        sanitized_resume = sanitize_resume(user_resume)
        job_str = json.dumps(job_object, indent=2)
        resume_str = json.dumps(sanitized_resume, indent=2)
        prompt = get_resume_advice_prompt(job_str, resume_str)

        try:
            response = self.model.generate_content(prompt)
            
            advice = response.text.strip()
            return advice
            
        except Exception as e:
            print(f"[RESUME_ADVISOR_SERVICE] Error generating advice: {e}")
            raise ValueError(f"Failed to generate advice: {e}")

