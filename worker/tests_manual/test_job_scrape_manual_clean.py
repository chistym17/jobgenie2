import os
import re
from typing import Any, Dict, List, Tuple

from db import fetch_all_jobs
from utils.crawler import JobCrawler
from utils.manual_job_parser import manual_parse_job, normalize_markdown


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


def _pick_latest_jobs(jobs: List[Dict[str, Any]], limit: int) -> List[Tuple[str, str, str]]:
    jobs_sorted = sorted(
        jobs,
        key=lambda j: (
            str(j.get("date") or ""),
            str(j.get("created_at") or ""),
            str(j.get("_id") or ""),
        ),
        reverse=True,
    )
    out: List[Tuple[str, str, str]] = []
    for job in jobs_sorted:
        url = str(job.get("url", "")).strip()
        if not url:
            continue
        out.append((url, str(job.get("title", "") or ""), str(job.get("company", "") or "")))
        if len(out) >= limit:
            break
    return out


def main() -> None:
    try:
        limit = int(os.getenv("TEST_JOBS_LIMIT", "3"))
    except Exception:
        limit = 3
    limit = max(1, min(10, limit))

    jobs = fetch_all_jobs()
    picked = _pick_latest_jobs(jobs, limit)
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

        md = normalize_markdown(_get_markdown(scrape))
        parsed = manual_parse_job(scrape, fallback_title=title, fallback_company=company, fallback_url=url)
        print("markdown_len:", len(md))
        print("manual_parse:", "ok" if parsed else "skipped")
        if parsed:
            bullets = parsed.get("bullets", [])
            print("title_guess:", parsed.get("title", ""))
            print("location_guess:", parsed.get("location", ""))
            print("bullet_count:", len(bullets) if isinstance(bullets, list) else 0)
        print("-" * 90)
        preview = md[:2200] + ("…" if len(md) > 2200 else "")
        print(preview)


if __name__ == "__main__":
    main()

