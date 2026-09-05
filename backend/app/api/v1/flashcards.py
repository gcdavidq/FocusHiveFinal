from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.flashcard import CardCollection, Flashcard
from app.models.user import Usuario
from app.schemas.flashcards import (
    CollectionCreate,
    CollectionOut,
    CollectionOutWithCards,
    CollectionUpdate,
    FlashcardCreate,
    FlashcardOut,
    FlashcardStatsResponse,
    FlashcardUpdate,
)

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


def _get_owned_collection(db: Session, user_id: int, collection_id: int, with_cards: bool = False) -> CardCollection:
    query = db.query(CardCollection).filter(
        CardCollection.collection_id == collection_id, CardCollection.user_id == user_id
    )
    if with_cards:
        query = query.options(selectinload(CardCollection.flashcards))
    collection = query.first()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colección no encontrada")
    return collection


def _get_owned_card(db: Session, user_id: int, card_id: int) -> Flashcard:
    card = db.query(Flashcard).filter(Flashcard.card_id == card_id, Flashcard.card_user == user_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard no encontrada")
    return card


# Colecciones


@router.post("/collections", response_model=CollectionOut, status_code=status.HTTP_201_CREATED, summary="Crear colección")
def create_collection(data: CollectionCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    collection = CardCollection(user_id=current_user.user_id, **data.model_dump())
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


@router.get("/collections", response_model=list[CollectionOutWithCards], summary="Listar colecciones con sus tarjetas")
def list_collections(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = (
        db.query(CardCollection)
        .options(selectinload(CardCollection.flashcards))
        .filter(CardCollection.user_id == current_user.user_id)
    )
    if not include_inactive:
        query = query.filter(CardCollection.is_active.is_(True))
    return query.order_by(CardCollection.collection_id).all()


@router.get("/collections/{collection_id}", response_model=CollectionOutWithCards, summary="Colección con tarjetas")
def get_collection(collection_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return _get_owned_collection(db, current_user.user_id, collection_id, with_cards=True)


@router.put("/collections/{collection_id}", response_model=CollectionOut, summary="Actualizar colección")
def update_collection(
    collection_id: int,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    collection = _get_owned_collection(db, current_user.user_id, collection_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(collection, field, value)
    db.commit()
    db.refresh(collection)
    return collection


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar colección")
def delete_collection(collection_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    """Elimina la colección y todas sus tarjetas."""
    collection = _get_owned_collection(db, current_user.user_id, collection_id)
    db.delete(collection)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Tarjetas


@router.post(
    "/collections/{collection_id}/cards",
    response_model=FlashcardOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tarjeta en una colección",
)
def create_card(
    collection_id: int,
    data: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_owned_collection(db, current_user.user_id, collection_id)
    card = Flashcard(card_user=current_user.user_id, collection=collection_id, **data.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/cards", response_model=list[FlashcardOut], summary="Listar todas mis tarjetas")
def list_cards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(Flashcard)
        .filter(Flashcard.card_user == current_user.user_id, Flashcard.is_active.is_(True))
        .order_by(Flashcard.card_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/cards/{card_id}", response_model=FlashcardOut, summary="Detalle de tarjeta")
def get_card(card_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return _get_owned_card(db, current_user.user_id, card_id)


@router.put("/cards/{card_id}", response_model=FlashcardOut, summary="Actualizar tarjeta")
def update_card(
    card_id: int, data: FlashcardUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    card = _get_owned_card(db, current_user.user_id, card_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar tarjeta")
def delete_card(card_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    card = _get_owned_card(db, current_user.user_id, card_id)
    db.delete(card)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/stats", response_model=FlashcardStatsResponse, summary="Totales de colecciones y tarjetas")
def get_stats(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    total_collections = (
        db.query(CardCollection)
        .filter(CardCollection.user_id == current_user.user_id, CardCollection.is_active.is_(True))
        .count()
    )
    total_cards = (
        db.query(Flashcard).filter(Flashcard.card_user == current_user.user_id, Flashcard.is_active.is_(True)).count()
    )
    return {"total_collections": total_collections, "total_cards": total_cards}
