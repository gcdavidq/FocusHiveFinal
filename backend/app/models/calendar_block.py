from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class CalendarBlock(Base):
    """Bloque de estudio planificado en el calendario semanal."""

    __tablename__ = "calendar_blocks"

    block_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(String(10), nullable=False)  # lunes ... domingo
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    method = Column(String(45), nullable=False)  # nombre del método (pomodoro, feynman, ...)
    subject = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Usuario", back_populates="calendar_blocks")
