# to structure the job data and clean them
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from typing import Dict, Optional
import re
from utils.crawler import JobCrawler

load_dotenv()

class JobLLMProcessor:
    def __init__(self):
        """Initialize the LLM processor with Gemini 2.5 Pro."""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY in environment variables.")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    def generate_system_prompt(self, content: str) -> str:
        """Generate a system prompt for Gemini to parse job postings dynamically."""
        return f"""
        You are an expert job posting parser. Analyze the following job posting content and extract all relevant information.
        The content may contain markdown formatting and HTML elements. Focus on extracting meaningful information about the job.

        Content to analyze:
        {content}

        Please analyze this content and return a structured JSON object containing all relevant information you can extract. 
        The structure should be logical and include all important details. Do not use predefined fields - create fields that make sense based on the content.

        The output should be in this format:
        ```json
        {{
            // Add relevant fields based on the content
            // Example fields might include:
            "title": "",
            "company": "",
            "description": "",
            "requirements": [],
            "benefits": [],
            "location": "",
            "salary": "",
        }}
        """

    def parse_job_posting(self, scrape_result: Dict) -> Dict:
        """
        Parse a job posting using Gemini 2.5 Pro.
        
        Args:
            scrape_result (Dict): Raw scrape result containing markdown content
            
        Returns:
            Dict: Structured job data extracted by the LLM
        """
        if not scrape_result or 'markdown' not in scrape_result:
            raise ValueError("Invalid scrape result format")

        markdown_content = scrape_result['markdown']
        
        prompt = self.generate_system_prompt(markdown_content)

        response = self.model.generate_content(prompt)
        
        response_text = response.text.strip()
        match = re.search(r"```json(.*?)```", response_text, re.DOTALL)
        
        if not match:
            raise ValueError("No JSON found in LLM response")

        json_str = match.group(1).strip()
        
        try:
            parsed_data = json.loads(json_str)
            
            parsed_data['url'] = scrape_result.get('url')
            
            return parsed_data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON: {str(e)}\nRaw response:\n{response_text}")

    def clean_text(self, text: str) -> str:
        """Clean text by removing markdown formatting and special characters."""
        text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)  
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)    
        text = re.sub(r'\[(.*?)\]', r'\1', text)         
        text = re.sub(r'\n\n+', '\n', text)              
        
        return text.strip()

    def process_job_posting(self, scrape_result: Dict) -> Dict:
        """
        Process a job posting by parsing it with Gemini and cleaning the result.
        
        Args:
            scrape_result (Dict): Raw scrape result from the crawler
            
        Returns:
            Dict: Cleaned, structured job data
        """
        try:
            parsed_data = self.parse_job_posting(scrape_result)
            
            for key, value in parsed_data.items():
                if isinstance(value, str):
                    parsed_data[key] = self.clean_text(value)
                elif isinstance(value, list):
                    parsed_data[key] = [self.clean_text(item) for item in value if isinstance(item, str)]
                elif isinstance(value, dict):
                    for subkey, subvalue in value.items():
                        if isinstance(subvalue, str):
                            value[subkey] = self.clean_text(subvalue)
            
            return parsed_data
            
        except Exception as e:
            raise ValueError(f"Failed to process job posting: {str(e)}")

