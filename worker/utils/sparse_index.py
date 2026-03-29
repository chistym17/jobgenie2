import re
import time
from typing import Any

from db import fetch_all_jobs

_CACHE: dict[str, Any] = {
    "loaded": False,
    "loaded_at": 0.0,
    "docs": [],
}


def _to_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        parts = [_to_text(v) for v in value]
        return " ".join([p for p in parts if p])
    if isinstance(value, dict):
        parts = [_to_text(v) for v in value.values()]
        return " ".join([p for p in parts if p])
    return ""


def _build_doc_text(job: dict) -> str:
    content = job.get("content")
    if isinstance(content, dict):
        title = _to_text(content.get("title"))
        company = _to_text(content.get("company"))
        location = _to_text(content.get("location"))
        requirements = _to_text(content.get("requirements") or content.get("requirement"))
        description = _to_text(content.get("description"))
    else:
        title = _to_text(job.get("title"))
        company = _to_text(job.get("company"))
        location = _to_text(job.get("location"))
        requirements = _to_text(job.get("requirements") or job.get("requirement"))
        description = _to_text(job.get("description"))
    raw = " ".join([title, company, location, requirements, description]).strip()
    return re.sub(r"\s+", " ", raw)


def _job_id(job: dict) -> str:
    return str(job.get("id") or job.get("job_id") or job.get("_id") or "")


def ensure_sparse_job_index(force: bool = False, ttl_sec: int = 900) -> dict[str, Any]:
    now = time.time()
    if (
        not force
        and _CACHE["loaded"]
        and (now - float(_CACHE["loaded_at"])) < max(10, ttl_sec)
    ):
        return {
            "loaded": True,
            "docs_count": len(_CACHE["docs"]),
            "from_cache": True,
            "age_sec": int(now - float(_CACHE["loaded_at"])),
        }

    jobs = fetch_all_jobs()
    docs: list[dict[str, str]] = []
    for j in jobs:
        jid = _job_id(j)
        if not jid:
            continue
        text = _build_doc_text(j)
        if not text:
            continue
        docs.append({"job_id": jid, "text": text})

    _CACHE["docs"] = docs
    _CACHE["loaded"] = True
    _CACHE["loaded_at"] = now
    return {
        "loaded": True,
        "docs_count": len(docs),
        "from_cache": False,
        "age_sec": 0,
    }


def get_sparse_docs() -> list[dict[str, str]]:
    return list(_CACHE["docs"])
