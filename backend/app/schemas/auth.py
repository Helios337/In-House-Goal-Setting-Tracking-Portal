from typing import Optional

from pydantic import BaseModel, EmailStr


class SSOLoginRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role_name: Optional[str] = "EMPLOYEE"
    id_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: Optional[str] = None
    email: Optional[str] = None
