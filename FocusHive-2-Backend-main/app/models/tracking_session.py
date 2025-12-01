from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base

class TrackingSession(Base):
    __tablename__ = "tracking_sessions"
    
    session_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id"), nullable=False)
    
    day_of_week = Column(String(20), nullable=False)
    hours = Column(Float, nullable=False)
    method = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())