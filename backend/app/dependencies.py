from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app import models
from app.core import security

# Database Setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
MANAGER_ACCESS_ROLES = {"MANAGER", "ADMIN"}

def get_db() -> Generator:
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """Dependency to get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = security.decode_access_token(token)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = int(subject)
    except Exception:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
):
    """Role guard checking if the user account is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_manager_role(
    current_user: models.User = Depends(get_current_active_user),
):
    """Role guard checking for manager privileges."""
    role = current_user.role
    if role is None or not hasattr(role, "name"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    role_name = str(role.name).upper()
    if role_name not in MANAGER_ACCESS_ROLES:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
