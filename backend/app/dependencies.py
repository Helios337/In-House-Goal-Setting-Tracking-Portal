from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session, joinedload

from app import models
from app.config import settings
from app.core import security
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
MANAGER_ACCESS_ROLES = {"MANAGER", "ADMIN"}
ADMIN_ACCESS_ROLES = {"ADMIN"}


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
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
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = (
        db.query(models.User)
        .options(joinedload(models.User.role))
        .filter(models.User.id == user_id)
        .first()
    )
    if not user:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def _role_name(user: models.User) -> str:
    if user.role is None or not hasattr(user.role, "name"):
        return ""
    return str(user.role.name).upper()


def require_manager_role(
    current_user: models.User = Depends(get_current_active_user),
):
    if _role_name(current_user) not in MANAGER_ACCESS_ROLES:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user


def require_admin_role(
    current_user: models.User = Depends(get_current_active_user),
):
    if _role_name(current_user) not in ADMIN_ACCESS_ROLES:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
