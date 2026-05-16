from sqlalchemy.orm import Session
from app import models, schemas
from app.services.auth_service import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in: schemas.UserCreate):
    db_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role_id=user_in.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
