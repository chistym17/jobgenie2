import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def get_groq_client() -> OpenAI:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )


def generate_text(
    prompt: str,
    model: str = os.environ.get("GROQ_MODEL_NAME"),
    max_tokens: int = 512,
    temperature: float = 0.7,
) -> str:
    client = get_groq_client()
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content or ""

