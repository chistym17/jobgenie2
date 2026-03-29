import re
from typing import Any


def _collect_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        t = value.strip()
        return [t] if t else []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            out.extend(_collect_strings(item))
        return out
    if isinstance(value, dict):
        out: list[str] = []
        for v in value.values():
            out.extend(_collect_strings(v))
        return out
    return []


def build_sparse_query(resume: dict, max_terms: int = 32) -> str:
    skills = _collect_strings(resume.get("skills", []))

    roles: list[str] = []
    for exp in resume.get("experience", []):
        if isinstance(exp, dict):
            roles.extend(_collect_strings(exp.get("position", "")))

    projects: list[str] = []
    for proj in resume.get("projects", []):
        if isinstance(proj, dict):
            projects.extend(_collect_strings(proj.get("tech_stack", "")))
            projects.extend(_collect_strings(proj.get("title", "")))

    seeds = skills + roles + projects
    tokens: list[str] = []
    seen: set[str] = set()
    for item in seeds:
        for raw in re.split(r"[,/|]+|\s+", item):
            tok = raw.strip().lower()
            if len(tok) < 2:
                continue
            if tok in seen:
                continue
            seen.add(tok)
            tokens.append(tok)
            if len(tokens) >= max_terms:
                return " ".join(tokens)
    return " ".join(tokens)
