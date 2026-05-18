from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas, dependencies
from app.core.database import get_db
from app.services import cycle_service, report_service
import io

router = APIRouter()


@router.get("/dashboard", response_model=schemas.DashboardOut)
def get_completion_dashboard(
    cycle_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    """Return aggregated stats and achievement data for the dashboard."""
    if cycle_id is None:
        try:
            cycle = cycle_service.get_active_cycle(db)
            cycle_id = cycle.id
        except Exception:
            cycle = (
                db.query(models.CheckinCycle)
                .order_by(models.CheckinCycle.start_date.desc())
                .first()
            )
            cycle_id = cycle.id if cycle else None

    total_users = db.query(models.User).count()
    active_cycles = (
        db.query(models.CheckinCycle)
        .filter(models.CheckinCycle.end_date >= models.CheckinCycle.start_date)
        .count()
    )

    stats = (
        report_service.generate_completion_stats(db, cycle_id=cycle_id)
        if cycle_id
        else {
            "average_progress": 0.0,
            "total_sheets": 0,
            "completion_rate": 0.0,
            "team_completion": [],
        }
    )

    report_rows = []
    if cycle_id:
        achievements = (
            db.query(models.QuarterlyAchievement)
            .join(models.Goal)
            .join(models.GoalSheet)
            .filter(models.GoalSheet.cycle_id == cycle_id)
            .all()
        )
        for achievement in achievements:
            goal = achievement.goal
            owner = db.query(models.User).filter(models.User.id == goal.owner_id).first()
            report_rows.append(
                schemas.AchievementReportRow(
                    user_id=goal.owner_id,
                    user_email=owner.email if owner else "unknown",
                    goal_id=goal.id,
                    goal_title=goal.title,
                    quarter=achievement.quarter,
                    progress=achievement.progress_percentage,
                )
            )

    return schemas.DashboardOut(
        total_users=total_users,
        active_cycles=active_cycles,
        company_average_progress=stats["average_progress"],
        reports=report_rows,
        team_completion=stats.get("team_completion", []),
    )


@router.get("/export")
def export_csv_report(
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    """Generate and download a CSV report of subordinate goal progress."""
    csv_content = report_service.build_csv_report(db, current_manager.id)
    response = StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
    )
    response.headers["Content-Disposition"] = "attachment; filename=report.csv"
    return response
