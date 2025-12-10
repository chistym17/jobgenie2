from celery_app import celery_app
from db import fetch_resume_data
from utils.local_embedder import get_embedding
from utils.qdrant_service import insert_resume_embedding
from fetch_recommendations import extract_relevant_resume_text, chunk_text
import numpy as np

@celery_app.task(name='precompute_resume_embedding')
def precompute_resume_embedding_task(user_email: str):

    try:
        resume = fetch_resume_data(user_email)
        if not resume:
            print(f"No resume data found for {user_email}")
            return None

        relevant_text = extract_relevant_resume_text(resume)
        chunks = chunk_text(relevant_text, max_length=500)
        
        embeddings = []
        for chunk in chunks:
            if chunk.strip():
                emb = get_embedding(chunk)
                if emb:  
                    embeddings.append(emb)
        
        if not embeddings:
            print(f"Failed to compute embeddings for {user_email}")
            return None

        final_embedding = np.mean(embeddings, axis=0).tolist()
        
        result = insert_resume_embedding(final_embedding, {"email": user_email})
        
        if result:
            return {"status": "success", "email": user_email}
        else:
            return None

    except Exception as e:
        print(f"Error in precompute_resume_embedding_task: {e}")
        raise
