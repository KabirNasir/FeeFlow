#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Starting FeeFlow services..."

# Start backend
(
  echo "📦 Installing backend dependencies…"
  cd "$ROOT_DIR/backend"
  npm install

  echo "🚀 Launching backend (on :5050)…"
  # replace with your actual backend start command if different
  npm run dev
) &

# Start frontend
(
  echo "📦 Installing frontend dependencies…"
  cd "$ROOT_DIR/frontend"
  npm install

  echo "🚀 Launching frontend (on :3000)…"
  npm start
) &

# Wait for both to exit (so Ctrl-C shuts everything down)
wait
