from pathlib import Path
from typing import List, Optional
from urllib.parse import quote_plus

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_ROOT.parent
_INSECURE_SECRET_MARKERS = {
    "generate_a_secure_random_string_here",
    "local-dev-secret-change-in-production",
    "ci-build-secret",
}


class Settings(BaseSettings):
    """Application settings. Defaults below are for tests/local-dev only;
    real values (passwords, secrets, etc.) MUST be supplied via .env."""

    PROJECT_NAME: str = "Goal Management API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Postgres (used to build DATABASE_URL when not set explicitly)
    POSTGRES_USER: str = "goal_user"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "goal_portal"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: Optional[str] = None
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "generate_a_secure_random_string_here"
    JWT_SECRET: Optional[str] = None

    @model_validator(mode="after")
    def apply_jwt_secret(self):
        if self.JWT_SECRET:
            self.SECRET_KEY = self.JWT_SECRET
        return self

    @model_validator(mode="after")
    def validate_production_secrets(self):
        env = self.ENVIRONMENT.lower()
        if env in ("production", "prod", "staging"):
            if self.SECRET_KEY in _INSECURE_SECRET_MARKERS or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "SECRET_KEY/JWT_SECRET must be a strong random value (≥32 chars) in production"
                )
            if self.ALLOW_INSECURE_SSO:
                raise ValueError("ALLOW_INSECURE_SSO must be false in production")
        return self

    @model_validator(mode="after")
    def assemble_database_url(self):
        if not self.DATABASE_URL:
            password = quote_plus(self.POSTGRES_PASSWORD)
            user = quote_plus(self.POSTGRES_USER)
            self.DATABASE_URL = (
                f"postgresql://{user}:{password}"
                f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4000",
        "http://localhost:8000",
    ]

    ENTRA_CLIENT_ID: Optional[str] = None
    ENTRA_TENANT_ID: Optional[str] = None
    ENTRA_CLIENT_SECRET: Optional[str] = None
    ALLOW_INSECURE_SSO: bool = False

    EMAIL_PROVIDER: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    EMAIL_FROM: str = "noreply@goalportal.local"

    TEAMS_WEBHOOK_URL: Optional[str] = None

    ESCALATION_SHEET_HOURS: int = 48
    ESCALATION_CHECKIN_HOURS: int = 72

    model_config = SettingsConfigDict(
        env_file=(
            _PROJECT_ROOT / ".env",
            _BACKEND_ROOT / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
