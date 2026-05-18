# In-House Goal Setting & Tracking Portal

This repository contains an internal goal-setting and tracking platform with:
- **Backend**: FastAPI REST API (Python)
- **Frontend**: Next.js web app (React)
- **Database**: PostgreSQL
- **Real-time**: Redis pub/sub + Server-Sent Events
- **Infrastructure**: Docker Compose stack with PostgreSQL and Redis

## Architecture (as-built)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, NextAuth (Azure AD + credentials) |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Auth | JWT (HS256) + optional Entra ID token verification |
| Integrations | SendGrid email, Microsoft Teams webhook (optional) |
| DevOps | Docker Compose, generic Kubernetes manifests, GitHub Actions CI |

This manual provides a **detailed step-by-step setup guide** for:
1. Windows
2. Linux
3. macOS

It concludes with troubleshooting and recommended next steps.

---

## 1) Project Structure

At the root of the repository:

- `backend/` → API source code, migrations, tests
- `frontend/` → Next.js application
- `infra/` → Dockerfiles for backend and frontend
- `docker-compose.yml` → Multi-service deployment definition
- `.env.example` → Environment template
- `docs/` → API spec and data model docs

---

## 2) Common Prerequisites (All Platforms)

Install the following before starting:

- **Git** (latest stable)
- **Docker Desktop** or Docker Engine + Docker Compose plugin
- **Python 3.10+** (3.11 recommended)
- **Node.js 18+** and **npm**

Optional but recommended:
- A code editor (VS Code recommended)
- `curl` for quick API checks

---

## 3) Environment Setup (All Platforms)

From the repository root:

1. Create your runtime environment file from template.
2. Update placeholder secrets and image references.

### Required edits in `.env`

- `POSTGRES_PASSWORD=CHANGE_ME` → replace with a real password
- `JWT_SECRET=CHANGE_ME` → replace with a strong random secret
- `API_IMAGE` and `WEB_IMAGE` → keep defaults or point to your own images

### Validate your compose configuration

```bash
cp .env.example .env
docker compose config
```

If `docker compose config` renders successfully, your environment file is valid.

---

## 4) Windows Setup (Step by Step)

> The easiest flow on Windows is **PowerShell + Docker Desktop**.

### Step 1: Install prerequisites

1. Install **Git for Windows**.
2. Install **Docker Desktop** and ensure WSL2 integration is enabled.
3. Install **Python 3.11**.
4. Install **Node.js 18 LTS**.

Verify:

```powershell
git --version
docker --version
docker compose version
python --version
node --version
npm --version
```

### Step 2: Go to the project

```powershell
cd "C:\path\to\In-House-Goal-Setting-Tracking-Portal"
```

### Step 3: Create and update environment variables

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace at least:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`

### Step 4: Validate compose file

```powershell
docker compose config
```

### Step 5: Start the platform

```powershell
docker compose up -d
```

### Step 6: Check status

```powershell
docker compose ps
docker compose logs -f
```

### Step 7: Access services

- Frontend: `http://localhost:3000`
- API (through configured API port): `http://localhost:4000`

### Step 8: Stop services

```powershell
docker compose down
```

To also remove data volumes:

```powershell
docker compose down -v
```

---

## 5) Linux Setup (Step by Step)

### Step 1: Install prerequisites

Ubuntu/Debian example:

```bash
sudo apt update
sudo apt install -y git curl python3 python3-venv python3-pip nodejs npm docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

Verify:

```bash
git --version
docker --version
docker compose version
python3 --version
node --version
npm --version
```

### Step 2: Move into the repository

```bash
cd /path/to/In-House-Goal-Setting-Tracking-Portal
```

### Step 3: Prepare environment file

```bash
cp .env.example .env
```

Edit `.env` and replace:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`

### Step 4: Validate and start

```bash
docker compose config
docker compose up -d
```

### Step 5: Verify running stack

```bash
docker compose ps
docker compose logs -f
```

### Step 6: Open applications

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`

### Step 7: Shutdown

```bash
docker compose down
```

Full cleanup:

```bash
docker compose down -v
```

---

## 6) macOS Setup (Step by Step)

### Step 1: Install prerequisites

1. Install **Homebrew** (if not installed).
2. Install Git, Python, Node.js:

```bash
brew install git python node
```

3. Install **Docker Desktop for Mac**.

Verify:

```bash
git --version
docker --version
docker compose version
python3 --version
node --version
npm --version
```

### Step 2: Go to repository folder

```bash
cd /path/to/In-House-Goal-Setting-Tracking-Portal
```

### Step 3: Configure `.env`

```bash
cp .env.example .env
```

Update secret placeholders in `.env`.

### Step 4: Validate and run

```bash
docker compose config
docker compose up -d
```

### Step 5: Monitor

```bash
docker compose ps
docker compose logs -f
```

### Step 6: Access app

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`

### Step 7: Stop

```bash
docker compose down
```

---

## 7) Local Development Without Docker (Optional)

Use this mode when you want to run backend/frontend directly for faster iteration.

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
```

Activate venv:
- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- Linux/macOS: `source .venv/bin/activate`

Install dependencies:

```bash
pip install -r requirements.txt pytest
```

Run migrations:

```bash
alembic upgrade head
```

Run API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:
- Swagger UI: `http://127.0.0.1:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open:
- `http://localhost:3000`

---

## 8) Validation and Health Checks

Basic checks:

1. `docker compose ps` shows services up/healthy.
2. Frontend loads in browser.
3. API responds on expected port.
4. Backend tests can run:

```bash
cd backend
python -m pytest
```

5. Frontend lint can run:

```bash
cd frontend
npm run lint
```

---

## 9) Troubleshooting

### Docker command not found
- Install Docker Desktop / Engine.
- Restart terminal and verify with `docker --version`.

### Ports already in use
- Change `API_PORT`, `WEB_PORT`, `POSTGRES_PORT`, or `REDIS_PORT` in `.env`.
- Restart stack with `docker compose down && docker compose up -d`.

### Authentication or startup errors
- Ensure `JWT_SECRET` is not left as `CHANGE_ME`.
- Verify `.env` is present at repository root.

### Image pull failures
- Confirm internet access and image names in `.env`.
- If using private registry images, authenticate first (`docker login`).

### Frontend cannot reach backend
- Verify API service is running.
- Confirm frontend/API URLs and port values are aligned with `.env`.

### Database issues
- Check Postgres container logs:
  - `docker compose logs postgres`
- For a clean reset:
  - `docker compose down -v`
  - `docker compose up -d`

---

## 10) Conclusion

You now have a complete, cross-platform setup process for running this portal on **Windows, Linux, and macOS**.

Recommended next actions:
1. Keep `.env` secrets secure and never commit them.
2. Use Docker Compose for consistent team environments.
3. Use local backend/frontend mode for rapid development.
4. Add CI/CD and automated checks as the project grows.

If you follow the steps above in order, you should be able to install, run, validate, and troubleshoot the system reliably on any major desktop OS.
