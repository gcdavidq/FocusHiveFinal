/**
 * Metadatos visuales de los cuatro métodos de estudio, indexados por su nombre en el backend.
 * El backend es la fuente de verdad para ids, títulos y descripciones; aquí solo viven
 * iconos, colores y rutas del frontend.
 */
export const METHODS = {
  pomodoro: {
    name: 'pomodoro',
    title: 'Técnica Pomodoro',
    icon: '🍅',
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    infoRoute: '/metodo/pomodoro',
    startRoute: '/iniciar-pomodoro',
    shortDescription: 'Trabaja en intervalos de 25 minutos con descansos de 5 minutos',
    benefits: ['Combate la procrastinación', 'Mejora la concentración', 'Gestiona mejor el tiempo'],
  },
  feynman: {
    name: 'feynman',
    title: 'Técnica Feynman',
    icon: '🧠',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    infoRoute: '/metodo/feynman',
    startRoute: '/iniciar/feynman',
    shortDescription: 'Aprende explicando conceptos con tus propias palabras simples',
    benefits: ['Comprensión profunda', 'Identifica vacíos', 'Mejora la retención'],
  },
  cornell: {
    name: 'cornell',
    title: 'Método Cornell',
    icon: '📝',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    infoRoute: '/metodo/cornell',
    startRoute: '/iniciar/cornell',
    shortDescription: 'Sistema de apuntes organizado en tres secciones estratégicas',
    benefits: ['Apuntes organizados', 'Repaso efectivo', 'Retención a largo plazo'],
  },
  flashcards: {
    name: 'flashcards',
    title: 'Flashcards',
    icon: '🗂️',
    color: 'from-yellow-400 to-orange-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    infoRoute: '/metodo/flashcards',
    startRoute: '/iniciar/flashcards',
    shortDescription: 'Tarjetas de estudio para memorizar mediante repetición activa',
    benefits: ['Memorización efectiva', 'Aprendizaje a largo plazo', 'Identifica debilidades'],
  },
};

export const METHOD_LIST = Object.values(METHODS);

/** Devuelve los metadatos de un método por nombre; si no existe, un fallback neutro. */
export function getMethodMeta(name) {
  return (
    METHODS[String(name || '').toLowerCase()] || {
      name: name || 'desconocido',
      title: name || 'Método',
      icon: '📚',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700',
      infoRoute: '/metodos-estudio',
      startRoute: '/metodos-estudio',
      shortDescription: '',
      benefits: [],
    }
  );
}
