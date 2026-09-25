from __future__ import annotations

import os
import ssl

from celery import Celery
from dotenv import load_dotenv

load_dotenv()

from app.config.v2.redis_url import normalize_redis_url, resolve_redis_url


def create_celery_client() -> Celery:
    app_env = (os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or "local").strip().lower()
    redis_url = resolve_redis_url()

    if app_env in ("prod", "production"):
        result_backend = redis_url
        os.environ["CELERY_BROKER_URL"] = redis_url
        os.environ["CELERY_RESULT_BACKEND"] = redis_url
    else:
        result_backend = normalize_redis_url(
            os.getenv("CELERY_RESULT_BACKEND", redis_url) or redis_url
        )

    app = Celery(
        "jobgenie",
        broker=redis_url,
        backend=result_backend,
    )

    app.conf.broker_url = redis_url
    app.conf.result_backend = result_backend

    ssl_opts = {"ssl_cert_reqs": ssl.CERT_REQUIRED}
    if redis_url.startswith("rediss://"):
        app.conf.broker_use_ssl = ssl_opts
    if result_backend.startswith("rediss://"):
        app.conf.redis_backend_use_ssl = ssl_opts

    return app


celery_client: Celery = create_celery_client()
