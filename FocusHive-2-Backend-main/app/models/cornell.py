from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class CornellNote(Base):
    __tablename__ = "cornell_notes"

    note_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id"), nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    notes_section = Column(Text, nullable=True)  # Sección derecha (70%)
    cues_section = Column(Text, nullable=True)   # Sección izquierda - palabras clave (30%)
    summary_section = Column(Text, nullable=True) # Sección inferior - resumen
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CornellNote(note_id={self.note_id}, title='{self.title}')>"