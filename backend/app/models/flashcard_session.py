from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class FlashcardStudySession(Base):
    """Resultado de una sesión de repaso de flashcards (fáciles / medias / difíciles)."""

    __tablename__ = "flashcard_study_sessions"

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    collection_id = Column(Integer, ForeignKey("card_collections.collection_id", ondelete="SET NULL"), nullable=True)
    cards_studied = Column(Integer, default=0, nullable=False)
    cards_easy = Column(Integer, default=0, nullable=False)
    cards_medium = Column(Integer, default=0, nullable=False)
    cards_hard = Column(Integer, default=0, nullable=False)
    duration_minutes = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Usuario", back_populates="flashcard_sessions")
