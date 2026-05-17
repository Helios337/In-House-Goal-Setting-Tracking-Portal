# In-House Goal Setting & Tracking Portal

An internal role-based goal management platform for organizations to plan, review, and track employee goals across performance cycles.

This repository contains:
- **Backend**: FastAPI + SQLAlchemy + Alembic (Python)
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Infra**: Docker Compose setup for PostgreSQL, Redis, API, and Web services
- **Docs**: Data model and API specification

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Core Functional Scope](#core-functional-scope)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [How to Run (Recommended: Docker Compose)](#how-to-run-recommended-docker-compose)
- [Service Access URLs](#service-access-urls)
- [How to Verify Everything Is Running](#how-to-verify-everything-is-running)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Available Documentation](#available-documentation)
- [Current Validation Status](#current-validation-status)

---

## Project Overview

The portal supports end-to-end goal lifecycle management:
- employees define and update goals
- managers review and approve goal sheets
- quarterly check-ins track actual progress
- admins monitor cycles, shared goals, reports, and audit data

The UI and API are designed for role-based workflows (Employee, Manager, Admin).

---

## Architecture

High-level system architecture is provided in:
- `architecture.png`

Runtime deployment (from `docker-compose.yml`):
1. `postgres` (PostgreSQL 16)
2. `redis` (Redis 7)
3. `api` (FastAPI service image)
4. `web` (Next.js service image)

---

## Core Functional Scope

From the source structure and docs, core capabilities include:
- Goal creation and goal-sheet workflows
- Quarterly achievement check-ins
- Goal progress scoring/aggregation
- Shared goals
- Audit logging
- Report generation
- Role-based user flows (employee/manager/admin)

---

## Repository Structure

```text
.
├── backend/                # FastAPI backend, models, services, routers, tests
├── frontend/               # Next.js frontend app
├── infra/                  # Dockerfiles for backend/frontend images
├── docs/                   # API and data model documentation
├── docker-compose.yml      # Multi-service runtime orchestration
├── .env.example            # Environment variables template
└── architecture.png        # Architecture diagram
```

Key backend folders:
- `backend/app/models` (SQLAlchemy entities)
- `backend/app/schemas` (Pydantic schemas)
- `backend/app/routers` (API routing modules)
- `backend/app/services` (business logic)
- `backend/tests` (test suite)

Key frontend folders:
- `frontend/src/app` (App router pages)
- `frontend/src/components` (UI and domain components)
- `frontend/src/hooks` (custom hooks)
- `frontend/src/store` (client-side state stores)

---

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis

### Frontend
- Node.js 18+
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Infrastructure
- Docker
- Docker Compose

---

## Prerequisites

Install the following on your machine:
1. **Docker** (latest stable)
2. **Docker Compose v2**

Optional for local (non-container) development:
3. **Python 3.10+**
4. **Node.js 18+**
5. **npm**

---

## Environment Configuration

1. Open terminal in repository root:
   ```bash
   cd <repository-root>
   ```

2. Create runtime env file from template:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and update at minimum:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - optionally `API_IMAGE` and `WEB_IMAGE` if using custom image tags

> Do not use `CHANGE_ME` values in real environments.

---

## How to Run (Recommended: Docker Compose)

### Step 1: Move to repository root
```bash
cd <repository-root>
```

### Step 2: Prepare environment file
```bash
cp .env.example .env
```

### Step 3: Validate compose file (recommended pre-check)
```bash
docker compose config
```

### Step 4: Start all services
```bash
docker compose up -d
```

### Step 5: Watch logs (optional)
```bash
docker compose logs -f
```

### Step 6: Stop services
```bash
docker compose down
```

### Step 7: Stop services and remove volumes (clean reset)
```bash
docker compose down -v
```

---

## Service Access URLs

When running with default `.env.example` values:
- **Frontend (web):** `http://localhost:3000`
- **API container mapped port:** `http://localhost:4000`
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`

Note:
- The API OpenAPI path in backend code is configured under `/api/v1/openapi.json`.
- The sample `next.config.js` rewrite fallback points to `http://127.0.0.1:8000` for API proxy in local frontend execution.

---

## How to Verify Everything Is Running

1. Check container status:
   ```bash
   docker compose ps
   ```

2. Check health/log output:
   ```bash
   docker compose logs --tail=100 postgres redis api web
   ```

3. Quick API reachability test:
   ```bash
   curl -i http://localhost:4000/
   ```

---

## Development Notes

### Backend
- Python backend configuration is in `backend/pyproject.toml`.
- App entrypoint is `backend/app/main.py`.
- Migrations are configured via `backend/alembic.ini` and `backend/alembic/`.

### Frontend
- Frontend npm scripts are defined in the frontend package manifest file.
- Main app source is in `frontend/src`.
- Next.js config is in `frontend/next.config.js`.

---

## Troubleshooting

### 1) `docker compose up` cannot pull images
- Ensure internet/network access to image registry.
- If needed, replace `API_IMAGE`/`WEB_IMAGE` in `.env` with available image tags.

### 2) Port already in use
- Update `API_PORT`, `WEB_PORT`, `POSTGRES_PORT`, `REDIS_PORT` in `.env`.
- Restart services:
  ```bash
  docker compose down
  docker compose up -d
  ```

### 3) Secrets not set
- Replace:
  - `POSTGRES_PASSWORD=CHANGE_ME`
  - `JWT_SECRET=CHANGE_ME`

### 4) Frontend local npm commands fail due missing `package.json`
- Ensure a valid `frontend/package.json` exists before running npm commands.
- If missing, correct the frontend manifest filename to `package.json`.

### 5) Backend local startup issues
- Ensure Python dependencies are installed from backend dependency definitions before running local server.

---

## Available Documentation

- Data model / ER diagram: `docs/data-model.md`
- API spec (OpenAPI-style): `docs/api-spec.yaml`
- Architecture diagram: `architecture.png`

---

## Current Validation Status

On this repository snapshot:
- `docker compose config` ✅ works after copying `.env.example` to `.env`
- `backend` local test command via `pytest` ❌ unavailable in clean environment (`pytest: command not found`)
- `frontend` local lint via `npm run lint` ❌ fails because `frontend/package.json` is not present in this snapshot

---

## License

No explicit license file is present in this repository at this time.
