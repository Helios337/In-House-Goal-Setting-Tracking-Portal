from app.services import report_service
from app import models

def test_completion_stats_aggregation(db):
    # Create test cycle
    db.add(models.CheckinCycle(id=1, name="FY24", start_date="2024-01-01", end_date="2024-12-31"))
    
    # Create two sheets: one approved, one draft
    db.add(models.GoalSheet(id=10, user_id=1, cycle_id=1, status="APPROVED"))
    db.add(models.GoalSheet(id=20, user_id=2, cycle_id=1, status="DRAFT"))
    
    # Add goals and achievements simulating 50% and 100% progress
    db.add(models.Goal(id=100, title="G1", owner_id=1, goal_sheet_id=10))
    db.add(models.Goal(id=200, title="G2", owner_id=2, goal_sheet_id=20))
    db.add(models.QuarterlyAchievement(goal_id=100, quarter="Q1", progress_percentage=100.0))
    db.add(models.QuarterlyAchievement(goal_id=200, quarter="Q1", progress_percentage=50.0))
    db.commit()

    stats = report_service.generate_completion_stats(db, cycle_id=1)
    
    assert stats["total_sheets"] == 2
    assert stats["completion_rate"] == 50.0  # 1 out of 2 is approved
    assert stats["average_progress"] == 75.0 # (100 + 50) / 2

def test_csv_export_endpoint(client, db, mock_user):
    # Mocking manager role logic
    response = client.get("/reports/export")
    
    # Assuming the stubbed router logic from earlier is returning a CSV
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=report.csv" in response.headers["content-disposition"]
    assert "User,Goal,Quarter,Progress" in response.text
