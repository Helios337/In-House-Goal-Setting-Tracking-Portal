import pytest
from fastapi import HTTPException
from app.services import goal_service
from app import schemas, models

@pytest.fixture
def draft_sheet(db, mock_user):
    sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="DRAFT")
    db.add(sheet)
    db.commit()
    db.refresh(sheet)
    return sheet

def test_weightage_validation_success(db, draft_sheet):
    """Rule A: Valid weightage does not raise an exception."""
    goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=40)
    # Adding a simulated existing goal
    db.add(models.Goal(title="Old", weightage=50, owner_id=1, goal_sheet_id=draft_sheet.id))
    db.commit()
    # 50 (existing) + 40 (new) = 90 (Passes)
    goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=40)

def test_weightage_validation_exceeds_100(db, draft_sheet):
    """Rule B: Exceeding 100% total weightage raises HTTP 400."""
    db.add(models.Goal(title="Old", weightage=80, owner_id=1, goal_sheet_id=draft_sheet.id))
    db.commit()
    
    with pytest.raises(HTTPException) as excinfo:
        goal_service.validate_weightage(db, draft_sheet.id, new_goal_weight=30)
    assert excinfo.value.status_code == 400
    assert "cannot exceed 100%" in excinfo.value.detail

def test_lock_logic_prevents_creation_on_approved_sheet(db, mock_user):
    """Rule C/D: Cannot add goals to a locked sheet."""
    locked_sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="APPROVED")
    db.add(locked_sheet)
    db.commit()

    with pytest.raises(HTTPException) as excinfo:
        goal_service.check_sheet_lock(db, locked_sheet.id)
    assert excinfo.value.status_code == 403
