from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class CornellNote(Base):
    """Nota Cornell: notas principales, columna de pistas y resumen."""

    __tablename__ = "cornell_notes"

    note_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    notes_section = Column(Text, nullable=True)
    cues_section = Column(Text, nullable=True)
    summary_section = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("Usuario", back_populates="cornell_notes")
