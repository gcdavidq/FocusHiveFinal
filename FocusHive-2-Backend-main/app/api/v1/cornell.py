from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user import Usuario
from app.models.cornell import CornellNote
from app.schemas.cornell import CornellCreate, CornellUpdate, CornellResponse

router = APIRouter(
    prefix="/method-work/cornell",
    tags=["Método Cornell"],
)


@router.post("", response_model=CornellResponse, status_code=status.HTTP_201_CREATED)
def create_cornell_note(
    note_data: CornellCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva nota Cornell para el usuario autenticado."""
    
    db_note = CornellNote(
        user_id=current_user.user_id,
        title=note_data.title,
        subject=note_data.subject,
        notes_section=note_data.notes_section,
        cues_section=note_data.cues_section,
        summary_section=note_data.summary_section
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("", response_model=List[CornellResponse])
def get_cornell_notes(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene todas las notas Cornell del usuario autenticado."""
    
    notes = db.query(CornellNote)\
        .filter(CornellNote.user_id == current_user.user_id)\
        .order_by(CornellNote.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return notes


@router.get("/{note_id}", response_model=CornellResponse)
def get_cornell_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene una nota Cornell específica del usuario."""
    
    note = db.query(CornellNote)\
        .filter(
            CornellNote.note_id == note_id,
            CornellNote.user_id == current_user.user_id
        )\
        .first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota Cornell no encontrada"
        )
    
    return note


@router.put("/{note_id}", response_model=CornellResponse)
def update_cornell_note(
    note_id: int,
    note_data: CornellUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza una nota Cornell existente."""
    
    note = db.query(CornellNote)\
        .filter(
            CornellNote.note_id == note_id,
            CornellNote.user_id == current_user.user_id
        )\
        .first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota Cornell no encontrada"
        )
    
    # Actualizar solo los campos proporcionados
    update_dict = note_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(note, key, value)
    
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cornell_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una nota Cornell."""
    
    note = db.query(CornellNote)\
        .filter(
            CornellNote.note_id == note_id,
            CornellNote.user_id == current_user.user_id
        )\
        .first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota Cornell no encontrada"
        )
    
    db.delete(note)
    db.commit()
    return None