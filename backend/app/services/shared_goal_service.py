from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from app.services.audit_service import log_action

def push_kpi_to_subordinate(db: Session, manager_id: int, subordinate_id: int, parent_goal_id: int):
    """Creates a linked copy of a manager's goal in the subordinate's active sheet."""
    # 1. Verify relationship
    hierarchy = db.query(models.OrgHierarchy).filter_by(manager_id=manager_id, employee_id=subordinate_id).first()
    if not hierarchy:
        raise HTTPException(status_code=403, detail="User is not a direct subordinate.")

    # 2. Get parent goal
    parent_goal = db.query(models.Goal).filter(models.Goal.id == parent_goal_id).first()
    if not parent_goal:
        raise HTTPException(status_code=404, detail="Parent goal not found.")

    # 3. Find subordinate's active goal sheet (assume active cycle logic here)
    sub_sheet = db.query(models.GoalSheet).filter_by(user_id=subordinate_id, status="DRAFT").first()
    if not sub_sheet:
        raise HTTPException(status_code=400, detail="Subordinate has no active DRAFT sheet.")

    # 4. Link it via SharedGoal table
    shared_link = models.SharedGoal(
        user_id=subordinate_id,
        goal_id=parent_goal.id,
        permission_level="CONTRIBUTOR"
    )
    db.add(shared_link)
    db.commit()
    
    log_action(db, manager_id, "PUSH_KPI", f"Goal:{parent_goal.id}->User:{subordinate_id}")
    return shared_link

def sync_linked_goal(db: Session, goal_id: int, new_title: str):
    """If a manager updates a top-level KPI, cascade title/description changes."""
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal:
        goal.title = new_title
        # Note: Since subordinates share the exact Goal ID via SharedGoal link table,
        # updating the master goal automatically updates it for viewers.
        # If they had deep copies, you would iterate and update children here.
        db.commit()
