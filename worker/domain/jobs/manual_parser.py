import re
from typing import Any, Dict, List, Optional


def _get_markdown(scrape_result: Any) -> str:
    if not scrape_result:
        return ""
    if isinstance(scrape_result, dict):
        md = scrape_result.get("markdown")
        if isinstance(md, str):
            return md
        data = scrape_result.get("data")
        if isinstance(data, dict) and isinstance(data.get("markdown"), str):
            return data["markdown"]
    return ""


def normalize_markdown(text: str) -> str:
    text = text or ""
    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def is_feed_or_listing_markdown(markdown_text: str) -> bool:
    t = (markdown_text or "").lower()
    if not t:
        return True

    job_detail_signals = 0
    if "# " in t:
        job_detail_signals += 1
    if "posted " in t:
        job_detail_signals += 1
    if "## description" in t or "\n## description\n" in t:
        job_detail_signals += 1
    if "apply now" in t:
        job_detail_signals += 1
    if job_detail_signals >= 3:
        return False

    hard_signals = [
        "view company profile",
        "past 24 hours",
        "past week",
        "past 2 weeks",
        "newest",
        "latest post",
        "jobs 819",
    ]
    if any(s in t for s in hard_signals):
        return True

    if "remote jobs" in t and "apply now" not in t and "# " not in t:
        return True

    if t.count("view company profile") >= 2:
        return True
    return False


def looks_gated_and_too_short(markdown_text: str) -> bool:
    t = (markdown_text or "").lower()
    if "create an account to view full job details" in t or "account/register" in t:
        if len(markdown_text) < 1200:
            return True
    return False


def extract_title(markdown_text: str) -> str:
    for ln in (markdown_text or "").splitlines():
        s = ln.strip()
        if s.startswith("# "):
            return s[2:].strip()
    for ln in (markdown_text or "").splitlines():
        s = ln.strip()
        if s.startswith("## "):
            return s[3:].strip()
    return ""


def extract_location(markdown_text: str) -> str:
    m = re.search(r"\b(Location|Locations)\b\s*[:\\-]\s*(.+)", markdown_text or "", re.IGNORECASE)
    if m:
        return m.group(2).strip()[:200]
    m = re.search(r"\b(Remote|Hybrid|On[- ]?site)\b", markdown_text or "", re.IGNORECASE)
    if m:
        return m.group(0).strip()
    return ""


def extract_bullets(markdown_text: str, max_items: int = 12) -> List[str]:
    items: List[str] = []
    for ln in (markdown_text or "").splitlines():
        s = ln.strip()
        if not s:
            continue
        if s.startswith(("- ", "* ", "• ")):
            item = s[2:].strip() if len(s) >= 2 and s[1] == " " else s[1:].strip()
            item = re.sub(r"\s+", " ", item).strip()
            if item:
                items.append(item)
        if len(items) >= max_items:
            break
    return items


def build_job_text_for_embedding(title: str, company: str, location: str, bullets: List[str], markdown_text: str) -> str:
    parts: List[str] = []
    if title:
        parts.append(title)
    if company:
        parts.append(company)
    if location:
        parts.append(location)
    if bullets:
        parts.append(" ".join(bullets[:10]))
    md = normalize_markdown(markdown_text)
    md = re.sub(r"\s+", " ", md).strip()
    if len(md) > 1200:
        md = md[:1199] + "…"
    if md:
        parts.append(md)
    text = "\n".join([p for p in parts if p])
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def manual_parse_job(scrape_result: Any, fallback_title: str = "", fallback_company: str = "", fallback_url: str = "") -> Optional[Dict[str, object]]:
    md = normalize_markdown(_get_markdown(scrape_result))
    if is_feed_or_listing_markdown(md):
        return None
    if looks_gated_and_too_short(md):
        return None

    title = extract_title(md) or (fallback_title or "")
    location = extract_location(md)
    bullets = extract_bullets(md, max_items=12)

    text_for_embedding = build_job_text_for_embedding(title, fallback_company, location, bullets, md)
    if len(text_for_embedding) < 200:
        return None

    return {
        "title": title,
        "company": fallback_company or "",
        "location": location,
        "bullets": bullets,
        "description": text_for_embedding,
        "url": fallback_url or "",
    }

