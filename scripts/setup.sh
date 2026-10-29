#!/usr/bin/env bash
set -e

echo "=== Setting up OmniConvert ==="

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Setup Backend
cd "$DIR/../backend"
if [ ! -d ".venv" ]; then
    echo "[1/3] Creating virtual environment in backend/.venv..."
    python3 -m venv .venv
fi

echo "[2/3] Installing backend dependencies..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Setup Frontend
cd "$DIR/../frontend"
echo "[3/3] Installing frontend dependencies..."
npm install

echo "=== Setup complete! Run scripts/start.sh to launch OmniConvert ==="
