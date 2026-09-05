from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.method import Metodo
from app.schemas.methods import MethodResponse

router = APIRouter(prefix="/methods", tags=["Métodos de estudio"])


@router.get("", response_model=list[MethodResponse], summary="Listar métodos de estudio")
def list_methods(db: Session = Depends(get_db)):
    """Catálogo público de métodos (pomodoro, feynman, cornell, flashcards)."""
    return db.query(Metodo).order_by(Metodo.metodo_id).all()
