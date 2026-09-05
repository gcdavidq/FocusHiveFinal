# FocusHive API

API REST en **FastAPI + SQLAlchemy 2 + PostgreSQL** para la plataforma FocusHive. La documentación interactiva se genera sola en `/docs` (Swagger) y `/redoc`.

## Ejecutar en local

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  |  source venv/bin/activate en macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # Windows  |  cp .env.example .env
# edita .env y coloca tu DATABASE_URL (PostgreSQL de Neon o local)
uvicorn main:app --reload
```

Al arrancar, la API crea las tablas que falten y carga los datos semilla (4 métodos y 8 preguntas del diagnóstico) si las tablas están vacías. Para forzar la recarga del cuestionario:

```bash
python -m app.database.seed --force
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | URL de PostgreSQL. Ej: `postgresql://usuario:clave@host/db?sslmode=require`. También acepta `sqlite:///./local.db` para pruebas rápidas. |
| `SECRET_KEY` | Sí en producción | Clave para firmar los JWT. Genera una con `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Duración del token. Por defecto 480 (8 horas). |
| `CORS_ORIGINS` | No | Orígenes permitidos separados por coma. Por defecto los puertos locales de Vite. |
| `SEED_ON_STARTUP` | No | `true` inserta métodos y preguntas si faltan. Por defecto `true`. |
| `DEBUG` | No | `true` muestra el SQL en consola. Por defecto `false`. |

## Tests

```bash
pip install -r requirements-dev.txt
pytest
```

Los tests corren contra SQLite en memoria; nunca tocan la base de datos real.

## Estructura

```
backend/
├── main.py                 # App FastAPI, CORS, lifespan (tablas + seed), manejo global de errores
├── app/
│   ├── config.py           # Settings (pydantic-settings, lee .env)
│   ├── database/           # engine/sesión y seed.py (métodos + cuestionario)
│   ├── models/             # ORM SQLAlchemy (una clase por archivo)
│   ├── schemas/            # Pydantic v2: entrada/salida de cada módulo
│   ├── services/           # Lógica de negocio (auth, usuarios, diagnóstico, dashboard, logros)
│   ├── utils/              # Seguridad (bcrypt + JWT), algoritmo del diagnóstico, cálculos del dashboard
│   └── api/v1/             # Routers agrupados bajo /api/v1
└── tests/                  # pytest + TestClient
```

## Módulos de la API

| Prefijo | Qué hace |
|---|---|
| `/auth` | Registro, login (por usuario o correo), perfil del token |
| `/users` | Perfil propio, cambio de contraseña, eliminación de cuenta en cascada |
| `/methods` | Catálogo de métodos de estudio |
| `/diagnostic` | Preguntas, envío de respuestas, resultado y estado |
| `/dashboard` | Sesiones de estudio, resumen semanal, racha, uso por método, meta semanal y logros |
| `/flashcards` | Colecciones y tarjetas |
| `/method-work/*` | Trabajos Feynman, notas Cornell y resultados de repaso de flashcards |
| `/calendar` | Bloques de estudio planificados |

Todos los endpoints salvo registro, login, `/methods` y el catálogo de logros requieren `Authorization: Bearer <token>`.
