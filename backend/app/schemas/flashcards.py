from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.validators import validate_hex_color


class CollectionCreate(BaseModel):
    collection_name: str = Field(..., min_length=1, max_length=100)
    collection_color: str = Field("3B82F6", description="Color HEX de 6 caracteres, sin numeral")
    is_active: bool = True

    @field_validator("collection_color")
    @classmethod
    def _color(cls, value: str) -> str:
        return validate_hex_color(value)


class CollectionUpdate(BaseModel):
    collection_name: str | None = Field(None, min_length=1, max_length=100)
    collection_color: str | None = None
    is_active: bool | None = None

    @field_validator("collection_color")
    @classmethod
    def _color(cls, value: str | None) -> str | None:
        return validate_hex_color(value) if value is not None else value


class CollectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    collection_id: int
    user_id: int
    collection_name: str
    collection_color: str
    is_active: bool


class FlashcardCreate(BaseModel):
    question: str = Field(..., min_length=1, max_length=255)
    answer: str = Field(..., min_length=1, max_length=500)
    is_reversed: bool = False
    flashcard_color: str | None = Field(None, max_length=45)


class FlashcardUpdate(BaseModel):
    question: str | None = Field(None, min_length=1, max_length=255)
    answer: str | None = Field(None, min_length=1, max_length=500)
    is_reversed: bool | None = None
    flashcard_color: str | None = Field(None, max_length=45)
    is_active: bool | None = None


class FlashcardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    card_id: int
    collection: int
    card_user: int
    question: str
    answer: str
    is_reversed: bool
    is_active: bool
    flashcard_color: str | None = None


class CollectionOutWithCards(CollectionOut):
    flashcards: list[FlashcardOut] = []


class FlashcardStatsResponse(BaseModel):
    total_collections: int
    total_cards: int
