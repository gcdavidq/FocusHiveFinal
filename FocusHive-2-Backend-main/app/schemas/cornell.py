from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Schema para crear una nueva nota Cornell
class CornellCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Título de la nota")
    subject: Optional[str] = Field(None, max_length=100, description="Materia o tema")
    notes_section: Optional[str] = Field(None, description="Notas principales (sección derecha)")
    cues_section: Optional[str] = Field(None, description="Palabras clave y preguntas (sección izquierda)")
    summary_section: Optional[str] = Field(None, description="Resumen (sección inferior)")


# Schema para actualizar una nota Cornell
class CornellUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subject: Optional[str] = Field(None, max_length=100)
    notes_section: Optional[str] = None
    cues_section: Optional[str] = None
    summary_section: Optional[str] = None


# Schema de respuesta (lo que devuelve la API)
class CornellResponse(BaseModel):
    note_id: int
    user_id: int
    title: str
    subject: Optional[str] = None
    notes_section: Optional[str] = None
    cues_section: Optional[str] = None
    summary_section: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True