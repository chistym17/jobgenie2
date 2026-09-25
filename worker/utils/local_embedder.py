"""
Embedding helper.

JOB_RUNNER=modal (prod / Modal) → Cohere API (384-d)
JOB_RUNNER=celery or unset (local) → EMBEDDING_SERVER (e.g. localhost:8080)
"""
from __future__ import annotations

import os

import numpy as np
import requests
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_SERVER = os.getenv("EMBEDDING_SERVER")


def _job_runner() -> str:
    return (os.getenv("JOB_RUNNER") or "celery").strip().lower()


def _truncate_text(text: str) -> str:
    if text is None:
        text = ""
    text = str(text)
    try:
        max_chars = int(os.getenv("EMBEDDER_MAX_CHARS", "6000"))
    except Exception:
        max_chars = 6000
    max_chars = max(200, min(50000, max_chars))
    if len(text) > max_chars:
        return text[: max_chars - 1] + "…"
    return text


def _embed_local(text: str) -> list[float]:
    if not EMBEDDING_SERVER:
        raise ValueError("EMBEDDING_SERVER is not set")

    response = requests.post(
        EMBEDDING_SERVER,
        json={"inputs": text, "truncate": True},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()[0]


def _embed_cohere(text: str) -> list[float]:
    import cohere

    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise ValueError("COHERE_API_KEY is not set")

    model = os.getenv("COHERE_EMBED_MODEL", "embed-v4.0")
    # Documents for resume/job chunks; search_query is fine for short queries too
    input_type = os.getenv("COHERE_EMBED_INPUT_TYPE", "search_document")

    client = cohere.ClientV2(api_key)
    response = client.embed(
        texts=[text],
        model=model,
        input_type=input_type,
        embedding_types=["float"],
        truncate="LEFT",
    )
    original = response.embeddings.float[0]
    if not isinstance(original, np.ndarray):
        original = np.array(original)
    # Qdrant collections are 384-d
    return original[:384].tolist()


def get_embedding(text: str) -> list[float]:
    text = _truncate_text(text)
    try:
        if _job_runner() == "modal":
            return _embed_cohere(text)
        return _embed_local(text)
    except Exception as e:
        print(f"Embedding error ({_job_runner()}):", e)
        return []
