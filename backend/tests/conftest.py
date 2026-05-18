import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base
from app import dependencies, models
from app.core.database import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def active_cycle(db):
    now = datetime.now(timezone.utc)
    cycle = models.CheckinCycle(
        name="Test Cycle",
        start_date=now - timedelta(days=30),
        end_date=now + timedelta(days=335),
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    for phase_name in ("Goal Setting", "Quarterly Check-in"):
        db.add(
            models.PhaseWindow(
                cycle_id=cycle.id,
                name=phase_name,
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=335),
            )
        )
    db.commit()
    return cycle


@pytest.fixture(scope="function")
def mock_user(db):
    user = models.User(email="test@example.com", hashed_password="fakehash", is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def draft_sheet(db, mock_user, active_cycle):
    sheet = models.GoalSheet(
        user_id=mock_user.id, cycle_id=active_cycle.id, status="DRAFT"
    )
    db.add(sheet)
    db.commit()
    db.refresh(sheet)
    return sheet


@pytest.fixture(scope="function")
def client(db, mock_user):
    def override_get_db():
        yield db

    def override_get_current_active_user():
        return mock_user

    def override_require_manager_role():
        return mock_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[dependencies.get_current_active_user] = override_get_current_active_user
    app.dependency_overrides[dependencies.require_manager_role] = override_require_manager_role

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
