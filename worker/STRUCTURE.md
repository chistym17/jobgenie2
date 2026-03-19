Worker package structure
=======================

This folder contains the async workers (Celery tasks) and a small HTTP API.

High-level folders:
- app/: HTTP API entrypoints
- tasks/: Celery task implementations
- infra/: external system adapters (MongoDB, Qdrant, Firecrawl, embedders)
- domain/: domain logic (e.g., job parsing/ingestion)
- scripts/: run scripts / operational utilities
- tests_manual/: ad-hoc manual test scripts

Backward compatibility:
- Existing modules and import paths are kept working via thin shim modules in the original locations.

