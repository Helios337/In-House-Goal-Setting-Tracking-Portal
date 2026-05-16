from sqlalchemy.orm import Session
from app import models, schemas
from app.services.audit_service import log_action

def create_goal(db: Session, goal_in: schemas.GoalCreate, owner_id: int):
    db_goal = models.Goal(
        **goal_in.model_dump(),
        owner_id=owner_id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    log_action(db, owner_id, "CREATE_GOAL", f"Goal:{db_goal.id}")
    return db_goal

def get_user_goals(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Goal)\
             .filter(models.Goal.owner_id == user_id)\
             .offset(skip)\
             .limit(limit)\
             .all()

def submit_goal_sheet(db: Session, sheet_id: int, user_id: int):
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if sheet and sheet.user_id == user_id:
        sheet.status = "SUBMITTED"
        db.commit()
        db.refresh(sheet)
        log_action(db, user_id, "SUBMIT_SHEET", f"GoalSheet:{sheet.id}")
    return sheet

def approve_goal_sheet(db: Session, sheet_id: int, manager_id: int):
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if sheet:
        sheet.status = "APPROVED"
        db.commit()
        db.refresh(sheet)
        log_action(db, manager_id, "APPROVE_SHEET", f"GoalSheet:{sheet.id}")
    return sheet
