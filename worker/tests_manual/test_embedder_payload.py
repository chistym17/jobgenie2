import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from utils.local_embedder import get_embedding


def main() -> None:
    n = int(os.getenv("TEST_EMBED_CHARS", "1000"))
    text = ("x" * n) + " end"
    emb = get_embedding(text)
    if not emb:
        print("embedding_failed")
        return
    print("embedding_ok")
    print("vector_len:", len(emb))


if __name__ == "__main__":
    main()

