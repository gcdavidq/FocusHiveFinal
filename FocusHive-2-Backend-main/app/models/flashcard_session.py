from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class FlashcardStudySession(Base):
    __tablename__ = "flashcard_study_sessions"

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id"), nullable=False)
    collection_id = Column(Integer, ForeignKey("card_collections.collection_id"), nullable=True)
    cards_studied = Column(Integer, default=0)
    cards_easy = Column(Integer, default=0)
    cards_medium = Column(Integer, default=0)
    cards_hard = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<FlashcardStudySession(session_id={self.session_id}, cards_studied={self.cards_studied})>"