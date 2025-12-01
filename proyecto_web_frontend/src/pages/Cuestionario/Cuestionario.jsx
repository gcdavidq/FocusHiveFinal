import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../../services/api';

function Cuestionario() {
  const navigate = useNavigate();
  
  // Estados principales
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // {question_id: option_id}
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Preguntas cargadas del backend
  const [questions, setQuestions] = useState([]);

  // Información de cada método (para mostrar en resultado)
  const methodInfo = {
    1: { // Pomodoro
      id: 'pomodoro',
      name: 'Técnica Pomodoro',
      icon: '🍅',
      color: 'from-red-400 to-red-600',
      route: '/metodo/pomodoro',
      description: 'La técnica Pomodoro te ayuda a mantener el foco mediante intervalos de 25 minutos de trabajo concentrado, seguidos de 5 minutos de descanso. Este método combate la procrastinación y mejora tu productividad al dividir el tiempo en bloques manejables.'
    },
    2: { // Feynman
      id: 'feynman',
      name: 'Técnica Feynman',
      icon: '🧠',
      color: 'from-purple-400 to-purple-600',
      route: '/metodo/feynman',
      description: 'El método Feynman te enseña a dominar cualquier tema explicándolo con palabras simples, como si se lo contaras a alguien sin conocimientos previos. Esta técnica revela las áreas que realmente comprendes y aquellas que necesitas reforzar.'
    },
    3: { // Cornell
      id: 'cornell',
      name: 'Método Cornell',
      icon: '📝',
      color: 'from-blue-400 to-blue-600',
      route: '/metodo/cornell',
      description: 'El sistema Cornell organiza tus apuntes en tres secciones estratégicas: notas principales, palabras clave y resumen. Este formato facilita el repaso activo y mejora significativamente la retención de información a largo plazo.'
    },
    4: { // Flashcards
      id: 'flashcards',
      name: 'Método Flashcards',
      icon: '🗂️',
      color: 'from-yellow-400 to-orange-600',
      route: '/metodo/flashcards',
      description: 'El método de flashcards te ayuda a memorizar información mediante tarjetas de estudio que promueven la repetición activa. Este sistema favorece el aprendizaje a largo plazo y te permite identificar qué contenidos ya dominas y cuáles necesitas repasar más.'
    }
  };

 // Cargar preguntas y verificar estado al iniciar
  useEffect(() => {
    checkStatusAndLoadQuestions();
    }, []);

  const checkStatusAndLoadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar si ya completó el diagnóstico
      const status = await diagnosticAPI.getStatus();
      
      if (status.diagnostic_completed) {
        // Ya completó, mostrar resultado anterior
        try {
          const previousResult = await diagnosticAPI.getResult();
          setResult(previousResult);
          setShowResult(true);
        } catch (err) {
          console.log('No se pudo obtener resultado anterior, permitiendo repetir');
          await loadQuestions();
        }
      } else {
        // No ha completado, cargar preguntas
        await loadQuestions();
      }
    } catch (err) {
      console.error('Error verificando estado:', err);
      // Si falla la verificación (e.g., token, 401), intentar cargar preguntas de todos modos
      await loadQuestions();
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const responseData = await diagnosticAPI.getQuestions();
      
      // 🚨 CAMBIO CLAVE: Extraer el array de la clave 'questions'
      const questionsArray = responseData?.questions;
      
      if (questionsArray && questionsArray.length > 0) {
        // Ordenar por question_order
        const sortedQuestions = questionsArray.sort((a, b) => a.question_order - b.question_order);
        setQuestions(sortedQuestions);
        setError(null); // Limpiar cualquier error previo
      } else {
        setError('No se encontraron preguntas del diagnóstico');
      }
    } catch (err) {
      console.error('Error cargando preguntas:', err);
      // Usar err.message para capturar el error formateado por el interceptor de Axios
      setError(err.message || 'Error al cargar las preguntas. Por favor, intenta de nuevo.');
    }
  };

  // Manejar selección de respuesta
  const handleAnswer = (questionId, optionId) => {
    // Guardar respuesta seleccionada
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));

    // Avanzar a siguiente pregunta o enviar
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 900);
    } else {
      // Última pregunta, preparar para enviar
      submitDiagnostic({
        ...selectedAnswers,
        [questionId]: optionId
      });
    }
  };

  // Enviar diagnóstico al backend
  const submitDiagnostic = async (allAnswers) => {
    setIsSubmitting(true);
    setError(null);
    
    const formattedAnswers = Object.keys(allAnswers).map(questionId => ({
      question_id: parseInt(questionId),
      option_id: allAnswers[questionId]
    }));

    try { 

      // Enviar al backend
      const response = await diagnosticAPI.submit(formattedAnswers);
      
      console.log('Resultado recibido:', response);
      
      // Guardar resultado y mostrar modal (para la respuesta 200 OK normal)
      setResult(response);
      setShowResult(true);
      
      // ... (guardado en localStorage sin cambios) ...

    } catch (err) {
      console.error('Error enviando diagnóstico:', err);
      
      // 🚨 LÓGICA CLAVE: Capturar la respuesta 201 Created que el interceptor convirtió en error
      if (err.response && err.response.status === 201) {
        const successfulResponseData = err.response.data;
        
        console.log('Éxito 201 capturado, procesando resultado:', successfulResponseData);
        
        // Procesa el cuerpo de la respuesta exitosa adjunta al error
        setResult(successfulResponseData);
        setShowResult(true);
        setError(null); // ⬅️ AÑADIR ESTA LÍNEA
        
        // Guardar en localStorage (tomado de la lógica 'try' original)
        if (successfulResponseData.primary_method) {
          const methodKey = methodInfo[successfulResponseData.primary_method.method_id]?.id || 'pomodoro';
          localStorage.setItem('recommendedMethod', methodKey);
        }
        
      } else {
        // Si es un error real (4xx o 5xx), muestra el mensaje
        setError(err.message || 'Error al enviar el diagnóstico. Por favor, intenta de nuevo.');
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar cuestionario
  const resetQuiz = async () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
    setResult(null);
    setError(null);
    
    // Recargar preguntas
    setIsLoading(true);
    await loadQuestions();
    setIsLoading(false);
  };

  // Obtener información del método recomendado
  const getRecommendedMethodInfo = () => {
    if (!result?.primary_method) return null;
    
    const methodId = result.primary_method.method_id;
    const baseInfo = methodInfo[methodId];
    
    if (!baseInfo) return null;
    
    return {
      ...baseInfo,
      score: result.primary_method.score,
      title: result.primary_method.title,
      backendDescription: result.primary_method.description,
      tips: result.primary_method.tips,
      best_for: result.primary_method.best_for
    };
  };

  // Obtener método secundario
  const getSecondaryMethodInfo = () => {
    if (!result?.secondary_method) return null;
    
    const methodId = result.secondary_method.method_id;
    return methodInfo[methodId] || null;
  };

  // Calcular progreso
  const progress = questions.length > 0 
    ? ((currentQuestion + 1) / questions.length) * 100 
    : 0;

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando diagnóstico...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error && !showResult && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={checkStatusAndLoadQuestions}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const recommendedMethod = getRecommendedMethodInfo();
  const secondaryMethod = getSecondaryMethodInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Modal de Resultado */}
        {showResult && recommendedMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full animate-slide-up my-8">
              {/* Confetti emoji */}
              <div className="text-6xl text-center mb-6">🎉</div>

              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
                ¡Tu método ideal es:
              </h2>

              {/* Badge del método recomendado */}
              <div className={`bg-gradient-to-br ${recommendedMethod.color} text-white px-8 py-6 rounded-2xl text-center mb-6 shadow-xl`}>
                <div className="text-5xl mb-3">{recommendedMethod.icon}</div>
                <div className="text-2xl md:text-3xl font-bold">{recommendedMethod.name}</div>
                {recommendedMethod.score && (
                  <div className="text-sm mt-2 opacity-90">
                    Puntuación: {recommendedMethod.score} puntos
                  </div>
                )}
              </div>

              {/* Descripción */}
              <p className="text-gray-700 text-lg text-center mb-6 leading-relaxed">
                {recommendedMethod.backendDescription || recommendedMethod.description}
              </p>

              {/* Tips del método */}
              {recommendedMethod.tips && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-yellow-800 font-semibold mb-2">💡 Tips:</p>
                  <p className="text-yellow-700 text-sm">{recommendedMethod.tips}</p>
                </div>
              )}

              {/* Mejor para... */}
              {recommendedMethod.best_for && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-800 font-semibold mb-2">🎯 Ideal para:</p>
                  <p className="text-blue-700 text-sm">{recommendedMethod.best_for}</p>
                </div>
              )}

              {/* Método secundario */}
              {secondaryMethod && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-600 text-sm mb-2">También te podría funcionar:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{secondaryMethod.icon}</span>
                    <span className="font-semibold text-gray-800">{secondaryMethod.name}</span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => navigate(recommendedMethod.route)}
                  className="flex-1 bg-[#1e3a5f] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg"
                >
                  Conocer mi método 🚀
                </button>
                <button
                  onClick={() => navigate('/metodos-estudio')}
                  className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Ver todos los métodos
                </button>
              </div>

              {/* Botón repetir */}
              <button
                onClick={resetQuiz}
                className="w-full mt-4 text-gray-500 hover:text-gray-700 py-3 font-medium transition-colors duration-300"
              >
                Repetir cuestionario
              </button>
            </div>
          </div>
        )}

        {/* Card del Cuestionario */}
        {!showResult && questions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-purple-400 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
                Pregunta {currentQuestion + 1} de {questions.length}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-4">
                Descubre tu método ideal
              </h1>
            </div>

            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-600 mt-2 text-sm">{Math.round(progress)}% completado</p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Pregunta actual */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                {questions[currentQuestion]?.question_text}
              </h2>

              {/* Opciones */}
              <div className="space-y-4">
                {questions[currentQuestion]?.options?.map((option, index) => (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswer(questions[currentQuestion].question_id, option.option_id)}
                    disabled={isSubmitting}
                    className={`w-full p-6 border-2 rounded-xl transition-all duration-300 text-left group ${
                      selectedAnswers[questions[currentQuestion].question_id] === option.option_id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-[#1e3a5f] hover:bg-blue-50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg font-semibold text-gray-700 group-hover:text-[#1e3a5f]">
                      {option.option_text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Indicador de envío */}
            {isSubmitting && (
              <div className="text-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Analizando tus respuestas...</p>
              </div>
            )}

            {/* Botón volver */}
            <div className="text-center">
              <button
                onClick={() => navigate('/metodos-estudio')}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-300"
              >
                ← Volver a Métodos de Estudio
              </button>
            </div>
          </div>
        )}

        {/* Mensaje motivacional */}
        {!showResult && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 italic">
              "El éxito es la suma de pequeños esfuerzos repetidos día tras día" 💪
            </p>
          </div>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Cuestionario;