from db import fetch_resume_data
from utils.qdrant_service import search_similar, get_resume_embedding_by_email
from utils.embedder import get_embedding
import numpy as np
import re
from utils.qdrant_service import insert_resume_embedding
from utils.hybrid_query import build_sparse_query
from utils.sparse_index import ensure_sparse_job_index, search_sparse_candidates

def chunk_text(text, max_length=500):
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_length:
            current_chunk += " " + sentence
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    return chunks

def extract_relevant_resume_text(resume):
    parts = []
    skills = resume.get('skills', [])
    if skills:
        parts.append('Skills: ' + ', '.join(skills))
    for exp in resume.get('experience', []):
        exp_str = f"{exp.get('position', '')} at {exp.get('company', '')}. {exp.get('description', '')} ({exp.get('duration', '')})"
        parts.append('Experience: ' + exp_str)
    for proj in resume.get('projects', []):
        proj_str = f"{proj.get('title', '')} ({proj.get('tech_stack', '')}): {proj.get('description', '')}"
        parts.append('Project: ' + proj_str)
    for edu in resume.get('education', []):
        edu_str = f"{edu.get('degree', '')} at {edu.get('institution', '')} ({edu.get('year', '')})"
        parts.append('Education: ' + edu_str)
 
    return '\n'.join(parts)

def fetch_recommendations(user_email: str):
    sparse_meta = ensure_sparse_job_index()
    print(
        "[HYBRID][INDEX] loaded=%s from_cache=%s docs=%s age_sec=%s"
        % (
            sparse_meta.get("loaded"),
            sparse_meta.get("from_cache"),
            sparse_meta.get("docs_count"),
            sparse_meta.get("age_sec"),
        )
    )
    resume = fetch_resume_data(user_email)
    if not resume:
        print("No resume data found")
        return []
    sparse_candidates = []
    sparse_query = build_sparse_query(resume)
    if sparse_query:
        print(f"[HYBRID][QUERY] user={user_email} query='{sparse_query[:180]}'")
        sparse_candidates = search_sparse_candidates(sparse_query, top_k=40)
        sparse_ids = [c.get("job_id") for c in sparse_candidates[:5] if c.get("job_id")]
        print(
            "[HYBRID][SPARSE] query_terms=%s top_k=%s hit_count=%s top_ids=%s"
            % (
                len(sparse_query.split()),
                40,
                len(sparse_candidates),
                ",".join(sparse_ids),
            )
        )

    embedding = get_resume_embedding_by_email(user_email)
    
    if embedding is None:
        relevant_text = extract_relevant_resume_text(resume)
        chunks = chunk_text(relevant_text, max_length=500)
        embeddings = []
        for chunk in chunks:
            if chunk.strip():
                emb = get_embedding(chunk)
                embeddings.append(emb)
        
        if embeddings:
            embedding = np.mean(embeddings, axis=0).tolist()
            insert_resume_embedding(embedding, {"email": user_email})
        else:
            print("Failed to compute embedding from resume chunks")
            return []
    else:
        print("Using precomputed embedding")
    
    if not embedding:
        print("No embedding available for recommendations")
        return []
    fetched_results = search_similar(embedding, top_k=20)
    
    job_data_with_ids = []
    for result in fetched_results:
        payload = result.payload if hasattr(result, 'payload') else {}
        job_id = payload.get('job_id', '')
        content = payload.get('content', None)
        if isinstance(content, dict):
            title = content.get("title") or payload.get("title") or ""
            company = content.get("company") or payload.get("company") or ""
            location = content.get("location") or ""
            description = content.get("description") or ""
            requirements = content.get("requirements") or content.get("requirement") or []
            if isinstance(requirements, list):
                req_text = "; ".join([str(x) for x in requirements[:8] if x])
            else:
                req_text = str(requirements)
            summary = f"{title}\n{company}\n{location}\n{req_text}\n{description}"
        else:
            title = payload.get("title", "")
            company = payload.get("company", "")
            location = payload.get("location", "")
            summary = str(content or payload.get('title', '') or "")

        summary = re.sub(r"\s+", " ", summary).strip()
        if len(summary) > 1200:
            summary = summary[:1199] + "…"
        
        if job_id and summary:
            job_data_with_ids.append({
                'job_id': job_id,
                'summary': summary,
                'title': title or payload.get('title', ''),
                'url': payload.get('url', ''),
                'company': company or payload.get('company', ''),
                'location': location,
                'date': payload.get('date', '')
            })
    dense_ids = [j.get("job_id") for j in job_data_with_ids if j.get("job_id")]
    sparse_ids_all = [c.get("job_id") for c in sparse_candidates if c.get("job_id")]
    dense_set = set(dense_ids)
    sparse_set = set(sparse_ids_all)
    overlap = len(dense_set & sparse_set)
    union_count = len(dense_set | sparse_set)
    print(
        "[HYBRID][MERGE] dense=%s sparse=%s overlap=%s union=%s"
        % (len(dense_set), len(sparse_set), overlap, union_count)
    )
    
    return job_data_with_ids

