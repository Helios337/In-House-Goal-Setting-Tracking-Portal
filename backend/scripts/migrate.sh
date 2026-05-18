#!/usr/bin/env sh
set -e

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"

cd "$BACKEND_DIR"

# Load repo-root .env (same file Docker Compose uses)
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_ROOT/.env"
  set +a
elif [ -f "$BACKEND_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$BACKEND_DIR/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-goal_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
POSTGRES_DB="${POSTGRES_DB:-goal_portal}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "ERROR: Set POSTGRES_PASSWORD in $PROJECT_ROOT/.env"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

if [ "$POSTGRES_PASSWORD" = "CHANGE_ME" ]; then
  echo "WARNING: Using placeholder POSTGRES_PASSWORD=CHANGE_ME (OK for local Docker only)."
fi

echo "Using database: postgresql://${POSTGRES_USER}:***@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

python3 - <<'PY'
import os, sys
try:
    import psycopg2
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.close()
except Exception as exc:
    print(f"ERROR: Cannot connect to Postgres: {exc}")
    print("  Check Docker is running: docker compose up postgres -d")
    print("  If you changed POSTGRES_PASSWORD, reset volume: docker compose down -v")
    sys.exit(1)
PY

python3 -m pip install -q -r requirements.txt
python3 -m alembic upgrade head
PYTHONPATH=. python3 scripts/seed.py
