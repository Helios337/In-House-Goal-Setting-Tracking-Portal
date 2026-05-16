from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, dependencies

router = APIRouter()

@router.post("/", response_model=schemas.CycleOut)
def create_cycle(
    cycle_in: schemas.CycleCreate,
    db: Session = Depends(dependencies.get_db),
    # current_admin = Depends(dependencies.require_admin_role)
):
    """Create a new performance cycle & phase windows."""
    pass

@router.get("/", response_model=List[schemas.CycleOut])
def read_active_cycles(
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Get current active performance cycles."""
    pass
