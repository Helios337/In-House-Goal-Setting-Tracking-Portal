from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, dependencies
from app.core import security
from app.core.database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.UserOut)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    _current_admin=Depends(dependencies.require_admin_role),
):
    """Create a new user (Admin)."""
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        is_active=True,
        role_id=user_in.role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=List[schemas.UserOut])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(dependencies.require_admin_role),
):
    """Retrieve all users."""
    return db.query(models.User).offset(skip).limit(limit).all()
