import cohere
import os
from dotenv import load_dotenv
import numpy as np

load_dotenv()

def get_embedding(text):
    client = cohere.ClientV2(os.getenv('COHERE_API_KEY'))
    response = client.embed(
        texts=[text],
        model="embed-v4.0",
        input_type="search_query",
        embedding_types=["float"],
        truncate="LEFT"
    )
    
    original_embedding = response.embeddings.float[0]
    
    if not isinstance(original_embedding, np.ndarray):
        original_embedding = np.array(original_embedding)
    
    reduced_embedding = original_embedding[:384]
    
    return reduced_embedding.tolist()  



