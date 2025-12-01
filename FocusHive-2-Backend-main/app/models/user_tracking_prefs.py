from sqlalchemy import Column, Integer, Float, Text, ForeignKey
from app.database.connection import Base

class UserTrackingPrefs(Base):
    __tablename__ = "user_tracking_prefs"
    
    user_id = Column(Integer, ForeignKey("usuario.user_id"), primary_key=True)
    weekly_goal = Column(Float, default=20.0)
    achievements = Column(Text, default="[]")  # JSON string: ["first_session", "week_goal"]