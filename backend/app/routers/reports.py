from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app import schemas, dependencies
import io
import csv

router = APIRouter()

@router.get("/dashboard", response_model=schemas.DashboardOut)
def get_completion_dashboard(
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Return aggregated stats and achievement data for the dashboard."""
    pass

@router.get("/export")
def export_csv_report(
    db: Session = Depends(dependencies.get_db),
    current_manager = Depends(dependencies.require_manager_role)
):
    """Generate and download a CSV report of subordinate goal progress."""
    # Example CSV streaming logic
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(["User", "Goal", "Quarter", "Progress"])
    writer.writerow(["user@example.com", "Increase Sales", "Q1", "75%"])
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=report.csv"
    return response
