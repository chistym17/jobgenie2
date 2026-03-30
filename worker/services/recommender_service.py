import json
import re
from services.prompts import get_recommendation_prompt
from fetch_recommendations import fetch_recommendations
from utils.groq_client import get_groq_client

try:
    import json_repair
    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False

class RecommenderService:
    REQUIRED_FIELDS = [
        "Job ID",
        "Job Title",
        "Company Name",
        "Location",
        "Job Type",
        "Salary",
        "Posted Date",
        "Application Deadline",
        "Key Requirements",
        "Bonus Skills",
        "Stack",
        "Description",
        "How to Apply",
        "Direct Link",
        "Match Score",
    ]

    def _extract_json_from_response(self, response_text: str) -> str:
        response_text = response_text.strip()
        
        match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        match = re.search(r"```\s*(.*?)\s*```", response_text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        match = re.search(r"\[\s*\{.*\}\s*\]", response_text, re.DOTALL)
        if match:
            return match.group(0).strip()
        
        return response_text

    def _clean_json_string(self, json_str: str) -> str:
        cleaned = json_str.strip()
        cleaned = cleaned.replace("'", '"')
        cleaned = cleaned.replace('None', 'null')
        cleaned = cleaned.replace('True', 'true')
        cleaned = cleaned.replace('False', 'false')
        cleaned = re.sub(r',\s*}', '}', cleaned)
        cleaned = re.sub(r',\s*]', ']', cleaned)
        return cleaned

    def _parse_json_safely(self, json_str: str) -> list:
        cleaned = self._clean_json_string(json_str)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            if HAS_JSON_REPAIR:
                try:
                    repaired = json_repair.repair_json(cleaned)
                    return json.loads(repaired)
                except Exception:
                    pass
            
            print(f"[RECOMMENDER_SERVICE] JSON parse error at position {e.pos}: {e.msg}")
            print(f"[RECOMMENDER_SERVICE] Problematic section: {cleaned[max(0, e.pos-100):e.pos+100]}")
            
            match = re.search(r'\[.*?\]', cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
            
            raise ValueError(f"Failed to parse JSON: {e.msg} at position {e.pos}")

    def _apply_deterministic_match_scores(self, recommendations: list, candidates: list) -> list:
        if not isinstance(recommendations, list):
            return recommendations
        rank_map: dict[str, int] = {}
        rrf_map: dict[str, float] = {}
        for idx, c in enumerate(candidates, start=1):
            jid = str(c.get("job_id") or "").strip()
            if not jid:
                continue
            rank_map[jid] = idx
            rrf_map[jid] = float(c.get("rrf_score") or 0.0)
        if not rank_map:
            return recommendations
        vals = [v for v in rrf_map.values() if v > 0]
        min_rrf = min(vals) if vals else 0.0
        max_rrf = max(vals) if vals else 0.0
        span = (max_rrf - min_rrf) if max_rrf > min_rrf else 0.0
        updated: list = []
        for item in recommendations:
            if not isinstance(item, dict):
                updated.append(item)
                continue
            jid = str(item.get("Job ID") or item.get("job_id") or "").strip()
            if jid and jid in rank_map:
                rrf = rrf_map.get(jid, 0.0)
                if span > 0:
                    norm = (rrf - min_rrf) / span
                    score = int(round(55 + (norm * 40)))
                else:
                    rank = rank_map[jid]
                    score = max(45, 98 - ((rank - 1) * 6))
            else:
                score = 45
            score = max(0, min(100, int(score)))
            item["Match Score"] = score
            updated.append(item)
        return updated

    def _filter_incomplete_recommendations(self, recommendations: list, candidates: list) -> list:
        if not isinstance(recommendations, list):
            return []
        allowed_ids = {
            str(c.get("job_id") or "").strip()
            for c in candidates
            if str(c.get("job_id") or "").strip()
        }
        filtered: list = []
        dropped = 0
        for item in recommendations:
            if not isinstance(item, dict):
                dropped += 1
                continue
            jid = str(item.get("Job ID") or item.get("job_id") or "").strip()
            if not jid:
                dropped += 1
                continue
            if allowed_ids and jid not in allowed_ids:
                dropped += 1
                continue
            missing = [k for k in self.REQUIRED_FIELDS if k not in item]
            if missing:
                dropped += 1
                continue
            filtered.append(item)
        if dropped:
            print(f"[RECOMMENDER_SERVICE] Dropped {dropped} incomplete recommendation item(s)")
        return filtered

    def generate_recommendations(self, user_email: str) -> list:
        job_data_list = fetch_recommendations(user_email)
        
        if not job_data_list:
            return []
        
        try:
            max_jobs = int(__import__("os").getenv("RECOMMENDER_MAX_JOBS", "10"))
        except Exception:
            max_jobs = 10
        max_jobs = max(1, min(30, max_jobs))

        prompt = get_recommendation_prompt(job_data_list[:max_jobs])

        try:
            client = get_groq_client()
            model_name = __import__("os").getenv("GROQ_MODEL_NAME", "llama3-8b-8192")
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1400,
                temperature=0.2,
            )

            response_text = (response.choices[0].message.content or "").strip()
            json_str = self._extract_json_from_response(response_text)
            recommendations = self._parse_json_safely(json_str)
            
            if not isinstance(recommendations, list):
                recommendations = [recommendations]

            recommendations = self._apply_deterministic_match_scores(
                recommendations[:5],
                job_data_list[:max_jobs],
            )
            recommendations = self._filter_incomplete_recommendations(
                recommendations,
                job_data_list[:max_jobs],
            )
            return recommendations[:5]
            
        except Exception as e:
            print(f"[RECOMMENDER_SERVICE] Error generating recommendations: {e}")
            print(f"[RECOMMENDER_SERVICE] Response text (first 500 chars): {response_text[:500] if 'response_text' in locals() else 'N/A'}")
            raise ValueError(f"Failed to generate recommendations: {e}")

