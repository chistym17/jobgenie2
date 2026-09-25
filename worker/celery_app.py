import os
import ssl

from celery import Celery
from dotenv import load_dotenv

load_dotenv()

from utils.redis_url import normalize_redis_url, resolve_redis_url

_app_env = (os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or "local").strip().lower()
_redis_url = resolve_redis_url()

if _app_env in ("prod", "production"):
    _result_backend = _redis_url
    # Celery also reads these from the environment; keep them in sync so SSL
    # settings are not paired with a leftover redis://localhost backend URL.
    os.environ["CELERY_BROKER_URL"] = _redis_url
    os.environ["CELERY_RESULT_BACKEND"] = _redis_url
else:
    _result_backend = normalize_redis_url(
        os.getenv("CELERY_RESULT_BACKEND", _redis_url) or _redis_url
    )

celery_app = Celery(
    "jobgenie",
    broker=_redis_url,
    backend=_result_backend,
    include=[
        "celery_tasks.recommendation_task",
        "celery_tasks.precompute_embedding",
        "celery_tasks.parse_resume_v2",
        "celery_tasks.job_ingest",
    ],
)

_conf: dict = {
    "broker_url": _redis_url,
    "result_backend": _result_backend,
    "task_serializer": "json",
    "accept_content": ["json"],
    "result_serializer": "json",
    "timezone": "UTC",
    "enable_utc": True,
}

_ssl = {"ssl_cert_reqs": ssl.CERT_REQUIRED}
if _redis_url.startswith("rediss://"):
    _conf["broker_use_ssl"] = _ssl
if _result_backend.startswith("rediss://"):
    _conf["redis_backend_use_ssl"] = _ssl

celery_app.conf.update(**_conf)
celery_app.autodiscover_tasks()
