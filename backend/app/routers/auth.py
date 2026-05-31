from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.config import settings
from app.core import security
from app.core.database import get_db
from app.core.entra_id import entra_client
from app.schemas.auth import SSOLoginRequest, TokenResponse

router = APIRouter()


def _get_or_create_role(db: Session, role_name: str) -> models.Role:
    normalized = role_name.upper()
    if normalized not in ("EMPLOYEE", "MANAGER", "ADMIN"):
        normalized = "EMPLOYEE"
    role = db.query(models.Role).filter(models.Role.name == normalized).first()
    if not role:
        role = models.Role(name=normalized, description=f"{normalized} role")
        db.add(role)
        db.commit()
        db.refresh(role)
    return role


def _resolve_role_from_token_claims(claims: dict, fallback: str) -> str:
    roles = claims.get("roles") or []
    if isinstance(roles, list):
        for role in roles:
            upper = str(role).upper()
            if upper in ("ADMIN", "MANAGER", "EMPLOYEE"):
                return upper
    return fallback.upper()


def _issue_token(user: models.User) -> TokenResponse:
    role_name = user.role.name if user.role else "EMPLOYEE"
    token = security.create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=role_name,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .options(joinedload(models.User.role))
        .filter(models.User.email == form_data.username)
        .first()
    )
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return _issue_token(user)


@router.post("/sso", response_model=TokenResponse)
async def sso_login(body: SSOLoginRequest, db: Session = Depends(get_db)):
    """Exchange Entra profile for a backend JWT (integer user id in sub)."""
    email = body.email
    role_name = "EMPLOYEE"
    verified_by_token = False

    if body.id_token:
        try:
            claims = entra_client.verify_sso_token(body.id_token)
            email = claims.get("email") or claims.get("preferred_username") or email
            role_name = _resolve_role_from_token_claims(claims, "EMPLOYEE")
            verified_by_token = True
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Entra ID token",
            ) from None
    elif not settings.ALLOW_INSECURE_SSO:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="id_token required. Set ALLOW_INSECURE_SSO=true for local demo only.",
        )
    else:
        # Demo-only path: never trust arbitrary role escalation in production
        role_name = (body.role_name or "EMPLOYEE").upper()

    user = (
        db.query(models.User)
        .options(joinedload(models.User.role))
        .filter(models.User.email == email)
        .first()
    )

    if not user:
        role = _get_or_create_role(db, role_name)
        user = models.User(
            email=email,
            hashed_password=security.get_password_hash("sso-placeholder"),
            is_active=True,
            role_id=role.id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif verified_by_token:
        # Only mutate roles when the identity provider attests to them
        role = _get_or_create_role(db, role_name)
        user.role_id = role.id
        db.commit()
        db.refresh(user)

    return _issue_token(user)


@router.post("/refresh")
async def refresh_token():
    return {"message": "Use /login or /sso to obtain a new token"}
