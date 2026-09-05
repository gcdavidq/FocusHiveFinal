from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class SesionEstudio(Base):
    """Sesión de estudio registrada por el usuario. Alimenta el dashboard de progreso."""

    __tablename__ = "sesion_estudio"

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    metodo_id = Column(Integer, ForeignKey("metodos.metodo_id"), nullable=False)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, index=True)
    duracion_minutos = Column(Integer, nullable=False)
    fue_completada = Column(Boolean, nullable=False, default=True)
    descripcion = Column(Text, nullable=True)

    user = relationship("Usuario", back_populates="study_sessions")
    method = relationship("Metodo", lazy="joined")

    def __repr__(self) -> str:
        return f"<SesionEstudio(id={self.session_id}, user_id={self.user_id}, duracion={self.duracion_minutos}min)>"
