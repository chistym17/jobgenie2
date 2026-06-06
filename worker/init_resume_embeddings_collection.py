import os
import sys

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

COLLECTION_NAME = "resume_embeddings"
VECTOR_SIZE = 384


def main() -> int:
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    if not url:
        print("QDRANT_URL is not set")
        return 1

    client = QdrantClient(url=url, api_key=api_key)
    existing = {c.name for c in client.get_collections().collections}

    if COLLECTION_NAME in existing:
        info = client.get_collection(COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' already exists (points={info.points_count})")
        return 0

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=VECTOR_SIZE,
            distance=models.Distance.COSINE,
        ),
    )
    print(f"Created collection '{COLLECTION_NAME}' (size={VECTOR_SIZE}, distance=cosine)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
