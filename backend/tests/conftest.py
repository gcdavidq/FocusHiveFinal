"""Fixtures compartidos. Los tests corren contra SQLite en memoria, sin tocar la base real."""
import os

# Debe configurarse ANTES de importar la aplicación (Settings se cachea al primer uso).
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SEED_ON_STARTUP"] = "false"
os.environ["SECRET_KEY"] = "clave-de-pruebas"
os.environ["DEBUG"] = "false"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import event  # noqa: E402

import app.models  # noqa: E402, F401
from app.database.connection import Base, SessionLocal, engine  # noqa: E402
from app.database.seed import run_seed  # noqa: E402
from main import app  # noqa: E402


@event.listens_for(engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _):
    dbapi_connection.execute("PRAGMA foreign_keys=ON")


@pytest.fixture(autouse=True)
def fresh_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def seeded(db):
    run_seed(db)


DEFAULT_PASSWORD = "Segura123"


def register_and_login(client: TestClient, username: str = "ana_estudia", password: str = DEFAULT_PASSWORD) -> dict:
    """Registra un usuario, inicia sesión y devuelve los headers con el Bearer token."""
    register = client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": password,
            "confirm_password": password,
        },
    )
    assert register.status_code == 201, register.text
    login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.fixture
def auth(client):
    return register_and_login(client)
