import re

from pydantic import BaseModel, EmailStr, field_validator


class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator('email')
    @classmethod
    def validate_gmail(cls, v: str):
        if not v.lower().endswith('@gmail.com'):
            raise ValueError('Only @gmail.com addresses are allowed')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str):
        if len(v) < 8 or len(v) > 12:
            raise ValueError('Password must be between 8 and 12 characters')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    username: str
    password: str
