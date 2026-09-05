from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.connection import Base


class UsuarioMetodo(Base):
    """Relación usuario-método: si fue recomendado por el diagnóstico y si ya lo utilizó."""

    __tablename__ = "usuario_metodo"

    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), primary_key=True)
    metodo_id = Column(Integer, ForeignKey("metodos.metodo_id", ondelete="CASCADE"), primary_key=True)
    es_recomendado = Column(Boolean, default=False, nullable=False)
    es_utilizado = Column(Boolean, default=False, nullable=False)

    user = relationship("Usuario", back_populates="methods")
    method = relationship("Metodo")
