#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Verify virtual environment exists ─────────────────────────────────────────
if [ ! -f "$PROJECT_ROOT/.venv/bin/activate" ]; then
    echo ""
    echo "ERROR: .venv not found at $PROJECT_ROOT/.venv"
    echo ""
    echo "Create it first:"
    echo "  cd $PROJECT_ROOT"
    echo "  python3 -m venv .venv"
    echo "  source .venv/bin/activate"
    echo "  pip install -r backend/requirements.txt"
    echo ""
    exit 1
fi

echo ""
echo "============================================================"
echo "  PralayAI — Starting all 3 services"
echo "============================================================"
echo ""
echo "  [1] Inference API  →  http://localhost:5000"
echo "  [2] Backend        →  http://localhost:8000"
echo "  [3] Frontend       →  http://localhost:5173"
echo ""
echo "NOTE: Inference API loads the model first (~30s on GPU)."
echo "      Wait for 'Model loaded successfully' before chatting."
echo ""

# ── PostgreSQL prerequisite ────────────────────────────────────────────────────
echo "Running database setup (requires sudo for postgres)..."
bash "$PROJECT_ROOT/setup_db.sh"

# ── Commands for each service (inline, no temp files) ─────────────────────────
CMD_INFERENCE="
cd '$PROJECT_ROOT' && \
source .venv/bin/activate && \
echo '====================================================' && \
echo '  [1] PralayAI Inference API  —  port 5000' && \
echo '====================================================' && \
echo 'Loading model from HuggingFace... (~30s on GPU)' && \
uvicorn backend.local_inference:app --host 0.0.0.0 --port 5000; \
echo ''; echo '--- Service stopped. Terminal stays open. ---'; exec bash
"

CMD_BACKEND="
cd '$PROJECT_ROOT/backend' && \
source '$PROJECT_ROOT/.venv/bin/activate' && \
echo '====================================================' && \
echo '  [2] PralayAI Backend  —  port 8000' && \
echo '====================================================' && \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; \
echo ''; echo '--- Service stopped. Terminal stays open. ---'; exec bash
"

CMD_FRONTEND="
cd '$PROJECT_ROOT/frontend' && \
echo '====================================================' && \
echo '  [3] PralayAI Frontend  —  port 5173' && \
echo '====================================================' && \
npm run dev; \
echo ''; echo '--- Service stopped. Terminal stays open. ---'; exec bash
"

# ── Launch ─────────────────────────────────────────────────────────────────────
if command -v gnome-terminal &>/dev/null; then
    # Open 3 separate windows (tabs after "--" break in gnome-terminal 3.28+)
    gnome-terminal --title="[1] Inference :5000" -- bash -c "$CMD_INFERENCE"
    gnome-terminal --title="[2] Backend   :8000" -- bash -c "$CMD_BACKEND"
    gnome-terminal --title="[3] Frontend  :5173" -- bash -c "$CMD_FRONTEND"
    echo "Opened 3 gnome-terminal windows."

elif command -v tmux &>/dev/null; then
    SESSION="pralayai"
    tmux kill-session -t "$SESSION" 2>/dev/null || true
    tmux new-session -d -s "$SESSION" -n "inference" "bash -c \"$CMD_INFERENCE\""
    tmux new-window  -t "$SESSION"   -n "backend"   "bash -c \"$CMD_BACKEND\""
    tmux new-window  -t "$SESSION"   -n "frontend"  "bash -c \"$CMD_FRONTEND\""
    tmux select-window -t "$SESSION:inference"
    echo "Opened tmux session '$SESSION'."
    echo "Attach with:  tmux attach -t $SESSION"

else
    # Background fallback with log files
    echo "No gnome-terminal or tmux found — running in background with logs."
    mkdir -p "$PROJECT_ROOT/logs"

    bash -c "$CMD_INFERENCE" > "$PROJECT_ROOT/logs/inference.log" 2>&1 &
    echo "Inference PID $!  →  logs/inference.log"

    bash -c "$CMD_BACKEND"   > "$PROJECT_ROOT/logs/backend.log"   2>&1 &
    echo "Backend   PID $!  →  logs/backend.log"

    bash -c "$CMD_FRONTEND"  > "$PROJECT_ROOT/logs/frontend.log"  2>&1 &
    echo "Frontend  PID $!  →  logs/frontend.log"

    echo ""
    echo "Watch logs:  tail -f logs/inference.log"
fi
