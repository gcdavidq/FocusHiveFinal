from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, diagnostic, dashboard, flashcards, sessions, feynman, cornell, flashcard_sessions  # ✅ AGREGADO
from app.config import get_settings
from app.database.connection import engine, Base

# Importar modelos para que SQLAlchemy los reconozca
from app.models.user import Usuario
from app.models.orm_models import Post, CardCollection, Flashcard, Like
from app.models.feynman import FeynmanWork
from app.models.cornell import CornellNote
from app.models.flashcard_session import FlashcardStudySession  # ✅ AGREGADO
from app.api.v1 import tracking
from app.models.tracking_session import TrackingSession
from app.models.user_tracking_prefs import UserTrackingPrefs

settings=get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="API Backend para FocusHive - Plataforma de gestión de estudio",
    version="1.0.0"
)

# Crear tablas automáticamente al iniciar
Base.metadata.create_all(bind=engine)

#Configurar CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "https://focushivefinal-1.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(diagnostic.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(flashcards.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(feynman.router, prefix="/api/v1")
app.include_router(cornell.router, prefix="/api/v1")
app.include_router(flashcard_sessions.router, prefix="/api/v1")  # ✅ AGREGADO
app.include_router(tracking.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "FocusHive API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
