from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.connection import Base


class CardCollection(Base):
    """Colección (curso) de flashcards de un usuario."""

    __tablename__ = "card_collections"

    collection_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    collection_name = Column(String(100), nullable=False)
    collection_color = Column(String(6), nullable=False)  # HEX sin numeral, ej. 3B82F6

    user = relationship("Usuario", back_populates="card_collections")
    flashcards = relationship(
        "Flashcard",
        back_populates="collection_owner",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Flashcard.card_id",
    )


class Flashcard(Base):
    __tablename__ = "flashcards"

    card_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_reversed = Column(Boolean, default=False, nullable=False)
    card_user = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(String(255), nullable=False)
    answer = Column(String(500), nullable=False)
    collection = Column(Integer, ForeignKey("card_collections.collection_id", ondelete="CASCADE"), nullable=False)
    flashcard_color = Column(String(45), nullable=True)

    collection_owner = relationship("CardCollection", back_populates="flashcards")
    user = relationship("Usuario", back_populates="flashcards")
