from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    """Clase base de todos los modelos ORM."""


def _engine_options(url: str) -> dict:
    if url.startswith("sqlite"):
        options: dict = {"connect_args": {"check_same_thread": False}}
        if ":memory:" in url or url.rstrip("/") == "sqlite:":
            # Una sola conexión compartida para que la BD en memoria persista entre requests (tests)
            options["poolclass"] = StaticPool
        return options
    return {"pool_pre_ping": True, "pool_recycle": 1800}


engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG, **_engine_options(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependencia de FastAPI que entrega una sesión de BD y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
