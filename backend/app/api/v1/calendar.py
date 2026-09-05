from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.calendar_block import CalendarBlock
from app.models.user import Usuario
from app.schemas.calendar import CalendarBlockCreate, CalendarBlockResponse, CalendarBlockUpdate

router = APIRouter(prefix="/calendar", tags=["Calendario"])


def _get_owned(db: Session, user_id: int, block_id: int) -> CalendarBlock:
    block = db.query(CalendarBlock).filter(CalendarBlock.block_id == block_id, CalendarBlock.user_id == user_id).first()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bloque no encontrado")
    return block


@router.get("/blocks", response_model=list[CalendarBlockResponse], summary="Listar bloques de estudio")
def list_blocks(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return (
        db.query(CalendarBlock)
        .filter(CalendarBlock.user_id == current_user.user_id)
        .order_by(CalendarBlock.day_of_week, CalendarBlock.start_time)
        .all()
    )


@router.post("/blocks", response_model=CalendarBlockResponse, status_code=status.HTTP_201_CREATED, summary="Crear bloque")
def create_block(data: CalendarBlockCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    block = CalendarBlock(user_id=current_user.user_id, **data.model_dump())
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.put("/blocks/{block_id}", response_model=CalendarBlockResponse, summary="Actualizar bloque")
def update_block(
    block_id: int, data: CalendarBlockUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    block = _get_owned(db, current_user.user_id, block_id)
    changes = data.model_dump(exclude_unset=True)
    new_start = changes.get("start_time", block.start_time)
    new_end = changes.get("end_time", block.end_time)
    if new_end <= new_start:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La hora de fin debe ser posterior a la de inicio")
    for field, value in changes.items():
        setattr(block, field, value)
    db.commit()
    db.refresh(block)
    return block


@router.delete("/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar bloque")
def delete_block(block_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db.delete(_get_owned(db, current_user.user_id, block_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/blocks", status_code=status.HTTP_204_NO_CONTENT, summary="Vaciar calendario")
def clear_blocks(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db.query(CalendarBlock).filter(CalendarBlock.user_id == current_user.user_id).delete()
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
