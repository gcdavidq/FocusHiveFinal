import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
// Asumimos que tienes el archivo api.js en la ruta '../../services/api'
import api from '../../services/api'; 

// --- Constantes de Configuración ---
const POMODORO_TIME = 25 * 60; // 25 minutos
const SHORT_BREAK_TIME = 5 * 60; // 5 minutos
const LONG_BREAK_TIME = 15 * 60; // 15 minutos

// ID de método según tu esquema (ej. FocusHive metodos.metodo_id)
const POMODORO_METODO_ID = 1; 
// Simulación de User ID (Debe ser reemplazado por un contexto de Auth real)
const SIMULATED_USER_ID = 104; // Usamos 104 como en tu log de ejemplo

// Tipos de ciclo para el estado
const CYCLE_TYPES = {
  POMODORO: 'POMODORO',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
};

// Duración por tipo de ciclo para inicialización
const CYCLE_DURATIONS = {
  [CYCLE_TYPES.POMODORO]: POMODORO_TIME,
  [CYCLE_TYPES.SHORT_BREAK]: SHORT_BREAK_TIME,
  [CYCLE_TYPES.LONG_BREAK]: LONG_BREAK_TIME,
};

const IniciarPomodoro = () => {
  const navigate = useNavigate();

  // --- Estados del Temporizador ---
  const [sessionName, setSessionName] = useState('Estudio Concentrado');
  const [currentCycle, setCurrentCycle] = useState(CYCLE_TYPES.POMODORO);
  const [timer, setTimer] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0); // Contador de pomodoros completados
  
  const [startTime, setStartTime] = useState(null); // Fecha y hora de inicio local
  const [totalDuration, setTotalDuration] = useState(0); // Duración total acumulada en segundos
  
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado crucial: Almacena la ID de la sesión creada por el backend
  const [sessionId, setSessionId] = useState(null); 

  // --- Lógica del Temporizador ---
  useEffect(() => {
    if (!isActive || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
      setTotalDuration((prevDuration) => prevDuration + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Manejar el final de un ciclo (callback memorizado)
  const handleCycleEnd = useCallback(() => {
    setIsActive(false);

    if (currentCycle === CYCLE_TYPES.POMODORO) {
      // Pomodoro terminado
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);

      // Determinar el siguiente ciclo: Descanso Largo si es múltiplo de 4, sino Descanso Corto
      const nextCycle =
        newPomodoroCount % 4 === 0
          ? CYCLE_TYPES.LONG_BREAK
          : CYCLE_TYPES.SHORT_BREAK;

      // NOTA: Recuerda reemplazar 'alert' por un modal o toast de UI en un entorno de producción/producción.
      alert(`¡Pomodoro #${newPomodoroCount} terminado! Es hora de un descanso ${nextCycle === CYCLE_TYPES.LONG_BREAK ? 'largo' : 'corto'}. Presiona "Play" para comenzar.`);
      
      setCurrentCycle(nextCycle);
      setTimer(CYCLE_DURATIONS[nextCycle]);
    } else {
      // Descanso terminado, volver a Pomodoro
      alert('¡Descanso terminado! De vuelta al trabajo. Presiona "Play" para comenzar.');
      setCurrentCycle(CYCLE_TYPES.POMODORO);
      setTimer(POMODORO_TIME);
    }
  }, [currentCycle, pomodoroCount]);
  
  // Ejecutar el manejo de fin de ciclo cuando el timer llega a 0 y aún está activo
  useEffect(() => {
    if (isActive && timer === 0) {
      handleCycleEnd();
    }
  }, [timer, isActive, handleCycleEnd]);


  // Iniciar/Pausar el temporizador
  const toggleTimer = async () => {
    // Si se está pausando, simplemente cambia el estado
    if (isActive) {
        setIsActive(false);
        return;
    }

    // Si se está reanudando o iniciando por primera vez
    if (startTime === null) {
      // INICIO FORMAL DE LA SESIÓN (Llamada POST al backend)
      setIsLoading(true);
      setError(null);
      
      const initialData = {
          user_id: SIMULATED_USER_ID,
          metodo_id: POMODORO_METODO_ID,
          // fecha_inicio se genera en el backend por defecto, pero es bueno enviarla
          fecha_inicio: new Date().toISOString(), 
          descripcion: sessionName // Se añade la descripción inicial
      };

      try {
          const response = await api.post('/sessions', initialData); 
          
          setSessionId(response.data.session_id); // Almacena la ID para la actualización posterior
          setStartTime(initialData.fecha_inicio);
          setIsActive(true);
      } catch (err) {
          console.error('Error al iniciar sesión:', err);
          setError('Error al iniciar la sesión. Verifique el endpoint POST /sessions.');
      } finally {
          setIsLoading(false);
      }
    } else {
        // REANUDAR (la sesión ya tiene un sessionId)
        setIsActive(true);
    }
  };

  // Reiniciar el ciclo actual
  const resetCycle = () => {
    setIsActive(false);
    setTimer(CYCLE_DURATIONS[currentCycle]);
  };

  /**
   * Finaliza la sesión y llama a la API para registrar la duración final y el estado completado.
   * Utiliza el endpoint PUT /sessions/{session_id}.
   */
  const finishSession = async () => {
    // La sesión solo puede finalizarse si se inició y tiene una ID
    if (!sessionId) {
        navigate('/metodo/pomodoro'); // o mostrar un error
        return;
    }

    // Detener el temporizador y deshabilitar botones
    setIsActive(false);
    setIsLoading(true);
    setError(null);

    // Calcular duración total en minutos (al menos 1 minuto si hay progreso)
    const totalTimeElapsed = Math.ceil(totalDuration / 60);
    const durationMinutes = Math.max(1, totalTimeElapsed); 
    
    // Objeto de datos a enviar para la ACTUALIZACIÓN (SessionUpdate)
    const updateData = {
        duracion_minutos: durationMinutes,
        fue_completada: pomodoroCount > 0, // Se considera completada si hay al menos 1 pomodoro
        descripcion: `Pomodoro finalizado: ${sessionName} (${pomodoroCount} ciclos)`,
    };

    try {
        // LLamada PUT para finalizar la sesión
        await api.put(`/sessions/${sessionId}`, updateData); 

        setIsSessionFinished(true);
    } catch (err) {
        console.error('Error al finalizar la sesión:', err);
        setError(`Error al finalizar la sesión ${sessionId}. Verifique el endpoint PUT /sessions/{id}.`);
    } finally {
        setIsLoading(false);
    }
  };
  
  // Reiniciar todos los estados para una nueva sesión
  const resetFullSession = () => {
    setIsSessionFinished(false);
    setIsActive(false);
    setPomodoroCount(0);
    setTotalDuration(0);
    setStartTime(null);
    setCurrentCycle(CYCLE_TYPES.POMODORO);
    setTimer(POMODORO_TIME);
    setSessionName('Estudio Concentrado');
    setError(null);
    setSessionId(null); // Limpiar la ID de la sesión
  };

  // --- Utilidades de Formato y Estilo ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCycleColor = (cycle) => {
    switch (cycle) {
      case CYCLE_TYPES.POMODORO:
        return 'from-red-500 to-red-600';
      case CYCLE_TYPES.SHORT_BREAK:
        return 'from-green-500 to-green-600';
      case CYCLE_TYPES.LONG_BREAK:
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const cycleText = {
    [CYCLE_TYPES.POMODORO]: 'ENFOQUE',
    [CYCLE_TYPES.SHORT_BREAK]: 'DESCANSO CORTO',
    [CYCLE_TYPES.LONG_BREAK]: 'DESCANSO LARGO',
  };

  const cycleColor = getCycleColor(currentCycle);


  // --- Vista de Resumen Final ---
  if (isSessionFinished) {
    const durationMinutes = Math.ceil(totalDuration / 60);

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Sesión Pomodoro Terminada!
            </h1>
            <p className="text-gray-600 mb-8">
              Has completado tu sesión: **{sessionName}**
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-red-50 rounded-xl p-4 shadow-inner">
                <div className="text-3xl mb-2">🍅</div>
                <div className="text-2xl font-bold text-red-600">{pomodoroCount}</div>
                <div className="text-sm text-gray-600">Pomodoros Completados</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4 shadow-inner">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-orange-600">{durationMinutes}</div>
                <div className="text-sm text-gray-600">Minutos Totales</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetFullSession}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md"
              >
                🔄 Nueva Sesión Pomodoro
              </button>
              <button
                onClick={() => navigate('/seguimiento')}
                className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-all shadow-md"
              >
                📊 Ver Progreso
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Vista del Temporizador ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* Botón de Regreso */}
        <button
          onClick={() => navigate('/metodo/pomodoro')}
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-red-700 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Volver a Método Pomodoro</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Temporizador FocusHive 🍅
          </h1>

          {/* Input para el Nombre de la Sesión */}
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Escribe el nombre de tu sesión"
            className="text-xl text-center font-medium text-gray-600 w-full mb-6 p-2 border-b-2 border-red-200 focus:border-red-500 transition-colors duration-200 outline-none disabled:bg-white"
            disabled={isActive || isLoading || sessionId !== null} // Se deshabilita después de la primera sesión
          />
          
          {/* Contador de Pomodoros */}
          <div className="flex justify-center items-center mb-6 space-x-2 p-2 bg-red-50 rounded-lg max-w-xs mx-auto shadow-inner">
            <CheckCircle className="w-5 h-5 text-red-500" />
            <span className="text-md font-semibold text-gray-700">
              Pomodoros: {pomodoroCount}
            </span>
          </div>

          {/* Indicador de Ciclo */}
          <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm tracking-wider mb-8 text-white bg-gradient-to-r ${cycleColor} shadow-md`}>
            {cycleText[currentCycle]}
          </div>

          {/* Temporizador Display */}
          <div className={`text-8xl md:text-9xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r ${cycleColor}`}>
            {formatTime(timer)}
          </div>

          {/* Botones de Control */}
          <div className="flex justify-center gap-6">
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center p-4 rounded-full text-white transition-all duration-300 shadow-xl w-20 h-20 transform hover:scale-105 active:scale-95 ${
                isActive ? 'bg-red-400 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              ) : isActive ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            
            <button
              onClick={resetCycle}
              className="flex items-center justify-center p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all duration-300 w-16 h-16 shadow-md hover:shadow-lg"
              disabled={isActive || isLoading}
              title="Reiniciar ciclo actual"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Botón de Finalizar Sesión */}
          <button
            onClick={finishSession}
            // Deshabilitado si: está cargando O la sesión no se ha iniciado formalmente (sessionId === null)
            className={`mt-8 w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center shadow-lg ${
                isLoading || sessionId === null
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            disabled={isLoading || sessionId === null}
          >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                    Guardando Sesión...
                </>
            ) : (
                <>
                    <Clock className="w-5 h-5 mr-2" />
                    Finalizar y Guardar Sesión ({formatTime(totalDuration)})
                </>
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
        
        {/* Información Adicional */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tiempos Predeterminados:</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex justify-between items-center"><span className="font-semibold text-red-600">🍅 Enfoque:</span> <span>{POMODORO_TIME / 60} minutos</span></li>
                <li className="flex justify-between items-center"><span className="font-semibold text-green-600">☕ Descanso Corto:</span> <span>{SHORT_BREAK_TIME / 60} minutos</span></li>
                <li className="flex justify-between items-center"><span className="font-semibold text-blue-600">🛌 Descanso Largo (cada 4 Pomodoros):</span> <span>{LONG_BREAK_TIME / 60} minutos</span></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default IniciarPomodoro;