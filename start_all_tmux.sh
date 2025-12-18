#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
WORKER_DIR="$PROJECT_ROOT/worker"

if ! command -v tmux &> /dev/null; then
    echo "Error: tmux is not installed. Install it with: sudo apt install tmux"
    exit 1
fi

SESSION_NAME="jobgenie"

tmux new-session -d -s "$SESSION_NAME" -n "frontend" -c "$FRONTEND_DIR" "npm run dev"
tmux new-window -t "$SESSION_NAME" -n "backend" -c "$BACKEND_DIR" "source venv/bin/activate && uvicorn app.main:app --reload"
tmux new-window -t "$SESSION_NAME" -n "worker" -c "$WORKER_DIR" "source venv/bin/activate && python main.py"
tmux new-window -t "$SESSION_NAME" -n "celery" -c "$WORKER_DIR" "source venv/bin/activate && celery -A celery_app worker --loglevel=info"

echo "All services started in tmux session: $SESSION_NAME"
echo ""
echo "To attach to the session, run: tmux attach -t $SESSION_NAME"
echo "To detach, press: Ctrl+b then d"
echo "To kill the session, run: tmux kill-session -t $SESSION_NAME"
echo ""
echo "Windows:"
echo "  1. frontend - npm run dev"
echo "  2. backend - uvicorn app.main:app --reload"
echo "  3. worker - python main.py"
echo "  4. celery - celery worker"

tmux attach -t "$SESSION_NAME"

