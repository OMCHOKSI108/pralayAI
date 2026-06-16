import json

from pydantic import BaseModel, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def username_min_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    preferred_language: str = "english"
    answer_style: str = "{}"
    thinking_level: str = "medium"
    theme: str = "dark"

    model_config = {"from_attributes": True}

    @property
    def answer_style_dict(self) -> dict:
        try:
            return json.loads(self.answer_style) if isinstance(self.answer_style, str) else {}
        except (json.JSONDecodeError, TypeError):
            return {}


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    username: str
    preferred_language: str = "english"
    answer_style: str = "{}"
    thinking_level: str = "medium"
    theme: str = "dark"

    @field_validator("username")
    @classmethod
    def username_min_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v.strip()

    @field_validator("thinking_level")
    @classmethod
    def validate_thinking(cls, v: str) -> str:
        if v not in ("low", "medium", "high"):
            raise ValueError("thinking_level must be low, medium, or high")
        return v

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        allowed = {"english", "hindi", "gujarati", "hinglish", "auto-detect"}
        if v.lower() not in allowed:
            raise ValueError(f"Language must be one of: {', '.join(sorted(allowed))}")
        return v.lower()

    @field_validator("theme")
    @classmethod
    def validate_theme(cls, v: str) -> str:
        if v not in ("dark", "light"):
            raise ValueError("theme must be dark or light")
        return v


class ChangePasswordRequest(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetVerify(BaseModel):
    email: str
    otp: str


class PasswordResetConfirm(BaseModel):
    email: str
    otp: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class PasswordResetStatus(BaseModel):
    status: str
    message: str = ""
