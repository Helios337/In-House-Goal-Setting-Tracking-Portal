from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from app import models
from app.services import cycle_service


def test_get_active_cycle_returns_current_cycle(db):
    now = datetime.now(timezone.utc)
    active_cycle = models.CheckinCycle(
        name="FY Active",
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=1),
    )
    db.add(active_cycle)
    db.commit()

    result = cycle_service.get_active_cycle(db)

    assert result.id == active_cycle.id


def test_get_active_cycle_raises_when_none_found(db):
    now = datetime.now(timezone.utc)
    past_cycle = models.CheckinCycle(
        name="FY Past",
        start_date=now - timedelta(days=10),
        end_date=now - timedelta(days=5),
    )
    db.add(past_cycle)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        cycle_service.get_active_cycle(db)
    assert exc.value.status_code == 400


def test_is_phase_active_true_when_window_open(db):
    now = datetime.now(timezone.utc)
    cycle = models.CheckinCycle(
        name="FY Phases",
        start_date=now - timedelta(days=2),
        end_date=now + timedelta(days=2),
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    db.add(
        models.PhaseWindow(
            cycle_id=cycle.id,
            name="Goal Setting",
            start_date=now - timedelta(hours=2),
            end_date=now + timedelta(hours=2),
        )
    )
    db.commit()

    assert cycle_service.is_phase_active(db, "Goal Setting", cycle.id) is True


def test_is_phase_active_false_when_window_closed(db):
    now = datetime.now(timezone.utc)
    cycle = models.CheckinCycle(
        name="FY Closed Window",
        start_date=now - timedelta(days=2),
        end_date=now + timedelta(days=2),
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    db.add(
        models.PhaseWindow(
            cycle_id=cycle.id,
            name="Goal Setting",
            start_date=now - timedelta(days=5),
            end_date=now - timedelta(days=1),
        )
    )
    db.commit()

    assert cycle_service.is_phase_active(db, "Goal Setting", cycle.id) is False
