from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base

# Todas las relaciones hijas se borran en cascada al eliminar la cuenta.
_CASCADE = {"cascade": "all, delete-orphan", "passive_deletes": True}


class Usuario(Base):
    __tablename__ = "usuario"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(45), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    total_studied_time = Column(Integer, default=0, nullable=False)  # minutos acumulados

    # Perfil
    full_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    diagnostic_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    card_collections = relationship("CardCollection", back_populates="user", **_CASCADE)
    flashcards = relationship("Flashcard", back_populates="user", **_CASCADE)
    study_sessions = relationship("SesionEstudio", back_populates="user", **_CASCADE)
    methods = relationship("UsuarioMetodo", back_populates="user", **_CASCADE)
    diagnostic_responses = relationship("DiagnosticResponse", back_populates="user", **_CASCADE)
    feynman_works = relationship("FeynmanWork", back_populates="user", **_CASCADE)
    cornell_notes = relationship("CornellNote", back_populates="user", **_CASCADE)
    flashcard_sessions = relationship("FlashcardStudySession", back_populates="user", **_CASCADE)
    calendar_blocks = relationship("CalendarBlock", back_populates="user", **_CASCADE)
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, **_CASCADE)

    def __repr__(self) -> str:
        return f"<Usuario(user_id={self.user_id}, username='{self.username}')>"
