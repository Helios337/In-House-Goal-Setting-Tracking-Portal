import pytest
from app.services.progress_service import compute_uom_score

@pytest.mark.parametrize("actual, target, expected", [
    (50, 100, 50.0),    # Halfway done
    (100, 100, 100.0),  # Exactly done
    (150, 100, 100.0),  # Over-achieved (capped at 100%)
    (0, 100, 0.0),      # No progress
])
def test_compute_uom_score_percentage(actual, target, expected):
    assert compute_uom_score(actual, target, uom_type="PERCENTAGE") == expected

@pytest.mark.parametrize("actual, target, expected", [
    (2, 5, 100.0),      # Actual bugs (2) < Target bugs (5) -> 100% success
    (5, 5, 100.0),      # Exact target met
    (10, 5, 50.0),      # Over target -> Linear penalty (5/10 = 50%)
    (20, 5, 25.0),      # Heavy penalty
])
def test_compute_uom_score_inverted(actual, target, expected):
    """Tests scenarios where a lower number is better (e.g., defects, churn)."""
    assert compute_uom_score(actual, target, uom_type="INVERTED") == expected

def test_compute_uom_score_zero_target():
    assert compute_uom_score(10, 0, uom_type="ABSOLUTE") == 0.0
