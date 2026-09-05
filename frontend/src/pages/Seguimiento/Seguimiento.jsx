import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { getMethodMeta, METHOD_LIST } from '../../services/methods';
import { useAsync } from '../../hooks/useAsync';
import { useUI } from '../../hooks/useUI';
import { dayLetter, formatDateTime, formatMinutes, toHours } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

const HISTORY_PAGE = 10;

function todayInputs() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

const EMPTY_SESSION = { metodo: 'pomodoro', duracion_minutos: 30, descripcion: '', ...todayInputs() };

function motivationalMessage(progress, minutes) {
  if (minutes === 0) return '¡Es hora de comenzar! Registra tu primera sesión de estudio 💪';
  if (progress < 30) return '¡Buen comienzo! Sigue así y alcanzarás tu meta 🚀';
  if (progress < 70) return '¡Vas por buen camino! Ya pasaste la mitad 📈';
  if (progress < 100) return '¡Casi lo logras! Un último empujón para la meta 🎯';
  return '¡Felicidades! Cumpliste tu meta semanal 🏆';
}

function StatCard({ icon, label, value, hint, accent = 'text-[#1e3a5f]' }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="text-gray-700 font-medium">{label}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function MethodCard({ title, usage, empty }) {
  if (!usage) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 text-center text-gray-500 text-sm">{empty}</div>
    );
  }
  const meta = getMethodMeta(usage.metodo_nombre);
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex items-center gap-4">
        <div className={`bg-gradient-to-br ${meta.color} w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg`}>{meta.icon}</div>
        <div>
          <p className="text-xl font-bold text-gray-800">{usage.metodo_titulo || meta.title}</p>
          <p className="text-gray-600 text-sm">
            {usage.total_sessions} sesión{usage.total_sessions === 1 ? '' : 'es'} · {formatMinutes(usage.total_minutes)} · {usage.percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}

/** Dashboard de progreso: métricas, racha, meta semanal, uso por método, historial y logros. */
export default function Seguimiento() {
  const navigate = useNavigate();
  const ui = useUI();

  const summary = useAsync(() => dashboardAPI.getSummary(), []);
  const catalog = useAsync(() => dashboardAPI.getAchievements(), []);
  const [historySkip, setHistorySkip] = useState(0);
  const history = useAsync(() => dashboardAPI.getHistory(historySkip, HISTORY_PAGE), [historySkip]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_SESSION);
  const [isSaving, setIsSaving] = useState(false);
  const [goalInput, setGoalInput] = useState(null);

  const reloadAll = async () => {
    await Promise.all([summary.reload(), history.reload()]);
  };

  const handleAddSession = async () => {
    const minutes = Number(form.duracion_minutos);
    if (!form.date || !form.time || !minutes || minutes < 1) {
      ui.warning('Completa la fecha, la hora y una duración válida');
      return;
    }
    setIsSaving(true);
    try {
      const response = await dashboardAPI.createSession({
        metodo: form.metodo,
        fecha_inicio: new Date(`${form.date}T${form.time}:00`).toISOString(),
        duracion_minutos: Math.min(1440, Math.round(minutes)),
        fue_completada: true,
        descripcion: form.descripcion.trim() || null,
      });
      setShowAdd(false);
      setForm({ ...EMPTY_SESSION, ...todayInputs() });
      ui.success(
        response.new_achievements?.length ? `Sesión registrada. ¡Nuevo logro: ${response.new_achievements.length}!` : 'Sesión registrada correctamente',
      );
      await reloadAll();
    } catch (error) {
      ui.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (session) => {
    const ok = await ui.confirm({
      title: 'Eliminar sesión',
      message: `Se restarán ${formatMinutes(session.duracion_minutos)} de tu tiempo total.`,
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await dashboardAPI.deleteSession(session.session_id);
      ui.success('Sesión eliminada');
      await reloadAll();
    } catch (error) {
      ui.error(error.message);
    }
  };

  const handleSaveGoal = async () => {
    const value = Number(goalInput);
    if (!value || value <= 0 || value > 168) {
      ui.warning('La meta debe estar entre 1 y 168 horas');
      return;
    }
    try {
      await dashboardAPI.updatePreferences({ weekly_goal_hours: value });
      setGoalInput(null);
      ui.success('Meta semanal actualizada');
      await summary.reload();
    } catch (error) {
      ui.error(error.message);
    }
  };

  if (summary.loading && !summary.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <FullPageSpinner label="Cargando tu progreso..." />
      </div>
    );
  }
  if (summary.error || !summary.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <ErrorState message={summary.error || 'Sin datos'} onRetry={summary.reload} />
      </div>
    );
  }

  const data = summary.data;
  const breakdown = data.weekly_progress?.daily_breakdown || [];
  const maxDayMinutes = Math.max(...breakdown.map((day) => day.total_minutes), 60);
  const unlocked = new Set(data.achievements || []);
  const achievements = catalog.data || [];
  const sessions = history.data?.sessions || [];
  const totalPages = history.data?.pages || 1;
  const currentPage = history.data?.page || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-blue-400 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            📊 Mi progreso
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Hola, {data.username}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{motivationalMessage(data.week_goal_progress, data.week_minutes)}</p>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="⏱️" label="Hoy" value={formatMinutes(data.today_minutes)} hint={`${data.today_sessions} sesión${data.today_sessions === 1 ? '' : 'es'}`} />
          <StatCard icon="📅" label="Esta semana" value={`${toHours(data.week_minutes)} h`} hint={`Meta: ${data.weekly_goal_hours} h`} accent="text-blue-600" />
          <StatCard
            icon="🔥"
            label="Racha actual"
            value={`${data.study_streak.current_streak} día${data.study_streak.current_streak === 1 ? '' : 's'}`}
            hint={`Récord: ${data.study_streak.longest_streak}`}
            accent="text-orange-600"
          />
          <StatCard icon="🏅" label={`Nivel ${data.level}`} value={`${toHours(data.total_studied_time)} h`} hint="Tiempo total de estudio" accent="text-purple-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Semana */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📈 Resumen semanal</h2>
                <button
                  onClick={() => {
                    setForm({ ...EMPTY_SESSION, ...todayInputs() });
                    setShowAdd(true);
                  }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg"
                >
                  + Registrar sesión
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 mb-2 font-medium">Horas esta semana</p>
                  <p className="text-5xl font-bold text-blue-600">{toHours(data.week_minutes)}</p>
                  <p className="text-gray-500 mt-2">
                    de {data.weekly_goal_hours} h · {data.weekly_progress.total_sessions} sesiones
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                  <p className="text-gray-600 mb-3 font-medium text-center">Meta semanal</p>
                  {goalInput === null ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-bold text-purple-700">{data.weekly_goal_hours} h</span>
                      <button onClick={() => setGoalInput(String(data.weekly_goal_hours))} className="text-sm text-purple-700 underline hover:no-underline">
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="168"
                        step="0.5"
                        value={goalInput}
                        onChange={(event) => setGoalInput(event.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-center font-bold text-xl focus:border-purple-500 outline-none"
                        aria-label="Meta semanal en horas"
                      />
                      <button onClick={handleSaveGoal} className="bg-purple-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-purple-700">
                        Guardar
                      </button>
                      <button onClick={() => setGoalInput(null)} className="text-gray-500 px-2" aria-label="Cancelar">
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${data.week_goal_progress}%` }} />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">{Math.round(data.week_goal_progress)}% completado</p>
                  </div>
                </div>
              </div>

              {/* Barras por día */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso diario</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                  {breakdown.map((day) => {
                    const height = (day.total_minutes / maxDayMinutes) * 100;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center" title={`${day.date}: ${formatMinutes(day.total_minutes)}`}>
                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                          {day.total_minutes > 0 ? (
                            <>
                              <span className="text-xs font-bold text-gray-700 mb-1">{toHours(day.total_minutes)}h</span>
                              <div className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(height, 8)}%` }} />
                            </>
                          ) : (
                            <div className="w-full bg-gray-200 rounded-lg h-2" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-600 mt-2">{dayLetter(day.date)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <MethodCard title="Recomendado por tu diagnóstico" usage={data.recommended_method} empty="Completa el cuestionario para recibir una recomendación." />
                <MethodCard title="Tu método más usado" usage={data.most_used_method} empty="Registra sesiones para ver cuál usas más." />
              </div>

              {data.methods_usage?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Distribución por método</h3>
                  <div className="space-y-2">
                    {data.methods_usage.map((usage) => {
                      const meta = getMethodMeta(usage.metodo_nombre);
                      return (
                        <div key={usage.metodo_id} className="flex items-center gap-3 text-sm">
                          <span className="w-6 text-center">{meta.icon}</span>
                          <span className="w-32 text-gray-700 truncate">{usage.metodo_titulo}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full bg-gradient-to-r ${meta.color}`} style={{ width: `${usage.percentage}%` }} />
                          </div>
                          <span className="w-24 text-right text-gray-600">{formatMinutes(usage.total_minutes)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Historial */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Historial de sesiones</h2>
              {history.loading && !history.data ? (
                <p className="text-gray-500">Cargando historial...</p>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600 text-lg">Aún no has registrado ninguna sesión</p>
                  <p className="text-gray-500 text-sm mt-2">Usa el temporizador Pomodoro, repasa flashcards o registra una sesión manual.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {sessions.map((session) => {
                      const meta = getMethodMeta(session.metodo_nombre);
                      return (
                        <div key={session.session_id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all">
                          <div className={`bg-gradient-to-br ${meta.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>{meta.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-bold text-gray-800">{session.metodo_titulo}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-blue-600 font-semibold">{formatMinutes(session.duracion_minutos)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 text-sm">{formatDateTime(session.fecha_inicio)}</span>
                              {!session.fue_completada && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Incompleta</span>}
                            </div>
                            {session.descripcion && <p className="text-sm text-gray-600 truncate">{session.descripcion}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteSession(session)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                            aria-label="Eliminar sesión"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 text-sm">
                      <button
                        onClick={() => setHistorySkip((skip) => Math.max(0, skip - HISTORY_PAGE))}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >
                        ← Anteriores
                      </button>
                      <span className="text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setHistorySkip((skip) => skip + HISTORY_PAGE)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                      >
                        Siguientes →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Logros</h2>
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const isUnlocked = unlocked.has(achievement.code);
                  return (
                    <div
                      key={achievement.code}
                      className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                        isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        {isUnlocked && <div className="text-green-500 text-2xl">✓</div>}
                      </div>
                    </div>
                  );
                })}
                {achievements.length === 0 && <p className="text-gray-500 text-sm">Cargando logros...</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Estudiar ahora</h2>
              <div className="space-y-3">
                {METHOD_LIST.map((method) => (
                  <button
                    key={method.name}
                    onClick={() => navigate(method.startRoute)}
                    className={`w-full bg-gradient-to-r ${method.color} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2`}
                  >
                    <span>{method.icon}</span>
                    {method.title}
                  </button>
                ))}
                <button onClick={() => navigate('/calendario')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                  📅 Planificar mi semana
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registrar sesión de estudio">
          <p className="text-sm text-gray-500 mb-4">¿Estudiaste sin la app? Registra la sesión manualmente para que cuente en tu progreso.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="session-method">
                Método *
              </label>
              <select
                id="session-method"
                value={form.metodo}
                onChange={(event) => setForm({ ...form, metodo: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {METHOD_LIST.map((method) => (
                  <option key={method.name} value={method.name}>
                    {method.icon} {method.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="session-date">
                  Fecha *
                </label>
                <input
                  id="session-date"
                  type="date"
                  value={form.date}
                  max={todayInputs().date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="session-time">
                  Hora de inicio *
                </label>
                <input
                  id="session-time"
                  type="time"
                  value={form.time}
                  onChange={(event) => setForm({ ...form, time: event.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="session-minutes">
                Duración en minutos *
              </label>
              <input
                id="session-minutes"
                type="number"
                min="1"
                max="1440"
                step="5"
                value={form.duracion_minutos}
                onChange={(event) => setForm({ ...form, duracion_minutos: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="session-notes">
                Descripción (opcional)
              </label>
              <textarea
                id="session-notes"
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                placeholder="¿Qué estudiaste? ¿Cómo te fue?"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button
              onClick={handleAddSession}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
