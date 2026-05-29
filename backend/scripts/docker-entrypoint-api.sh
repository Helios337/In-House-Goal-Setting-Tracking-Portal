#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head

if [ "${SEED_DATABASE:-true}" != "false" ]; then
  echo "Seeding database (set SEED_DATABASE=false in production)..."
  PYTHONPATH=/app python /app/scripts/seed.py
fi

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
