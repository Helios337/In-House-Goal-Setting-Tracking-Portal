from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException
from app import models

def get_active_cycle(db: Session):
    """Returns the currently active performance cycle based on today's date."""
    now = datetime.now(timezone.utc)
    cycle = db.query(models.CheckinCycle).filter(
        models.CheckinCycle.start_date <= now,
        models.CheckinCycle.end_date >= now
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=400, detail="No active performance cycle found.")
    return cycle

def is_phase_active(db: Session, phase_name: str, cycle_id: int) -> bool:
    """Detects if a specific window (e.g., 'Goal Setting') is currently open."""
    now = datetime.now(timezone.utc)
    phase = db.query(models.PhaseWindow).filter(
        models.PhaseWindow.cycle_id == cycle_id,
        models.PhaseWindow.name == phase_name,
        models.PhaseWindow.start_date <= now,
        models.PhaseWindow.end_date >= now
    ).first()
    
    return bool(phase)


def require_phase_active(db: Session, phase_name: str, cycle_id: int) -> None:
    """Raise HTTP 400 if the named phase window is not currently open."""
    if not is_phase_active(db, phase_name, cycle_id):
        raise HTTPException(
            status_code=400,
            detail=f"Phase '{phase_name}' is not currently active for this cycle.",
        )
