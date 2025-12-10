import datetime
import bson

def clean_crew_output(raw):
    s = raw.strip()
    if s.startswith('```json'):
        s = s[len('```json'):].strip()
    if s.startswith('```'):
        s = s[len('```'):].strip()
    if s.endswith('```'):
        s = s[:-3].strip()
    return s


def sanitize_resume(resume):
    if isinstance(resume, dict):
        return {k: sanitize_resume(v) for k, v in resume.items()}
    elif isinstance(resume, list):
        return [sanitize_resume(i) for i in resume]
    elif hasattr(resume, 'binary') or 'bson' in str(type(resume)):
        return str(resume)
    elif isinstance(resume, (datetime.datetime, datetime.date)):
        return resume.isoformat()
    else:
        return resume

