# Architecture

This document describes the **as-built** architecture of the In-House Goal Setting & Tracking Portal.

All diagrams below render natively on GitHub (Mermaid).

> **README banner:** [`architecture.png`](./architecture.png) is exported from [`architecture-overview.mmd`](./architecture-overview.mmd). Regenerate with `python3 docs/generate_architecture_svg.py` then `npx @resvg/resvg-js` (see script header).

---

## 1. System overview

```mermaid
flowchart LR
    subgraph Client["Client (browser)"]
        UI["Next.js 15 App<br/>(React, Tailwind, SWR)"]
    end

    subgraph Edge["Next.js server (port 3000)"]
        NA["NextAuth route<br/>/api/auth/[...nextauth]"]
        SSE["SSE proxy<br/>/api/events/stream"]
        RW["URL rewrite<br/>/api/v1/* → backend"]
    end

    subgraph Backend["FastAPI backend (port 8000)"]
        API["REST routers<br/>/api/v1/*"]
        DEP["Auth + RBAC<br/>dependencies"]
        SVC["Domain services<br/>(goal, checkin, achievement,<br/>shared-goal, report,<br/>escalation, notification)"]
        SCHED["APScheduler<br/>(hourly escalations)"]
        BUS["Event bus<br/>(Redis publish)"]
    end

    subgraph Data["Stateful services"]
        PG[("PostgreSQL 16<br/>core schema")]
        RD[("Redis 7<br/>pub/sub channels")]
    end

    subgraph External["External (optional)"]
        EID["Microsoft Entra ID<br/>(OIDC)"]
        SG["SendGrid"]
        TM["Microsoft Teams<br/>webhook"]
    end

    UI -->|axios| RW
    UI -->|NextAuth flows| NA
    UI -->|EventSource| SSE

    RW --> API
    NA -->|/auth/sso<br/>token exchange| API
    SSE -->|forwards Bearer JWT| API

    API --> DEP --> SVC
    SVC --> PG
    SVC --> BUS --> RD
    RD -->|subscribe| API

    SCHED --> SVC
    NA -. id_token .-> EID
    DEP -. JWKS .-> EID
    SVC -. email .-> SG
    SVC -. card .-> TM
```

**Key points**

- The browser never talks directly to PostgreSQL or Redis.
- Two paths reach the backend:
  - Browser → Next rewrite (`/api/v1/*` → backend) for normal REST.
  - Browser → Next route (`/api/events/stream`) which forwards the Bearer JWT to the backend SSE endpoint.
- Real-time updates: backend services publish `DomainEvent`s to Redis channels (`user:{id}`, `team:{manager_id}`, `goal:{id}`). The SSE endpoint subscribes per connected user and streams events to the browser, which invalidates SWR caches and shows toasts.
- A background `APScheduler` job runs hourly inside the API process to create escalation records when sheets/check-ins age beyond their SLA.

---

## 2. Authentication & authorization

```mermaid
sequenceDiagram
    autonumber
    participant U as User (browser)
    participant N as Next.js / NextAuth
    participant B as FastAPI /auth/sso
    participant DB as PostgreSQL
    participant E as Entra ID (optional)

    U->>N: POST /api/auth/callback/credentials<br/>(email, role)
    alt Entra ID enabled
        U->>E: OAuth flow (azure-ad provider)
        E-->>N: id_token, profile
    end
    N->>B: POST /api/v1/auth/sso<br/>{email, role_name, id_token?}
    opt id_token present
        B->>E: GET JWKS
        B->>B: jose.jwt.decode(id_token, RS256, aud=client_id)
    end
    B->>DB: upsert User, assign Role
    B-->>N: { access_token (JWT HS256), user_id, role, email }
    N-->>U: NextAuth session cookie<br/>(stores accessToken, roles)
    Note over U,N: Subsequent requests<br/>attach Authorization: Bearer accessToken
    U->>N: /employee/goals (page render)
    U->>B: GET /api/v1/goals/sheets<br/>via Next rewrite, Bearer JWT
    B->>B: dependencies.get_current_user<br/>(decode JWT, fetch user)
    B->>DB: select goal_sheets where user_id=?
    B-->>U: JSON
```

**RBAC**

| Layer | Mechanism |
|-------|-----------|
| Frontend | `RoleGuard` + per-route `layout.tsx` (`UI_ROLES`) |
| Backend | `dependencies.require_manager_role`, `require_admin_role` |
| Token | JWT `sub` = `users.id`; role re-read from DB each request (not from claims) |

---

## 3. Goal lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Employee creates sheet<br/>(or auto on first goal)
    DRAFT --> DRAFT: Add/update goals<br/>(min 10%/goal, max 8 goals)
    DRAFT --> SUBMITTED: POST /goals/{id}/submit<br/>requires total = 100%
    SUBMITTED --> APPROVED: Manager POST /goals/{id}/approve
    SUBMITTED --> DRAFT: (not supported — must edit before submit)
    APPROVED --> APPROVED: Quarterly check-ins<br/>+ achievement logging
    APPROVED --> [*]: Cycle ends
```

**Server-enforced invariants** (`backend/app/services/goal_service.py`):

| Invariant | Function |
|-----------|----------|
| ≤ 8 goals/sheet | `validate_goal_count` |
| ≥ 10% per goal | `validate_single_goal_weight` |
| Total = 100% on submit | `validate_sheet_ready_for_submit` |
| Sheet locked after submit/approve | `check_sheet_lock` |
| Phase window must be active | `cycle_service.require_phase_active` |

---

## 4. Real-time event flow

```mermaid
sequenceDiagram
    autonumber
    participant U1 as Employee (browser)
    participant U2 as Manager (browser)
    participant N1 as Next /api/events/stream
    participant N2 as Next /api/events/stream
    participant B as FastAPI /api/v1/events/stream
    participant SVC as goal_service.lock_goal_sheet
    participant R as Redis (pub/sub)

    U2->>N2: EventSource open
    N2->>B: GET /events/stream<br/>Bearer JWT
    B->>R: SUBSCRIBE user:{mgr_id}, team:{mgr_id}
    U1->>B: POST /goals/{id}/submit
    B->>SVC: lock_goal_sheet(submit)
    SVC->>R: PUBLISH team:{mgr_id} {goal.sheet.submitted, ...}
    R-->>B: message
    B-->>N2: data: {...}
    N2-->>U2: onmessage → SWR mutate(/goals/manager/pending-approvals)
    Note over U2: Dashboard refreshes,<br/>toast "Team member submitted goals"
```

**Channels** (`backend/app/events/types.py`):

| Channel | Subscribers |
|---------|-------------|
| `user:{id}` | Single user (notifications, own goal updates) |
| `team:{manager_id}` | Manager dashboards |
| `goal:{id}` | Anyone viewing/sharing the goal |

**Event types** (subset): `goal.sheet.submitted`, `goal.sheet.approved`, `goal.updated`, `shared_kpi.pushed`, `checkin.created`, `achievement.updated`, `notification.created`, `escalation.created`.

---

## 5. Data model

See [`data-model.md`](./data-model.md) for the full ER diagram and business-rule mapping.

Quick summary:

```mermaid
flowchart LR
    Role -->|assigns| User
    User -->|creates| GoalSheet
    GoalSheet -->|contains| Goal
    Goal -->|tracked via| QuarterlyAchievement
    Goal -->|shared with| SharedGoal
    GoalSheet -->|reviewed| ManagerCheckin
    CheckinCycle -->|spans| GoalSheet
    CheckinCycle -->|defines| PhaseWindow
    User -->|performs| AuditLog
    User -->|receives| Notification
    User -->|in| EscalationRecord
    User -->|reports to| OrgHierarchy
```

---

## 6. Request fan-out (manager dashboard load)

```mermaid
sequenceDiagram
    participant U as Manager
    participant N as Next page<br/>/manager/dashboard
    participant B as FastAPI
    participant DB as PostgreSQL

    U->>N: navigate
    N->>N: useSession() → JWT
    par
        N->>B: GET /goals/manager/pending-approvals
        B->>DB: select subordinates, sheets[SUBMITTED]<br/>+ goals (per sheet)
        B-->>N: PendingApproval[]
    and
        N->>B: GET /checkins/team
        B->>DB: select subordinates,<br/>latest APPROVED sheet
        B-->>N: TeamMemberSummary[]
    end
    N-->>U: render dashboard
    N->>N: useRealtime() opens EventSource<br/>for live invalidation
```

---

## 7. Deployment topology

```mermaid
flowchart TB
    subgraph Compose["docker compose (single host)"]
        WEB[goal_portal_web<br/>Next.js standalone<br/>:3000]
        API_C[goal_portal_api<br/>uvicorn 4 workers<br/>:8000 internal, :4000 host]
        PG_C[goal_portal_postgres<br/>:5432]
        RD_C[goal_portal_redis<br/>:6379]
    end

    WEB -->|API_BASE_URL=http://api:8000| API_C
    API_C --> PG_C
    API_C --> RD_C

    subgraph K8s["Kubernetes (infra/k8s/*)"]
        ING[Ingress] --> SVC[Service] --> POD[Deployment<br/>backend pod x N]
        POD --> PGEXT[(External Postgres)]
        POD --> RDEXT[(External Redis)]
    end
```

**Compose** (`docker-compose.yml`) is the default local/staging deploy. **Kubernetes** manifests under `infra/k8s/` are templates for production; you supply a real Postgres + Redis (managed) and your own `Secret` / `ConfigMap`.

---

## 8. Security model

| Concern | Mitigation |
|---------|------------|
| JWT secret | `JWT_SECRET` env var, HS256, validated on every request |
| Password storage | `bcrypt` via `passlib`/`bcrypt` lib (used by `/auth/login`) |
| Entra ID tokens | RS256 verified against Microsoft JWKS, audience = client_id, issuer pinned |
| CORS | Allow-list of dev origins (`localhost:3000/4000/8000`) — restrict in prod |
| SSO bypass for dev | `ALLOW_INSECURE_SSO=true` lets `/auth/sso` accept email without `id_token` — **must be `false` in production** |
| Role tampering | Role looked up from DB each request, never trusted from JWT claims |
| Audit | Every mutation logs to `audit_logs` with actor, action, entity ref, timestamp |

---

## 9. Failure modes

| Failure | Effect | Recovery |
|---------|--------|----------|
| Redis down | Event publish logs a warning; REST keeps working; live UI stops updating | Restart Redis; refresh browser |
| Postgres down | All API calls return 500 | Restart Postgres; check `pool_pre_ping` reconnects |
| Email/Teams webhook down | Background task fails silently with logs | Re-run notification (idempotent on `audit_log`) |
| Entra ID JWKS unreachable | SSO with `id_token` rejected | Fall back to credentials provider or fix network |
| Scheduler crash | No new escalations created | API process restart; APScheduler re-arms on lifespan |
