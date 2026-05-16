from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, dependencies

router = APIRouter()

@router.post("/", response_model=schemas.GoalOut)
def create_goal(
    goal_in: schemas.GoalCreate,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Create new goal in a goal sheet."""
    pass

@router.get("/", response_model=List[schemas.GoalOut])
def read_goals(
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Retrieve goals for the current user."""
    pass

@router.put("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(
    goal_id: int,
    goal_in: schemas.GoalUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Update a draft goal."""
    pass

@router.post("/{sheet_id}/submit")
def submit_goal_sheet(
    sheet_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Submit goal sheet for manager approval."""
    pass

@router.post("/{sheet_id}/approve")
def approve_goal_sheet(
    sheet_id: int,
    db: Session = Depends(dependencies.get_db),
    current_manager = Depends(dependencies.require_manager_role)
):
    """Manager approves and locks the goal sheet."""
    pass
