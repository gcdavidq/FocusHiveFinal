from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.utils.validators import validate_password_strength, validate_username_format


class UserUpdateSchema(BaseModel):
    """Actualización parcial del perfil: solo se aplican los campos enviados."""

    username: str | None = Field(None, min_length=3, max_length=45)
    email: EmailStr | None = None
    full_name: str | None = Field(None, max_length=100)
    bio: str | None = Field(None, max_length=500)
    avatar_url: str | None = Field(None, max_length=255)

    @field_validator("username")
    @classmethod
    def _username(cls, value: str | None) -> str | None:
        return validate_username_format(value) if value is not None else value


class ChangePasswordSchema(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=72)
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def _password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def _passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


class UserDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    is_premium: bool
    level: int
    total_studied_time: int
    diagnostic_completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserSummaryResponse(BaseModel):
    """Vista pública de un usuario (sin correo)."""

    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    level: int


class UserStatsResponse(BaseModel):
    user_id: int
    username: str
    level: int
    total_studied_time: int
    total_hours: float
    is_premium: bool
    member_since: str | None


class UserActionResponse(BaseModel):
    message: str
    user: UserDetailResponse
