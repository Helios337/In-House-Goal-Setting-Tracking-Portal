import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base
from app import dependencies, models

# Use an in-memory SQLite database for rapid, isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Provides a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def mock_user(db):
    """Creates a mock active user."""
    user = models.User(email="test@example.com", hashed_password="fakehash", is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="function")
def client(db, mock_user):
    """Provides a TestClient with overridden dependencies."""
    def override_get_db():
        yield db

    def override_get_current_active_user():
        return mock_user

    app.dependency_overrides[dependencies.get_db] = override_get_db
    app.dependency_overrides[dependencies.get_current_active_user] = override_get_current_active_user
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()
