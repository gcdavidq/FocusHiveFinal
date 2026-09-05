"""Punto de entrada de la API de FocusHive.

Ejecutar en local:  uvicorn main:app --reload
Documentación:      http://localhost:8000/docs
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

import app.models  # noqa: F401  (registra todos los modelos en Base.metadata)
from app.api.v1 import api_router
from app.config import get_settings
from app.database.connection import Base, SessionLocal, engine
from app.database.seed import run_seed

settings = get_settings()
logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("focushive")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Crea las tablas que falten y carga los datos semilla al arrancar."""
    Base.metadata.create_all(bind=engine)
    if settings.SEED_ON_STARTUP:
        with SessionLocal() as db:
            run_seed(db)
    logger.info("%s v%s lista", settings.APP_NAME, settings.APP_VERSION)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API de FocusHive, plataforma que recomienda un método de estudio mediante un diagnóstico "
        "y permite practicarlo (Pomodoro, Feynman, Cornell, Flashcards) registrando el progreso."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_: Request, exc: IntegrityError):
    logger.warning("Conflicto de integridad: %s", exc.orig)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "Los datos entran en conflicto con registros existentes"},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("Error de base de datos: %s", exc)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Error de base de datos"})


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception):
    logger.exception("Error no controlado: %s", exc)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Error interno del servidor"})


@app.get("/", tags=["Sistema"])
def root():
    return {"message": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/docs", "health": "/health"}


@app.get("/health", tags=["Sistema"])
def health_check():
    """Comprueba que la API responde y que la base de datos acepta consultas."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        database = "ok"
    except SQLAlchemyError:
        database = "error"
    status_code = status.HTTP_200_OK if database == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content={"status": "ok" if database == "ok" else "degraded", "database": database})
