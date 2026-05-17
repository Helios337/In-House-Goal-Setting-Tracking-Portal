from app import models

def test_create_goal_triggers_audit_log(client, db, mock_user):
    # 1. Setup a DRAFT sheet
    sheet = models.GoalSheet(user_id=mock_user.id, cycle_id=1, status="DRAFT")
    db.add(sheet)
    db.commit()

    # 2. Call the API to create a goal
    payload = {
        "title": "Increase Q3 Sales",
        "weightage": 50,
        "goal_sheet_id": sheet.id
    }
    response = client.post("/api/v1/goals/", json=payload)
    assert response.status_code == 200
    goal_id = response.json()["id"]

    # 3. Verify the AuditLog intercepted the event
    log_entry = db.query(models.AuditLog).filter_by(user_id=mock_user.id).first()
    assert log_entry is not None
    assert log_entry.action == "CREATE_GOAL"
    assert log_entry.target_resource == f"Goal:{goal_id}"
