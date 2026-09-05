from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class DiagnosticQuestion(Base):
    __tablename__ = "diagnostic_questions"

    question_id = Column(Integer, primary_key=True, autoincrement=True)
    question_text = Column(Text, nullable=False)
    question_order = Column(Integer, nullable=False)

    options = relationship(
        "DiagnosticOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="DiagnosticOption.option_id",
    )


class DiagnosticOption(Base):
    __tablename__ = "diagnostic_options"

    option_id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("diagnostic_questions.question_id", ondelete="CASCADE"), nullable=False)
    option_text = Column(Text, nullable=False)
    method_id = Column(Integer, ForeignKey("metodos.metodo_id"), nullable=False)
    points = Column(Integer, default=1, nullable=False)

    question = relationship("DiagnosticQuestion", back_populates="options")
    method = relationship("Metodo", lazy="joined")


class DiagnosticResponse(Base):
    __tablename__ = "diagnostic_responses"

    response_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("usuario.user_id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("diagnostic_questions.question_id", ondelete="CASCADE"), nullable=False)
    option_id = Column(Integer, ForeignKey("diagnostic_options.option_id", ondelete="CASCADE"), nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Usuario", back_populates="diagnostic_responses")
    question = relationship("DiagnosticQuestion")
    option = relationship("DiagnosticOption")
