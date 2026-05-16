from sqlalchemy.orm import Session
from sqlalchemy import func
import io
import csv
from app import models

def generate_completion_stats(db: Session, cycle_id: int):
    """Calculates overall company progress for a specific cycle."""
    # This is a simplified aggregate query. In a real app, this joins 
    # Achievements to Goals to GoalSheets filtered by Cycle.
    avg_progress = db.query(func.avg(models.QuarterlyAchievement.progress_percentage))\
                     .join(models.Goal)\
                     .join(models.GoalSheet)\
                     .filter(models.GoalSheet.cycle_id == cycle_id)\
                     .scalar()
                     
    total_sheets = db.query(models.GoalSheet).filter(models.GoalSheet.cycle_id == cycle_id).count()
    approved_sheets = db.query(models.GoalSheet).filter(models.GoalSheet.cycle_id == cycle_id, models.GoalSheet.status == "APPROVED").count()
    
    return {
        "average_progress": float(avg_progress or 0.0),
        "total_sheets": total_sheets,
        "completion_rate": (approved_sheets / total_sheets * 100) if total_sheets else 0
    }

def build_csv_report(db: Session, manager_id: int) -> str:
    """Generates a CSV string of all subordinate goals and progress."""
    # 1. Fetch data (simplified for brevity)
    subordinates = db.query(models.User).join(models.OrgHierarchy, models.User.id == models.OrgHierarchy.employee_id)\
                     .filter(models.OrgHierarchy.manager_id == manager_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee Email", "Goal Title", "Weightage", "Status"])
    
    for sub in subordinates:
        for goal in sub.goals:
            writer.writerow([sub.email, goal.title, goal.weightage, goal.goal_sheet.status])
            
    return output.getvalue()
