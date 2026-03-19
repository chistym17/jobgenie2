import os
import sys
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

from utils.local_embedder import get_embedding
from utils.qdrant_service import insert_resume_embedding

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

COLLECTION_NAME = "resume_embeddings"
VECTOR_SIZE = 384
TEST_EMAIL = "test@example.com"

def create_resume_embeddings_collection():
    try:
        collections = [c.name for c in client.get_collections().collections]
        
        if COLLECTION_NAME in collections:
            print(f"Collection '{COLLECTION_NAME}' already exists")
        else:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=VECTOR_SIZE,
                    distance=models.Distance.COSINE
                )
            )
            print(f"Successfully created collection '{COLLECTION_NAME}' with vector size {VECTOR_SIZE}")
        
    except Exception as e:
        print(f"Error creating collection: {e}")
        return False
    
    return True

def test_insertion():
    print("\nTesting insertion...")
    
    test_text = "Software engineer with 5 years of experience in Python and JavaScript"
    print(f"Generating embedding for: '{test_text}'")
    
    embedding = get_embedding(test_text)
    
    if not embedding:
        print("Failed to generate embedding")
        return False
    
    print(f"Embedding generated: {len(embedding)} dimensions")
    
    if len(embedding) != VECTOR_SIZE:
        print(f"Warning: Embedding size ({len(embedding)}) doesn't match collection size ({VECTOR_SIZE})")
    
    print(f"Inserting embedding for email: {TEST_EMAIL}")
    result = insert_resume_embedding(embedding, {"email": TEST_EMAIL})
    
    if result:
        print("Successfully inserted embedding!")
        return True
    else:
        print("Failed to insert embedding")
        return False

def clear_collection():
    print("\nClearing collection...")
    try:
        collections = [c.name for c in client.get_collections().collections]
        
        if COLLECTION_NAME not in collections:
            print(f"Collection '{COLLECTION_NAME}' doesn't exist")
            return False
        
        offset = None
        total_deleted = 0
        
        while True:
            points, offset = client.scroll(
                collection_name=COLLECTION_NAME,
                limit=100,
                offset=offset,
                with_payload=False,
                with_vectors=False,
            )
            
            if not points:
                break
            
            point_ids = [point.id for point in points]
            
            if point_ids:
                client.delete(
                    collection_name=COLLECTION_NAME,
                    points_selector=models.PointIdsList(points=point_ids),
                )
                total_deleted += len(point_ids)
                print(f"Deleted {len(point_ids)} points")
            
            if offset is None:
                break
        
        print(f"Collection cleared. Total points deleted: {total_deleted}")
        return True
        
    except Exception as e:
        print(f"Error clearing collection: {e}")
        return False

if __name__ == "__main__":
    if create_resume_embeddings_collection():
        test_insertion()
        clear_collection()

