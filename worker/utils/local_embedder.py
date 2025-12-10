import requests
import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_SERVER = os.getenv("EMBEDDING_SERVER")

def get_embedding(text: str) -> list[float]:
    try:
        response = requests.post(EMBEDDING_SERVER, json={"inputs": text}, timeout=10)
        response.raise_for_status()
        return response.json()[0]
    except Exception as e:
        print("Embedding error:", e)
        return []

