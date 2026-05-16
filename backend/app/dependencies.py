from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
# from app import models, schemas
# from app.core import security

# Database Setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")

def get_db() -> Generator:
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
): # -> models.User:
    """
    Dependency to get the current authenticated user.
    (Implementation is stubbed out. Needs JWT decoding logic).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # 1. Decode JWT token using python-jose
    # 2. Extract user ID
    # 3. Query DB for user
    # user = db.query(models.User).filter(models.User.id == token_data.sub).first()
    # if not user:
    #     raise credentials_exception
    # return user
    pass

def get_current_active_user(
    # current_user: models.User = Depends(get_current_user),
): # -> models.User:
    """Role guard checking if the user account is active."""
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    # return current_user
    pass

def require_manager_role(
    # current_user: models.User = Depends(get_current_active_user),
):
    """Role guard checking for manager privileges."""
    # if not current_user.role == "manager":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    # return current_user
    pass
