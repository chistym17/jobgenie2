import json
from services.base_gemini_service import BaseGeminiService
from services.prompts import get_explanation_prompt
from utils.funcs import sanitize_resume

class ExplainerService(BaseGeminiService):
    def explain_job_match(self, job_object: dict, user_resume: dict) -> str:
        sanitized_resume = sanitize_resume(user_resume)
        job_str = json.dumps(job_object, indent=2)
        resume_str = json.dumps(sanitized_resume, indent=2)
        prompt = get_explanation_prompt(job_str, resume_str)

        try:
            response = self.model.generate_content(prompt)
            
            explanation = response.text.strip()
            return explanation
            
        except Exception as e:
            print(f"[EXPLAINER_SERVICE] Error generating explanation: {e}")
            raise ValueError(f"Failed to generate explanation: {e}")

