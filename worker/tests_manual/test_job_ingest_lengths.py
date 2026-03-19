import os
from typing import Any, Dict, List

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


def _pick_latest_jobs(jobs: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    jobs_sorted = sorted(
        jobs,
        key=lambda j: (
            str(j.get("date") or ""),
            str(j.get("created_at") or ""),
            str(j.get("_id") or ""),
        ),
        reverse=True,
    )
    out: List[Dict[str, Any]] = []
    for job in jobs_sorted:
        url = str(job.get("url", "")).strip()
        if not url:
            continue
        out.append(job)
        if len(out) >= limit:
            break
    return out


def main() -> None:
    limit = 5
    jobs = fetch_all_jobs()
    latest = _pick_latest_jobs(jobs, limit)
    if not latest:
        print("no_jobs_found")
        return

    crawler = JobCrawler()

    print("EMBEDDING_SERVER:", os.getenv("EMBEDDING_SERVER", ""))
    print("EMBEDDER_MAX_CHARS:", os.getenv("EMBEDDER_MAX_CHARS", "6000"))

    for idx, job in enumerate(latest, start=1):
        url = str(job.get("url", "")).strip()
        title = str(job.get("title", "") or "")
        company = str(job.get("company", "") or "")
        print("\n" + "=" * 90)
        print(f"{idx}/{len(latest)}")
        print("url:", url)
        print("mongo_title:", title)
        print("mongo_company:", company)

        scrape = crawler.scrape_job_details(url)
        md_raw = _get_markdown(scrape)
        md_norm = normalize_markdown(md_raw)
        print("markdown_len_raw:", len(md_raw))
        print("markdown_len_norm:", len(md_norm))

        parsed = manual_parse_job(
            scrape,
            fallback_title=title,
            fallback_company=company,
            fallback_url=url,
        )
        if not parsed:
            print("manual_parse: skipped")
            continue

        desc = str(parsed.get("description", "") or "")
        print("manual_description_len:", len(desc))


if __name__ == "__main__":
    main()

