from sqlalchemy import JSON, Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.connection import Base


class UserPreferences(Base):
    """Meta semanal de estudio y logros desbloqueados."""

    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), primary_key=True)
    weekly_goal_hours = Column(Float, default=10.0, nullable=False)
    achievements = Column(JSON, default=list, nullable=False)  # lista de códigos, ej. ["first_session"]

    user = relationship("Usuario", back_populates="preferences")
