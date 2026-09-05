from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import Usuario
from app.schemas.user import ChangePasswordSchema, UserUpdateSchema
from app.utils.security import hash_password, verify_password
from app.utils.validators import UserValidator


class UserService:
    """Operaciones sobre el perfil de usuario."""

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Usuario:
        user = db.get(Usuario, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Usuario:
        user = db.query(Usuario).filter(Usuario.username == username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return user

    @staticmethod
    def update_user_profile(db: Session, user: Usuario, update_data: UserUpdateSchema) -> Usuario:
        """Aplica solo los campos enviados, validando unicidad de username y correo."""
        changes = update_data.model_dump(exclude_unset=True, exclude_none=True)
        if not changes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se proporcionaron campos para actualizar")

        if "username" in changes:
            UserValidator.validate_username_available(db, changes["username"], exclude_user_id=user.user_id)
        if "email" in changes:
            UserValidator.validate_email_available(db, changes["email"], exclude_user_id=user.user_id)
        if "avatar_url" in changes:
            UserValidator.validate_avatar_url(changes["avatar_url"])

        for field, value in changes.items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def change_password(db: Session, user: Usuario, data: ChangePasswordSchema) -> Usuario:
        if not verify_password(data.current_password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La contraseña actual es incorrecta")
        if data.current_password == data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="La nueva contraseña debe ser diferente a la actual"
            )
        user.password_hash = hash_password(data.new_password)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user: Usuario) -> None:
        """Elimina la cuenta y, por cascada, todos sus datos."""
        db.delete(user)
        db.commit()

    @staticmethod
    def get_user_statistics(user: Usuario) -> dict:
        return {
            "user_id": user.user_id,
            "username": user.username,
            "level": user.level,
            "total_studied_time": user.total_studied_time,
            "total_hours": round(user.total_studied_time / 60, 2),
            "is_premium": user.is_premium,
            "member_since": user.created_at.strftime("%Y-%m-%d") if user.created_at else None,
        }
