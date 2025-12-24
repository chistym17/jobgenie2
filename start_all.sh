#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
WORKER_DIR="$PROJECT_ROOT/worker"

if ! command -v gnome-terminal &> /dev/null; then
    echo "Error: gnome-terminal is not installed. Please install it or modify the script for your terminal."
    exit 1
fi

echo "Starting all services..."
echo "Project root: $PROJECT_ROOT"
echo ""

gnome-terminal --title="Frontend" --working-directory="$FRONTEND_DIR" -- bash -c "npm run dev; exec bash"

sleep 1

gnome-terminal --title="Backend" --working-directory="$BACKEND_DIR" -- bash -c "source venv/bin/activate && uvicorn app.main:app --reload; exec bash"

sleep 1

gnome-terminal --title="Worker" --working-directory="$WORKER_DIR" -- bash -c "source venv/bin/activate && python main.py; exec bash"

sleep 1

gnome-terminal --title="Celery Worker" --working-directory="$WORKER_DIR" -- bash -c "source venv/bin/activate && celery -A celery_app worker --loglevel=info; exec bash"

echo "All services started in separate terminals!"
echo ""
echo "Terminals opened:"
echo "  1. Frontend - npm run dev"
echo "  2. Backend - uvicorn app.main:app --reload"
echo "  3. Worker - python main.py"
echo "  4. Celery Worker - celery -A celery_app worker"

