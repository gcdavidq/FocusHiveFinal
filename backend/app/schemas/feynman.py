from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeynmanCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=255, description="Tema a estudiar")
    explanation: str | None = Field(None, description="Explicación con palabras simples")
    gaps_identified: str | None = Field(None, description="Vacíos identificados")
    final_version: str | None = Field(None, description="Versión final simplificada")


class FeynmanUpdate(BaseModel):
    topic: str | None = Field(None, min_length=1, max_length=255)
    explanation: str | None = None
    gaps_identified: str | None = None
    final_version: str | None = None
    is_completed: bool | None = None


class FeynmanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feynman_id: int
    user_id: int
    topic: str
    explanation: str | None = None
    gaps_identified: str | None = None
    final_version: str | None = None
    is_completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
