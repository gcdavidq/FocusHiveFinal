# FocusHive Web

SPA en **React 19 + Vite 7 + Tailwind CSS 3** que consume la API de FocusHive.

## Ejecutar en local

```bash
cd frontend
npm install
copy .env.example .env      # Windows  |  cp .env.example .env
npm run dev                 # http://localhost:5173
```

La variable `VITE_API_URL` debe apuntar a la API (por defecto `http://localhost:8000/api/v1`).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint (incluye reglas de hooks de React) |
| `npm test` | Tests unitarios con Vitest + Testing Library |

## Estructura

```
src/
├── App.jsx                 # Rutas (públicas y protegidas)
├── context/                # AuthProvider (sesión) y UIProvider (toasts y confirmaciones)
├── hooks/                  # useAuth, useUI, useAsync
├── services/api.js         # Cliente Axios: interceptores, normalización de errores y endpoints
├── services/methods.js     # Iconos, colores y rutas de los 4 métodos
├── components/             # Layout, ProtectedRoute y componentes de UI reutilizables
├── pages/                  # Una carpeta por pantalla
└── utils/format.js         # Formato de fechas y duraciones
```

## Convenciones

- Toda llamada al backend pasa por `services/api.js`; las páginas no usan Axios directamente.
- La sesión vive en `AuthProvider`; las páginas leen `useAuth()` y nunca `localStorage`.
- Mensajes al usuario con `useUI()` (`success`, `error`, `confirm`), no con `alert` ni `window.confirm`.
- Los métodos se identifican por su nombre (`pomodoro`, `feynman`, `cornell`, `flashcards`), igual que en el backend.
