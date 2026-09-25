#!/usr/bin/env python3
"""
Create / update Modal secret `jobgenie-worker-secrets` from worker/.env
(without Redis/Celery keys — not needed on Modal).

Run from worker/ with your existing venv active:
  python scripts/create_modal_secret.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from dotenv import dotenv_values

SECRET_NAME = "jobgenie-worker-secrets"

INCLUDE_PREFIXES = (
    "MONGODB_",
    "QDRANT_",
    "GROQ_",
    "GOOGLE_",
    "GEMINI_",
    "FIRECRAWL_",
    "COHERE_",
    "HUGGINGFACE_",
    "LITELLM_",
    "DAILY_",
    "EMBEDDING_",
    "RESUME_",
    "RECOMMENDER_",
)

INCLUDE_EXACT = {
    "APP_ENV",
    "JOB_RUNNER",
}


def main() -> int:
    if not shutil.which("modal"):
        print("ERROR: `modal` CLI not found on PATH (activate the worker venv).")
        return 1

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        print(f"ERROR: missing {env_path}")
        return 1

    raw = dotenv_values(env_path)
    selected: dict[str, str] = {}
    for key, value in raw.items():
        if not key or value is None or str(value).strip() == "":
            continue
        if key in INCLUDE_EXACT or key.startswith(INCLUDE_PREFIXES):
            selected[key] = str(value)

    selected["APP_ENV"] = "prod"
    selected["JOB_RUNNER"] = "modal"

    if "MONGODB_URI" not in selected:
        print("ERROR: MONGODB_URI missing from .env")
        return 1
    if "QDRANT_URL" not in selected or "QDRANT_API_KEY" not in selected:
        print("ERROR: QDRANT_URL / QDRANT_API_KEY missing from .env")
        return 1
    if "GROQ_API_KEY" not in selected:
        print("ERROR: GROQ_API_KEY missing from .env")
        return 1

    print(f"Creating/updating Modal secret '{SECRET_NAME}' with {len(selected)} keys:")
    for k in sorted(selected):
        print(f"  - {k}")

    # Modal 1.x: use CLI (SDK Secret.create was removed / renamed)
    # Write a temp dotenv so values with spaces/special chars stay safe.
    with tempfile.NamedTemporaryFile("w", suffix=".env", delete=False) as tmp:
        tmp_path = Path(tmp.name)
        for k, v in selected.items():
            # Escape newlines; quote values
            safe = v.replace("\n", "\\n").replace('"', '\\"')
            tmp.write(f'{k}="{safe}"\n')

    try:
        # Prefer --from-dotenv if this Modal CLI supports it
        from_dotenv = subprocess.run(
            ["modal", "secret", "create", "--help"],
            capture_output=True,
            text=True,
        )
        help_text = (from_dotenv.stdout or "") + (from_dotenv.stderr or "")

        if "--from-dotenv" in help_text or "from-dotenv" in help_text:
            cmd = [
                "modal",
                "secret",
                "create",
                SECRET_NAME,
                "--from-dotenv",
                str(tmp_path),
            ]
            # Some CLIs use --force to overwrite
            if "--force" in help_text:
                cmd.append("--force")
            result = subprocess.run(cmd, capture_output=True, text=True)
        else:
            # Fallback: KEY=VALUE args
            cmd = ["modal", "secret", "create", SECRET_NAME]
            for k, v in selected.items():
                cmd.append(f"{k}={v}")
            result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            err = (result.stderr or result.stdout or "").strip()
            # If it already exists, delete and recreate
            if "already exists" in err.lower() or "exists" in err.lower():
                print("Secret already exists — deleting and recreating...")
                subprocess.run(
                    ["modal", "secret", "delete", SECRET_NAME, "--yes"],
                    capture_output=True,
                    text=True,
                )
                # retry without --force
                if "--from-dotenv" in help_text or "from-dotenv" in help_text:
                    cmd = [
                        "modal",
                        "secret",
                        "create",
                        SECRET_NAME,
                        "--from-dotenv",
                        str(tmp_path),
                    ]
                else:
                    cmd = ["modal", "secret", "create", SECRET_NAME]
                    for k, v in selected.items():
                        cmd.append(f"{k}={v}")
                result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print("ERROR creating secret:")
            print(result.stdout)
            print(result.stderr)
            return 1

        print(result.stdout.strip() or "Secret created.")
        print("Done. Verify with: modal secret list")
        return 0
    finally:
        tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    sys.exit(main())
