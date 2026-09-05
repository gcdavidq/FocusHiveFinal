from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CornellCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subject: str | None = Field(None, max_length=100)
    notes_section: str | None = Field(None, description="Notas principales (sección derecha)")
    cues_section: str | None = Field(None, description="Palabras clave y preguntas (sección izquierda)")
    summary_section: str | None = Field(None, description="Resumen (sección inferior)")


class CornellUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    subject: str | None = Field(None, max_length=100)
    notes_section: str | None = None
    cues_section: str | None = None
    summary_section: str | None = None


class CornellResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    note_id: int
    user_id: int
    title: str
    subject: str | None = None
    notes_section: str | None = None
    cues_section: str | None = None
    summary_section: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
