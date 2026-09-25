from __future__ import annotations

import os


def normalize_redis_url(url: str) -> str:
    """Strip quotes/whitespace; force TLS for Upstash (redis:// → rediss://)."""
    url = (url or "").strip().strip('"').strip("'")
    if not url:
        return url
    if "upstash.io" in url and url.startswith("redis://"):
        url = "rediss://" + url[len("redis://") :]
    return url


def resolve_redis_url() -> str:
    """
    Pick Redis URL from APP_ENV:
      - local (default): CELERY_BROKER_URL / REDIS_URL / localhost
      - prod|production: UPSTASH_REDIS_URL (or CELERY_BROKER_URL / REDIS_URL)
    """
    app_env = (os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or "local").strip().lower()
    local_default = "redis://localhost:6379/0"

    if app_env in ("prod", "production"):
        url = (
            os.getenv("UPSTASH_REDIS_URL")
            or os.getenv("CELERY_BROKER_URL")
            or os.getenv("REDIS_URL")
            or ""
        )
        url = normalize_redis_url(url)
        if not url:
            raise RuntimeError(
                "APP_ENV=prod requires UPSTASH_REDIS_URL (or CELERY_BROKER_URL / REDIS_URL)"
            )
        return url

    return normalize_redis_url(
        os.getenv("CELERY_BROKER_URL")
        or os.getenv("REDIS_URL")
        or local_default
    )
