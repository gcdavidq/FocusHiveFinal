from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.cornell import CornellNote
from app.models.user import Usuario
from app.schemas.cornell import CornellCreate, CornellResponse, CornellUpdate

router = APIRouter(prefix="/method-work/cornell", tags=["Método Cornell"])


def _get_owned(db: Session, user_id: int, note_id: int) -> CornellNote:
    note = db.query(CornellNote).filter(CornellNote.note_id == note_id, CornellNote.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota Cornell no encontrada")
    return note


@router.post("", response_model=CornellResponse, status_code=status.HTTP_201_CREATED, summary="Crear nota Cornell")
def create_note(data: CornellCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    note = CornellNote(user_id=current_user.user_id, **data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=list[CornellResponse], summary="Listar notas Cornell")
def list_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(CornellNote)
        .filter(CornellNote.user_id == current_user.user_id)
        .order_by(CornellNote.created_at.desc(), CornellNote.note_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{note_id}", response_model=CornellResponse, summary="Detalle de nota Cornell")
def get_note(note_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return _get_owned(db, current_user.user_id, note_id)


@router.put("/{note_id}", response_model=CornellResponse, summary="Actualizar nota Cornell")
def update_note(note_id: int, data: CornellUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    note = _get_owned(db, current_user.user_id, note_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar nota Cornell")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db.delete(_get_owned(db, current_user.user_id, note_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
