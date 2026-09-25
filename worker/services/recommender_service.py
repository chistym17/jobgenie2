import json
import os
import re

from fetch_recommendations import fetch_recommendations
from services.prompts import get_recommendation_prompt
from utils.groq_client import get_groq_client

try:
    import json_repair

    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False


class RecommenderService:
    # Soft display fields — filled from Mongo/candidate data when the model omits them
    DISPLAY_FIELDS = [
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
        response_text = (response_text or "").strip()
        if not response_text:
            return ""

        match = re.search(r"```(?:json)?\s*(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()

        # Prefer array, else object
        for open_c, close_c in (("[", "]"), ("{", "}")):
            start = response_text.find(open_c)
            end = response_text.rfind(close_c)
            if start != -1 and end != -1 and end > start:
                return response_text[start : end + 1].strip()

        return response_text

    def _clean_json_string(self, json_str: str) -> str:
        cleaned = json_str.strip()
        cleaned = cleaned.replace("None", "null")
        cleaned = cleaned.replace("True", "true")
        cleaned = cleaned.replace("False", "false")
        cleaned = re.sub(r",\s*}", "}", cleaned)
        cleaned = re.sub(r",\s*]", "]", cleaned)
        return cleaned

    def _parse_json_safely(self, json_str: str):
        cleaned = self._clean_json_string(json_str)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            if HAS_JSON_REPAIR:
                try:
                    repaired = json_repair.repair_json(cleaned)
                    return json.loads(repaired) if isinstance(repaired, str) else repaired
                except Exception:
                    pass

            print(f"[RECOMMENDER_SERVICE] JSON parse error at position {e.pos}: {e.msg}")
            print(
                f"[RECOMMENDER_SERVICE] Problematic section: {cleaned[max(0, e.pos - 100) : e.pos + 100]}"
            )
            raise ValueError(f"Failed to parse JSON: {e.msg} at position {e.pos}")

    def _normalize_recommendations_payload(self, parsed) -> list:
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            for key in ("recommendations", "jobs", "matches", "results", "data"):
                val = parsed.get(key)
                if isinstance(val, list):
                    return val
            # Single job object
            if parsed.get("Job ID") or parsed.get("job_id"):
                return [parsed]
        return []

    def _candidate_map(self, candidates: list) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for c in candidates:
            jid = str(c.get("job_id") or "").strip()
            if jid:
                out[jid] = c
        return out

    def _hydrate_from_candidate(self, item: dict, candidate: dict | None) -> dict:
        """Fill missing display fields from hybrid-search candidate / Mongo job."""
        c = candidate or {}
        jid = str(item.get("Job ID") or item.get("job_id") or c.get("job_id") or "").strip()
        hydrated = {
            "Job ID": jid,
            "Job Title": item.get("Job Title") or c.get("title") or "Untitled role",
            "Company Name": item.get("Company Name") or c.get("company") or "Not specified",
            "Location": item.get("Location") or c.get("location") or "Not specified",
            "Job Type": item.get("Job Type") or "Not specified",
            "Salary": item.get("Salary") or "Not specified",
            "Posted Date": item.get("Posted Date") or c.get("date") or "Not specified",
            "Application Deadline": item.get("Application Deadline") or "Not specified",
            "Key Requirements": item.get("Key Requirements")
            or (c.get("summary") or "")[:400]
            or "Not specified",
            "Bonus Skills": item.get("Bonus Skills") or "Not specified",
            "Stack": item.get("Stack") or "Not specified",
            "Description": item.get("Description")
            or (c.get("summary") or "")[:800]
            or "Not specified",
            "How to Apply": item.get("How to Apply") or "Apply via the job link",
            "Direct Link": item.get("Direct Link") or c.get("url") or "",
            "Match Score": item.get("Match Score") or item.get("match_score") or 0,
        }
        return hydrated

    def _recommendations_from_candidates(self, candidates: list, limit: int = 5) -> list:
        """Deterministic fallback when the LLM returns nothing usable."""
        built: list = []
        for idx, c in enumerate(candidates[:limit]):
            jid = str(c.get("job_id") or "").strip()
            if not jid:
                continue
            score = max(45, 98 - idx * 6)
            built.append(
                self._hydrate_from_candidate(
                    {"Job ID": jid, "Match Score": score},
                    c,
                )
            )
        return built

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
                score = int(item.get("Match Score") or 45)
            item["Match Score"] = max(0, min(100, int(score)))
            updated.append(item)
        return updated

    def _filter_and_hydrate(self, recommendations: list, candidates: list) -> list:
        if not isinstance(recommendations, list):
            return []
        by_id = self._candidate_map(candidates)
        allowed_ids = set(by_id.keys())
        filtered: list = []
        dropped = 0
        seen: set[str] = set()

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
            if jid in seen:
                dropped += 1
                continue
            seen.add(jid)
            hydrated = self._hydrate_from_candidate(item, by_id.get(jid))
            filtered.append(hydrated)

        if dropped:
            print(f"[RECOMMENDER_SERVICE] Dropped {dropped} incomplete/duplicate recommendation item(s)")
        return filtered

    def _rank_with_groq(self, candidates: list, max_jobs: int) -> list:
        client = get_groq_client()
        model_name = os.getenv("GROQ_MODEL_NAME", "llama3-8b-8192")
        try:
            max_tokens = int(os.getenv("RECOMMENDER_MAX_TOKENS", "4096"))
        except Exception:
            max_tokens = 4096
        max_tokens = max(1024, min(8192, max_tokens))

        # Prefer compact ranking JSON to avoid truncation on smaller models
        compact = []
        for c in candidates[:max_jobs]:
            compact.append(
                {
                    "job_id": str(c.get("job_id") or "").strip(),
                    "title": str(c.get("title") or "")[:120],
                    "company": str(c.get("company") or "")[:80],
                    "summary": str(c.get("summary") or "")[:400],
                }
            )

        system = (
            "You rank job matches. Return ONLY valid JSON with this shape: "
            '{"recommendations":[{"Job ID":"<exact job_id>","Match Score":<0-100>}]}. '
            "Include at most 5 items. Preserve Job ID exactly."
        )
        user = (
            "Rank the best matches from these jobs (best first):\n"
            + json.dumps(compact, ensure_ascii=False)
        )

        create_kwargs = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.1,
        }

        try:
            response = client.chat.completions.create(
                **create_kwargs,
                response_format={"type": "json_object"},
            )
        except Exception as json_mode_err:
            print(f"[RECOMMENDER_SERVICE] JSON mode unavailable ({json_mode_err}); retrying")
            # Fall back to the richer formatting prompt without JSON mode
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": get_recommendation_prompt(candidates[:max_jobs])}],
                max_tokens=max_tokens,
                temperature=0.1,
            )

        response_text = (response.choices[0].message.content or "").strip()
        finish = getattr(response.choices[0], "finish_reason", None)
        if finish == "length":
            print(f"[RECOMMENDER_SERVICE] Response truncated (finish_reason=length, max_tokens={max_tokens})")

        parsed = self._parse_json_safely(self._extract_json_from_response(response_text))
        return self._normalize_recommendations_payload(parsed)

    def generate_recommendations(self, user_email: str) -> list:
        job_data_list = fetch_recommendations(user_email)

        if not job_data_list:
            return []

        try:
            max_jobs = int(os.getenv("RECOMMENDER_MAX_JOBS", "10"))
        except Exception:
            max_jobs = 10
        max_jobs = max(1, min(30, max_jobs))
        candidates = job_data_list[:max_jobs]

        try:
            recommendations = self._rank_with_groq(candidates, max_jobs)
            recommendations = self._apply_deterministic_match_scores(recommendations[:5], candidates)
            recommendations = self._filter_and_hydrate(recommendations, candidates)

            if not recommendations:
                print("[RECOMMENDER_SERVICE] LLM returned no usable rows; using candidate fallback")
                recommendations = self._recommendations_from_candidates(candidates, limit=5)
                recommendations = self._apply_deterministic_match_scores(recommendations, candidates)

            return recommendations[:5]

        except Exception as e:
            print(f"[RECOMMENDER_SERVICE] Error generating recommendations: {e}")
            print("[RECOMMENDER_SERVICE] Falling back to hybrid candidates")
            fallback = self._recommendations_from_candidates(candidates, limit=5)
            fallback = self._apply_deterministic_match_scores(fallback, candidates)
            if fallback:
                return fallback[:5]
            raise ValueError(f"Failed to generate recommendations: {e}")
