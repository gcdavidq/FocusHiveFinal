from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import Usuario
from app.services.auth_service import AuthService
from app.utils.security import verify_token

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> Usuario:
    """Obtiene el usuario autenticado a partir del token Bearer. Se usa en todos los endpoints protegidos."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or not credentials.credentials:
        raise unauthorized
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise unauthorized
    return AuthService.get_user_by_id(db, payload["user_id"])
