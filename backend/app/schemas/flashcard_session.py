from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FlashcardSessionCreate(BaseModel):
    collection_id: int | None = Field(None, description="ID de la colección estudiada")
    cards_studied: int = Field(0, ge=0)
    cards_easy: int = Field(0, ge=0)
    cards_medium: int = Field(0, ge=0)
    cards_hard: int = Field(0, ge=0)
    duration_minutes: int = Field(0, ge=0, le=1440)
    notes: str | None = Field(None, max_length=500)


class FlashcardSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    user_id: int
    collection_id: int | None = None
    cards_studied: int
    cards_easy: int
    cards_medium: int
    cards_hard: int
    duration_minutes: int
    notes: str | None = None
    created_at: datetime | None = None
