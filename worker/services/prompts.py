def get_recommendation_prompt(jobs_data: list) -> str:
    import json

    def _truncate(value: str, limit: int) -> str:
        if not value:
            return ""
        value = str(value).strip()
        if len(value) <= limit:
            return value
        return value[: max(0, limit - 1)] + "…"

    compact_jobs = []
    for job_data in jobs_data:
        compact_jobs.append(
            {
                "job_id": str(job_data.get("job_id", "")).strip(),
                "title": _truncate(job_data.get("title", ""), 120),
                "company": _truncate(job_data.get("company", ""), 120),
                "location": _truncate(job_data.get("location", ""), 120),
                "date": _truncate(job_data.get("date", ""), 40),
                "url": _truncate(job_data.get("url", ""), 300),
                "summary": _truncate(job_data.get("summary", ""), 900),
            }
        )

    jobs_json = json.dumps(compact_jobs, ensure_ascii=False)

    return f"""You are a job recommendation formatter. Transform the following job listings into a structured JSON array.

Job Listings:
{jobs_json}

For each job, create ONE JSON object with these fields:
- Job ID (REQUIRED - preserve the exact Job ID from the source)
- Job Title
- Company Name
- Location
- Job Type
- Salary
- Posted Date
- Application Deadline
- Key Requirements
- Bonus Skills
- Stack
- Description (keep concise)
- How to Apply (keep concise)
- Direct Link
- Match Score (as a percentage, e.g., 55 for 55%)

Return the TOP 5 best matches only.

CRITICAL JSON FORMATTING RULES:
1. Return ONLY a valid JSON array - no markdown, no explanations, no text before or after
2. All string values MUST be properly escaped - use \\" for quotes inside strings
3. The Match Score must be a number (0-100), not a string
4. The Job ID MUST be preserved exactly as provided in the source
5. Ensure all commas are properly placed between array elements and object properties
6. Do not include trailing commas
7. All special characters in strings must be escaped (newlines as \\n, quotes as \\")

Return ONLY the JSON array, nothing else. Example format:
[
  {{
    "Job ID": "2c37c2a269066c4bbc573e28f3260ce4",
    "Job Title": "Software Engineer",
    "Company Name": "Tech Corp",
    "Location": "San Francisco, CA",
    "Job Type": "Full-time",
    "Salary": "$120k-150k",
    "Posted Date": "2024-01-15",
    "Application Deadline": "2024-02-15",
    "Key Requirements": "5+ years Python, React experience",
    "Bonus Skills": "Docker, AWS",
    "Stack": "Python, React, PostgreSQL",
    "Description": "We are looking for...",
    "How to Apply": "Send resume to jobs@techcorp.com",
    "Direct Link": "https://example.com/job/123",
    "Match Score": 85
  }}
]
"""

def get_explanation_prompt(job_str: str, resume_str: str) -> str:
    return f"""You are an expert job match explainer.
You will receive a job object and a user's resume as input.
Analyze the job requirements, responsibilities, and desired skills from the job object: {job_str}, and compare them carefully with the user's experience, skills, and background from the resume: {resume_str}.
Write a clear, concise explanation that *directly compares* the job posting with the user's profile: for each major requirement, explain how the user meets it, referencing specific experiences, skills, or achievements.
Your explanation should follow this pattern: "The job requires [requirement], and you have [matching skill/experience]."
Always address the user directly as "you" — do not use their name, and do not refer to them as "the candidate" or "he/she."
If the user lacks any skills, explain how their transferable skills can help cover the gap.
Your final output MUST be a single, well-structured paragraph (no bullet points, no markdown, no extraneous text).
Only return the explanation text, and nothing else.
"""

def get_resume_advice_prompt(job_str: str, resume_str: str) -> str:
    return f"""You are an expert resume advisor.
You will receive a job description and a user's resume as input.
Analyze the job requirements, responsibilities, and desired skills from the job description: {job_str}, and carefully review the user's resume: {resume_str}.
Identify any gaps, weaknesses, or areas for improvement that would make the resume better aligned with the job.
Provide clear, specific suggestions on how the user can improve their resume — such as adding missing skills, emphasizing relevant experiences, adjusting wording to better match the job description, or reordering sections to highlight strengths.
Your advice should directly reference elements from the resume and job description.
Always address the user directly as "you" — do not refer to them as "the candidate" or "he/she."
Your final output MUST be a single, clear paragraph (no bullet points, no markdown, no extraneous text), offering constructive and actionable feedback.
Only return the advice text, and nothing else.
"""

