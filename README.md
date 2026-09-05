# FocusHive

**Descubre tu método de estudio ideal y mide tu progreso.**

FocusHive es una plataforma web que recomienda al estudiante un método de estudio mediante un cuestionario diagnóstico y le permite practicarlo dentro de la app: temporizador **Pomodoro**, técnica **Feynman** guiada en 4 pasos, notas **Cornell** de tres secciones y **Flashcards** con repaso por dificultad. Cada sesión alimenta un dashboard con racha de días, horas por semana, método más usado, meta semanal y logros.

Nació como proyecto universitario en equipo y fue modernizado para funcionar de punta a punta y desplegarse en la nube.

> **Demo:** _pendiente de desplegar (ver sección Despliegue)_ · **API docs:** `/docs` en la URL de la API

---

## Cómo funciona

```
 Registro / Login ──► Cuestionario diagnóstico (8 preguntas) ──► Método recomendado
                                                                      │
        ┌─────────────────────────────────────────────────────────────┘
        ▼
  Practicar un método            Cada sesión se registra en ──►  Dashboard de progreso
  ├─ 🍅 Pomodoro (temporizador)                                    ├─ minutos de hoy y de la semana
  ├─ 🧠 Feynman (4 pasos, autoguardado)                            ├─ racha de días consecutivos
  ├─ 📝 Cornell (notas, pistas, resumen)                           ├─ recomendado vs. más usado
  └─ 🗂️ Flashcards (colecciones y repaso)                          ├─ meta semanal y nivel
                                                                   └─ logros desbloqueados
  📅 Calendario semanal para planificar bloques de estudio
```

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python 3.12 · FastAPI · SQLAlchemy 2 · Pydantic 2 · JWT (python-jose) · bcrypt |
| Base de datos | PostgreSQL (Neon en producción, Docker o SQLite en local) |
| Frontend | React 19 · Vite 7 · React Router 7 · Tailwind CSS 3 · Axios · lucide-react |
| Tests | pytest (45 tests, SQLite en memoria) · Vitest + Testing Library |
| Despliegue | Render (API + sitio estático) mediante `render.yaml` · Docker Compose para local |

## Estructura del repositorio

```
├── backend/          API FastAPI (ver backend/README.md)
├── frontend/         SPA React (ver frontend/README.md)
├── render.yaml       Blueprint de Render: API + frontend
├── docker-compose.yml Entorno local completo (Postgres + API + web)
└── README.md
```

## Ejecutar en local

### Opción A: Docker Compose (un solo comando)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000 · Swagger: http://localhost:8000/docs

### Opción B: manual

**Requisitos:** Python 3.12+, Node 20+ y una base PostgreSQL (una cuenta gratuita de [Neon](https://neon.tech) sirve; también puedes usar `sqlite:///./local.db` para probar).

1. Backend

   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate            # Windows  |  source venv/bin/activate
   pip install -r requirements.txt
   copy .env.example .env           # Windows  |  cp .env.example .env
   ```

   Edita `backend/.env` y coloca tu `DATABASE_URL` y una `SECRET_KEY`. Luego:

   ```bash
   uvicorn main:app --reload
   ```

   Al arrancar se crean las tablas y se cargan los métodos y el cuestionario automáticamente.

2. Frontend (otra terminal)

   ```bash
   cd frontend
   npm install
   copy .env.example .env           # VITE_API_URL=http://localhost:8000/api/v1
   npm run dev
   ```

3. Abre http://localhost:5173, crea una cuenta y responde el cuestionario.

### Variables de entorno

| Dónde | Variable | Descripción |
|---|---|---|
| backend | `DATABASE_URL` | URL de PostgreSQL. Obligatoria. |
| backend | `SECRET_KEY` | Clave de firma de los JWT. Cámbiala en producción. |
| backend | `CORS_ORIGINS` | Orígenes del frontend separados por coma. |
| backend | `ACCESS_TOKEN_EXPIRE_MINUTES`, `SEED_ON_STARTUP`, `DEBUG` | Opcionales, ver `backend/.env.example`. |
| frontend | `VITE_API_URL` | URL de la API incluyendo `/api/v1`. |
| frontend | `VITE_REPO_URL`, `VITE_CONTACT_EMAIL` | Opcionales: enlaces del pie de página y contacto. |

## Tests

```bash
# Backend
cd backend && pip install -r requirements-dev.txt && pytest

# Frontend
cd frontend && npm test && npm run lint
```

## Despliegue en Render

El archivo `render.yaml` describe dos servicios: `focushive-api` (Python) y `focushive-web` (sitio estático con reescritura a `index.html` para la SPA). Pasos:

1. **Base de datos.** Crea un proyecto en Neon y copia la cadena de conexión (`postgresql://...?sslmode=require`).
2. **Sube el repo a GitHub.** Asegúrate de que `backend/.env` no está versionado (ya está en `.gitignore`).
3. **Render → New → Blueprint.** Conecta el repositorio; Render leerá `render.yaml` y propondrá los dos servicios.
4. **Nombres.** Los nombres `focushive-api` y `focushive-web` deben ser únicos en Render. Si los cambias, actualiza `CORS_ORIGINS` (API) y `VITE_API_URL` (web) en el mismo archivo antes de aplicar.
5. **Secretos.** Cuando Render pida `DATABASE_URL`, pega la URL de Neon. `SECRET_KEY` se genera automáticamente.
6. **Aplica.** El primer arranque de la API crea las tablas y carga los datos semilla. Comprueba `https://<tu-api>.onrender.com/health` y `/docs`.
7. **Frontend.** Abre `https://<tu-web>.onrender.com`, regístrate y completa el cuestionario.

En el plan gratuito la API se suspende tras 15 minutos sin tráfico y tarda unos segundos en despertar; la primera petición puede demorar.

## API

Con la API en marcha, la documentación interactiva está en `/docs`. Resumen de módulos:

| Prefijo (`/api/v1`) | Descripción |
|---|---|
| `/auth`, `/users` | Registro, login por usuario o correo, perfil, cambio de contraseña, borrado en cascada |
| `/methods`, `/diagnostic` | Catálogo de métodos; preguntas, envío y resultado del diagnóstico |
| `/dashboard` | Sesiones de estudio, resumen, historial, estadísticas, meta semanal y logros |
| `/flashcards`, `/method-work/*` | Colecciones y tarjetas; trabajos Feynman, notas Cornell, repasos |
| `/calendar` | Bloques de estudio semanales |

## Decisiones técnicas

- **Un solo sistema de progreso.** Todas las herramientas (Pomodoro, Feynman, Cornell, Flashcards) registran sesiones en `sesion_estudio`; el dashboard calcula racha, desglose diario y uso por método con consultas agregadas.
- **Métodos identificados por nombre** (`pomodoro`, `feynman`, `cornell`, `flashcards`) tanto en la API como en el frontend, para no depender de ids autoincrementales.
- **Seeds idempotentes** al arrancar: el proyecto funciona desde cero sin pasos manuales.
- **Seguridad básica correcta:** contraseñas con bcrypt, JWT con expiración, cada recurso filtrado por el usuario del token, sin endpoints administrativos abiertos, credenciales solo en variables de entorno.
- **Sin migraciones:** el esquema se crea con `create_all`. Si cambias un modelo sobre una base con datos, aplica el cambio a mano o añade Alembic.

## Limitaciones conocidas

- Las métricas diarias se calculan en UTC; para usuarios en otras zonas horarias el corte del día puede diferir.
- No hay recuperación de contraseña por correo ni verificación de email.
- El formulario de contacto es demostrativo.
- Las herramientas "Mapas mentales" y "Cronómetro" aparecen como próximamente.

## Créditos

Proyecto académico desarrollado en equipo (ver la página "Sobre nosotros" de la app). Modernización 2026: migración a PostgreSQL, unificación del progreso, seguridad, tests y despliegue.
