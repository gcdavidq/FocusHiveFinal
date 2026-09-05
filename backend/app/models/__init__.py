"""Importa todos los modelos para que SQLAlchemy conozca el esquema completo."""
from app.models.calendar_block import CalendarBlock
from app.models.cornell import CornellNote
from app.models.diagnostic import DiagnosticOption, DiagnosticQuestion, DiagnosticResponse
from app.models.feynman import FeynmanWork
from app.models.flashcard import CardCollection, Flashcard
from app.models.flashcard_session import FlashcardStudySession
from app.models.method import Metodo
from app.models.study_session import SesionEstudio
from app.models.user import Usuario
from app.models.user_method import UsuarioMetodo
from app.models.user_preferences import UserPreferences

__all__ = [
    "CalendarBlock",
    "CornellNote",
    "DiagnosticOption",
    "DiagnosticQuestion",
    "DiagnosticResponse",
    "FeynmanWork",
    "CardCollection",
    "Flashcard",
    "FlashcardStudySession",
    "Metodo",
    "SesionEstudio",
    "Usuario",
    "UsuarioMetodo",
    "UserPreferences",
]
