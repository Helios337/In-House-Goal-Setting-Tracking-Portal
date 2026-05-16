import pytest
from fastapi import HTTPException
from app.services import shared_goal_service
from app import models

def test_push_kpi_to_subordinate(db):
    # 1. Setup Manager and Subordinate
    manager = models.User(email="mgr@ex.com", hashed_password="pwd")
    subordinate = models.User(email="sub@ex.com", hashed_password="pwd")
    db.add_all([manager, subordinate])
    db.commit()

    # 2. Setup Hierarchy
    db.add(models.OrgHierarchy(manager_id=manager.id, employee_id=subordinate.id))
    
    # 3. Setup Manager's Goal & Subordinate's Draft Sheet
    mgr_sheet = models.GoalSheet(user_id=manager.id, cycle_id=1, status="APPROVED")
    sub_sheet = models.GoalSheet(user_id=subordinate.id, cycle_id=1, status="DRAFT")
    db.add_all([mgr_sheet, sub_sheet])
    db.commit()

    mgr_goal = models.Goal(title="Company Revenue", weightage=100, owner_id=manager.id, goal_sheet_id=mgr_sheet.id)
    db.add(mgr_goal)
    db.commit()

    # 4. Execute Service
    shared_link = shared_goal_service.push_kpi_to_subordinate(
        db, manager_id=manager.id, subordinate_id=subordinate.id, parent_goal_id=mgr_goal.id
    )

    # 5. Verify Link
    assert shared_link.user_id == subordinate.id
    assert shared_link.goal_id == mgr_goal.id
    assert shared_link.permission_level == "CONTRIBUTOR"

def test_push_kpi_fails_if_not_manager(db):
    """Ensures a user cannot push a KPI to someone they don't manage."""
    with pytest.raises(HTTPException) as exc:
        shared_goal_service.push_kpi_to_subordinate(db, manager_id=99, subordinate_id=100, parent_goal_id=1)
    assert exc.value.status_code == 403
