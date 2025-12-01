from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user import Usuario
from app.models.flashcard_session import FlashcardStudySession
from app.schemas.flashcard_session import FlashcardSessionCreate, FlashcardSessionResponse

router = APIRouter(
    prefix="/method-work/flashcard-sessions",
    tags=["Sesiones de Flashcards"],
)


@router.post("", response_model=FlashcardSessionResponse, status_code=status.HTTP_201_CREATED)
def create_flashcard_session(
    session_data: FlashcardSessionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva sesión de estudio de flashcards."""
    
    db_session = FlashcardStudySession(
        user_id=current_user.user_id,
        collection_id=session_data.collection_id,
        cards_studied=session_data.cards_studied,
        cards_easy=session_data.cards_easy,
        cards_medium=session_data.cards_medium,
        cards_hard=session_data.cards_hard,
        duration_minutes=session_data.duration_minutes,
        notes=session_data.notes
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("", response_model=List[FlashcardSessionResponse])
def get_flashcard_sessions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene todas las sesiones de estudio del usuario autenticado."""
    
    sessions = db.query(FlashcardStudySession)\
        .filter(FlashcardStudySession.user_id == current_user.user_id)\
        .order_by(FlashcardStudySession.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return sessions


@router.get("/{session_id}", response_model=FlashcardSessionResponse)
def get_flashcard_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene una sesión de estudio específica del usuario."""
    
    session = db.query(FlashcardStudySession)\
        .filter(
            FlashcardStudySession.session_id == session_id,
            FlashcardStudySession.user_id == current_user.user_id
        )\
        .first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )
    
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una sesión de estudio."""
    
    session = db.query(FlashcardStudySession)\
        .filter(
            FlashcardStudySession.session_id == session_id,
            FlashcardStudySession.user_id == current_user.user_id
        )\
        .first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )
    
    db.delete(session)
    db.commit()
    return None