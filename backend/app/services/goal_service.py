from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from app.services.audit_service import log_action

def validate_weightage(db: Session, goal_sheet_id: int, new_goal_weight: int = 0, updating_goal_id: int = None):
    """Rule A/B: Ensures total weightage in a sheet does not exceed 100%."""
    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == goal_sheet_id).all()
    
    current_total = sum(
        g.weightage for g in goals if g.id != updating_goal_id
    )
    
    if current_total + new_goal_weight > 100:
        raise HTTPException(
            status_code=400, 
            detail=f"Total weightage cannot exceed 100%. Current: {current_total}%, Attempted addition: {new_goal_weight}%"
        )

def check_sheet_lock(db: Session, goal_sheet_id: int):
    """Rule C: Prevents edits if the sheet is SUBMITTED or APPROVED."""
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == goal_sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")
    if sheet.status in ["SUBMITTED", "APPROVED"]:
        raise HTTPException(status_code=403, detail=f"Cannot modify goals. Sheet is {sheet.status}.")

def create_goal(db: Session, goal_in: schemas.GoalCreate, owner_id: int):
    check_sheet_lock(db, goal_in.goal_sheet_id)
    validate_weightage(db, goal_in.goal_sheet_id, goal_in.weightage)
    
    db_goal = models.Goal(**goal_in.model_dump(), owner_id=owner_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    log_action(db, owner_id, "CREATE_GOAL", f"Goal:{db_goal.id}")
    return db_goal

def lock_goal_sheet(db: Session, sheet_id: int, action_user_id: int, is_manager: bool = False):
    """Rule D: Status transition logic for submitting or approving sheets."""
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")
        
    if is_manager:
        sheet.status = "APPROVED"
        log_action(db, action_user_id, "APPROVE_SHEET", f"GoalSheet:{sheet.id}")
    else:
        sheet.status = "SUBMITTED"
        log_action(db, action_user_id, "SUBMIT_SHEET", f"GoalSheet:{sheet.id}")
        
    db.commit()
    db.refresh(sheet)
    return sheet
