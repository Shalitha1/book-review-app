#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/home/ubuntu/book-review-app-v2"
BACKEND_DIR="$REPO_DIR/backend"

cd "$BACKEND_DIR"

echo "Installing backend production dependencies..."
npm ci --omit=dev --no-audit --no-fund
npm run check

echo "Restarting backend..."
pm2 restart book-review-backend --update-env

for attempt in {1..15}; do
  if curl --fail --silent --show-error http://127.0.0.1:3001/health > /dev/null; then
    break
  fi

  if [[ "$attempt" -eq 15 ]]; then
    echo "Backend health check failed" >&2
    pm2 logs book-review-backend --lines 50 --nostream
    exit 1
  fi

  sleep 2
done

curl --fail --silent --show-error http://127.0.0.1:3001/api/books > /dev/null
pm2 save

echo "Backend deployment passed health checks."
