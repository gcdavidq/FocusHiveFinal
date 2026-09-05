import axios from 'axios';

// En desarrollo apunta al backend local; en producción se define VITE_API_URL en el hosting.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'focushive_token';
const USER_KEY = 'focushive_user';
const AUTH_REASON_KEY = 'focushive_auth_reason';

/** Evento global que se dispara cuando el backend rechaza el token (sesión expirada). */
export const AUTH_EVENT = 'focushive:auth-expired';

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* almacenamiento no disponible */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
  },
};

export const tokenStorage = {
  getToken: () => safeStorage.get(TOKEN_KEY),
  setToken: (token) => safeStorage.set(TOKEN_KEY, token),
  getUser: () => {
    const raw = safeStorage.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user) => safeStorage.set(USER_KEY, JSON.stringify(user)),
  clear: () => {
    safeStorage.remove(TOKEN_KEY);
    safeStorage.remove(USER_KEY);
  },
  /** Motivo del último cierre de sesión forzado (p. ej. "expired"), se consume una sola vez. */
  takeAuthReason: () => {
    const reason = safeStorage.get(AUTH_REASON_KEY);
    safeStorage.remove(AUTH_REASON_KEY);
    return reason;
  },
  setAuthReason: (reason) => safeStorage.set(AUTH_REASON_KEY, reason),
};

/**
 * Convierte cualquier error de Axios en un Error con mensaje legible y `status`.
 * Los errores de validación de FastAPI (422) llegan como una lista y se aplanan.
 */
export function normalizeApiError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    let message = 'Error en la operación';
    const detail = data?.detail ?? data?.message;
    if (Array.isArray(detail)) {
      message = detail
        .map((item) => {
          const field = Array.isArray(item.loc) ? item.loc.filter((p) => p !== 'body').join('.') : '';
          const text = String(item.msg || '').replace(/^Value error, /, '');
          return field ? `${field}: ${text}` : text;
        })
        .join(' · ');
    } else if (typeof detail === 'string') {
      message = detail;
    }
    const normalized = new Error(message);
    normalized.status = status;
    return normalized;
  }
  if (error?.request) {
    const offline = new Error('No se pudo conectar con el servidor. Verifica tu conexión o que la API esté en línea.');
    offline.status = 0;
    return offline;
  }
  return error instanceof Error ? error : new Error(String(error || 'Error inesperado'));
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isLogin = url.includes('/auth/login');
    if (status === 401 && !isLogin && tokenStorage.getToken()) {
      tokenStorage.clear();
      tokenStorage.setAuthReason('expired');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { reason: 'expired' } }));
      }
    }
    return Promise.reject(normalizeApiError(error));
  },
);

const data = (promise) => promise.then((response) => response.data);

// ---------------------------------------------------------------------------
// Autenticación y usuario
// ---------------------------------------------------------------------------

export const authAPI = {
  register: (payload) => data(api.post('/auth/register', payload)),
  login: (credentials) => data(api.post('/auth/login', credentials)),
  getMe: () => data(api.get('/auth/me')),
  logout: () => data(api.post('/auth/logout')),
};

export const userAPI = {
  getProfile: () => data(api.get('/users/me')),
  getStats: () => data(api.get('/users/me/stats')),
  updateProfile: (payload) => data(api.put('/users/me', payload)),
  changePassword: (payload) => data(api.patch('/users/me/password', payload)),
  deleteAccount: () => data(api.delete('/users/me')),
};

// ---------------------------------------------------------------------------
// Métodos y diagnóstico
// ---------------------------------------------------------------------------

export const methodsAPI = {
  list: () => data(api.get('/methods')),
};

export const diagnosticAPI = {
  getStatus: () => data(api.get('/diagnostic/status')),
  getQuestions: () => data(api.get('/diagnostic/questions')),
  submit: (answers) => data(api.post('/diagnostic/submit', { answers })),
  getResult: () => data(api.get('/diagnostic/result')),
};

// ---------------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------------

export const flashcardsAPI = {
  /** Devuelve las colecciones activas con sus tarjetas incluidas. */
  getCollections: () => data(api.get('/flashcards/collections')),
  createCollection: (payload) => data(api.post('/flashcards/collections', payload)),
  getCollectionWithCards: (collectionId) => data(api.get(`/flashcards/collections/${collectionId}`)),
  updateCollection: (collectionId, payload) => data(api.put(`/flashcards/collections/${collectionId}`, payload)),
  deleteCollection: (collectionId) => data(api.delete(`/flashcards/collections/${collectionId}`)),
  createCard: (collectionId, payload) => data(api.post(`/flashcards/collections/${collectionId}/cards`, payload)),
  getCard: (cardId) => data(api.get(`/flashcards/cards/${cardId}`)),
  updateCard: (cardId, payload) => data(api.put(`/flashcards/cards/${cardId}`, payload)),
  deleteCard: (cardId) => data(api.delete(`/flashcards/cards/${cardId}`)),
  getStats: () => data(api.get('/flashcards/stats')),
};

export const flashcardSessionAPI = {
  createSession: (payload) => data(api.post('/method-work/flashcard-sessions', payload)),
  getSessions: (skip = 0, limit = 20) => data(api.get('/method-work/flashcard-sessions', { params: { skip, limit } })),
};

// ---------------------------------------------------------------------------
// Feynman y Cornell
// ---------------------------------------------------------------------------

export const feynmanAPI = {
  createWork: (payload) => data(api.post('/method-work/feynman', payload)),
  getWorks: (skip = 0, limit = 20) => data(api.get('/method-work/feynman', { params: { skip, limit } })),
  getWork: (id) => data(api.get(`/method-work/feynman/${id}`)),
  updateWork: (id, payload) => data(api.put(`/method-work/feynman/${id}`, payload)),
  deleteWork: (id) => data(api.delete(`/method-work/feynman/${id}`)),
};

export const cornellAPI = {
  createNote: (payload) => data(api.post('/method-work/cornell', payload)),
  getNotes: (skip = 0, limit = 50) => data(api.get('/method-work/cornell', { params: { skip, limit } })),
  getNote: (id) => data(api.get(`/method-work/cornell/${id}`)),
  updateNote: (id, payload) => data(api.put(`/method-work/cornell/${id}`, payload)),
  deleteNote: (id) => data(api.delete(`/method-work/cornell/${id}`)),
};

// ---------------------------------------------------------------------------
// Dashboard de progreso (sesiones, meta semanal, logros)
// ---------------------------------------------------------------------------

export const dashboardAPI = {
  /** payload: { metodo: 'pomodoro', fecha_inicio: ISO, duracion_minutos, fue_completada?, descripcion? } */
  createSession: (payload) => data(api.post('/dashboard/sessions', payload)),
  getSummary: () => data(api.get('/dashboard/summary')),
  getHistory: (skip = 0, limit = 20) => data(api.get('/dashboard/sessions/history', { params: { skip, limit } })),
  getSession: (id) => data(api.get(`/dashboard/sessions/${id}`)),
  updateSession: (id, payload) => data(api.put(`/dashboard/sessions/${id}`, payload)),
  deleteSession: (id) => data(api.delete(`/dashboard/sessions/${id}`)),
  getMonthlyStats: (month, year) => data(api.get('/dashboard/stats/monthly', { params: { month, year } })),
  getMethodStats: () => data(api.get('/dashboard/stats/methods')),
  getPreferences: () => data(api.get('/dashboard/preferences')),
  updatePreferences: (payload) => data(api.put('/dashboard/preferences', payload)),
  getAchievements: () => data(api.get('/dashboard/achievements')),
};

// ---------------------------------------------------------------------------
// Calendario
// ---------------------------------------------------------------------------

export const calendarAPI = {
  getBlocks: () => data(api.get('/calendar/blocks')),
  createBlock: (payload) => data(api.post('/calendar/blocks', payload)),
  updateBlock: (id, payload) => data(api.put(`/calendar/blocks/${id}`, payload)),
  deleteBlock: (id) => data(api.delete(`/calendar/blocks/${id}`)),
  clearAll: () => data(api.delete('/calendar/blocks')),
};

export default api;
