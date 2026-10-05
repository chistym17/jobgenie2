## firecrawl to scrape job details--used to get job descriptions and all data
from __future__ import annotations

from typing import Any, Dict, Optional
import os

from dotenv import load_dotenv
from firecrawl import FirecrawlApp

load_dotenv()


def _to_dict(scrape_result: Any) -> Optional[Dict]:
    """Normalize Firecrawl Document / dict into a plain dict for parsers."""
    if scrape_result is None:
        return None
    if isinstance(scrape_result, dict):
        return scrape_result
    if hasattr(scrape_result, "model_dump"):
        try:
            return scrape_result.model_dump()
        except Exception:
            pass
    if hasattr(scrape_result, "dict"):
        try:
            return scrape_result.dict()
        except Exception:
            pass
    md = getattr(scrape_result, "markdown", None)
    meta = getattr(scrape_result, "metadata", None)
    if isinstance(md, str):
        out: Dict[str, Any] = {"markdown": md}
        if meta is not None:
            out["metadata"] = meta.model_dump() if hasattr(meta, "model_dump") else meta
        return out
    return None


class JobCrawler:
    def __init__(self):
        self.api_key = os.getenv("FIRECRAWL_API_KEY")
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables")

        self.app = FirecrawlApp(api_key=self.api_key)

    def scrape_job_details(self, url: str) -> Optional[Dict]:
        """
        Scrape job details from a single job posting URL.

        Firecrawl SDK v4+: use formats=[...] (params= is no longer supported).
        """
        try:
            scrape_result = self.app.scrape(url, formats=["markdown"])
            return _to_dict(scrape_result)
        except Exception as e:
            print(f"Error scraping URL {url}: {str(e)}")
            return None
