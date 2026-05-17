import pytest
from fastapi import HTTPException

from app import models
from app.services import goal_service, report_service, shared_goal_service
from app.services.progress_service import compute_uom_score


def test_check_sheet_lock_raises_not_found(db):
    with pytest.raises(HTTPException) as exc:
        goal_service.check_sheet_lock(db, goal_sheet_id=999)
    assert exc.value.status_code == 404


def test_lock_goal_sheet_submit_and_audit_log(db, mock_user):
    sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="DRAFT")
    db.add(sheet)
    db.commit()
    db.refresh(sheet)

    result = goal_service.lock_goal_sheet(db, sheet.id, action_user_id=mock_user.id, is_manager=False)
    assert result.status == "SUBMITTED"

    audit = db.query(models.AuditLog).filter_by(user_id=mock_user.id, action="SUBMIT_SHEET").first()
    assert audit is not None
    assert audit.target_resource == f"GoalSheet:{sheet.id}"


def test_lock_goal_sheet_approve_and_audit_log(db, mock_user):
    sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="SUBMITTED")
    db.add(sheet)
    db.commit()
    db.refresh(sheet)

    result = goal_service.lock_goal_sheet(db, sheet.id, action_user_id=mock_user.id, is_manager=True)
    assert result.status == "APPROVED"

    audit = db.query(models.AuditLog).filter_by(user_id=mock_user.id, action="APPROVE_SHEET").first()
    assert audit is not None
    assert audit.target_resource == f"GoalSheet:{sheet.id}"


def test_push_kpi_fails_when_parent_goal_missing(db):
    manager = models.User(email="manager-missing-goal@ex.com", hashed_password="pwd")
    subordinate = models.User(email="sub-missing-goal@ex.com", hashed_password="pwd")
    db.add_all([manager, subordinate])
    db.commit()
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=subordinate.id))
    db.commit()

    with pytest.raises(HTTPException) as exc:
        shared_goal_service.push_kpi_to_subordinate(
            db, manager_id=manager.id, subordinate_id=subordinate.id, parent_goal_id=123456
        )
    assert exc.value.status_code == 404


def test_push_kpi_fails_when_subordinate_has_no_draft_sheet(db):
    manager = models.User(email="manager-no-sheet@ex.com", hashed_password="pwd")
    subordinate = models.User(email="sub-no-sheet@ex.com", hashed_password="pwd")
    db.add_all([manager, subordinate])
    db.commit()
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=subordinate.id))
    db.commit()

    mgr_sheet = models.GoalSheet(user_id=manager.id, cycle_id=1, status="APPROVED")
    db.add(mgr_sheet)
    db.commit()
    db.refresh(mgr_sheet)
    goal = models.Goal(title="Parent Goal", weightage=50, owner_id=manager.id, goal_sheet_id=mgr_sheet.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)

    with pytest.raises(HTTPException) as exc:
        shared_goal_service.push_kpi_to_subordinate(
            db, manager_id=manager.id, subordinate_id=subordinate.id, parent_goal_id=goal.id
        )
    assert exc.value.status_code == 400


def test_build_csv_report_includes_subordinate_goal_rows(db):
    manager = models.User(email="manager-report@ex.com", hashed_password="pwd")
    subordinate = models.User(email="sub-report@ex.com", hashed_password="pwd")
    db.add_all([manager, subordinate])
    db.commit()

    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=subordinate.id))
    db.commit()

    sub_sheet = models.GoalSheet(user_id=subordinate.id, cycle_id=1, status="DRAFT")
    db.add(sub_sheet)
    db.commit()
    db.refresh(sub_sheet)

    db.add(models.Goal(title="Subordinate KPI", weightage=30, owner_id=subordinate.id, goal_sheet_id=sub_sheet.id))
    db.commit()

    csv_output = report_service.build_csv_report(db, manager_id=manager.id)
    assert "Employee Email,Goal Title,Weightage,Status" in csv_output
    assert "sub-report@ex.com,Subordinate KPI,30,DRAFT" in csv_output


def test_create_goal_respects_updating_goal_id_exclusion(db, mock_user):
    sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="DRAFT")
    db.add(sheet)
    db.commit()
    db.refresh(sheet)

    existing_goal = models.Goal(title="Existing", weightage=80, owner_id=mock_user.id, goal_sheet_id=sheet.id)
    db.add(existing_goal)
    db.commit()
    db.refresh(existing_goal)

    goal_service.validate_weightage(
        db,
        goal_sheet_id=sheet.id,
        new_goal_weight=30,
        updating_goal_id=existing_goal.id,
    )

    with pytest.raises(HTTPException):
        goal_service.validate_weightage(
            db,
            goal_sheet_id=sheet.id,
            new_goal_weight=30,
        )


def test_compute_uom_score_raises_for_unsupported_type():
    with pytest.raises(ValueError):
        compute_uom_score(10, 20, uom_type="UNKNOWN")
