from db import fetch_all_jobs, fetch_resume_data
from fastapi import APIRouter
from utils.qdrant_service import search_similar, delete_collection, get_resume_embedding_by_email
from utils.embedder import get_embedding
import numpy as np
import re
from utils.qdrant_service import insert_resume_embedding

router = APIRouter()

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

@router.get("/fetch_recommendations")
def fetch_recommendations(user_email: str):
    
    embedding = get_resume_embedding_by_email(user_email)
    
    if embedding is None:
        resume = fetch_resume_data(user_email)
        if not resume:
            print("No resume data found")
            return []
        
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
    fetched_chunks = search_similar(embedding)
    return fetched_chunks

