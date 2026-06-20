import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
from app import models, schemas
from app.services import escalation_service, report_service
from app.core import security


def test_escalation_grace_period_cutoff(db, mock_user, active_cycle):
    # Setup subordinate and manager
    manager = models.User(email="mgr-esc@example.com", hashed_password="fakehash", is_active=True)
    db.add(manager)
    db.commit()
    db.refresh(manager)
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=mock_user.id))
    db.commit()

    # Create two sheets: one overdue, one within grace period
    overdue_sheet = models.GoalSheet(
        user_id=mock_user.id, cycle_id=active_cycle.id, status="SUBMITTED"
    )
    recent_sheet_user = models.User(email="sub-recent@example.com", hashed_password="fakehash", is_active=True)
    db.add(recent_sheet_user)
    db.commit()
    db.refresh(recent_sheet_user)
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=recent_sheet_user.id))
    db.commit()
    recent_sheet = models.GoalSheet(
        user_id=recent_sheet_user.id, cycle_id=active_cycle.id, status="SUBMITTED"
    )
    db.add_all([overdue_sheet, recent_sheet])
    db.commit()
    db.refresh(overdue_sheet)
    db.refresh(recent_sheet)

    # Log audit logs for both sheets
    now = datetime.now(timezone.utc)
    # Overdue sheet submitted 3 days ago (beyond 48 hours)
    log_overdue = models.AuditLog(
        user_id=mock_user.id,
        action="SUBMIT_SHEET",
        target_resource=f"GoalSheet:{overdue_sheet.id}",
        timestamp=now - timedelta(days=3)
    )
    # Recent sheet submitted 1 hour ago
    log_recent = models.AuditLog(
        user_id=recent_sheet_user.id,
        action="SUBMIT_SHEET",
        target_resource=f"GoalSheet:{recent_sheet.id}",
        timestamp=now - timedelta(hours=1)
    )
    db.add_all([log_overdue, log_recent])
    db.commit()

    # Verify that run_escalation_checks runs and escalates exactly 1 sheet (the overdue one)
    # Patch settings.ESCALATION_SHEET_HOURS to be 48 hours and mock the background notification delivery task
    with patch("app.services.escalation_service.settings.ESCALATION_SHEET_HOURS", 48), \
         patch("app.services.notification_service.deliver_notification_task") as mock_deliver:
        count = escalation_service._escalate_pending_approvals(db)
        
        # We expect exactly 1 new escalation record to be created
        assert count == 1
        
        # Verify the escalation record in the database is for the overdue sheet
        record = db.query(models.EscalationRecord).filter_by(
            rule_type="sheet_approval_overdue",
            status="open"
        ).first()
        assert record is not None
        assert record.resource_id == overdue_sheet.id
        assert record.target_user_id == manager.id


def test_sso_role_caching_fixes(client, db):
    # Setup an existing user with role EMPLOYEE
    emp_role = models.Role(name="EMPLOYEE", description="Employee role")
    mgr_role = models.Role(name="MANAGER", description="Manager role")
    db.add_all([emp_role, mgr_role])
    db.commit()

    user = models.User(
        email="sso-user@example.com",
        hashed_password="fakehash",
        is_active=True,
        role_id=emp_role.id
    )
    db.add(user)
    db.commit()

    # Mock the verify_sso_token call to assert the user is now a MANAGER
    mock_claims = {
        "email": "sso-user@example.com",
        "roles": ["MANAGER"]
    }
    
    with patch("app.routers.auth.entra_client.verify_sso_token", return_value=mock_claims), \
         patch("app.routers.auth.settings.ALLOW_INSECURE_SSO", True):
        
        # Make the SSO login request
        payload = {
            "email": "sso-user@example.com",
            "id_token": "mock-valid-id-token"
        }
        response = client.post("/api/v1/auth/sso", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify the returned role is MANAGER (was updated and cached relationship expired/reloaded)
        assert data["role"] == "MANAGER"
        
        # Double check the database has updated the role
        db.refresh(user)
        assert user.role.name == "MANAGER"


def test_csv_report_cycle_filtering(db, mock_user):
    # Setup manager and subordinate
    manager = models.User(email="mgr-rep@example.com", hashed_password="fakehash", is_active=True)
    db.add(manager)
    db.commit()
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=mock_user.id))
    db.commit()

    # Create two checkin cycles
    cycle1 = models.CheckinCycle(name="Cycle 1", start_date=datetime.now(timezone.utc) - timedelta(days=60), end_date=datetime.now(timezone.utc) - timedelta(days=30))
    cycle2 = models.CheckinCycle(name="Cycle 2", start_date=datetime.now(timezone.utc) - timedelta(days=29), end_date=datetime.now(timezone.utc) + timedelta(days=30))
    db.add_all([cycle1, cycle2])
    db.commit()

    # Create sheets for both cycles
    sheet1 = models.GoalSheet(user_id=mock_user.id, cycle_id=cycle1.id, status="DRAFT")
    sheet2 = models.GoalSheet(user_id=mock_user.id, cycle_id=cycle2.id, status="DRAFT")
    db.add_all([sheet1, sheet2])
    db.commit()

    # Create goals for both sheets
    goal1 = models.Goal(title="Goal Cycle 1", weightage=100, owner_id=mock_user.id, goal_sheet_id=sheet1.id)
    goal2 = models.Goal(title="Goal Cycle 2", weightage=100, owner_id=mock_user.id, goal_sheet_id=sheet2.id)
    db.add_all([goal1, goal2])
    db.commit()

    # Call report_service.build_csv_report for cycle1
    csv_cycle1 = report_service.build_csv_report(db, manager_id=manager.id, cycle_id=cycle1.id)
    assert "Goal Cycle 1" in csv_cycle1
    assert "Goal Cycle 2" not in csv_cycle1

    # Call report_service.build_csv_report for cycle2
    csv_cycle2 = report_service.build_csv_report(db, manager_id=manager.id, cycle_id=cycle2.id)
    assert "Goal Cycle 2" in csv_cycle2
    assert "Goal Cycle 1" not in csv_cycle2
