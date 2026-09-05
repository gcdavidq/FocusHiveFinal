import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import Usuario

USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]+$")
HEX_COLOR_RE = re.compile(r"^[0-9A-Fa-f]{6}$")
IMAGE_URL_RE = re.compile(r"^https?://[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$", re.IGNORECASE)


def validate_username_format(value: str) -> str:
    if not USERNAME_RE.match(value):
        raise ValueError("El username solo puede contener letras, números y guiones bajos")
    return value


def validate_password_strength(value: str) -> str:
    """Política de contraseñas: mínimo 8 caracteres, mayúscula, minúscula y número."""
    if len(value) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", value):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula")
    if not re.search(r"[a-z]", value):
        raise ValueError("La contraseña debe contener al menos una letra minúscula")
    if not re.search(r"[0-9]", value):
        raise ValueError("La contraseña debe contener al menos un número")
    return value


def validate_hex_color(value: str) -> str:
    value = value.lstrip("#").upper()
    if not HEX_COLOR_RE.match(value):
        raise ValueError("El color debe ser un HEX de 6 caracteres, por ejemplo 3B82F6")
    return value


class UserValidator:
    """Validaciones que requieren consultar la base de datos."""

    @staticmethod
    def validate_username_available(db: Session, username: str, exclude_user_id: int | None = None) -> None:
        query = db.query(Usuario).filter(Usuario.username == username)
        if exclude_user_id:
            query = query.filter(Usuario.user_id != exclude_user_id)
        if query.first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El username ya está en uso")

    @staticmethod
    def validate_email_available(db: Session, email: str, exclude_user_id: int | None = None) -> None:
        query = db.query(Usuario).filter(Usuario.email == email)
        if exclude_user_id:
            query = query.filter(Usuario.user_id != exclude_user_id)
        if query.first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya ha sido registrado")

    @staticmethod
    def validate_avatar_url(url: str | None) -> None:
        if url and not IMAGE_URL_RE.match(url):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La URL del avatar debe ser http(s) y apuntar a una imagen (.jpg, .jpeg, .png, .gif, .webp, .svg)",
            )
