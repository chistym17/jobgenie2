from __future__ import annotations

import io
import json
import os
import re
from datetime import datetime

from bson import ObjectId
from celery_app import celery_app
from db import get_mongodb_client
from google import genai
from gridfs import GridFSBucket
import PyPDF2

from celery_tasks.precompute_embedding import precompute_resume_embedding_task
from utils.logger_v2 import get_v2_logger


logger = get_v2_logger("resume_v2.worker.parse")


def _get_db_and_bucket():
  client = get_mongodb_client()
  db = client["jobs_db"]
  bucket = GridFSBucket(db, bucket_name="resume_files")
  return client, db, bucket


def _read_pdf_from_gridfs(bucket: GridFSBucket, file_id: str) -> str:
  oid = ObjectId(file_id)
  grid_out = bucket.open_download_stream(oid)
  data = grid_out.read()
  reader = PyPDF2.PdfReader(io.BytesIO(data))
  text = ""
  for page in reader.pages:
    text += page.extract_text() or ""
  return text


def _call_gemini(file_text: str) -> dict:
  api_key = os.getenv("GOOGLE_API_KEY")
  if not api_key:
    raise ValueError("Missing GOOGLE_API_KEY for Gemini")

  client = genai.Client(api_key=api_key)
  model_name_raw = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
  model_name = model_name_raw.lower().replace(" ", "-").strip()

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

  response = client.models.generate_content(
    model=model_name,
    contents=[prompt],
  )

  response_text = response.text.strip()
  match = re.search(r"```json(.*?)```", response_text, re.DOTALL)
  json_str = match.group(1).strip() if match else response_text

  cleaned_str = (
    json_str
    .replace("'", '"')
    .replace("None", "null")
    .replace("True", "true")
    .replace("False", "false")
  )

  return json.loads(cleaned_str)


@celery_app.task(name="parse_resume_v2", bind=True, max_retries=3)
def parse_resume_v2(self, upload_id: str, file_id: str, user_email: str):
  client = None
  try:
    logger.info("Starting parse_resume_v2 for upload_id=%s, file_id=%s, user_email=%s", upload_id, file_id, user_email)
    client, db, bucket = _get_db_and_bucket()
    uploads = db["resume_uploads"]
    resumes = db["resumes"]

    uploads.update_one(
      {"_id": ObjectId(upload_id)},
      {"$set": {"status": "parsing", "updated_at": datetime.utcnow()}},
    )

    file_text = _read_pdf_from_gridfs(bucket, file_id)

    resume_data = _call_gemini(file_text)

    resume_doc = {
      "user_email": user_email,
      "name": resume_data.get("name", ""),
      "contact": resume_data.get("contact", {}),
      "skills": resume_data.get("skills", []),
      "education": resume_data.get("education", []),
      "experience": resume_data.get("experience", []),
      "projects": resume_data.get("projects", []),
      "certifications": resume_data.get("certifications", []),
      "preferences": resume_data.get("preferences", {}),
      "markdown": "",
      "created_at": datetime.utcnow(),
      "updated_at": datetime.utcnow(),
    }

    result = resumes.insert_one(resume_doc)
    resume_id = result.inserted_id

    uploads.update_one(
      {"_id": ObjectId(upload_id)},
      {
        "$set": {
          "status": "parsed",
          "resume_id": resume_id,
          "updated_at": datetime.utcnow(),
        }
      },
    )

    logger.info("parse_resume_v2 success upload_id=%s resume_id=%s", upload_id, resume_id)

    embed_task = precompute_resume_embedding_task.delay(user_email, upload_id)
    logger.info(
      "Triggered precompute_resume_embedding_task for upload_id=%s task_id=%s user_email=%s",
      upload_id,
      embed_task.id,
      user_email,
    )
    uploads.update_one(
      {"_id": ObjectId(upload_id)},
      {
        "$set": {
          "embedding_task_id": embed_task.id,
          "status": "embedding",
          "updated_at": datetime.utcnow(),
        }
      },
    )

    return {"status": "parsed", "upload_id": upload_id, "resume_id": str(resume_id)}

  except Exception as exc:
    if client is not None:
      db = client["jobs_db"]
      uploads = db["resume_uploads"]
      uploads.update_one(
        {"_id": ObjectId(upload_id)},
        {
          "$set": {
            "status": "parsing_failed",
            "error_message": str(exc),
            "updated_at": datetime.utcnow(),
          }
        },
      )
    logger.error("parse_resume_v2 error upload_id=%s err=%s", upload_id, exc)
    raise self.retry(exc=exc, countdown=2 ** self.request.retries) if self.request.retries < self.max_retries else exc
  finally:
    if client is not None:
      client.close()


