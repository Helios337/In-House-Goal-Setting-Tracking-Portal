# Data Model & ER Diagram

This document reflects the **implemented** PostgreSQL schema (integer primary keys).

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ GOAL_SHEET : creates
    USER ||--o{ ORG_HIERARCHY : manager_or_employee
    ROLE ||--o{ USER : assigns
    GOAL_SHEET ||--|{ GOAL : contains
    GOAL ||--o{ QUARTERLY_ACHIEVEMENT : tracked_via
    GOAL ||--o{ SHARED_GOAL : shared_with
    GOAL_SHEET ||--o{ MANAGER_CHECKIN : reviewed_via
    CHECKIN_CYCLE ||--o{ GOAL_SHEET : spans
    CHECKIN_CYCLE ||--o{ PHASE_WINDOW : defines
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ ESCALATION_RECORD : involved_in

    USER {
        int id PK
        string email
        int role_id FK
        bool is_active
    }
    ORG_HIERARCHY {
        int id PK
        int manager_id FK
        int employee_id FK
    }
    GOAL_SHEET {
        int id PK
        int user_id FK
        int cycle_id FK
        string status "DRAFT, SUBMITTED, APPROVED"
    }
    GOAL {
        int id PK
        int goal_sheet_id FK
        int owner_id FK
        string title
        int weightage
        string uom_type
        float target_value
    }
    QUARTERLY_ACHIEVEMENT {
        int id PK
        int goal_id FK
        string quarter
        float progress_percentage
        text narrative
    }
    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        string entity_ref
        datetime created_at
    }
```

## Approval trail

There is no separate `approval_logs` table. Approvals are recorded as:

- `goal_sheets.status` transitions (`SUBMITTED` → `APPROVED`)
- `audit_logs` entries with actions `SUBMIT_SHEET` and `APPROVE_SHEET`

## Real-time layer

Redis pub/sub backs Server-Sent Events (`/api/v1/events/stream`) for notifications and goal updates.

## Business rules (server-enforced)

| Rule | Enforcement |
|------|-------------|
| Max 8 goals per sheet | `goal_service.validate_goal_count` |
| Min 10% per goal | `goal_service.validate_single_goal_weight` |
| Total weightage = 100% | `goal_service.validate_sheet_ready_for_submit` on submit/approve |
| Goal lock after approval | `goal_service.check_sheet_lock` |
| Phase windows | `cycle_service.require_phase_active` on goal and achievement mutations |
