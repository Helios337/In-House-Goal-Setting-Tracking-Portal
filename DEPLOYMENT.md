# Internal production rollout checklist

Use this guide for a live **internal** deployment (Docker Compose or native). Do not commit `.env` files or secrets.

## 1. Prerequisites

- PostgreSQL 16 and Redis 7 (or use `docker compose`)
- Node.js 18+ and Python 3.11+ (native path)
- TLS termination in front of the web app (reverse proxy / ingress)

## 2. Secrets and environment

1. Copy `.env.example` → `.env` at the repo root.
2. Copy `frontend/.env.local.example` → `frontend/.env.local` (native frontend dev only).
3. Set strong values:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET` (≥32 chars, e.g. `openssl rand -base64 32`)
   - `NEXTAUTH_SECRET` (same strength; Compose maps `JWT_SECRET` into the web container)
4. Set **`ALLOW_INSECURE_SSO=false`** (default in `.env.example`). Only set `true` on a developer machine for SSO bypass demos — never in production.
5. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` to the URLs users actually hit (browser origin for API calls).
6. Add your web origin to **`BACKEND_CORS_ORIGINS`** (JSON array in `.env`), e.g. `["https://goals.internal.company.com"]`.

### Password login (no Entra)

If Microsoft Entra ID is not configured yet:

- Leave `ENTRA_*` and `AZURE_AD_*` empty.
- Create users in Postgres with bcrypt-hashed passwords (see `backend/scripts/seed.py` for demo pattern).
- Frontend **Credentials** sign-in uses `POST /api/v1/auth/login` (email + password).
- Azure AD button requires `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, and `AZURE_AD_TENANT_ID`.

### Entra ID (optional)

When ready for SSO:

- Register an app in Microsoft Entra ID.
- Set backend: `ENTRA_CLIENT_ID`, `ENTRA_TENANT_ID`, `ENTRA_CLIENT_SECRET`.
- Set frontend: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`.
- Keep `ALLOW_INSECURE_SSO=false`.

## 3. Database

```bash
cd backend
source .venv/bin/activate   # or create venv and pip install -r requirements.txt
./scripts/migrate.sh        # alembic upgrade head + seed (optional seed for demos)
```

For production, replace demo seed users with real accounts and remove or change default passwords.

## 4. Docker Compose (recommended)

```bash
cp .env.example .env
# edit .env — passwords, JWT_SECRET, CORS, ALLOW_INSECURE_SSO=false

docker compose up -d --build
```

Services:

| Service   | Default host port |
|-----------|-------------------|
| Web       | `WEB_PORT` (3000) |
| API       | `API_PORT` (4000) |
| Postgres  | 5432              |
| Redis     | 6379              |

On `docker compose up`, the API container runs `alembic upgrade head` automatically. Demo seed runs when `SEED_DATABASE=true` (default in `.env.example`).

For production after first boot, set `SEED_DATABASE=false` in `.env` and restart the API service.

To re-run migrations or seed manually:

```bash
docker compose exec api alembic upgrade head
docker compose exec api python /app/scripts/seed.py
```

## 5. Native (without Compose)

**Backend**

```bash
cd backend && source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
cd frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000
export API_BASE_URL=http://127.0.0.1:8000
export NEXTAUTH_URL=http://localhost:3000
export NEXTAUTH_SECRET=your-secret
npm run build && npm start
```

## 6. Verification

```bash
cd backend && source .venv/bin/activate && pytest -q
cd frontend && npm run lint && npm run build
cd backend && PYTHONPATH=. python scripts/smoke_test.py   # in-memory; no running API required
```

After `docker compose up -d --build`:

```bash
curl -s http://localhost:4000/health
# Expect: {"status":"ok"}

curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=employee@demo.example.com&password=demo123'
# Expect JSON with access_token

open http://localhost:3000/login
# Demo: employee@demo.example.com / demo123
```

## 7. Post-deploy manual steps (outside repo)

- [ ] DNS / TLS certificate for internal hostname
- [ ] Firewall: only corporate network → web + API
- [ ] Entra app registration + redirect URIs (if using SSO)
- [ ] Real user provisioning (HRIS export or admin scripts)
- [ ] Rotate demo passwords from seed
- [ ] Monitoring / backups for Postgres
- [ ] Teams webhook / SendGrid if using notifications

## 8. Security reminders

- Route protection: Next.js `middleware.ts` + client `RoleGuard`.
- API: JWT on all protected routes; `/auth/sso` requires `id_token` when `ALLOW_INSECURE_SSO=false`.
- Never commit `.env`, `frontend/.env.local`, or keys.
