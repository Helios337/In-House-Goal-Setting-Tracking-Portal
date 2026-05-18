import pytest
from fastapi import HTTPException
from app.services import goal_service
from app import models


def test_weightage_validation_success(db, draft_sheet):
    goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=40)
    db.add(
        models.Goal(
            title="Old", weightage=50, owner_id=1, goal_sheet_id=draft_sheet.id
        )
    )
    db.commit()
    goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=40)


def test_weightage_validation_exceeds_100(db, draft_sheet):
    db.add(
        models.Goal(
            title="Old", weightage=80, owner_id=1, goal_sheet_id=draft_sheet.id
        )
    )
    db.commit()

    with pytest.raises(HTTPException) as excinfo:
        goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=30)
    assert excinfo.value.status_code == 400
    assert "cannot exceed 100%" in excinfo.value.detail


def test_single_goal_weight_minimum(db):
    with pytest.raises(HTTPException) as excinfo:
        goal_service.validate_single_goal_weight(5)
    assert excinfo.value.status_code == 400


def test_goal_count_max(db, draft_sheet):
    for i in range(8):
        db.add(
            models.Goal(
                title=f"G{i}",
                weightage=10,
                owner_id=1,
                goal_sheet_id=draft_sheet.id,
            )
        )
    db.commit()
    with pytest.raises(HTTPException) as excinfo:
        goal_service.validate_goal_count(db, draft_sheet.id)
    assert "Maximum 8 goals" in excinfo.value.detail


def test_sheet_ready_requires_100_percent(db, draft_sheet):
    db.add(
        models.Goal(
            title="Only", weightage=90, owner_id=1, goal_sheet_id=draft_sheet.id
        )
    )
    db.commit()
    with pytest.raises(HTTPException) as excinfo:
        goal_service.validate_sheet_ready_for_submit(db, draft_sheet.id)
    assert "must equal exactly 100%" in excinfo.value.detail


def test_sheet_ready_passes_at_100(db, draft_sheet):
    db.add(
        models.Goal(
            title="A", weightage=50, owner_id=1, goal_sheet_id=draft_sheet.id
        )
    )
    db.add(
        models.Goal(
            title="B", weightage=50, owner_id=1, goal_sheet_id=draft_sheet.id
        )
    )
    db.commit()
    goal_service.validate_sheet_ready_for_submit(db, draft_sheet.id)


def test_lock_logic_prevents_creation_on_approved_sheet(db, mock_user, active_cycle):
    locked_sheet = models.GoalSheet(
        user_id=mock_user.id, cycle_id=active_cycle.id, status="APPROVED"
    )
    db.add(locked_sheet)
    db.commit()

    with pytest.raises(HTTPException) as excinfo:
        goal_service.check_sheet_lock(db, locked_sheet.id)
    assert excinfo.value.status_code == 403
