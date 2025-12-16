## gemini llm resume parser to parse and save user resume data
import os
from google import genai
from markdownify import markdownify as md
from dotenv import load_dotenv
import PyPDF2
import re
import json
from datetime import datetime
from app.db.models import Resume
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.utils.startembeddertask import start_embedder_task
load_dotenv()

class ResumeParser:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY in environment variables.")
        self.genai_client = genai.Client(api_key=self.api_key)
        
        model_name_raw = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
        self.model_name = model_name_raw.lower().replace(" ", "-").strip()
        if self.model_name != model_name_raw:
            print(f"[RESUME_PARSER] Model name normalized from '{model_name_raw}' to '{self.model_name}'")
        
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
        self.client = AsyncIOMotorClient(self.mongo_uri)
        self.db = self.client.jobs_db
        self.resumes_collection = self.db.resumes

    def read_pdf(self, file_path: str) -> str:
        """Reads a PDF file and returns its text content."""
        print(f"[RESUME_PARSER] read_pdf called for file: {file_path}")
        try:
            print("[RESUME_PARSER] Opening PDF file...")
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                print(f"[RESUME_PARSER] PDF has {len(reader.pages)} pages")
                text = ""
                for i, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    text += page_text
                    print(f"[RESUME_PARSER] Extracted {len(page_text)} characters from page {i+1}")
                print(f"[RESUME_PARSER] Total extracted text length: {len(text)} characters")
                return text
        except Exception as e:
            print(f"[RESUME_PARSER] ERROR reading PDF: {str(e)}")
            print(f"[RESUME_PARSER] Error type: {type(e)}")
            import traceback
            print(f"[RESUME_PARSER] Traceback: {traceback.format_exc()}")
            raise

    def extract_resume_data(self, file_text: str) -> dict:
        """Extracts resume data from a PDF file using Gemini."""
        print("[RESUME_PARSER] Starting extract_resume_data...")
        print(f"[RESUME_PARSER] File text length: {len(file_text)} characters")
        
        prompt = f"""You are a professional resume parser. Please analyze the following resume text and extract the relevant information:

 Resume Text:
{file_text}

Extract the following fields:
- Full Name
- Contact Information (Phone, Email, LinkedIn if available)
- Skills (technical and soft)
- Education (with degrees, institutes, years)
- Work Experience (position, company, description, duration)
- Projects (title, tech stack, description)
- Certifications (if any)
- Job Preferences (location, remote/on-site, role, etc.)

Respond in the following structured JSON format:
{{
  'name': '',
  'contact': {{
     'email': '', 'phone': '', 'linkedin': ''
  }},
  'skills': [],
  'education': [],
  'experience': [],
  'projects': [],
  'certifications': [],
  'preferences': {{}}
}}
"""

        print("[RESUME_PARSER] Calling Gemini API...")
        print(f"[RESUME_PARSER] Model: {self.model_name}")
        print(f"[RESUME_PARSER] API Key present: {bool(self.api_key)}")
        
        try:
            response = self.genai_client.models.generate_content(
                model=self.model_name,
                contents=[
                    prompt
                ]
            )
            print("[RESUME_PARSER] Gemini API call successful")
            print(f"[RESUME_PARSER] Response type: {type(response)}")
            print(f"[RESUME_PARSER] Response attributes: {dir(response)}")
        except Exception as api_error:
            print(f"[RESUME_PARSER] ERROR calling Gemini API: {str(api_error)}")
            print(f"[RESUME_PARSER] Error type: {type(api_error)}")
            raise

        try:
            print("[RESUME_PARSER] Extracting response text...")
            response_text = response.text.strip()
            print(f"[RESUME_PARSER] Response text length: {len(response_text)} characters")
            print(f"[RESUME_PARSER] Response text preview: {response_text[:200]}...")

            match = re.search(r"```json(.*?)```", response_text, re.DOTALL)
            json_str = match.group(1).strip() if match else response_text
            print(f"[RESUME_PARSER] Extracted JSON string length: {len(json_str)}")

            cleaned_str = (
                json_str
                .replace("'", '"')
                .replace('None', 'null')
                .replace('True', 'true')
                .replace('False', 'false')
            )
            print("[RESUME_PARSER] Parsing JSON...")
            parsed_data = json.loads(cleaned_str)
            print("[RESUME_PARSER] JSON parsing successful")
            return parsed_data

        except Exception as e:
            print(f"[RESUME_PARSER] ERROR parsing response: {str(e)}")
            print(f"[RESUME_PARSER] Error type: {type(e)}")
            try:
                print(f"[RESUME_PARSER] Raw response text: {response.text}")
            except:
                print("[RESUME_PARSER] Could not access response.text")
            raise ValueError(f"Failed to parse response JSON: {e}\nRaw response:\n{response.text}")

    async def save_to_mongodb(self, resume_data: dict, user_email: str):
        """Save parsed resume data to MongoDB."""
        print(f"[RESUME_PARSER] save_to_mongodb called for user: {user_email}")
        try:
            print("[RESUME_PARSER] Creating Resume model...")
            resume = Resume(
                user_email=user_email,
                name=resume_data.get('name', ''),
                contact=resume_data.get('contact', {}),
                skills=resume_data.get('skills', []),
                education=resume_data.get('education', []),
                experience=resume_data.get('experience', []),
                projects=resume_data.get('projects', []),
                certifications=resume_data.get('certifications', []),
                preferences=resume_data.get('preferences', {}),
                markdown=self.convert_to_markdown(resume_data),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            print("[RESUME_PARSER] Resume model created successfully")
            
            print("[RESUME_PARSER] Converting to dict...")
            resume_dict = resume.model_dump()
            print(f"[RESUME_PARSER] Resume dict keys: {list(resume_dict.keys())}")
            
            print("[RESUME_PARSER] Inserting into MongoDB...")
            result = await self.resumes_collection.insert_one(resume_dict)
            print(f"[RESUME_PARSER] MongoDB insert successful, ID: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            print(f"[RESUME_PARSER] ERROR saving to MongoDB: {str(e)}")
            print(f"[RESUME_PARSER] Error type: {type(e)}")
            import traceback
            print(f"[RESUME_PARSER] Traceback: {traceback.format_exc()}")
            raise

    async def process_resume(self, file_path: str,user_email: str) -> str:
        """Process a resume file and save to MongoDB."""
        print(f"[RESUME_PARSER] Starting process_resume for user: {user_email}")
        print(f"[RESUME_PARSER] File path: {file_path}")
        try:
            print("[RESUME_PARSER] Step 1: Reading PDF...")
            file_text = self.read_pdf(file_path)
            print(f"[RESUME_PARSER] PDF read successful, text length: {len(file_text)}")
            
            print("[RESUME_PARSER] Step 2: Extracting resume data with Gemini...")
            resume_data = self.extract_resume_data(file_text)
            print(f"[RESUME_PARSER] Resume data extracted: {list(resume_data.keys())}")
            
            print("[RESUME_PARSER] Step 3: Saving to MongoDB...")
            resume_id = await self.save_to_mongodb(resume_data,user_email)
            print(f"[RESUME_PARSER] Saved to MongoDB with ID: {resume_id}")

            print("[RESUME_PARSER] Step 4: Starting embedder task...")
            response = start_embedder_task(user_email)
            task_id = response.get("task_id")
            print(f"[RESUME_PARSER] Embedder task started with ID: {task_id}")
            

            return resume_id,task_id
            
        except Exception as e:
            print(f"[RESUME_PARSER] ERROR in process_resume: {str(e)}")
            print(f"[RESUME_PARSER] Error type: {type(e)}")
            import traceback
            print(f"[RESUME_PARSER] Traceback: {traceback.format_exc()}")
            raise ValueError(f"Failed to process resume: {str(e)}")

    def convert_to_markdown(self, resume_json: dict) -> str:
        """Converts parsed resume JSON into Markdown for better display."""
        markdown = f"## {resume_json.get('name', 'Candidate')}\n"

        contact = resume_json.get('contact', {})
        markdown += f"**Email:** {contact.get('email', 'N/A')}  \n"
        markdown += f"**Phone:** {contact.get('phone', 'N/A')}  \n"
        markdown += f"**LinkedIn:** {contact.get('linkedin', 'N/A')}  \n\n"

        markdown += "### Skills\n"
        markdown += ", ".join(resume_json.get("skills", [])) + "\n\n"

        markdown += "### Education\n"
        for edu in resume_json.get("education", []):
            markdown += f"- {edu}\n"

        markdown += "\n### Work Experience\n"
        for exp in resume_json.get("experience", []):
            markdown += f"- {exp}\n"

        markdown += "\n### Projects\n"
        for proj in resume_json.get("projects", []):
            markdown += f"- {proj}\n"

        markdown += "\n### Certifications\n"
        for cert in resume_json.get("certifications", []):
            markdown += f"- {cert}\n"

        markdown += "\n### Preferences\n"
        for key, val in resume_json.get("preferences", {}).items():
            markdown += f"- **{key.capitalize()}:** {val}\n"

        return markdown.strip()
