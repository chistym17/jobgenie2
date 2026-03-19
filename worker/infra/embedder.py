import requests
import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_SERVER = os.getenv("EMBEDDING_SERVER")


def get_embedding(text: str) -> list[float]:
    try:
        if not EMBEDDING_SERVER:
            raise ValueError("EMBEDDING_SERVER is not set")

        if text is None:
            text = ""
        text = str(text)

        try:
            max_chars = int(os.getenv("EMBEDDER_MAX_CHARS", "6000"))
        except Exception:
            max_chars = 6000
        max_chars = max(200, min(50000, max_chars))
        if len(text) > max_chars:
            text = text[: max_chars - 1] + "…"

        response = requests.post(
            EMBEDDING_SERVER,
            json={"inputs": text, "truncate": True},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()[0]
    except Exception as e:
        try:
            status = response.status_code  # type: ignore[name-defined]
        except Exception:
            status = None
        if status == 413:
            print("Embedding error: 413 Payload Too Large")
            print("embed_url:", EMBEDDING_SERVER)
            print("inputs_len:", len(text) if isinstance(text, str) else "n/a")
        else:
            print("Embedding error:", e)
        return []

