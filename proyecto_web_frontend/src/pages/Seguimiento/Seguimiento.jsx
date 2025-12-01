import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingAPI } from '../../services/api';

function Seguimiento() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para nueva sesión de estudio
  const [newSession, setNewSession] = useState({
    day: '',
    hours: '',
    method: 'pomodoro',
    description: ''
  });

  // Estado para datos del backend
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState({ weekly_goal: 20, achievements: [] });

  // Días de la semana
  const daysOfWeek = [
    { id: 'lunes', name: 'Lun', fullName: 'Lunes' },
    { id: 'martes', name: 'Mar', fullName: 'Martes' },
    { id: 'miercoles', name: 'Mié', fullName: 'Miércoles' },
    { id: 'jueves', name: 'Jue', fullName: 'Jueves' },
    { id: 'viernes', name: 'Vie', fullName: 'Viernes' },
    { id: 'sabado', name: 'Sáb', fullName: 'Sábado' },
    { id: 'domingo', name: 'Dom', fullName: 'Domingo' }
  ];

  // Métodos disponibles
  const methods = [
    { id: 'pomodoro', name: 'Pomodoro', color: 'from-red-400 to-red-600', icon: '🍅' },
    { id: 'feynman', name: 'Feynman', color: 'from-purple-400 to-purple-600', icon: '🧠' },
    { id: 'cornell', name: 'Cornell', color: 'from-blue-400 to-blue-600', icon: '📝' },
    { id: 'flashcards', name: 'Flashcards', color: 'from-yellow-400 to-orange-600', icon: '🗂️' }
  ];

  // Logros disponibles
  const availableAchievements = [
    { id: 'first_session', name: 'Primera Sesión', icon: '🎯', description: 'Registra tu primera sesión de estudio' },
    { id: 'week_goal', name: 'Meta Semanal', icon: '⭐', description: 'Cumple tu meta semanal de horas' },
    { id: 'streak_3', name: '3 Días Seguidos', icon: '🔥', description: 'Estudia 3 días consecutivos' },
    { id: 'total_20h', name: '20 Horas Totales', icon: '💪', description: 'Acumula 20 horas de estudio' },
    { id: 'all_methods', name: 'Explorador', icon: '🧩', description: 'Prueba todos los métodos' },
    { id: 'streak_7', name: 'Semana Perfecta', icon: '👑', description: 'Estudia todos los días de la semana' }
  ];

  // Cargar datos del backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sessionsData, statsData, prefsData] = await Promise.all([
        trackingAPI.getSessions(7),
        trackingAPI.getStats(7),
        trackingAPI.getPreferences()
      ]);
      
      setSessions(sessionsData);
      setStats(statsData);
      setPreferences(prefsData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular horas por día
  const getHoursByDay = (day) => {
    return stats?.hours_by_day?.[day] || 0;
  };

  // Calcular horas totales
  const getTotalWeekHours = () => {
    return stats?.total_hours || 0;
  };

  // Obtener método más usado
  const getMostUsedMethod = () => {
    if (!stats?.most_used_method) return null;
    
    const methodData = methods.find(m => m.id === stats.most_used_method);
    const methodStats = stats.method_stats?.[stats.most_used_method];
    
    if (!methodData || !methodStats) return null;
    
    return {
      ...methodData,
      percentage: methodStats.percentage
    };
  };

  // Agregar nueva sesión
  const handleAddSession = async () => {
    if (!newSession.day || !newSession.hours) {
      alert('Por favor completa el día y las horas');
      return;
    }

    try {
      await trackingAPI.createSession({
        day_of_week: newSession.day,
        hours: parseFloat(newSession.hours),
        method: newSession.method,
        description: newSession.description || null
      });

      // Reset form
      setNewSession({
        day: '',
        hours: '',
        method: 'pomodoro',
        description: ''
      });

      setShowAddModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Recargar datos
      await loadData();
    } catch (err) {
      console.error('Error agregando sesión:', err);
      alert('Error al guardar la sesión: ' + err.message);
    }
  };

  // Eliminar sesión
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('¿Estás seguro de eliminar esta sesión?')) {
      try {
        await trackingAPI.deleteSession(sessionId);
        await loadData();
      } catch (err) {
        console.error('Error eliminando sesión:', err);
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  // Actualizar meta semanal
  const handleUpdateGoal = async (newGoal) => {
    const goalValue = parseFloat(newGoal);
    if (isNaN(goalValue) || goalValue <= 0) return;
    
    try {
      const updated = await trackingAPI.updatePreferences({ weekly_goal: goalValue });
      setPreferences(updated);
    } catch (err) {
      console.error('Error actualizando meta:', err);
    }
  };

  // Reiniciar semana
  const handleResetWeek = async () => {
    if (window.confirm('¿Estás seguro de reiniciar la semana? Se borrarán todas las sesiones registradas.')) {
      try {
        await trackingAPI.resetWeek();
        await loadData();
      } catch (err) {
        console.error('Error reiniciando semana:', err);
        alert('Error al reiniciar: ' + err.message);
      }
    }
  };

  // Calcular progreso de meta
  const goalProgress = Math.min((getTotalWeekHours() / preferences.weekly_goal) * 100, 100);

  // Mensaje motivacional
  const getMotivationalMessage = () => {
    const totalHours = getTotalWeekHours();
    const goal = preferences.weekly_goal;

    if (totalHours === 0) {
      return '¡Es hora de comenzar! Registra tu primera sesión de estudio 💪';
    } else if (totalHours < goal * 0.3) {
      return '¡Buen comienzo! Sigue así y alcanzarás tu meta 🚀';
    } else if (totalHours < goal * 0.7) {
      return '¡Vas por buen camino! Ya llevas más de la mitad 📈';
    } else if (totalHours < goal) {
      return '¡Casi lo logras! Un último empujón para la meta 🎯';
    } else {
      return '¡Felicidades! Superaste tu meta semanal 🏆';
    }
  };

  const mostUsedMethod = getMostUsedMethod();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-blue-400 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            📊 Seguimiento
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Tu Progreso Semanal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Registra tus sesiones de estudio y observa tu progreso día a día
          </p>
        </div>

        {/* Mensaje Motivacional */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-2xl p-6 text-center mb-8 animate-fade-in">
          <p className="text-lg font-semibold text-gray-800">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">

          {/* Columna Izquierda - Estadísticas */}
          <div className="lg:col-span-2 space-y-6">

            {/* Resumen Semanal */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  📈 Resumen Semanal
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  + Agregar Sesión
                </button>
              </div>

              {/* Horas Totales y Meta */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 mb-2 font-medium">Horas Esta Semana</p>
                  <p className="text-5xl font-bold text-blue-600">{getTotalWeekHours()}</p>
                  <p className="text-gray-500 mt-2">de {preferences.weekly_goal} horas</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                  <p className="text-gray-600 mb-4 font-medium text-center">Meta Semanal</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={preferences.weekly_goal}
                      onChange={(e) => handleUpdateGoal(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-center font-bold text-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      min="1"
                      max="100"
                    />
                    <span className="text-gray-700 font-medium">hrs</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${goalProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">{goalProgress.toFixed(0)}% completado</p>
                  </div>
                </div>
              </div>

              {/* Gráfica de Barras por Día */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso Diario</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                  {daysOfWeek.map((day) => {
                    const hours = getHoursByDay(day.id);
                    const maxHeight = 8;
                    const heightPercentage = Math.min((hours / maxHeight) * 100, 100);

                    return (
                      <div key={day.id} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                          {hours > 0 && (
                            <>
                              <span className="text-xs font-bold text-gray-700 mb-1">{hours}h</span>
                              <div
                                className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg transition-all duration-500"
                                style={{ height: `${heightPercentage}%`, minHeight: hours > 0 ? '20px' : '0' }}
                              ></div>
                            </>
                          )}
                          {hours === 0 && (
                            <div className="w-full bg-gray-200 rounded-lg h-5"></div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-600 mt-2">{day.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Método Más Usado */}
              {mostUsedMethod && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Método Más Usado</h3>
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${mostUsedMethod.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                      {mostUsedMethod.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-gray-800">{mostUsedMethod.name}</p>
                      <p className="text-gray-600">Usado en el {mostUsedMethod.percentage}% de tus sesiones</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Sesiones */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📝 Historial de Sesiones
              </h2>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600 text-lg">Aún no has registrado ninguna sesión</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
                  >
                    Registrar Primera Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.map((session) => {
                    const method = methods.find(m => m.id === session.method) || methods[0];
                    const day = daysOfWeek.find(d => d.id === session.day_of_week);

                    return (
                      <div key={session.session_id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all duration-300">
                        <div className={`bg-gradient-to-br ${method.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{day?.fullName || session.day_of_week}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-600 font-semibold">{session.hours}h</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{method.name}</span>
                          </div>
                          {session.description && (
                            <p className="text-sm text-gray-600">{session.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSession(session.session_id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Logros */}
          <div className="space-y-6">

            {/* Logros */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🏆 Logros
              </h2>

              <div className="space-y-4">
                {availableAchievements.map((achievement) => {
                  const isUnlocked = preferences.achievements.includes(achievement.id);

                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        {isUnlocked && (
                          <div className="text-green-500 text-2xl">✓</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Acciones</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  + Agregar Sesión
                </button>
                <button
                  onClick={handleResetWeek}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
                >
                  🔄 Reiniciar Semana
                </button>
                <button
                  onClick={() => navigate('/metodos-estudio')}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  ← Volver a Métodos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Agregar Sesión */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Sesión de Estudio</h2>

              <div className="space-y-4">
                {/* Día */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Día *</label>
                  <select
                    value={newSession.day}
                    onChange={(e) => setNewSession({...newSession, day: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">Selecciona un día</option>
                    {daysOfWeek.map(day => (
                      <option key={day.id} value={day.id}>{day.fullName}</option>
                    ))}
                  </select>
                </div>

                {/* Horas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horas de estudio *</label>
                  <input
                    type="number"
                    value={newSession.hours}
                    onChange={(e) => setNewSession({...newSession, hours: e.target.value})}
                    placeholder="Ej: 2.5"
                    step="0.5"
                    min="0.5"
                    max="12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                {/* Método */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Método usado *</label>
                  <select
                    value={newSession.method}
                    onChange={(e) => setNewSession({...newSession, method: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    {methods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                    placeholder="¿Qué estudiaste? ¿Cómo te fue?"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSession}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {showSuccessMessage && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 z-50">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Sesión registrada correctamente</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Seguimiento;