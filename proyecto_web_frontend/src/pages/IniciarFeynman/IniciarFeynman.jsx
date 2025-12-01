import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feynmanAPI } from '../../services/api';

function IniciarFeynman() {
  const navigate = useNavigate();
  
  // Estados principales
  const [currentStep, setCurrentStep] = useState(1);
  const [workId, setWorkId] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    explanation: '',
    gaps_identified: '',
    final_version: ''
  });
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [error, setError] = useState(null);

  // Cargar trabajo previo no completado al iniciar
  useEffect(() => {
    loadPreviousWork();
  }, []);

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    if (!formData.topic) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, workId]);

  const loadPreviousWork = async () => {
    setIsLoading(true);
    try {
      const works = await feynmanAPI.getWorks(0, 10);
      if (works && works.length > 0) {
        // Buscar trabajo no completado más reciente
        const incompleteWork = works.find(w => !w.is_completed);
        if (incompleteWork) {
          setFormData({
            topic: incompleteWork.topic || '',
            explanation: incompleteWork.explanation || '',
            gaps_identified: incompleteWork.gaps_identified || '',
            final_version: incompleteWork.final_version || ''
          });
          setWorkId(incompleteWork.feynman_id);
          
          // Determinar en qué paso estaba
          if (incompleteWork.final_version) setCurrentStep(4);
          else if (incompleteWork.gaps_identified) setCurrentStep(3);
          else if (incompleteWork.explanation) setCurrentStep(2);
          else setCurrentStep(1);
        }
      }
    } catch (err) {
      console.error('Error al cargar trabajo previo:', err);
      // No mostrar error, simplemente empezar desde cero
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!formData.topic.trim()) return;
    
    setIsSaving(true);
    try {
      if (workId) {
        await feynmanAPI.updateWork(workId, {
          topic: formData.topic,
          explanation: formData.explanation,
          gaps_identified: formData.gaps_identified,
          final_version: formData.final_version,
          is_completed: false
        });
      } else {
        const newWork = await feynmanAPI.createWork({
          topic: formData.topic,
          explanation: formData.explanation || '',
          gaps_identified: formData.gaps_identified || '',
          final_version: formData.final_version || ''
        });
        setWorkId(newWork.feynman_id);
      }
      
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    } catch (err) {
      console.error('Error al auto-guardar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Validaciones por paso
    if (currentStep === 1 && !formData.topic.trim()) {
      setError('Por favor, ingresa un tema para continuar');
      return;
    }
    if (currentStep === 2 && !formData.explanation.trim()) {
      setError('Por favor, escribe tu explicación para continuar');
      return;
    }
    if (currentStep === 3 && !formData.gaps_identified.trim()) {
      setError('Por favor, identifica los vacíos para continuar');
      return;
    }

    setError(null);
    
    // Guardar antes de avanzar
    await handleAutoSave();
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!formData.final_version.trim()) {
      setError('Por favor, escribe tu versión final para completar');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (workId) {
        await feynmanAPI.updateWork(workId, {
          topic: formData.topic,
          explanation: formData.explanation,
          gaps_identified: formData.gaps_identified,
          final_version: formData.final_version,
          is_completed: true
        });
      } else {
        await feynmanAPI.createWork({
          topic: formData.topic,
          explanation: formData.explanation,
          gaps_identified: formData.gaps_identified,
          final_version: formData.final_version,
          is_completed: true
        });
      }
      
      // Mostrar éxito y redirigir
      alert('🎉 ¡Trabajo Feynman completado exitosamente!');
      navigate('/seguimiento');
    } catch (err) {
      console.error('Error al finalizar:', err);
      setError('Error al guardar el trabajo. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setFormData({
      topic: '',
      explanation: '',
      gaps_identified: '',
      final_version: ''
    });
    setWorkId(null);
    setCurrentStep(1);
    setError(null);
  };

  // Contador de palabras
  const wordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Pantalla de carga inicial
  if (isLoading && !formData.topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🧠 Método Feynman
          </h1>
          
          {/* Barra de progreso */}
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 w-12 md:w-16 rounded-full transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <p className="text-gray-600 text-lg">
            Paso {currentStep} de 4
          </p>
          
          {/* Indicadores de estado */}
          <div className="flex justify-center gap-4 mt-2">
            {isSaving && (
              <span className="text-sm text-purple-600 flex items-center gap-1">
                <span className="animate-pulse">💾</span> Guardando...
              </span>
            )}
            {showSaveMessage && !isSaving && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                ✅ Guardado
              </span>
            )}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* PASO 1: Elegir tema */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  📚
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Paso 1: Elige tu tema
                </h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-lg">
                ¿Qué concepto, teoría o tema quieres aprender y dominar?
              </p>
              
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                placeholder="Ej: La fotosíntesis, Leyes de Newton, El ciclo de Krebs..."
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
                autoFocus
              />
              
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <p className="text-purple-700 font-medium mb-2">💡 Consejos:</p>
                <ul className="text-purple-600 text-sm space-y-1">
                  <li>• Elige un tema específico, no demasiado amplio</li>
                  <li>• Puede ser algo de tu clase, un libro o algo que quieras entender mejor</li>
                  <li>• Ejemplos: "Derivadas", "Segunda Ley de Newton", "Mitosis celular"</li>
                </ul>
              </div>
            </div>
          )}

          {/* PASO 2: Explicar con palabras simples */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  ✏️
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Paso 2: Explica con palabras simples
                </h2>
              </div>
              
              <div className="bg-purple-100 rounded-xl p-4 mb-6">
                <p className="text-purple-800 font-semibold text-lg">
                  Tema: "{formData.topic}"
                </p>
              </div>
              
              <p className="text-gray-600 mb-4 text-lg">
                ¡Vamos tú puedes! <strong>ya falta poco </strong>,
                tú puedes.
              </p>
              
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                placeholder="Escribe tu explicación aquí...&#10;&#10;Imagina que se lo explicas a alguien que nunca ha oído hablar del tema. Usa analogías y ejemplos de la vida cotidiana."
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none min-h-[300px] text-lg transition-colors resize-none"
                autoFocus
              />
              
              <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    💡 <strong>Tip:</strong> Si usas palabras técnicas, probablemente no lo entiendes bien
                  </p>
                </div>
                <div className="text-gray-600 font-medium">
                  📝 {wordCount(formData.explanation)} palabras
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Identificar vacíos */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  🔍
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Paso 3: Identifica los vacíos
                </h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-lg">
                Revisa tu explicación anterior. <strong>¿Dónde te trabaste? ¿Qué partes fueron difíciles de explicar?</strong>
              </p>
              
              <textarea
                value={formData.gaps_identified}
                onChange={(e) => setFormData({...formData, gaps_identified: e.target.value})}
                placeholder="Escribe aquí las partes que te costó explicar...&#10;&#10;Por ejemplo:&#10;• Me confundí cuando intenté explicar...&#10;• No pude simplificar el concepto de...&#10;• Necesito repasar más sobre..."
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none min-h-[250px] text-lg transition-colors resize-none"
                autoFocus
              />
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-700 font-medium mb-2">🎯 ¿Por qué es importante?</p>
                <p className="text-blue-600 text-sm">
                  Identificar tus vacíos te permite saber exactamente qué repasar. 
                  No pierdas tiempo estudiando lo que ya sabes, enfócate en lo que no entiendes.
                </p>
              </div>
              
              {/* Vista previa de explicación anterior */}
              {formData.explanation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 font-medium mb-2">📋 Tu explicación anterior:</p>
                  <p className="text-gray-600 text-sm italic line-clamp-4">
                    {formData.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Versión final */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  ⭐
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Paso 4: Versión final simplificada
                </h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-lg">
                Ahora que identificaste los vacíos y los llenaste, <strong>reescribe tu explicación mejorada y más clara</strong>.
              </p>
              
              <textarea
                value={formData.final_version}
                onChange={(e) => setFormData({...formData, final_version: e.target.value})}
                placeholder="Escribe tu explicación mejorada aquí...&#10;&#10;Esta versión debería ser más clara, más simple y sin los vacíos que identificaste antes."
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none min-h-[300px] text-lg transition-colors resize-none"
                autoFocus
              />
              
              <div className="mt-4 text-gray-600 font-medium text-right">
                📝 {wordCount(formData.final_version)} palabras
              </div>
              
              {/* Comparación con versión anterior */}
              {formData.explanation && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-purple-700 font-semibold mb-3">📊 Comparación con tu primera versión:</p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm italic">
                      "{formData.explanation.substring(0, 250)}{formData.explanation.length > 250 ? '...' : ''}"
                    </p>
                  </div>
                  <p className="text-purple-600 text-sm mt-3">
                    💡 Tu nueva versión debería ser más clara y fácil de entender
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl'
                }`}
              >
                ← Anterior
              </button>
              
              <button
                onClick={handleStartNew}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                🔄 Nuevo tema
              </button>
            </div>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isLoading || !formData.final_version.trim()}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span> Guardando...
                  </>
                ) : (
                  <>
                    Finalizar ✓
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/metodo/feynman')}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}

export default IniciarFeynman;