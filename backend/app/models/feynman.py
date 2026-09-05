from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class FeynmanWork(Base):
    """Trabajo con la técnica Feynman: tema, explicación, vacíos detectados y versión final."""

    __tablename__ = "feynman_work"

    feynman_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    gaps_identified = Column(Text, nullable=True)
    final_version = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("Usuario", back_populates="feynman_works")
