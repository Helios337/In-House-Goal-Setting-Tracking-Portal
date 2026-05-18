from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List

from app import models, schemas
from app.events.types import DomainEvent, channel_user, channel_team
from app.services.audit_service import log_action
from app.services.cycle_service import require_phase_active
from app.services.event_bus import publish
from app.services.goal_service import _get_manager_for_employee
from app.services.progress_service import compute_uom_score
from app.services.uom_utils import normalize_uom_type

QUARTERLY_CHECKIN_PHASE = "Quarterly Check-in"


def _resolve_progress_score(goal: models.Goal, achievement_in: schemas.AchievementUpdate) -> float:
    raw = achievement_in.actual_value
    if raw is None:
        raw = achievement_in.progress_percentage
    if raw is None:
        raise HTTPException(
            status_code=400,
            detail="Provide actual_value or progress_percentage.",
        )

    if goal.uom_type and goal.target_value is not None:
        uom = normalize_uom_type(goal.uom_type)
        if uom == "INVERTED" and goal.target_value == 0:
            return 100.0 if raw == 0 else 0.0
        return compute_uom_score(raw, float(goal.target_value), uom_type=uom)

    return float(raw)


def log_achievement(
    db: Session, user_id: int, achievement_in: schemas.AchievementUpdate
):
    goal = (
        db.query(models.Goal)
        .filter(
            models.Goal.id == achievement_in.goal_id,
            models.Goal.owner_id == user_id,
        )
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    sheet = (
        db.query(models.GoalSheet)
        .filter(models.GoalSheet.id == goal.goal_sheet_id)
        .first()
    )
    if sheet:
        require_phase_active(db, QUARTERLY_CHECKIN_PHASE, sheet.cycle_id)

    computed_score = _resolve_progress_score(goal, achievement_in)

    existing = (
        db.query(models.QuarterlyAchievement)
        .filter_by(goal_id=achievement_in.goal_id, quarter=achievement_in.quarter)
        .first()
    )
    if existing:
        existing.progress_percentage = computed_score
        existing.narrative = achievement_in.narrative
        db.commit()
        db.refresh(existing)
        achievement = existing
    else:
        achievement = models.QuarterlyAchievement(
            goal_id=achievement_in.goal_id,
            quarter=achievement_in.quarter,
            progress_percentage=computed_score,
            narrative=achievement_in.narrative,
        )
        db.add(achievement)
        db.commit()
        db.refresh(achievement)

    log_action(db, user_id, "UPDATE_ACHIEVEMENT", f"Goal:{goal.id}:{achievement_in.quarter}")

    channels = [channel_user(user_id)]
    manager = _get_manager_for_employee(db, user_id)
    if manager:
        channels.extend([channel_user(manager.id), channel_team(manager.id)])

    publish(
        DomainEvent(
            type="achievement.updated",
            channels=list(set(channels)),
            actor_id=user_id,
            resource_type="achievement",
            resource_id=achievement.id,
            payload={"goal_id": goal.id, "quarter": achievement_in.quarter},
        )
    )
    return achievement


def get_goal_achievements(db: Session, goal_id: int, user_id: int) -> List[models.QuarterlyAchievement]:
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != user_id:
        shared = (
            db.query(models.SharedGoal)
            .filter_by(user_id=user_id, goal_id=goal_id)
            .first()
        )
        if not shared:
            raise HTTPException(status_code=403, detail="Not authorized")

    return (
        db.query(models.QuarterlyAchievement)
        .filter(models.QuarterlyAchievement.goal_id == goal_id)
        .all()
    )
