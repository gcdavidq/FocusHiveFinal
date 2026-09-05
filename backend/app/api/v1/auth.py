from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import Usuario
from app.schemas.auth import LoginSchema, RegisterResponse, RegisterSchema, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED, summary="Registrar usuario")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    """Crea una cuenta. El username admite letras, números y guion bajo; la contraseña exige mayúscula, minúscula y número."""
    user = AuthService.register(db, data)
    return RegisterResponse(message="Usuario registrado exitosamente", user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    """Autentica por username o correo y devuelve un JWT para el header `Authorization: Bearer <token>`."""
    result = AuthService.login(db, data)
    return TokenResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        expires_in_minutes=result["expires_in_minutes"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.get("/me", response_model=UserResponse, summary="Usuario actual")
def get_me(current_user: Usuario = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout", summary="Cerrar sesión")
def logout(current_user: Usuario = Depends(get_current_user)):
    """El JWT es stateless: el cliente debe descartar el token. Este endpoint solo confirma que era válido."""
    return {"message": f"Sesión cerrada para {current_user.username}", "detail": "Elimina el token del cliente"}
