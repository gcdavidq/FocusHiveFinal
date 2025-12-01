from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user import Usuario
from app.models.pydantic_models import (
    CollectionCreate, CollectionOut, CollectionOutWithCards,
    FlashcardCreate, FlashcardOut, FlashcardBase
)
from app.models.orm_models import CardCollection, Flashcard

router = APIRouter(
    prefix="/flashcards",
    tags=["Flashcards y Colecciones"],
)

# =============================================
# ENDPOINTS PARA COLECCIONES (POR USUARIO)
# =============================================

@router.post("/collections", response_model=CollectionOut, status_code=status.HTTP_201_CREATED)
def create_collection(
    collection_data: CollectionCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Crea una nueva colección de flashcards para el usuario autenticado.
    """
    db_collection = CardCollection(
        user_id=current_user.user_id,  # ✅ NUEVO: Asociar al usuario
        collection_name=collection_data.collection_name,
        collection_color=collection_data.collection_color,
        is_active=collection_data.is_active
    )
    
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection


@router.get("/collections", response_model=List[CollectionOut])
def get_user_collections(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Obtiene todas las colecciones del usuario autenticado (sin tarjetas).
    """
    collections = db.query(CardCollection).filter(
        CardCollection.user_id == current_user.user_id,  # ✅ NUEVO: Filtrar por usuario
        CardCollection.is_active == True
    ).all()
    return collections


@router.get("/collections/{collection_id}", response_model=CollectionOutWithCards)
def get_collection_with_cards(
    collection_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Obtiene una colección específica del usuario con todas sus tarjetas.
    """
    collection = db.query(CardCollection).filter(
        CardCollection.collection_id == collection_id,
        CardCollection.user_id == current_user.user_id  # ✅ NUEVO: Verificar propiedad
    ).first()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Colección no encontrada o no tienes acceso"
        )
    return collection


@router.put("/collections/{collection_id}", response_model=CollectionOut)
def update_collection(
    collection_id: int,
    collection_data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Actualiza una colección del usuario autenticado.
    """
    collection = db.query(CardCollection).filter(
        CardCollection.collection_id == collection_id,
        CardCollection.user_id == current_user.user_id  # ✅ Verificar propiedad
    ).first()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colección no encontrada o no tienes acceso"
        )
    
    collection.collection_name = collection_data.collection_name
    collection.collection_color = collection_data.collection_color
    collection.is_active = collection_data.is_active
    
    db.commit()
    db.refresh(collection)
    return collection


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(
    collection_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Elimina una colección del usuario (y sus tarjetas en cascada).
    """
    db_collection = db.query(CardCollection).filter(
        CardCollection.collection_id == collection_id,
        CardCollection.user_id == current_user.user_id  # ✅ NUEVO: Verificar propiedad
    ).first()
    
    if not db_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Colección no encontrada o no tienes acceso"
        )
    
    db.delete(db_collection)
    db.commit()
    return None


# =============================================
# ENDPOINTS PARA FLASHCARDS (DENTRO DE COLECCIÓN)
# =============================================

@router.post("/collections/{collection_id}/cards", response_model=FlashcardOut, status_code=status.HTTP_201_CREATED)
def create_flashcard_in_collection(
    collection_id: int, 
    card_data: FlashcardCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Crea una nueva flashcard en una colección del usuario.
    """
    # 1. Verificar que la colección exista Y pertenezca al usuario
    db_collection = db.query(CardCollection).filter(
        CardCollection.collection_id == collection_id,
        CardCollection.user_id == current_user.user_id  # ✅ NUEVO: Verificar propiedad
    ).first()
    
    if not db_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Colección no encontrada o no tienes acceso"
        )

    # 2. Crear la flashcard (asociada al usuario actual)
    db_card = Flashcard(
        question=card_data.question,
        answer=card_data.answer,
        is_reversed=card_data.is_reversed,
        flashcard_color=card_data.flashcard_color,
        card_user=current_user.user_id,  # ✅ NUEVO: Usar el usuario del token
        collection=collection_id,
        is_active=True
    )
    
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


@router.get("/cards", response_model=List[FlashcardOut])
def get_user_flashcards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtiene todas las flashcards del usuario autenticado.
    """
    cards = db.query(Flashcard).filter(
        Flashcard.card_user == current_user.user_id,
        Flashcard.is_active == True
    ).offset(skip).limit(limit).all()
    
    return cards


@router.put("/cards/{card_id}", response_model=FlashcardOut)
def update_flashcard(
    card_id: int, 
    card_data: FlashcardBase, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Actualiza una flashcard del usuario.
    """
    db_card = db.query(Flashcard).filter(
        Flashcard.card_id == card_id,
        Flashcard.card_user == current_user.user_id  # ✅ NUEVO: Verificar propiedad
    ).first()
    
    if not db_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Flashcard no encontrada o no tienes acceso"
        )

    update_dict = card_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_card, key, value)
        
    db.commit()
    db.refresh(db_card)
    return db_card


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard(
    card_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ✅ NUEVO: Requiere autenticación
):
    """
    Elimina una flashcard del usuario.
    """
    db_card = db.query(Flashcard).filter(
        Flashcard.card_id == card_id,
        Flashcard.card_user == current_user.user_id  # ✅ NUEVO: Verificar propiedad
    ).first()
    
    if not db_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Flashcard no encontrada o no tienes acceso"
        )
        
    db.delete(db_card)
    db.commit()
    return None


# =============================================
# ESTADÍSTICAS DE FLASHCARDS
# =============================================

@router.get("/stats")
def get_flashcard_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtiene estadísticas de flashcards del usuario.
    """
    total_collections = db.query(CardCollection).filter(
        CardCollection.user_id == current_user.user_id,
        CardCollection.is_active == True
    ).count()
    
    total_cards = db.query(Flashcard).filter(
        Flashcard.card_user == current_user.user_id,
        Flashcard.is_active == True
    ).count()
    
    return {
        "total_collections": total_collections,
        "total_cards": total_cards,
        "user_id": current_user.user_id
    }