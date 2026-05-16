from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: Optional[int] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    role_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class TokenPayload(BaseModel):
    sub: Optional[int] = None
