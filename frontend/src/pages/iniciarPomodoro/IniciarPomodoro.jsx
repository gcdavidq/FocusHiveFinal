import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Pause, Play, RotateCcw } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { useUI } from '../../hooks/useUI';
import { formatClock } from '../../utils/format';

const CYCLE = { FOCUS: 'FOCUS', SHORT_BREAK: 'SHORT_BREAK', LONG_BREAK: 'LONG_BREAK' };

const FOCUS_PRESETS = [15, 25, 45, 50];
const DEFAULT_DURATIONS = { [CYCLE.FOCUS]: 25 * 60, [CYCLE.SHORT_BREAK]: 5 * 60, [CYCLE.LONG_BREAK]: 15 * 60 };

const CYCLE_META = {
  [CYCLE.FOCUS]: { label: 'ENFOQUE', color: 'from-red-500 to-red-600' },
  [CYCLE.SHORT_BREAK]: { label: 'DESCANSO CORTO', color: 'from-green-500 to-green-600' },
  [CYCLE.LONG_BREAK]: { label: 'DESCANSO LARGO', color: 'from-blue-500 to-blue-600' },
};

/** Sonido breve al terminar un ciclo; falla silenciosamente si el navegador lo bloquea. */
function beep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    /* sin audio */
  }
}

/**
 * Temporizador Pomodoro. Al finalizar, registra la sesión en el dashboard con el tiempo
 * de enfoque real (los descansos no cuentan como estudio).
 */
export default function IniciarPomodoro() {
  const navigate = useNavigate();
  const ui = useUI();

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [sessionName, setSessionName] = useState('Estudio concentrado');
  const [cycle, setCycle] = useState(CYCLE.FOCUS);
  const [timer, setTimer] = useState(DEFAULT_DURATIONS[CYCLE.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;

  const durations = { ...DEFAULT_DURATIONS, [CYCLE.FOCUS]: focusMinutes * 60 };

  // Tic del temporizador
  useEffect(() => {
    if (!isActive) return undefined;
    const interval = setInterval(() => {
      setTimer((seconds) => Math.max(0, seconds - 1));
      if (cycleRef.current === CYCLE.FOCUS) {
        setFocusSeconds((seconds) => seconds + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleCycleEnd = useCallback(() => {
    setIsActive(false);
    beep();
    if (cycle === CYCLE.FOCUS) {
      const completed = pomodoroCount + 1;
      setPomodoroCount(completed);
      const next = completed % 4 === 0 ? CYCLE.LONG_BREAK : CYCLE.SHORT_BREAK;
      setCycle(next);
      setTimer(durations[next]);
      ui.success(`¡Pomodoro #${completed} terminado! Toca play para iniciar el descanso ${next === CYCLE.LONG_BREAK ? 'largo' : 'corto'}.`);
    } else {
      setCycle(CYCLE.FOCUS);
      setTimer(durations[CYCLE.FOCUS]);
      ui.info('Descanso terminado. ¡De vuelta al enfoque!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, pomodoroCount, focusMinutes]);

  useEffect(() => {
    if (isActive && timer === 0) handleCycleEnd();
  }, [timer, isActive, handleCycleEnd]);

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      return;
    }
    if (!startedAt) setStartedAt(new Date());
    setIsActive(true);
  };

  const resetCycle = () => {
    setIsActive(false);
    setTimer(durations[cycle]);
  };

  const changeFocusPreset = (minutes) => {
    if (startedAt) return;
    setFocusMinutes(minutes);
    setCycle(CYCLE.FOCUS);
    setTimer(minutes * 60);
  };

  const finishSession = async () => {
    if (!startedAt || focusSeconds === 0) {
      ui.warning('Inicia el temporizador antes de finalizar la sesión.');
      return;
    }
    setIsActive(false);
    setIsSaving(true);
    const durationMinutes = Math.min(1440, Math.max(1, Math.round(focusSeconds / 60)));
    try {
      const response = await dashboardAPI.createSession({
        metodo: 'pomodoro',
        fecha_inicio: startedAt.toISOString(),
        duracion_minutos: durationMinutes,
        fue_completada: pomodoroCount > 0,
        descripcion: `${sessionName.trim() || 'Pomodoro'} · ${pomodoroCount} pomodoro(s) de ${focusMinutes} min`,
      });
      setSummary({ durationMinutes, newAchievements: response.new_achievements || [] });
      ui.success('Sesión registrada en tu progreso');
    } catch (error) {
      ui.error(error.message || 'No se pudo guardar la sesión');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = () => {
    setSummary(null);
    setIsActive(false);
    setPomodoroCount(0);
    setFocusSeconds(0);
    setStartedAt(null);
    setCycle(CYCLE.FOCUS);
    setTimer(focusMinutes * 60);
    setSessionName('Estudio concentrado');
  };

  if (summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Sesión Pomodoro terminada!</h1>
          <p className="text-gray-600 mb-8">
            Completaste <strong>{sessionName}</strong>
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-3xl mb-2">🍅</div>
              <div className="text-2xl font-bold text-red-600">{pomodoroCount}</div>
              <div className="text-sm text-gray-600">Pomodoros completos</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-orange-600">{summary.durationMinutes}</div>
              <div className="text-sm text-gray-600">Minutos de enfoque</div>
            </div>
          </div>
          {summary.newAchievements.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8 text-yellow-800 font-semibold">
              🏆 ¡Nuevo logro desbloqueado! Revísalo en tu progreso.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={resetAll} className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md">
              🔄 Nueva sesión
            </button>
            <button onClick={() => navigate('/seguimiento')} className="flex-1 px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2a4a6f] transition-all shadow-md">
              📊 Ver mi progreso
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meta = CYCLE_META[cycle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate('/metodo/pomodoro')}
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-red-700 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Volver a Método Pomodoro</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Temporizador FocusHive 🍅</h1>

          <input
            type="text"
            value={sessionName}
            onChange={(event) => setSessionName(event.target.value)}
            placeholder="¿Qué vas a estudiar?"
            maxLength={80}
            className="text-xl text-center font-medium text-gray-600 w-full mb-6 p-2 border-b-2 border-red-200 focus:border-red-500 transition-colors duration-200 outline-none disabled:bg-white"
            disabled={isActive || isSaving}
          />

          {/* Duración del bloque de enfoque */}
          <div className="flex justify-center gap-2 mb-6" role="group" aria-label="Duración del enfoque">
            {FOCUS_PRESETS.map((minutes) => (
              <button
                key={minutes}
                onClick={() => changeFocusPreset(minutes)}
                disabled={Boolean(startedAt)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
                  focusMinutes === minutes ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>

          <div className="flex justify-center items-center mb-6 space-x-2 p-2 bg-red-50 rounded-lg max-w-xs mx-auto">
            <CheckCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-gray-700">Pomodoros: {pomodoroCount}</span>
          </div>

          <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm tracking-wider mb-8 text-white bg-gradient-to-r ${meta.color} shadow-md`}>
            {meta.label}
          </div>

          <div className={`text-8xl md:text-9xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r ${meta.color} tabular-nums`} aria-live="off">
            {formatClock(timer)}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={toggleTimer}
              disabled={isSaving}
              aria-label={isActive ? 'Pausar' : 'Iniciar'}
              className={`flex items-center justify-center p-4 rounded-full text-white transition-all duration-300 shadow-xl w-20 h-20 transform hover:scale-105 active:scale-95 ${
                isActive ? 'bg-red-400 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button
              onClick={resetCycle}
              disabled={isActive || isSaving}
              title="Reiniciar ciclo actual"
              aria-label="Reiniciar ciclo actual"
              className="flex items-center justify-center p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all duration-300 w-16 h-16 shadow-md disabled:opacity-50"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={finishSession}
            disabled={isSaving || !startedAt}
            className={`mt-8 w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center shadow-lg ${
              isSaving || !startedAt ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2" />
                Guardando sesión...
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Finalizar y guardar ({formatClock(focusSeconds)} de enfoque)
              </>
            )}
          </button>
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Ciclo actual</h3>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="font-semibold text-red-600">🍅 Enfoque</span>
              <span>{focusMinutes} minutos</span>
            </li>
            <li className="flex justify-between">
              <span className="font-semibold text-green-600">☕ Descanso corto</span>
              <span>{DEFAULT_DURATIONS[CYCLE.SHORT_BREAK] / 60} minutos</span>
            </li>
            <li className="flex justify-between">
              <span className="font-semibold text-blue-600">🛌 Descanso largo (cada 4 pomodoros)</span>
              <span>{DEFAULT_DURATIONS[CYCLE.LONG_BREAK] / 60} minutos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
