# Data Model & ER Diagram

## Entity Relationship Diagram
```mermaid
erDiagram
    USER ||--o{ GOAL_SHEET : creates
    USER {
        uuid id PK
        string name
        string role "Employee, Manager, Admin"
        string email
        uuid manager_id FK
    }
    GOAL_SHEET ||--|{ GOAL : contains
    GOAL_SHEET {
        uuid id PK
        uuid employee_id FK
        string status "Draft, Pending, Approved, Locked"
        datetime submitted_at
    }
    GOAL ||--o{ QUARTERLY_CHECKIN : tracked_via
    GOAL {
        uuid id PK
        uuid goal_sheet_id FK
        string title
        string thrust_area
        string uom "Numeric, %, Timeline, Zero"
        float target
        int weightage
        boolean is_shared
    }
    QUARTERLY_CHECKIN {
        uuid id PK
        uuid goal_id FK
        string quarter "Q1, Q2, Q3, Q4"
        float actual_achievement
        string status "Not Started, On Track, Completed"
        text manager_comment
        float calculated_score
    }
    AUDIT_LOG {
        uuid id PK
        uuid entity_id
        string entity_type
        string action
        uuid changed_by FK
        datetime changed_at
    }
