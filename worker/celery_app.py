from celery import Celery

celery_app = Celery(
    'jobgenie',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
    include=[
        'celery_tasks.recommendation_task',
        'celery_tasks.precompute_embedding',
        'celery_tasks.parse_resume_v2',
        'celery_tasks.job_ingest',
    ],
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

celery_app.autodiscover_tasks()