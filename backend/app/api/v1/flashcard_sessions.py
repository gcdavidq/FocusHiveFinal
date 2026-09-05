from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.flashcard_session import FlashcardStudySession
from app.models.user import Usuario
from app.schemas.flashcard_session import FlashcardSessionCreate, FlashcardSessionResponse

router = APIRouter(prefix="/method-work/flashcard-sessions", tags=["Sesiones de flashcards"])


def _get_owned(db: Session, user_id: int, session_id: int) -> FlashcardStudySession:
    session = (
        db.query(FlashcardStudySession)
        .filter(FlashcardStudySession.session_id == session_id, FlashcardStudySession.user_id == user_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")
    return session


@router.post("", response_model=FlashcardSessionResponse, status_code=status.HTTP_201_CREATED, summary="Guardar resultado de repaso")
def create_session(data: FlashcardSessionCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    session = FlashcardStudySession(user_id=current_user.user_id, **data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[FlashcardSessionResponse], summary="Listar repasos")
def list_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(FlashcardStudySession)
        .filter(FlashcardStudySession.user_id == current_user.user_id)
        .order_by(FlashcardStudySession.created_at.desc(), FlashcardStudySession.session_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{session_id}", response_model=FlashcardSessionResponse, summary="Detalle de repaso")
def get_session(session_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return _get_owned(db, current_user.user_id, session_id)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar repaso")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db.delete(_get_owned(db, current_user.user_id, session_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
