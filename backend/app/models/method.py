from sqlalchemy import Column, Integer, String, Text

from app.database.connection import Base


class Metodo(Base):
    """Método de estudio. `nombre` es un identificador estable (pomodoro, feynman, cornell, flashcards)."""

    __tablename__ = "metodos"

    metodo_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(45), unique=True, nullable=False, index=True)
    titulo = Column(String(80), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo_aprendizaje_compatible = Column(String(80), nullable=False)

    def __repr__(self) -> str:
        return f"<Metodo(id={self.metodo_id}, nombre='{self.nombre}')>"
