import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, feynmanAPI } from '../../services/api';
import { useUI } from '../../hooks/useUI';
import { FullPageSpinner } from '../../components/ui/Spinner';

const EMPTY_WORK = { topic: '', explanation: '', gaps_identified: '', final_version: '' };
const AUTOSAVE_MS = 30000;

const STEP_ICONS = ['📚', '✏️', '🔍', '⭐'];

const wordCount = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length;

/**
 * Técnica Feynman en 4 pasos con autoguardado. Al finalizar marca el trabajo como completo
 * y registra el tiempo dedicado como sesión de estudio.
 */
export default function IniciarFeynman() {
  const navigate = useNavigate();
  const ui = useUI();
  const startedAt = useRef(Date.now());
  const autoSaveRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [workId, setWorkId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_WORK);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  // Retoma el último trabajo sin terminar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const works = await feynmanAPI.getWorks(0, 10);
        const pending = works.find((work) => !work.is_completed);
        if (pending && !cancelled) {
          setFormData({
            topic: pending.topic || '',
            explanation: pending.explanation || '',
            gaps_identified: pending.gaps_identified || '',
            final_version: pending.final_version || '',
          });
          setWorkId(pending.feynman_id);
          if (pending.final_version) setCurrentStep(4);
          else if (pending.gaps_identified) setCurrentStep(3);
          else if (pending.explanation) setCurrentStep(2);
        }
      } catch {
        /* sin trabajo previo: empezamos de cero */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveWork = async (extra = {}) => {
    if (!formData.topic.trim()) return null;
    setIsSaving(true);
    try {
      const payload = { ...formData, ...extra };
      let saved;
      if (workId) {
        saved = await feynmanAPI.updateWork(workId, payload);
      } else {
        saved = await feynmanAPI.createWork(payload);
        setWorkId(saved.feynman_id);
      }
      setSavedAt(Date.now());
      return saved;
    } finally {
      setIsSaving(false);
    }
  };
  autoSaveRef.current = () => saveWork().catch(() => {});

  // Autoguardado periódico mientras haya un tema
  useEffect(() => {
    if (!formData.topic) return undefined;
    const interval = setInterval(() => autoSaveRef.current?.(), AUTOSAVE_MS);
    return () => clearInterval(interval);
  }, [formData.topic]);

  const update = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleNext = async () => {
    const requirements = {
      1: [formData.topic, 'Ingresa un tema para continuar'],
      2: [formData.explanation, 'Escribe tu explicación para continuar'],
      3: [formData.gaps_identified, 'Identifica los vacíos para continuar'],
    };
    const [value, message] = requirements[currentStep] || [];
    if (value !== undefined && !value.trim()) {
      setError(message);
      return;
    }
    setError(null);
    try {
      await saveWork();
    } catch (err) {
      ui.error(`No se pudo guardar: ${err.message}`);
    }
    if (currentStep < 4) setCurrentStep((step) => step + 1);
  };

  const handleFinish = async () => {
    if (!formData.final_version.trim()) {
      setError('Escribe tu versión final para completar');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await saveWork({ is_completed: true });
      const minutes = Math.min(1440, Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)));
      let achievements = [];
      try {
        const response = await dashboardAPI.createSession({
          metodo: 'feynman',
          fecha_inicio: new Date(startedAt.current).toISOString(),
          duracion_minutos: minutes,
          fue_completada: true,
          descripcion: `Feynman: ${formData.topic}`,
        });
        achievements = response.new_achievements || [];
      } catch {
        /* el registro de progreso no bloquea el flujo */
      }
      ui.success(achievements.length ? '🎉 ¡Trabajo completado y nuevo logro desbloqueado!' : '🎉 ¡Trabajo Feynman completado! Se registró en tu progreso.');
      navigate('/seguimiento');
    } catch (err) {
      setError(`Error al guardar el trabajo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNew = async () => {
    if (formData.topic && !(await ui.confirm({ title: 'Empezar un tema nuevo', message: 'El trabajo actual queda guardado como pendiente.', confirmText: 'Nuevo tema' }))) {
      return;
    }
    setFormData(EMPTY_WORK);
    setWorkId(null);
    setCurrentStep(1);
    setError(null);
    startedAt.current = Date.now();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <FullPageSpinner label="Cargando..." />
      </div>
    );
  }

  const textareaClass = 'w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors resize-none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🧠 Método Feynman</h1>
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`h-2 w-12 md:w-16 rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gray-300'}`} />
            ))}
          </div>
          <p className="text-gray-600 text-lg">Paso {currentStep} de 4</p>
          <div className="flex justify-center gap-4 mt-2 h-5 text-sm">
            {isSaving && <span className="text-purple-600 flex items-center gap-1"><span className="animate-pulse">💾</span> Guardando...</span>}
            {!isSaving && savedAt && <span className="text-green-600">✅ Guardado</span>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">⚠️ {error}</div>}

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">{STEP_ICONS[currentStep - 1]}</div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentStep === 1 && 'Paso 1: Elige tu tema'}
              {currentStep === 2 && 'Paso 2: Explica con palabras simples'}
              {currentStep === 3 && 'Paso 3: Identifica los vacíos'}
              {currentStep === 4 && 'Paso 4: Versión final simplificada'}
            </h2>
          </div>

          {currentStep === 1 && (
            <div className="animate-fade-in">
              <p className="text-gray-600 mb-6 text-lg">¿Qué concepto, teoría o tema quieres aprender y dominar?</p>
              <input
                type="text"
                value={formData.topic}
                onChange={update('topic')}
                placeholder="Ej: La fotosíntesis, Leyes de Newton, El ciclo de Krebs..."
                maxLength={255}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
                autoFocus
              />
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <p className="text-purple-700 font-medium mb-2">💡 Consejos</p>
                <ul className="text-purple-600 text-sm space-y-1">
                  <li>• Elige un tema específico, no demasiado amplio</li>
                  <li>• Puede ser algo de tu clase, un libro o algo que quieras entender mejor</li>
                  <li>• Ejemplos: "Derivadas", "Segunda Ley de Newton", "Mitosis celular"</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="bg-purple-100 rounded-xl p-4 mb-6">
                <p className="text-purple-800 font-semibold text-lg">Tema: "{formData.topic}"</p>
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                Explícalo como si se lo contaras a alguien que nunca ha oído del tema. <strong>Usa analogías y ejemplos cotidianos.</strong>
              </p>
              <textarea value={formData.explanation} onChange={update('explanation')} placeholder="Escribe tu explicación aquí..." className={`${textareaClass} min-h-[300px]`} autoFocus />
              <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    💡 <strong>Tip:</strong> si necesitas palabras técnicas, probablemente aún no lo entiendes del todo
                  </p>
                </div>
                <div className="text-gray-600 font-medium">📝 {wordCount(formData.explanation)} palabras</div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <p className="text-gray-600 mb-6 text-lg">
                Revisa tu explicación. <strong>¿Dónde te trabaste? ¿Qué partes fueron difíciles de explicar?</strong>
              </p>
              <textarea
                value={formData.gaps_identified}
                onChange={update('gaps_identified')}
                placeholder={'Escribe las partes que te costó explicar...\n\n• Me confundí cuando intenté explicar...\n• No pude simplificar el concepto de...\n• Necesito repasar más sobre...'}
                className={`${textareaClass} min-h-[250px]`}
                autoFocus
              />
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-700 font-medium mb-2">🎯 ¿Por qué es importante?</p>
                <p className="text-blue-600 text-sm">Identificar tus vacíos te dice exactamente qué repasar. Enfócate en lo que no entiendes, no en lo que ya sabes.</p>
              </div>
              {formData.explanation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 font-medium mb-2">📋 Tu explicación anterior</p>
                  <p className="text-gray-600 text-sm italic line-clamp-4 whitespace-pre-line">{formData.explanation}</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-fade-in">
              <p className="text-gray-600 mb-6 text-lg">
                Ahora que llenaste los vacíos, <strong>reescribe tu explicación mejorada y más clara</strong>.
              </p>
              <textarea value={formData.final_version} onChange={update('final_version')} placeholder="Escribe tu explicación mejorada aquí..." className={`${textareaClass} min-h-[300px]`} autoFocus />
              <div className="mt-4 text-gray-600 font-medium text-right">📝 {wordCount(formData.final_version)} palabras</div>
              {formData.explanation && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-purple-700 font-semibold mb-3">📊 Tu primera versión</p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm italic">
                      "{formData.explanation.substring(0, 250)}
                      {formData.explanation.length > 250 ? '...' : ''}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg'}`}
              >
                ← Anterior
              </button>
              <button onClick={handleStartNew} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                🔄 Nuevo tema
              </button>
            </div>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSaving || !formData.final_version.trim()}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? 'Guardando...' : 'Finalizar ✓'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/metodo/feynman')} className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}
