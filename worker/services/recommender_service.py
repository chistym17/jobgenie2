import json
import re
from services.base_gemini_service import BaseGeminiService
from services.prompts import get_recommendation_prompt
from fetch_recommendations import fetch_recommendations

class RecommenderService(BaseGeminiService):
    def generate_recommendations(self, user_email: str) -> list:
        job_chunks = fetch_recommendations(user_email)
        
        if not job_chunks:
            return []
        
        jobs_text = "\n\n".join([str(chunk) for chunk in job_chunks[:20]])
        prompt = get_recommendation_prompt(jobs_text)

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
            print(f"[RECOMMENDER_SERVICE] Error generating recommendations: {e}")
            raise ValueError(f"Failed to generate recommendations: {e}")

