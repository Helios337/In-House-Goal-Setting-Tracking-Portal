from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas, dependencies
from app.core.database import get_db
from app.services import cycle_service

router = APIRouter()


@router.post("/", response_model=schemas.CycleOut)
def create_cycle(
    cycle_in: schemas.CycleCreate,
    db: Session = Depends(get_db),
    _current_admin=Depends(dependencies.require_admin_role),
):
    """Create a new performance cycle."""
    cycle = models.CheckinCycle(
        name=cycle_in.name,
        start_date=cycle_in.start_date,
        end_date=cycle_in.end_date,
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/", response_model=List[schemas.CycleOut])
def read_active_cycles(
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    """Get active performance cycles (falls back to most recent if none active)."""
    now = datetime.now(timezone.utc)
    active = (
        db.query(models.CheckinCycle)
        .filter(
            models.CheckinCycle.start_date <= now,
            models.CheckinCycle.end_date >= now,
        )
        .order_by(models.CheckinCycle.start_date.desc())
        .all()
    )
    if active:
        return active

    return (
        db.query(models.CheckinCycle)
        .order_by(models.CheckinCycle.start_date.desc())
        .limit(5)
        .all()
    )


@router.get("/active")
def read_current_cycle(
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    """Return the current cycle and phase windows."""
    try:
        cycle = cycle_service.get_active_cycle(db)
    except Exception:
        cycle = (
            db.query(models.CheckinCycle)
            .order_by(models.CheckinCycle.start_date.desc())
            .first()
        )
        if not cycle:
            return {"cycle": None, "phases": []}

    phases = (
        db.query(models.PhaseWindow)
        .filter(models.PhaseWindow.cycle_id == cycle.id)
        .all()
    )
    return {
        "cycle": schemas.CycleOut.model_validate(cycle),
        "phases": [
            {
                "id": p.id,
                "name": p.name,
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "end_date": p.end_date.isoformat() if p.end_date else None,
                "active": cycle_service.is_phase_active(db, p.name, cycle.id),
            }
            for p in phases
        ],
    }
