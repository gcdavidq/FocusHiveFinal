/** Minutos → "1 h 05 min" / "45 min". */
export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${String(rest).padStart(2, '0')} min`;
}

/** Segundos → "mm:ss". */
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** Fecha ISO → "5 sep 2026, 14:30" en español. */
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Fecha ISO → "5 sep 2026". */
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

/** "2026-09-05" → "S" (letra del día de la semana). */
export function dayLetter(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return DAY_LETTERS[date.getDay()] || '';
}

/** Redondea a un decimal para mostrar horas. */
export function toHours(minutes, decimals = 1) {
  return Number(((Number(minutes) || 0) / 60).toFixed(decimals));
}
