from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Schema para crear una nueva sesión de estudio
class FlashcardSessionCreate(BaseModel):
    collection_id: Optional[int] = Field(None, description="ID de la colección estudiada")
    cards_studied: int = Field(0, ge=0, description="Total de tarjetas estudiadas")
    cards_easy: int = Field(0, ge=0, description="Tarjetas marcadas como fáciles")
    cards_medium: int = Field(0, ge=0, description="Tarjetas marcadas como media dificultad")
    cards_hard: int = Field(0, ge=0, description="Tarjetas marcadas como difíciles")
    duration_minutes: int = Field(0, ge=0, description="Duración en minutos")
    notes: Optional[str] = Field(None, description="Notas de la sesión")


# Schema de respuesta (lo que devuelve la API)
class FlashcardSessionResponse(BaseModel):
    session_id: int
    user_id: int
    collection_id: Optional[int] = None
    cards_studied: int
    cards_easy: int
    cards_medium: int
    cards_hard: int
    duration_minutes: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True