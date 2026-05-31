"""End-to-end API smoke test (in-memory SQLite). Run: PYTHONPATH=. python scripts/smoke_test.py"""
import os
import sys

# Always use in-memory SQLite — inherited shell DATABASE_URL (e.g. Postgres) breaks connect_args.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("REDIS_URL", "redis://127.0.0.1:6379/0")
os.environ.setdefault("ALLOW_INSECURE_SSO", "true")

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models, dependencies
from app.core.database import get_db
from app.main import app

engine = create_engine(
    os.environ["DATABASE_URL"],
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
Session = sessionmaker(bind=engine)
models.Base.metadata.create_all(bind=engine)


def run():
    db = Session()
    for name in ("EMPLOYEE", "MANAGER", "ADMIN"):
        db.add(models.Role(name=name))
    db.commit()

    manager_role = db.query(models.Role).filter_by(name="MANAGER").one()
    employee_role = db.query(models.Role).filter_by(name="EMPLOYEE").one()
    admin_role = db.query(models.Role).filter_by(name="ADMIN").one()

    manager = models.User(
        email="manager@demo.example.com",
        hashed_password="fakehash",
        is_active=True,
        role_id=manager_role.id,
    )
    employee = models.User(
        email="employee@demo.example.com",
        hashed_password="fakehash",
        is_active=True,
        role_id=employee_role.id,
    )
    admin = models.User(
        email="admin@demo.example.com",
        hashed_password="fakehash",
        is_active=True,
        role_id=admin_role.id,
    )
    db.add_all([manager, employee, admin])
    db.commit()
    db.refresh(manager)
    db.refresh(employee)
    db.refresh(admin)

    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=employee.id))
    now = datetime.now(timezone.utc)
    cycle = models.CheckinCycle(
        name="FY 2026",
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=300),
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    for phase_name in ("Goal Setting", "Quarterly Check-in"):
        db.add(
            models.PhaseWindow(
                cycle_id=cycle.id,
                name=phase_name,
                start_date=now - timedelta(days=1),
                end_date=now + timedelta(days=300),
            )
        )
    db.commit()

    def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db

    import app.core.database as db_module

    db_module.SessionLocal = sessionmaker(bind=engine)

    client = TestClient(app, raise_server_exceptions=True)

    r = client.post(
        "/api/v1/auth/sso",
        json={"email": "employee@demo.example.com", "role_name": "EMPLOYEE"},
    )
    assert r.status_code == 200, r.text
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

    sheet = client.get("/api/v1/goals/sheets/current", headers=headers).json()
    sheet_id = sheet["id"]

    for title, weight in [("Goal A", 50), ("Goal B", 50)]:
        gr = client.post(
            "/api/v1/goals/",
            headers=headers,
            json={
                "title": title,
                "weightage": weight,
                "goal_sheet_id": sheet_id,
                "uom_type": "Min (Numeric / %)",
                "target_value": 100,
            },
        )
        assert gr.status_code == 200, gr.text

    bad = client.post(
        "/api/v1/goals/",
        headers=headers,
        json={"title": "Extra", "weightage": 10, "goal_sheet_id": sheet_id},
    )
    assert bad.status_code == 400, bad.text

    sub = client.post(f"/api/v1/goals/{sheet_id}/submit", headers=headers)
    assert sub.status_code == 200, sub.text

    mr = client.post(
        "/api/v1/auth/sso",
        json={"email": "manager@demo.example.com", "role_name": "MANAGER"},
    )
    m_headers = {"Authorization": f"Bearer {mr.json()['access_token']}"}
    pending = client.get("/api/v1/goals/manager/pending-approvals", headers=m_headers)
    assert pending.status_code == 200, pending.text
    assert len(pending.json()) >= 1

    appr = client.post(f"/api/v1/goals/{sheet_id}/approve", headers=m_headers)
    assert appr.status_code == 200, appr.text

    ach = client.post(
        "/api/v1/achievements/",
        headers=headers,
        json={"goal_id": 1, "quarter": "Q1", "actual_value": 75},
    )
    assert ach.status_code in (200, 404), ach.text

    team = client.get("/api/v1/checkins/team", headers=m_headers)
    assert team.status_code == 200, team.text

    ar = client.post(
        "/api/v1/auth/sso",
        json={"email": "admin@demo.example.com", "role_name": "ADMIN"},
    )
    assert ar.status_code == 200, ar.text
    admin_headers = {"Authorization": f"Bearer {ar.json()['access_token']}"}

    audit = client.get("/api/v1/audit/logs", headers=admin_headers)
    assert audit.status_code == 200, audit.text

    dash = client.get("/api/v1/reports/dashboard", headers=admin_headers)
    assert dash.status_code == 200, dash.text
    assert "team_completion" in dash.json()

    print("Smoke test passed: auth, goals, rules, submit, approve, reports")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(run())
    except AssertionError as e:
        print("Smoke test FAILED:", e)
        sys.exit(1)
