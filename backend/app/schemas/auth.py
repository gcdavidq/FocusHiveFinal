from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.utils.validators import validate_password_strength, validate_username_format


class RegisterSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=45, examples=["ana_estudia"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    confirm_password: str

    @field_validator("username")
    @classmethod
    def _username(cls, value: str) -> str:
        return validate_username_format(value)

    @field_validator("password")
    @classmethod
    def _password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def _passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


class LoginSchema(BaseModel):
    username: str = Field(..., min_length=3, description="Nombre de usuario o correo electrónico")
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str
    is_premium: bool
    level: int
    total_studied_time: int
    diagnostic_completed: bool


class RegisterResponse(BaseModel):
    message: str
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse
