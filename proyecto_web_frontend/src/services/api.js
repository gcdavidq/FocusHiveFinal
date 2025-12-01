import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://focushivefinal.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000, // 100 segundos
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      // ✅ SOLUCIÓN: No redirigir si el error 401 viene del endpoint de login
      const isLoginEndpoint = config.url.includes('/auth/login');

      // Si el token expiró o es inválido (pero NO en el login)
      if (status === 401 && !isLoginEndpoint) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Formatear mensaje de error
      const errorMessage = data.detail || data.message || 'Error en la operación';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      throw new Error(error.message || 'Error inesperado');
    }
  }
);

// =============================================
// UTILIDADES
// =============================================

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Obtener usuario actual del localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Limpiar datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// =============================================
// AUTH ENDPOINTS
// =============================================

export const authAPI = {
  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password,
    });
    return response.data;
  },

  /**
   * Iniciar sesión
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    // Guardar token y usuario en localStorage
    if (response.data.access_token) {
      const token = response.data.access_token; // <--- Se captura el token
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // AÑADE ESTA LÍNEA CLAVE PARA FORZAR LA SINCRONIZACIÓN DE AXIOS
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthData();
    }
  },
};

// =============================================
// USER ENDPOINTS
// =============================================

export const userAPI = {
  /**
   * Obtener perfil del usuario
   */
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Obtener estadísticas del usuario
   */
  getStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data) => {
    const response = await api.patch('/users/me/password', data);
    return response.data;
  },

  /**
   * Eliminar cuenta
   */
  deleteAccount: async () => {
    const response = await api.delete('/users/me');
    clearAuthData();
    return response.data;
  },
};

// =============================================
// DIAGNOSTIC ENDPOINTS
// =============================================

export const diagnosticAPI = {
  /**
   * Verificar si el usuario ya completó el diagnóstico
   */
  getStatus: async () => {
    const response = await api.get('/diagnostic/status');
    return response.data;
  },

  /**
   * Obtener preguntas del diagnóstico
   */
  getQuestions: async () => {
    const response = await api.get('/diagnostic/questions');
    return response.data;
  },

  /**
   * Enviar respuestas del diagnóstico
   * @param {Array} answers - Array de objetos {question_id, option_id}
   */
  submit: async (answers) => {
    const response = await api.post('/diagnostic/submit', { answers });
    return response.data;
  },

  /**
   * Obtener resultado del diagnóstico (método recomendado)
   */
  getResult: async () => {
    const response = await api.get('/diagnostic/result');
    return response.data;
  },
};

// =============================================
// FLASHCARDS ENDPOINTS (Colecciones y Tarjetas)
// =============================================

export const flashcardsAPI = {
  /**
   * Obtener todas las colecciones del usuario
   */
  getCollections: async () => {
    const response = await api.get('/flashcards/collections');
    return response.data;
  },

  /**
   * Crear nueva colección
   */
  createCollection: async (data) => {
    const response = await api.post('/flashcards/collections', {
      collection_name: data.collection_name,
      collection_color: data.collection_color || '3B82F6'
    });
    return response.data;
  },

  /**
   * Obtener una colección con sus flashcards
   */
  getCollectionWithCards: async (collectionId) => {
    const response = await api.get(`/flashcards/collections/${collectionId}`);
    return response.data;
  },

  /**
   * Actualizar colección
   */
  updateCollection: async (collectionId, data) => {
    const response = await api.put(`/flashcards/collections/${collectionId}`, data);
    return response.data;
  },

  /**
   * Eliminar colección (y todas sus flashcards)
   */
  deleteCollection: async (collectionId) => {
    const response = await api.delete(`/flashcards/collections/${collectionId}`);
    return response.data;
  },

  /**
   * Crear nueva flashcard en una colección
   * @param {number} collectionId - ID de la colección
   * @param {object} data - {question, answer}
   * Nota: card_user se obtiene automáticamente del token en el backend
   */
  createCard: async (collectionId, data) => {
    const response = await api.post(`/flashcards/collections/${collectionId}/cards`, {
      question: data.question,
      answer: data.answer,
      is_reversed: data.is_reversed || false,
      flashcard_color: data.flashcard_color || null
    });
    return response.data;
  },

  /**
   * Obtener una flashcard específica
   */
  getCard: async (cardId) => {
    const response = await api.get(`/flashcards/cards/${cardId}`);
    return response.data;
  },

  /**
   * Actualizar flashcard
   */
  updateCard: async (cardId, data) => {
    const response = await api.put(`/flashcards/cards/${cardId}`, data);
    return response.data;
  },

  /**
   * Eliminar flashcard
   */
  deleteCard: async (cardId) => {
    const response = await api.delete(`/flashcards/cards/${cardId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de flashcards del usuario
   */
  getStats: async () => {
    const response = await api.get('/flashcards/stats');
    return response.data;
  },

  /**
   * Obtener todas las flashcards del usuario
   */
  getAllCards: async (skip = 0, limit = 100) => {
    const response = await api.get(`/flashcards/cards?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// =============================================
// FLASHCARD SESSIONS ENDPOINTS
// =============================================

export const flashcardSessionAPI = {
  /**
   * Crear nueva sesión de estudio
   */
  createSession: async (data) => {
    const response = await api.post('/method-work/flashcard-sessions', data);
    return response.data;
  },

  /**
   * Obtener todas las sesiones del usuario
   */
  getSessions: async (skip = 0, limit = 20) => {
    const response = await api.get(`/method-work/flashcard-sessions?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Obtener una sesión específica
   */
  getSession: async (sessionId) => {
    const response = await api.get(`/method-work/flashcard-sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Eliminar sesión
   */
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/method-work/flashcard-sessions/${sessionId}`);
    return response.data;
  },
};

// =============================================
// FEYNMAN ENDPOINTS
// =============================================

export const feynmanAPI = {
  /**
   * Crear nuevo trabajo Feynman
   */
  createWork: async (data) => {
    const response = await api.post('/method-work/feynman', data);
    return response.data;
  },

  /**
   * Obtener todos los trabajos del usuario
   */
  getWorks: async (skip = 0, limit = 20) => {
    const response = await api.get(`/method-work/feynman?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Obtener un trabajo específico
   */
  getWork: async (feynmanId) => {
    const response = await api.get(`/method-work/feynman/${feynmanId}`);
    return response.data;
  },

  /**
   * Actualizar trabajo existente
   */
  updateWork: async (feynmanId, data) => {
    const response = await api.put(`/method-work/feynman/${feynmanId}`, data);
    return response.data;
  },

  /**
   * Eliminar trabajo
   */
  deleteWork: async (feynmanId) => {
    const response = await api.delete(`/method-work/feynman/${feynmanId}`);
    return response.data;
  },
};

// =============================================
// CORNELL ENDPOINTS
// =============================================

export const cornellAPI = {
  /**
   * Crear nueva nota Cornell
   */
  createNote: async (data) => {
    const response = await api.post('/method-work/cornell', data);
    return response.data;
  },

  /**
   * Obtener todas las notas del usuario
   */
  getNotes: async (skip = 0, limit = 20) => {
    const response = await api.get(`/method-work/cornell?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Obtener una nota específica
   */
  getNote: async (noteId) => {
    const response = await api.get(`/method-work/cornell/${noteId}`);
    return response.data;
  },

  /**
   * Actualizar nota existente
   */
  updateNote: async (noteId, data) => {
    const response = await api.put(`/method-work/cornell/${noteId}`, data);
    return response.data;
  },

  /**
   * Eliminar nota
   */
  deleteNote: async (noteId) => {
    const response = await api.delete(`/method-work/cornell/${noteId}`);
    return response.data;
  },
};

// =============================================
// TRACKING ENDPOINTS
// =============================================

export const trackingAPI = {
  /**
   * Crear nueva sesión de seguimiento
   */
  createSession: async (data) => {
    const response = await api.post('/progress/tracking/sessions', data);
    return response.data;
  },

  /**
   * Obtener sesiones (últimos N días)
   */
  getSessions: async (days = 7) => {
    const response = await api.get(`/progress/tracking/sessions?days=${days}`);
    return response.data;
  },

  /**
   * Obtener estadísticas semanales
   */
  getStats: async (days = 7) => {
    const response = await api.get(`/progress/tracking/stats?days=${days}`);
    return response.data;
  },

  /**
   * Eliminar una sesión
   */
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/progress/tracking/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Reiniciar semana (eliminar todas las sesiones)
   */
  resetWeek: async () => {
    const response = await api.delete('/progress/tracking/sessions');
    return response.data;
  },

  /**
   * Obtener preferencias (meta y logros)
   */
  getPreferences: async () => {
    const response = await api.get('/progress/tracking/preferences');
    return response.data;
  },

  /**
   * Actualizar meta semanal
   */
  updatePreferences: async (data) => {
    const response = await api.put('/progress/tracking/preferences', data);
    return response.data;
  },
};

// =============================================
// DASHBOARD ENDPOINTS
// =============================================

export const dashboardAPI = {
  /**
   * Crear sesión de estudio
   */
  createSession: async (data) => {
    const response = await api.post('/dashboard/session', data);
    return response.data;
  },

  /**
   * Obtener resumen del dashboard
   */
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  /**
   * Obtener historial de sesiones
   */
  getHistory: async (skip = 0, limit = 10) => {
    const response = await api.get(`/dashboard/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Obtener estadísticas mensuales
   */
  getMonthlyStats: async (year, month) => {
    const response = await api.get(`/dashboard/monthly/${year}/${month}`);
    return response.data;
  },
};

// =============================================
// SESSIONS ENDPOINTS (Pomodoro)
// =============================================

export const sessionsAPI = {
  /**
   * Crear nueva sesión de estudio
   */
  createSession: async (data) => {
    const response = await api.post('/sessions', data);
    return response.data;
  },

  /**
   * Obtener sesiones del usuario
   */
  getSessions: async (skip = 0, limit = 20) => {
    const response = await api.get(`/sessions?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Obtener una sesión específica
   */
  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Finalizar sesión
   */
  endSession: async (sessionId, data) => {
    const response = await api.put(`/sessions/${sessionId}/end`, data);
    return response.data;
  },

  /**
   * Eliminar sesión
   */
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },
};

// =============================================
// CALENDAR ENDPOINTS
// =============================================

export const calendarAPI = {
  /**
   * Obtener bloques del calendario
   */
  getBlocks: async () => {
    const response = await api.get('/calendar/blocks');
    return response.data;
  },

  /**
   * Crear bloque de estudio
   */
  createBlock: async (data) => {
    const response = await api.post('/calendar/blocks', data);
    return response.data;
  },

  /**
   * Actualizar bloque
   */
  updateBlock: async (blockId, data) => {
    const response = await api.put(`/calendar/blocks/${blockId}`, data);
    return response.data;
  },

  /**
   * Eliminar bloque
   */
  deleteBlock: async (blockId) => {
    const response = await api.delete(`/calendar/blocks/${blockId}`);
    return response.data;
  },

  /**
   * Limpiar todos los bloques
   */
  clearAll: async () => {
    const response = await api.delete('/calendar/blocks');
    return response.data;
  },
};

export default api;
