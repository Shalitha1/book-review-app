#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/home/ubuntu/book-review-app-v2"
FRONTEND_DIR="$REPO_DIR/frontend"

cd "$FRONTEND_DIR"

echo "Installing frontend dependencies..."
npm ci --no-audit --no-fund
npm run lint
npm run build

echo "Restarting frontend..."
pm2 restart book-review-frontend --update-env

for attempt in {1..15}; do
  if curl --fail --silent --show-error http://127.0.0.1:3000/ > /dev/null; then
    break
  fi

  if [[ "$attempt" -eq 15 ]]; then
    echo "Frontend health check failed" >&2
    pm2 logs book-review-frontend --lines 50 --nostream
    exit 1
  fi

  sleep 2
done

curl --fail --silent --show-error http://127.0.0.1/api/books > /dev/null
pm2 save

echo "Frontend and Nginx API proxy passed health checks."
