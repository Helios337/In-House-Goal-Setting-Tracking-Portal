"""Seed demo data for local development. Run: python -m scripts.seed"""
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.core import security
from app import models


def seed():
    db = SessionLocal()
    try:
        for name in ("EMPLOYEE", "MANAGER", "ADMIN"):
            if not db.query(models.Role).filter(models.Role.name == name).first():
                db.add(models.Role(name=name, description=f"{name} role"))

        db.commit()

        def role_id(name: str) -> int:
            return db.query(models.Role).filter(models.Role.name == name).one().id

        users_spec = [
            ("employee@demo.example.com", "EMPLOYEE"),
            ("manager@demo.example.com", "MANAGER"),
            ("admin@demo.example.com", "ADMIN"),
        ]
        created_users = {}
        for email, role in users_spec:
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                user = models.User(
                    email=email,
                    hashed_password=security.get_password_hash("demo123"),
                    is_active=True,
                    role_id=role_id(role),
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            created_users[role] = user

        employee = created_users["EMPLOYEE"]
        manager = created_users["MANAGER"]

        if (
            not db.query(models.OrgHierarchy)
            .filter(
                models.OrgHierarchy.manager_id == manager.id,
                models.OrgHierarchy.employee_id == employee.id,
            )
            .first()
        ):
            db.add(
                models.OrgHierarchy(manager_id=manager.id, employee_id=employee.id)
            )

        now = datetime.now(timezone.utc)
        cycle = db.query(models.CheckinCycle).filter(models.CheckinCycle.name == "FY 2026").first()
        if not cycle:
            cycle = models.CheckinCycle(
                name="FY 2026",
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=335),
            )
            db.add(cycle)
            db.commit()
            db.refresh(cycle)

        for phase_name, start_offset, end_offset in (
            ("Goal Setting", -30, 60),
            ("Quarterly Check-in", -30, 335),
        ):
            existing_phase = (
                db.query(models.PhaseWindow)
                .filter_by(cycle_id=cycle.id, name=phase_name)
                .first()
            )
            if not existing_phase:
                db.add(
                    models.PhaseWindow(
                        cycle_id=cycle.id,
                        name=phase_name,
                        start_date=now + timedelta(days=start_offset),
                        end_date=now + timedelta(days=end_offset),
                    )
                )

        for area in ("Sales Revenue", "Operational TAT", "Safety Compliance"):
            if not db.query(models.ThrustArea).filter(models.ThrustArea.name == area).first():
                db.add(models.ThrustArea(name=area))

        db.commit()
        print("Seed complete: employee@demo.example.com / manager@demo.example.com / admin@demo.example.com (password: demo123)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
