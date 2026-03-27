import json
import re
from typing import List
from services.base_gemini_service import BaseGeminiService
from services.prompts import get_match_coach_prompt
from utils.funcs import sanitize_resume


def _normalize_bullets(val) -> List[str]:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    s = str(val).strip()
    if not s:
        return []
    if "\n" in s:
        lines = []
        for line in s.split("\n"):
            t = re.sub(r"^[-•*\d.)\s]+", "", line.strip()).strip()
            if t:
                lines.append(t)
        return lines if lines else [s]
    return [s]


class MatchCoachService(BaseGeminiService):
    def explain_and_improve(self, job_object: dict, user_resume: dict) -> dict:
        sanitized_resume = sanitize_resume(user_resume)
        job_str = json.dumps(job_object or {}, indent=2)
        resume_str = json.dumps(sanitized_resume or {}, indent=2)
        prompt = get_match_coach_prompt(job_str, resume_str)

        response = self.model.generate_content(prompt)
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:].strip()

        parsed = json.loads(text)
        why = _normalize_bullets(parsed.get("why_good_match"))
        improvements = _normalize_bullets(parsed.get("improvements"))
        if not why or not improvements:
            raise ValueError("Invalid match coach response")

        return {
            "why_good_match": why,
            "improvements": improvements,
        }
