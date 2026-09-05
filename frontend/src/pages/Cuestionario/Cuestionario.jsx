import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../../services/api';
import { getMethodMeta } from '../../services/methods';
import { useAuth } from '../../hooks/useAuth';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

/**
 * Cuestionario diagnóstico: carga las preguntas del backend, envía las respuestas
 * y muestra el método recomendado (con uno secundario si el puntaje es cercano).
 */
export default function Cuestionario() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadQuestions = useCallback(async () => {
    const response = await diagnosticAPI.getQuestions();
    const sorted = [...(response?.questions || [])].sort((a, b) => a.question_order - b.question_order);
    if (sorted.length === 0) throw new Error('No se encontraron preguntas del diagnóstico');
    setQuestions(sorted);
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await diagnosticAPI.getStatus();
      if (status.diagnostic_completed) {
        try {
          setResult(await diagnosticAPI.getResult());
          return;
        } catch {
          /* sin resultado guardado: se repite el cuestionario */
        }
      }
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Error al cargar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const submitDiagnostic = async (allAnswers) => {
    setIsSubmitting(true);
    setError(null);
    const answers = Object.entries(allAnswers).map(([questionId, optionId]) => ({
      question_id: Number(questionId),
      option_id: optionId,
    }));
    try {
      const response = await diagnosticAPI.submit(answers);
      setResult(response);
      refreshUser().catch(() => {});
    } catch (err) {
      setError(err.message || 'Error al enviar el diagnóstico. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    const updated = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updated);
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((index) => index + 1), 400);
    } else {
      submitDiagnostic(updated);
    }
  };

  const resetQuiz = async () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setResult(null);
    setError(null);
    setIsLoading(true);
    try {
      await loadQuestions();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <FullPageSpinner label="Cargando diagnóstico..." />
      </div>
    );
  }

  if (error && !result && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <ErrorState message={error} onRetry={initialize} />
      </div>
    );
  }

  if (result) {
    const primary = { ...getMethodMeta(result.primary_method.method_name), ...result.primary_method };
    const secondary = result.secondary_method
      ? { ...getMethodMeta(result.secondary_method.method_name), ...result.secondary_method }
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up">
          <div className="text-6xl text-center mb-6">🎉</div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">Tu método ideal es:</h1>

          <div className={`bg-gradient-to-br ${primary.color} text-white px-8 py-6 rounded-2xl text-center mb-6 shadow-xl`}>
            <div className="text-5xl mb-3">{primary.icon}</div>
            <div className="text-2xl md:text-3xl font-bold">{primary.title}</div>
            {typeof primary.score === 'number' && <div className="text-sm mt-2 opacity-90">Puntuación: {primary.score} puntos</div>}
          </div>

          <p className="text-gray-700 text-lg text-center mb-6 leading-relaxed">{primary.description}</p>

          {primary.tips?.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 mb-6">
              <p className="text-yellow-800 font-semibold mb-3">💡 Cómo aplicarlo</p>
              <ul className="space-y-2">
                {primary.tips.map((tip) => (
                  <li key={tip} className="text-yellow-800 text-sm flex gap-2">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {primary.best_for && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 font-semibold mb-1">🎯 Ideal para</p>
              <p className="text-blue-700 text-sm">{primary.best_for}</p>
            </div>
          )}

          {secondary && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-sm mb-2">También te podría funcionar:</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{secondary.icon}</span>
                <span className="font-semibold text-gray-800">{secondary.title}</span>
                {typeof secondary.score === 'number' && <span className="text-sm text-gray-500">({secondary.score} pts)</span>}
              </div>
            </div>
          )}

          {result.all_scores && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-600 mb-3">Puntaje por método</p>
              <div className="space-y-2">
                {Object.entries(result.all_scores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => {
                    const meta = getMethodMeta(name);
                    const max = Math.max(...Object.values(result.all_scores), 1);
                    return (
                      <div key={name} className="flex items-center gap-3 text-sm">
                        <span className="w-6 text-center">{meta.icon}</span>
                        <span className="w-28 text-gray-700">{meta.title}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full bg-gradient-to-r ${meta.color}`} style={{ width: `${(score / max) * 100}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-600">{score}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => navigate(primary.infoRoute)}
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
          <button onClick={resetQuiz} className="w-full mt-4 text-gray-500 hover:text-gray-700 py-3 font-medium transition-colors duration-300">
            Repetir cuestionario
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-purple-400 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
              Pregunta {currentQuestion + 1} de {questions.length}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-4">Descubre tu método ideal</h1>
          </div>

          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-gray-600 mt-2 text-sm">{Math.round(progress)}% completado</p>
          </div>

          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">⚠️ {error}</div>}

          {question && (
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{question.question_text}</h2>
              <div className="space-y-4">
                {question.options.map((option) => {
                  const selected = selectedAnswers[question.question_id] === option.option_id;
                  return (
                    <button
                      key={option.option_id}
                      onClick={() => handleAnswer(question.question_id, option.option_id)}
                      disabled={isSubmitting}
                      className={`w-full p-6 border-2 rounded-xl transition-all duration-300 text-left group ${
                        selected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-[#1e3a5f] hover:bg-blue-50'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-lg font-semibold text-gray-700 group-hover:text-[#1e3a5f]">{option.option_text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isSubmitting && (
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
              <p className="text-gray-600">Analizando tus respuestas...</p>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <button
              onClick={() => setCurrentQuestion((index) => Math.max(0, index - 1))}
              disabled={currentQuestion === 0 || isSubmitting}
              className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-40"
            >
              ← Pregunta anterior
            </button>
            <Link to="/metodos-estudio" className="text-gray-500 hover:text-gray-700 font-medium">
              Ver métodos sin responder
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-600 italic">"El éxito es la suma de pequeños esfuerzos repetidos día tras día" 💪</p>
      </div>
    </div>
  );
}
