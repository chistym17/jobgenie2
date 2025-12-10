## firecrawl to scrape job details--used to get job descriptions and all data
from firecrawl import FirecrawlApp
from typing import Dict, Optional, List
import os
from dotenv import load_dotenv
import json
import markdown
from bs4 import BeautifulSoup
import requests

load_dotenv()

class JobCrawler:
    def __init__(self):
        """Initialize the Firecrawl app with API key from environment"""
        self.api_key = os.getenv("FIRECRAWL_API_KEY")
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables")
        
        self.app = FirecrawlApp(api_key=self.api_key)

    def scrape_job_details(self, url: str) -> Optional[Dict]:
        """
        Scrape job details from a single job posting URL
        
        Args:
            url (str): URL of the job posting
            
        Returns:
            Optional[Dict]: Structured job data or None if scraping fails
        """
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

