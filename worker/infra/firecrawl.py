from firecrawl import FirecrawlApp
from typing import Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class JobCrawler:
    def __init__(self):
        self.api_key = os.getenv("FIRECRAWL_API_KEY")
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables")

        self.app = FirecrawlApp(api_key=self.api_key)

    def scrape_job_details(self, url: str) -> Optional[Dict]:
        try:
            scrape_result = self.app.scrape_url(
                url,
                params={
                    'formats': ['markdown']
                }
            )
            return scrape_result
        except Exception as e:
            print(f"Error scraping URL {url}: {str(e)}")
            return None

