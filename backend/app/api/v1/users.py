from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import Usuario
from app.schemas.user import (
    ChangePasswordSchema,
    UserActionResponse,
    UserDetailResponse,
    UserStatsResponse,
    UserSummaryResponse,
    UserUpdateSchema,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/me", response_model=UserDetailResponse, summary="Perfil propio")
def get_my_profile(current_user: Usuario = Depends(get_current_user)):
    return UserDetailResponse.model_validate(current_user)


@router.get("/me/stats", response_model=UserStatsResponse, summary="Estadísticas propias")
def get_my_statistics(current_user: Usuario = Depends(get_current_user)):
    return UserService.get_user_statistics(current_user)


@router.put("/me", response_model=UserActionResponse, summary="Actualizar perfil")
def update_my_profile(
    update_data: UserUpdateSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza solo los campos enviados: username, email, full_name, bio y avatar_url."""
    user = UserService.update_user_profile(db, current_user, update_data)
    return UserActionResponse(message="Perfil actualizado exitosamente", user=UserDetailResponse.model_validate(user))


@router.patch("/me/password", response_model=UserActionResponse, summary="Cambiar contraseña")
def change_my_password(
    password_data: ChangePasswordSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService.change_password(db, current_user, password_data)
    return UserActionResponse(message="Contraseña cambiada exitosamente", user=UserDetailResponse.model_validate(user))


@router.delete("/me", summary="Eliminar cuenta propia")
def delete_my_account(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """Elimina la cuenta y todos sus datos (sesiones, flashcards, notas, calendario). Irreversible."""
    username = current_user.username
    UserService.delete_user(db, current_user)
    return {"message": f"Cuenta de {username} eliminada exitosamente"}


@router.get("/{user_id}", response_model=UserSummaryResponse, summary="Perfil público por ID")
def get_user_by_id(user_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return UserSummaryResponse.model_validate(UserService.get_user_by_id(db, user_id))


@router.get("/username/{username}", response_model=UserSummaryResponse, summary="Perfil público por username")
def get_user_by_username(username: str, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return UserSummaryResponse.model_validate(UserService.get_user_by_username(db, username))
