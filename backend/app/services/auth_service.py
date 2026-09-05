from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import Usuario
from app.schemas.auth import LoginSchema, RegisterSchema
from app.utils.security import create_access_token, hash_password, verify_password
from app.utils.validators import UserValidator

settings = get_settings()

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciales incorrectas",
    headers={"WWW-Authenticate": "Bearer"},
)


class AuthService:
    @staticmethod
    def register(db: Session, data: RegisterSchema) -> Usuario:
        """Crea una cuenta nueva con la contraseña hasheada."""
        UserValidator.validate_username_available(db, data.username)
        UserValidator.validate_email_available(db, data.email)

        user = Usuario(username=data.username, email=data.email, password_hash=hash_password(data.password))
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, data: LoginSchema) -> dict:
        """Autentica por username o correo y devuelve un JWT."""
        identifier = data.username.strip()
        query = db.query(Usuario)
        if "@" in identifier:
            user = query.filter(Usuario.email == identifier).first()
        else:
            user = query.filter(Usuario.username == identifier).first()

        if not user or not verify_password(data.password, user.password_hash):
            raise _CREDENTIALS_ERROR

        token = create_access_token({"user_id": user.user_id, "username": user.username})
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "user": user,
        }

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Usuario:
        user = db.get(Usuario, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
        return user
