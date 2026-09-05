# Plan de despliegue de FocusHive

Guía paso a paso para publicar FocusHive en internet con **Neon** (PostgreSQL), **Render** (API y frontend) y **GitHub** (código y despliegue automático). Todo en planes gratuitos.

Tiempo estimado: 30 a 45 minutos la primera vez.

---

## 1. Arquitectura de producción

```
                 ┌──────────────────────────────┐
  Navegador ───► │ Render Static Site           │  https://focushive-web.onrender.com
                 │ frontend/ (React, Vite)      │
                 └──────────────┬───────────────┘
                                │ HTTPS (VITE_API_URL)
                                ▼
                 ┌──────────────────────────────┐
                 │ Render Web Service (Python)  │  https://focushive-api.onrender.com
                 │ backend/ (FastAPI, uvicorn)  │  /health  /docs  /api/v1/*
                 └──────────────┬───────────────┘
                                │ PostgreSQL + SSL (DATABASE_URL)
                                ▼
                 ┌──────────────────────────────┐
                 │ Neon                         │  proyecto neondb, región sa-east-1
                 │ PostgreSQL serverless        │
                 └──────────────────────────────┘
```

| Componente | Servicio | Plan | Qué despliega |
|---|---|---|---|
| Base de datos | Neon | Free | PostgreSQL con SSL |
| API | Render Web Service | Free | `backend/` con `uvicorn main:app` |
| Frontend | Render Static Site | Free | `frontend/dist` generado por `npm run build` |
| Código y CI | GitHub | Free | Cada push a `master` redespliega ambos servicios |

---

## 2. Requisitos previos

- [ ] Cuenta en [GitHub](https://github.com) con el repositorio de FocusHive.
- [ ] Cuenta en [Neon](https://neon.tech) (registro con GitHub).
- [ ] Cuenta en [Render](https://render.com) (registro con GitHub, para que pueda leer el repo).
- [ ] El proyecto corre en local siguiendo el `README.md` (tests en verde).
- [ ] `backend/.env` **no** está versionado. Compruébalo:

  ```bash
  git ls-files | grep -E "\.env$"      # no debe imprimir nada
  ```

---

## 3. Base de datos en Neon

Ya existe un proyecto Neon creado para FocusHive. Si necesitas crearlo de nuevo:

1. Neon → **New Project**. Nombre `focushive`, región **South America (sa-east-1)** para menor latencia desde Perú.
2. En el panel del proyecto → **Connection Details** → selecciona **Pooled connection** y copia la URL. Tiene esta forma:

   ```
   postgresql://USUARIO:PASSWORD@ep-xxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

3. Guarda la URL en un gestor de contraseñas. La pegarás en Render en el paso 5. **No la escribas en ningún archivo del repositorio.**

Notas:

- La API acepta la URL tal cual (`postgresql://`). También acepta `postgres://` y `postgresql+psycopg2://`.
- El esquema y los datos semilla se crean solos en el primer arranque de la API. No hay que ejecutar SQL a mano.
- Para partir de cero, en Neon → **SQL Editor** ejecuta `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` y reinicia la API.

---

## 4. Publicar el código en GitHub

```bash
cd C:\Users\gcdav\Documents\PERSONAL\PROYECTOS\FocusHiveFinal
git status                     # revisa los cambios
git add -A
git commit -m "Modernización: PostgreSQL, dashboard unificado, seguridad, tests y despliegue"
git push -u origin master
```

Antes del push, verifica que no viaja ninguna credencial:

```bash
git grep -n -I "npg_\|neon.tech/neondb\|rlwy.net"      # no debe encontrar contraseñas
```

> Importante: la contraseña de la antigua base MySQL de Railway quedó en commits anteriores. Si el repo será público, **elimina o rota esa base en Railway**. La de Neon nunca ha estado en git.

---

## 5. Despliegue en Render con Blueprint (recomendado)

El archivo [`render.yaml`](render.yaml) describe los dos servicios. Render lo lee y los crea juntos.

### 5.1 Elegir los nombres

Los nombres de servicio forman el subdominio `*.onrender.com` y deben ser únicos en toda la plataforma. Por defecto:

| Servicio | Nombre | URL resultante |
|---|---|---|
| API | `focushive-api` | `https://focushive-api.onrender.com` |
| Frontend | `focushive-web` | `https://focushive-web.onrender.com` |

Si alguno está ocupado, cambia **los tres lugares** en `render.yaml` antes de continuar:

1. `name:` del servicio.
2. `CORS_ORIGINS` de la API → URL del frontend.
3. `VITE_API_URL` del frontend → URL de la API + `/api/v1`.

Haz commit y push del cambio.

### 5.2 Crear el Blueprint

1. Render Dashboard → **New +** → **Blueprint**.
2. Conecta tu cuenta de GitHub si aún no lo hiciste y selecciona el repositorio.
3. Render muestra los dos servicios detectados. Pulsa **Apply**.
4. Render pedirá el valor de las variables marcadas `sync: false`. Pega la **URL de Neon** en `DATABASE_URL` de `focushive-api`.
5. `SECRET_KEY` se genera automáticamente (`generateValue: true`). No hace falta tocarla.
6. Espera a que ambos servicios terminen el primer deploy (3 a 6 minutos).

### 5.3 Variables que quedan configuradas

**focushive-api**

| Variable | Valor | Origen |
|---|---|---|
| `DATABASE_URL` | URL de Neon | la pegas tú |
| `SECRET_KEY` | aleatoria | Render |
| `PYTHON_VERSION` | `3.12.7` | render.yaml |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | render.yaml |
| `SEED_ON_STARTUP` | `true` | render.yaml |
| `DEBUG` | `false` | render.yaml |
| `CORS_ORIGINS` | `https://focushive-web.onrender.com` | render.yaml |

**focushive-web**

| Variable | Valor | Origen |
|---|---|---|
| `VITE_API_URL` | `https://focushive-api.onrender.com/api/v1` | render.yaml |
| `VITE_REPO_URL` | URL del repo en GitHub | opcional, añádela en el dashboard |
| `VITE_CONTACT_EMAIL` | tu correo | opcional |

Las variables `VITE_*` se incrustan en el build. Si las cambias, hay que hacer **Manual Deploy → Clear build cache & deploy** en el sitio estático.

---

## 6. Alternativa: crear los servicios a mano (sin Blueprint)

Útil si prefieres controlar cada paso o el Blueprint falla.

### 6.1 API

1. **New +** → **Web Service** → conecta el repo.
2. Configuración:

   | Campo | Valor |
   |---|---|
   | Name | `focushive-api` |
   | Region | Oregon (US West) o la más cercana disponible |
   | Root Directory | `backend` |
   | Runtime | Python 3 |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | Free |

3. **Environment** → añade las variables de la tabla 5.3 (`DATABASE_URL`, `SECRET_KEY` generada con `python -c "import secrets; print(secrets.token_hex(32))"`, `CORS_ORIGINS`, etc.).
4. **Health Check Path**: `/health`.
5. **Create Web Service**.

### 6.2 Frontend

1. **New +** → **Static Site** → mismo repo.
2. Configuración:

   | Campo | Valor |
   |---|---|
   | Name | `focushive-web` |
   | Root Directory | `frontend` |
   | Build Command | `npm ci && npm run build` |
   | Publish Directory | `dist` |

3. **Environment** → `VITE_API_URL` = URL de la API + `/api/v1`.
4. **Redirects/Rewrites** → añade una regla: Source `/*`, Destination `/index.html`, Action **Rewrite**. Sin esto, recargar cualquier ruta interna da 404.
5. **Create Static Site**.

### 6.3 Cerrar el círculo de CORS

Cuando el frontend tenga URL definitiva, vuelve a la API → **Environment** → `CORS_ORIGINS` = esa URL exacta (con `https://`, sin barra final). Guarda; Render redespliega la API.

---

## 7. Verificación tras el despliegue

Ejecuta en orden. Sustituye las URLs por las tuyas.

1. **Salud de la API y conexión a la base**

   ```bash
   curl https://focushive-api.onrender.com/health
   # {"status":"ok","database":"ok"}
   ```

   Si devuelve `"database":"error"` o 503, revisa `DATABASE_URL` (sección 9).

2. **Seeds cargados**

   ```bash
   curl https://focushive-api.onrender.com/api/v1/methods
   # lista con pomodoro, feynman, cornell, flashcards
   ```

3. **Documentación**: abre `https://focushive-api.onrender.com/docs`.

4. **Frontend**: abre `https://focushive-web.onrender.com`.
   - Regístrate con un usuario de prueba.
   - Responde el cuestionario y comprueba que aparece un método recomendado.
   - Inicia un Pomodoro, finalízalo y revisa que aparece en **Mi progreso**.
   - Recarga la página estando en `/seguimiento`: debe seguir cargando (regla de rewrite OK).
   - Cierra sesión y vuelve a entrar.

5. **Consola del navegador (F12)**: no debe haber errores de CORS. Si los hay, revisa `CORS_ORIGINS`.

6. **Logs en Render** (pestaña *Logs* de la API): en el arranque debe verse
   `Seed listo: 4 métodos, 8 preguntas insertadas` (o `0 preguntas insertadas` si ya existían) y `FocusHive API v2.0.0 lista`.

---

## 8. Operación diaria

- **Despliegue automático**: cada `git push` a `master` redespliega el servicio cuya carpeta cambió (`autoDeploy: true`). Los servicios usan `rootDir`, así que un cambio solo en `frontend/` no reconstruye la API.
- **Rollback**: Render → servicio → pestaña *Events* → **Rollback** al deploy anterior.
- **Logs**: pestaña *Logs* de cada servicio; los errores 500 de la API quedan registrados con traza.
- **Arranque en frío**: en el plan gratuito la API se suspende tras 15 minutos sin tráfico y tarda entre 30 y 60 segundos en despertar. El frontend muestra "No se pudo conectar" si la primera petición expira; basta recargar. Opciones para mitigarlo: un ping periódico a `/health` con un servicio externo gratuito (por ejemplo cron-job.org cada 10 minutos) o pasar la API al plan Starter.
- **Neon**: el plan gratuito suspende el cómputo tras inactividad y lo reanuda en menos de un segundo; no requiere acción.
- **Cambios de esquema**: la API crea tablas nuevas con `create_all`, pero **no modifica columnas existentes**. Para cambios sobre tablas con datos, aplica el `ALTER TABLE` en el SQL Editor de Neon o añade Alembic.

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Deploy de la API falla en build con error de `psycopg2` | Versión de Python distinta | Confirma `PYTHON_VERSION=3.12.7` en Environment |
| `/health` devuelve `"database":"error"` | `DATABASE_URL` mal pegada o sin `sslmode=require` | Copia de nuevo la URL *pooled* de Neon completa |
| La API arranca y muere en bucle | Falta `DATABASE_URL` (Settings la exige) | Añade la variable y redespliega |
| Frontend carga pero todo falla con error de red | `VITE_API_URL` incorrecta o sin `/api/v1` | Corrige la variable y haz *Clear build cache & deploy* |
| Error CORS en consola | `CORS_ORIGINS` no coincide con la URL del frontend | Debe ser exacta, `https://`, sin barra final; varios orígenes separados por coma |
| 404 al recargar `/seguimiento` | Falta la regla de rewrite | Añade `/*` → `/index.html` (Rewrite) en el sitio estático |
| Cuestionario dice "No hay preguntas disponibles" | Seed no ejecutado | `SEED_ON_STARTUP=true` y reinicia; o ejecuta `python -m app.database.seed` desde la *Shell* de Render |
| Sesión se cierra sola | Token expirado (8 h por defecto) | Ajusta `ACCESS_TOKEN_EXPIRE_MINUTES` si quieres más |
| Primera carga muy lenta | Arranque en frío del plan gratuito | Ver sección 8 |

---

## 10. Seguridad en producción

- `SECRET_KEY` única y aleatoria (Render la genera). Nunca la copies al repo.
- `DEBUG=false` en producción: evita volcar SQL a los logs.
- `CORS_ORIGINS` solo con los dominios reales del frontend.
- Credenciales únicamente en variables de entorno de Render y en tu `backend/.env` local.
- Rota la contraseña de Neon si alguna vez se comparte por un canal inseguro: Neon → *Roles* → *Reset password*, y actualiza `DATABASE_URL` en Render.

---

## 11. Alternativa local con Docker

Para demostrar el proyecto sin depender de Neon ni Render:

```bash
docker compose up --build
# Frontend http://localhost:5173 · API http://localhost:8000/docs
```

Levanta PostgreSQL local, la API con seeds y el frontend en modo desarrollo. Para apuntar a Neon desde Docker: `DATABASE_URL="postgresql://..." docker compose up`.

---

## 12. Checklist final

- [ ] `git ls-files | grep .env` no devuelve nada.
- [ ] Repo en GitHub actualizado.
- [ ] Base Railway antigua eliminada o con contraseña rotada.
- [ ] Nombres en `render.yaml` únicos (o ajustados en los tres lugares).
- [ ] Blueprint aplicado; `DATABASE_URL` de Neon pegada.
- [ ] `/health` → `{"status":"ok","database":"ok"}`.
- [ ] `/api/v1/methods` devuelve 4 métodos.
- [ ] Registro, cuestionario y Pomodoro funcionan en el frontend publicado.
- [ ] Recargar una ruta interna no da 404.
- [ ] Sin errores CORS en consola.
- [ ] `VITE_REPO_URL` configurada para que el pie de página enlace al código.
- [ ] URL de la demo añadida al `README.md` (sección "Demo").
