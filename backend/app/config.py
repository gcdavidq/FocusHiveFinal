from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la aplicación, cargada desde variables de entorno o el archivo .env.

    Las variables de entorno del sistema tienen prioridad sobre el archivo .env.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Aplicación
    APP_NAME: str = "FocusHive API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # Base de datos (obligatoria; sin valor por defecto para no filtrar credenciales)
    DATABASE_URL: str
    # Inserta métodos y cuestionario diagnóstico si las tablas están vacías
    SEED_ON_STARTUP: bool = True

    # Seguridad
    SECRET_KEY: str = "clave-secreta-cambia-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Orígenes permitidos para CORS, separados por coma
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:4173,http://localhost:3000"

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Algunos proveedores entregan "postgres://", esquema que SQLAlchemy 2 ya no acepta.
        if value.startswith("postgres://"):
            value = value.replace("postgres://", "postgresql://", 1)
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
