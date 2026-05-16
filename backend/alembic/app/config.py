from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Goal Management API"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/goals_db"
    
    # Security Settings
    SECRET_KEY: str = "generate_a_secure_random_string_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
