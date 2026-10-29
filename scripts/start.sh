#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Launching OmniConvert ==="

# Trap exit to kill backend
cleanup() {
    echo "Stopping backend..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

# Start Backend
cd "$DIR/../backend"
source .venv/bin/activate
echo "Starting Backend on http://127.0.0.1:8000..."
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start Frontend
cd "$DIR/../frontend"
echo "Starting Frontend on http://localhost:5173..."
npm run dev
