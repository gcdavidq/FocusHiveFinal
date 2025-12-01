from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Schema para crear un nuevo trabajo Feynman
class FeynmanCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=255, description="Tema a estudiar")
    explanation: Optional[str] = Field(None, description="Explicación con palabras simples")
    gaps_identified: Optional[str] = Field(None, description="Vacíos identificados")
    final_version: Optional[str] = Field(None, description="Versión final simplificada")


# Schema para actualizar un trabajo Feynman
class FeynmanUpdate(BaseModel):
    topic: Optional[str] = Field(None, min_length=1, max_length=255)
    explanation: Optional[str] = None
    gaps_identified: Optional[str] = None
    final_version: Optional[str] = None
    is_completed: Optional[bool] = None


# Schema de respuesta (lo que devuelve la API)
class FeynmanResponse(BaseModel):
    feynman_id: int
    user_id: int
    topic: str
    explanation: Optional[str] = None
    gaps_identified: Optional[str] = None
    final_version: Optional[str] = None
    is_completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Permite convertir desde ORM


# Schema para lista de trabajos
class FeynmanList(BaseModel):
    works: list[FeynmanResponse]
    total: int