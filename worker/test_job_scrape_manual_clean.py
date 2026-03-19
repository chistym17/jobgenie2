import os
import re
from typing import Any, Dict, List, Optional, Tuple

from db import fetch_all_jobs
from utils.crawler import JobCrawler


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


def _normalize(text: str) -> str:
    text = text or ""
    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def _drop_boilerplate_lines(lines: List[str]) -> List[str]:
    patterns = [
        r"equal opportunity employer",
        r"e[- ]?verify",
        r"privacy policy",
        r"terms of (use|service)",
        r"cookie",
        r"accommodation",
        r"reasonable accommodation",
        r"legal notice",
        r"all rights reserved",
        r"join our talent network",
        r"subscribe",
        r"sign in",
        r"log in",
        r"create account",
    ]
    rx = re.compile("|".join(patterns), re.IGNORECASE)
    out = []
    for ln in lines:
        s = ln.strip()
        if not s:
            out.append("")
            continue
        if rx.search(s):
            continue
        out.append(s)
    return out


def _extract_title(markdown_text: str) -> str:
    for ln in markdown_text.splitlines():
        s = ln.strip()
        if s.startswith("# "):
            return s[2:].strip()
    for ln in markdown_text.splitlines():
        s = ln.strip()
        if s.startswith("## "):
            return s[3:].strip()
    return ""


def _extract_location(markdown_text: str) -> str:
    m = re.search(r"\b(Location|Locations)\b\s*[:\-]\s*(.+)", markdown_text, re.IGNORECASE)
    if m:
        return m.group(2).strip()[:200]
    m = re.search(r"\b(Remote|Hybrid|On[- ]?site)\b", markdown_text, re.IGNORECASE)
    if m:
        return m.group(0).strip()
    return ""


def _extract_company(markdown_text: str) -> str:
    m = re.search(r"\b(Company|Employer)\b\s*[:\-]\s*(.+)", markdown_text, re.IGNORECASE)
    if m:
        return m.group(2).strip()[:200]
    return ""


def _extract_bullets(markdown_text: str, max_items: int = 10) -> List[str]:
    items: List[str] = []
    for ln in markdown_text.splitlines():
        s = ln.strip()
        if not s:
            continue
        if s.startswith(("- ", "* ", "• ")):
            item = s[2:].strip() if s[1] == " " else s[1:].strip()
            item = re.sub(r"\s+", " ", item).strip()
            if item:
                items.append(item)
        if len(items) >= max_items:
            break
    return items


def manual_clean(scrape_result: Any) -> Dict[str, Any]:
    md = _normalize(_get_markdown(scrape_result))
    lines = _drop_boilerplate_lines(md.splitlines())
    md2 = "\n".join(lines)
    md2 = _normalize(md2)

    title = _extract_title(md2)
    company = _extract_company(md2)
    location = _extract_location(md2)
    bullets = _extract_bullets(md2, max_items=10)

    preview = md2
    if len(preview) > 2200:
        preview = preview[:2199] + "…"

    return {
        "title_guess": title,
        "company_guess": company,
        "location_guess": location,
        "bullet_guesses": bullets,
        "markdown_preview": preview,
    }


def _pick_jobs(jobs: List[Dict[str, Any]], limit: int) -> List[Tuple[str, str, str]]:
    picked: List[Tuple[str, str, str]] = []
    jobs_sorted = sorted(
        jobs,
        key=lambda j: (
            str(j.get("date") or ""),
            str(j.get("created_at") or ""),
            str(j.get("_id") or ""),
        ),
        reverse=True,
    )
    for job in jobs_sorted:
        url = str(job.get("url", "")).strip()
        if not url:
            continue
        title = str(job.get("title", "")).strip()
        company = str(job.get("company", "")).strip()
        picked.append((url, title, company))
        if len(picked) >= limit:
            break
    return picked


def main() -> None:
    try:
        limit = int(os.getenv("TEST_JOBS_LIMIT", "3"))
    except Exception:
        limit = 3
    limit = max(1, min(10, limit))

    if os.getenv("REFRESH_JOBS", "").strip().lower() in ("1", "true", "yes", "y", "on"):
        try:
            from backend.app.services import jobs as job_fetcher
            job_fetcher.main()
        except Exception as e:
            print("Job refresh failed:", str(e))

    jobs = fetch_all_jobs()
    picked = _pick_jobs(jobs, limit)
    if not picked:
        print("No jobs with URLs found in MongoDB.")
        return

    crawler = JobCrawler()

    for idx, (url, title, company) in enumerate(picked, start=1):
        print("\n" + "=" * 90)
        print(f"JOB {idx}/{len(picked)}")
        print(f"url: {url}")
        print(f"mongo_title: {title}")
        print(f"mongo_company: {company}")
        print("-" * 90)

        scrape = crawler.scrape_job_details(url)
        if not scrape:
            print("scrape: FAILED (None)")
            continue

        cleaned = manual_clean(scrape)
        print("title_guess:", cleaned.get("title_guess", ""))
        print("company_guess:", cleaned.get("company_guess", ""))
        print("location_guess:", cleaned.get("location_guess", ""))
        print("bullet_guesses:", cleaned.get("bullet_guesses", []))
        print("-" * 90)
        print(cleaned.get("markdown_preview", ""))


if __name__ == "__main__":
    main()

