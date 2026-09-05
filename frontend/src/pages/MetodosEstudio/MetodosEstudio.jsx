import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../../services/api';
import { METHOD_LIST } from '../../services/methods';
import { useAuth } from '../../hooks/useAuth';

const COMPLEMENTARY = [
  { name: 'Mapas mentales', icon: '🧩', description: 'Organiza ideas visualmente', color: 'from-green-400 to-green-600' },
  { name: 'Cronómetro de estudio', icon: '⏱️', description: 'Mide tu tiempo de estudio libre', color: 'from-indigo-400 to-indigo-600' },
];

/** Catálogo de métodos. Si el usuario completó el diagnóstico, resalta el recomendado. */
export default function MetodosEstudio() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recommended, setRecommended] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    diagnosticAPI
      .getStatus()
      .then((status) => !cancelled && setRecommended(status.recommended_method_name || null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const goToQuiz = () => navigate(isAuthenticated ? '/cuestionario' : '/registro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Métodos de estudio 📚</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Descubre técnicas probadas para estudiar de forma más efectiva y alcanzar tus metas académicas</p>
        </div>

        {recommended ? (
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold text-gray-800">
                ✨ Según tu diagnóstico, te recomendamos empezar por el método marcado como <span className="text-purple-600">"Recomendado para ti"</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center mb-12 animate-fade-in">
            <button
              onClick={goToQuiz}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
            >
              <span className="text-2xl">🎯</span>
              ¿No sabes cuál elegir? Haz nuestro cuestionario
            </button>
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Métodos principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {METHOD_LIST.map((method, index) => (
              <button
                type="button"
                key={method.name}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up relative text-left"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(method.infoRoute)}
              >
                {recommended === method.name && (
                  <div className="absolute -top-3 -right-3">
                    <div className={`bg-gradient-to-br ${method.color} text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transform rotate-12`}>⭐ Recomendado para ti</div>
                  </div>
                )}
                <div className={`bg-gradient-to-br ${method.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto shadow-lg`}>{method.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{method.title}</h3>
                <p className="text-gray-600 mb-4 text-center text-sm">{method.shortDescription}</p>
                <div className="space-y-2 mb-4">
                  {method.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                <span className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-300 text-center">Conocer más →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 border-2 border-yellow-300">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Consejo pro</h3>
            <p className="text-gray-700">Puedes combinar métodos según la materia: usa Pomodoro para gestionar tu tiempo mientras aplicas Feynman para entender conceptos.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Empieza simple</h3>
            <p className="text-gray-700">No intentes aplicar todos los métodos a la vez. Elige uno, practícalo dos semanas y evalúa si funciona para ti.</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Herramientas complementarias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {COMPLEMENTARY.map((tool) => (
              <div key={tool.name} className="bg-white rounded-2xl shadow-lg p-6 opacity-60">
                <div className={`bg-gradient-to-br ${tool.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4`}>{tool.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                <span className="text-xs text-gray-500 italic">Próximamente</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para mejorar tu forma de estudiar? 🚀</h2>
          <p className="text-xl mb-6 opacity-90">Descubre cuál es el método perfecto para ti en solo 2 minutos</p>
          <button onClick={goToQuiz} className="bg-white text-[#1e3a5f] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg inline-flex items-center gap-2">
            {recommended ? 'Repetir el cuestionario' : 'Hacer el cuestionario'}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
