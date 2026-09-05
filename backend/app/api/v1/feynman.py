from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.feynman import FeynmanWork
from app.models.user import Usuario
from app.schemas.feynman import FeynmanCreate, FeynmanResponse, FeynmanUpdate

router = APIRouter(prefix="/method-work/feynman", tags=["Método Feynman"])


def _get_owned(db: Session, user_id: int, feynman_id: int) -> FeynmanWork:
    work = db.query(FeynmanWork).filter(FeynmanWork.feynman_id == feynman_id, FeynmanWork.user_id == user_id).first()
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabajo Feynman no encontrado")
    return work


@router.post("", response_model=FeynmanResponse, status_code=status.HTTP_201_CREATED, summary="Crear trabajo Feynman")
def create_work(data: FeynmanCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    work = FeynmanWork(user_id=current_user.user_id, **data.model_dump())
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


@router.get("", response_model=list[FeynmanResponse], summary="Listar trabajos Feynman")
def list_works(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(FeynmanWork)
        .filter(FeynmanWork.user_id == current_user.user_id)
        .order_by(FeynmanWork.created_at.desc(), FeynmanWork.feynman_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{feynman_id}", response_model=FeynmanResponse, summary="Detalle de trabajo Feynman")
def get_work(feynman_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return _get_owned(db, current_user.user_id, feynman_id)


@router.put("/{feynman_id}", response_model=FeynmanResponse, summary="Actualizar trabajo Feynman")
def update_work(
    feynman_id: int, data: FeynmanUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    work = _get_owned(db, current_user.user_id, feynman_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(work, field, value)
    db.commit()
    db.refresh(work)
    return work


@router.delete("/{feynman_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar trabajo Feynman")
def delete_work(feynman_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db.delete(_get_owned(db, current_user.user_id, feynman_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
