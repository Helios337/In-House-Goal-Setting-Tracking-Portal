from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import dependencies, models, schemas
from app.core.database import get_db

router = APIRouter()


@router.get("", response_model=List[schemas.ThrustAreaOut])
@router.get("/", response_model=List[schemas.ThrustAreaOut])
def list_thrust_areas(
    db: Session = Depends(get_db),
    _current_user=Depends(dependencies.get_current_active_user),
):
    return (
        db.query(models.ThrustArea)
        .order_by(models.ThrustArea.name)
        .all()
    )
