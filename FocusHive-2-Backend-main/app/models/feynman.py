from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class FeynmanWork(Base):
    __tablename__ = "feynman_work"

    feynman_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id"), nullable=False)
    topic = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    gaps_identified = Column(Text, nullable=True)
    final_version = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FeynmanWork(feynman_id={self.feynman_id}, topic='{self.topic}')>"