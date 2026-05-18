import pytest
from app.services.achievement_service import _resolve_progress_score
from app.services.uom_utils import normalize_uom_type
from app import models, schemas


def test_normalize_uom_frontend_labels():
    assert normalize_uom_type("Min (Numeric / %)") == "PERCENTAGE"
    assert normalize_uom_type("Max (Numeric / %)") == "INVERTED"
    assert normalize_uom_type("Zero") == "INVERTED"


def test_resolve_progress_with_uom(db, draft_sheet):
    goal = models.Goal(
        title="Sales",
        weightage=100,
        owner_id=1,
        goal_sheet_id=draft_sheet.id,
        uom_type="Min (Numeric / %)",
        target_value=100.0,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    score = _resolve_progress_score(
        goal,
        schemas.AchievementUpdate(goal_id=goal.id, quarter="Q1", actual_value=50),
    )
    assert score == 50.0


def test_resolve_progress_zero_uom(db, draft_sheet):
    goal = models.Goal(
        title="Safety",
        weightage=100,
        owner_id=1,
        goal_sheet_id=draft_sheet.id,
        uom_type="Zero",
        target_value=0.0,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    score = _resolve_progress_score(
        goal,
        schemas.AchievementUpdate(goal_id=goal.id, quarter="Q1", actual_value=0),
    )
    assert score == 100.0
