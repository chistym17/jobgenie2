from __future__ import annotations

import io
import json
import os
import re
from datetime import datetime

from bson import ObjectId
from celery_app import celery_app
from db import get_mongodb_client
from gridfs import GridFSBucket
import PyPDF2

from celery_tasks.precompute_embedding import precompute_resume_embedding_task
from utils.logger_v2 import get_v2_logger
from utils.groq_client import get_groq_client


logger = get_v2_logger("resume_v2.worker.parse")


def _get_db_and_bucket():
  client = get_mongodb_client()
  db = client["jobs_db"]
  bucket = GridFSBucket(db, bucket_name="resume_files")
  return client, db, bucket


def _clean_resume_text(text: str) -> str:
  if not text:
    return ""

  text = text.replace("\x00", " ")
  text = re.sub(r"[ \t]+\n", "\n", text)
  text = re.sub(r"\n{3,}", "\n\n", text)
  text = re.sub(r"[ \t]{2,}", " ", text)
  lines = [ln.strip() for ln in text.splitlines()]

  seen = set()
  deduped_lines = []
  for ln in lines:
    if not ln:
      deduped_lines.append("")
      continue
    key = ln.lower()
    if len(ln) > 6 and key in seen:
      continue
    seen.add(key)
    deduped_lines.append(ln)

  text = "\n".join(deduped_lines)
  text = re.sub(r"\n{3,}", "\n\n", text).strip()

  try:
    max_chars = int(os.getenv("RESUME_PARSE_MAX_CHARS", "16000"))
  except Exception:
    max_chars = 16000
  max_chars = max(2000, min(80000, max_chars))

  if len(text) <= max_chars:
    return text

  head = int(max_chars * 0.7)
  tail = max_chars - head
  return (text[:head].rstrip() + "\n\n…\n\n" + text[-tail:].lstrip()).strip()


def _read_pdf_from_gridfs(bucket: GridFSBucket, file_id: str) -> str:
  oid = ObjectId(file_id)
  grid_out = bucket.open_download_stream(oid)
  data = grid_out.read()
  reader = PyPDF2.PdfReader(io.BytesIO(data))
  text = ""
  for page in reader.pages:
    text += page.extract_text() or ""
  return text


def _extract_json_text(response_text: str) -> str:
  text = (response_text or "").strip()
  if not text:
    return ""
  match = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
  if match:
    return match.group(1).strip()
  # Prefer the outermost object if the model added prose
  start = text.find("{")
  end = text.rfind("}")
  if start != -1 and end != -1 and end > start:
    return text[start : end + 1].strip()
  return text


def _parse_resume_json(raw: str) -> dict:
  """Parse model JSON without the destructive global quote swap."""
  json_str = _extract_json_text(raw)
  if not json_str:
    raise ValueError("Empty model response for resume parse")

  candidates = [json_str]
  # Light cleanup only (no blanket ' → " which breaks apostrophes)
  light = (
    json_str.replace("None", "null")
    .replace("True", "true")
    .replace("False", "false")
  )
  light = re.sub(r",\s*}", "}", light)
  light = re.sub(r",\s*]", "]", light)
  if light != json_str:
    candidates.append(light)

  last_err: Exception | None = None
  for candidate in candidates:
    try:
      data = json.loads(candidate)
      if isinstance(data, dict):
        return data
      raise ValueError("Resume parse JSON root must be an object")
    except Exception as exc:
      last_err = exc

  try:
    import json_repair

    repaired = json_repair.repair_json(json_str)
    data = json.loads(repaired) if isinstance(repaired, str) else repaired
    if isinstance(data, dict):
      logger.warning("Recovered resume JSON via json_repair")
      return data
  except Exception:
    pass

  raise ValueError(f"Failed to parse resume JSON: {last_err}") from last_err


def _call_groq_parser(file_text: str) -> dict:
  client = get_groq_client()
  model_name = os.getenv("GROQ_MODEL_NAME", "llama3-8b-8192")
  try:
    max_tokens = int(os.getenv("RESUME_PARSE_MAX_TOKENS", "4096"))
  except Exception:
    max_tokens = 4096
  max_tokens = max(1024, min(8192, max_tokens))

  system = (
    "You are a professional resume parser. "
    "Return ONLY a single valid JSON object. "
    "Use double quotes for all keys and string values. "
    "Keep descriptions concise if needed so the JSON is complete."
  )
  user = f"""Analyze this resume and extract structured data.

Resume Text:
{file_text}

Required JSON shape:
{{
  "name": "",
  "contact": {{"email": "", "phone": "", "linkedin": ""}},
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "preferences": {{}}
}}
"""

  create_kwargs = {
    "model": model_name,
    "messages": [
      {"role": "system", "content": system},
      {"role": "user", "content": user},
    ],
    "max_tokens": max_tokens,
    "temperature": 0.1,
  }
  # Prefer Groq JSON mode when the model supports it
  try:
    response = client.chat.completions.create(
      **create_kwargs,
      response_format={"type": "json_object"},
    )
  except Exception as json_mode_err:
    logger.warning("JSON mode unavailable (%s); retrying without it", json_mode_err)
    response = client.chat.completions.create(**create_kwargs)

  response_text = (response.choices[0].message.content or "").strip()
  finish = getattr(response.choices[0], "finish_reason", None)
  if finish == "length":
    logger.warning(
      "Resume parse response truncated (finish_reason=length, max_tokens=%s)",
      max_tokens,
    )

  return _parse_resume_json(response_text)


@celery_app.task(name="parse_resume_v2", bind=True, max_retries=3)
def parse_resume_v2(self, upload_id: str, file_id: str, user_email: str):
  from utils.upload_status import add_activity_event
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
    add_activity_event(upload_id, "Parsing Started", "Analyzing your resume content and extracting information", "in_progress")

    file_text = _read_pdf_from_gridfs(bucket, file_id)
    file_text = _clean_resume_text(file_text)

    resume_data = _call_groq_parser(file_text)

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
    add_activity_event(upload_id, "Parsing Completed", "Resume successfully parsed and structured", "completed")

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
    from utils.funcs import sanitize_error_message
    from utils.upload_status import add_activity_event
    sanitized_error = sanitize_error_message(exc)
    if client is not None:
      db = client["jobs_db"]
      uploads = db["resume_uploads"]
      uploads.update_one(
        {"_id": ObjectId(upload_id)},
        {
          "$set": {
            "status": "parsing_failed",
            "error_message": sanitized_error,
            "updated_at": datetime.utcnow(),
          }
        },
      )
    add_activity_event(upload_id, "Parsing Failed", "Failed to parse your resume", "failed", sanitized_error)
    logger.error("parse_resume_v2 error upload_id=%s err=%s", upload_id, exc)
    raise self.retry(exc=exc, countdown=2 ** self.request.retries) if self.request.retries < self.max_retries else exc
  finally:
    if client is not None:
      client.close()


