# Resume Upload V2 Architecture

## Overview
This directory contains the implementation plan and tasks for the new queue-based resume upload architecture.

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v2/              # V2 API endpoints
│   │       ├── __init__.py
│   │       ├── upload_resume_v2.py
│   │       ├── status_v2.py
│   │       └── api.py
│   ├── services/
│   │   └── v2/              # V2 services
│   │       ├── __init__.py
│   │       ├── resume_upload_service.py
│   │       └── file_storage_service.py
│   ├── models/
│   │   └── v2/              # V2 data models
│   │       ├── __init__.py
│   │       ├── upload_db_models.py
│   │       └── upload_models.py
│   ├── tasks/
│   │   └── v2/              # V2 Celery tasks
│   │       ├── __init__.py
│   │       ├── parse_resume_task.py
│   │       ├── precompute_embedding_task_v2.py
│   │       └── generate_recommendations_task_v2.py
│   └── config/
│       └── v2/              # V2 configuration
│           ├── __init__.py
│           └── celery_config_v2.py
└── v2/                      # Planning & documentation
    ├── tasks.txt            # Step-by-step implementation tasks
    └── README.md            # This file
```

## Implementation Plan

Follow `tasks.txt` for step-by-step implementation. Tasks are organized into phases:

1. **Phase 1:** Foundation & Data Models
2. **Phase 2:** Celery Tasks (V2)
3. **Phase 3:** API Endpoints (V2)
4. **Phase 4:** Integration & Testing
5. **Phase 5:** Frontend Integration
6. **Phase 6:** Cleanup & Optimization
7. **Phase 7:** Migration & Deprecation (Future)

## Key Principles

- **Modular:** Each component in its own file
- **Reusable:** Reuse v1 code where possible (ResumeParser, models, etc.)
- **Clean:** Clear separation of concerns
- **Testable:** Each component can be tested independently

## Getting Started

1. Start with **Task 1.1** in `tasks.txt`
2. Complete tasks in order
3. Mark tasks as `[DONE]` when completed
4. Test each phase before moving to next

## Status

**Current Phase:** Phase 1 - Foundation & Data Models  
**Current Task:** Task 1.1 - Create V2 Directory Structure  
**Progress:** 0/50+ tasks completed

