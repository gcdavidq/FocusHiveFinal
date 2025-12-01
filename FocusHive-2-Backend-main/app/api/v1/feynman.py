from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user import Usuario
from app.models.feynman import FeynmanWork
from app.schemas.feynman import FeynmanCreate, FeynmanUpdate, FeynmanResponse

router = APIRouter(
    prefix="/method-work/feynman",
    tags=["Método Feynman"],
)


@router.post("", response_model=FeynmanResponse, status_code=status.HTTP_201_CREATED)
def create_feynman_work(
    work_data: FeynmanCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea un nuevo trabajo Feynman para el usuario autenticado."""
    
    db_work = FeynmanWork(
        user_id=current_user.user_id,
        topic=work_data.topic,
        explanation=work_data.explanation,
        gaps_identified=work_data.gaps_identified,
        final_version=work_data.final_version,
        is_completed=False
    )
    
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work


@router.get("", response_model=List[FeynmanResponse])
def get_feynman_works(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene todos los trabajos Feynman del usuario autenticado."""
    
    works = db.query(FeynmanWork)\
        .filter(FeynmanWork.user_id == current_user.user_id)\
        .order_by(FeynmanWork.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return works


@router.get("/{feynman_id}", response_model=FeynmanResponse)
def get_feynman_work(
    feynman_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene un trabajo Feynman específico del usuario."""
    
    work = db.query(FeynmanWork)\
        .filter(
            FeynmanWork.feynman_id == feynman_id,
            FeynmanWork.user_id == current_user.user_id
        )\
        .first()
    
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo Feynman no encontrado"
        )
    
    return work


@router.put("/{feynman_id}", response_model=FeynmanResponse)
def update_feynman_work(
    feynman_id: int,
    work_data: FeynmanUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza un trabajo Feynman existente."""
    
    work = db.query(FeynmanWork)\
        .filter(
            FeynmanWork.feynman_id == feynman_id,
            FeynmanWork.user_id == current_user.user_id
        )\
        .first()
    
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo Feynman no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_dict = work_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(work, key, value)
    
    db.commit()
    db.refresh(work)
    return work


@router.delete("/{feynman_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feynman_work(
    feynman_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina un trabajo Feynman."""
    
    work = db.query(FeynmanWork)\
        .filter(
            FeynmanWork.feynman_id == feynman_id,
            FeynmanWork.user_id == current_user.user_id
        )\
        .first()
    
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo Feynman no encontrado"
        )
    
    db.delete(work)
    db.commit()
    return None