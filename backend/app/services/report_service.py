from sqlalchemy.orm import Session
from sqlalchemy import func
import io
import csv
from app import models


def generate_completion_stats(db: Session, cycle_id: int):
    """Calculates overall company progress for a specific cycle."""
    avg_progress = (
        db.query(func.avg(models.QuarterlyAchievement.progress_percentage))
        .join(models.Goal)
        .join(models.GoalSheet)
        .filter(models.GoalSheet.cycle_id == cycle_id)
        .scalar()
    )

    total_sheets = (
        db.query(models.GoalSheet)
        .filter(models.GoalSheet.cycle_id == cycle_id)
        .count()
    )
    approved_sheets = (
        db.query(models.GoalSheet)
        .filter(
            models.GoalSheet.cycle_id == cycle_id,
            models.GoalSheet.status == "APPROVED",
        )
        .count()
    )

    team_completion = _team_completion_stats(db, cycle_id)

    return {
        "average_progress": float(avg_progress or 0.0),
        "total_sheets": total_sheets,
        "completion_rate": (approved_sheets / total_sheets * 100) if total_sheets else 0,
        "team_completion": team_completion,
    }


def _team_completion_stats(db: Session, cycle_id: int) -> list:
    """Group achievement completion by manager team via org_hierarchy."""
    managers = (
        db.query(models.User)
        .join(
            models.OrgHierarchy,
            models.User.id == models.OrgHierarchy.manager_id,
        )
        .distinct()
        .all()
    )
    teams = []
    for manager in managers:
        subordinate_ids = [
            row.employee_id
            for row in db.query(models.OrgHierarchy)
            .filter(models.OrgHierarchy.manager_id == manager.id)
            .all()
        ]
        if not subordinate_ids:
            continue

        total_employees = len(subordinate_ids)
        rows = (
            db.query(models.Goal.owner_id)
            .join(models.QuarterlyAchievement, models.QuarterlyAchievement.goal_id == models.Goal.id)
            .join(models.GoalSheet, models.GoalSheet.id == models.Goal.goal_sheet_id)
            .filter(
                models.GoalSheet.cycle_id == cycle_id,
                models.GoalSheet.user_id.in_(subordinate_ids),
            )
            .distinct()
            .all()
        )
        completed = len(rows)
        teams.append(
            {
                "department": f"Team: {manager.email}",
                "totalEmployees": total_employees,
                "completedCheckins": min(completed, total_employees),
            }
        )
    return teams


def build_csv_report(db: Session, manager_id: int, cycle_id: int | None = None) -> str:
    """Generates a CSV string of all subordinate goals and progress for a cycle."""
    subordinates = (
        db.query(models.User)
        .join(
            models.OrgHierarchy,
            models.User.id == models.OrgHierarchy.employee_id,
        )
        .filter(models.OrgHierarchy.manager_id == manager_id)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee Email", "Goal Title", "Weightage", "Status"])

    if not subordinates:
        return output.getvalue()

    if cycle_id is None:
        cycle = (
            db.query(models.CheckinCycle)
            .order_by(models.CheckinCycle.start_date.desc())
            .first()
        )
        cycle_id = cycle.id if cycle else None

    subordinate_ids = [sub.id for sub in subordinates]
    sub_map = {sub.id: sub.email for sub in subordinates}

    goals_query = (
        db.query(models.Goal)
        .join(models.GoalSheet, models.Goal.goal_sheet_id == models.GoalSheet.id)
        .filter(models.GoalSheet.user_id.in_(subordinate_ids))
    )
    if cycle_id is not None:
        goals_query = goals_query.filter(models.GoalSheet.cycle_id == cycle_id)

    goals = goals_query.all()

    for goal in goals:
        email = sub_map.get(goal.owner_id, "UNKNOWN")
        status = goal.goal_sheet.status if goal.goal_sheet else "UNKNOWN"
        writer.writerow([email, goal.title, goal.weightage, status])

    return output.getvalue()
