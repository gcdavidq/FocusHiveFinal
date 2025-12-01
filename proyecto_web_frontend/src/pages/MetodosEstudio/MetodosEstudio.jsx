import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MetodosEstudio() {
  const navigate = useNavigate();
  const [recommendedMethod, setRecommendedMethod] = useState('');

  useEffect(() => {
    // Obtener método recomendado del localStorage
    const method = localStorage.getItem('recommendedMethod');
    if (method) {
      setRecommendedMethod(method);
    }
  }, []);

  // Métodos principales (ACTUALIZADO: incluye Flashcards como 4to método)
  const mainMethods = [
    {
      id: 'pomodoro',
      name: 'Técnica Pomodoro',
      icon: '🍅',
      description: 'Trabaja en intervalos de 25 minutos con descansos de 5 minutos',
      color: 'from-red-400 to-red-600',
      route: '/metodo/pomodoro',
      benefits: ['Combate la procrastinación', 'Mejora la concentración', 'Gestiona mejor el tiempo']
    },
    {
      id: 'feynman',
      name: 'Técnica Feynman',
      icon: '🧠',
      description: 'Aprende explicando conceptos con tus propias palabras simples',
      color: 'from-purple-400 to-purple-600',
      route: '/metodo/feynman',
      benefits: ['Comprensión profunda', 'Identifica vacíos', 'Mejora retención']
    },
    {
      id: 'cornell',
      name: 'Método Cornell',
      icon: '📝',
      description: 'Sistema de apuntes organizado en tres secciones estratégicas',
      color: 'from-blue-400 to-blue-600',
      route: '/metodo/cornell',
      benefits: ['Apuntes organizados', 'Repaso efectivo', 'Retención a largo plazo']
    },
    {
      id: 'flashcards',
      name: 'Método Flashcards',
      icon: '🗂️',
      description: 'Tarjetas de estudio para memorizar mediante repetición activa',
      color: 'from-yellow-400 to-orange-600',
      route: '/metodo/flashcards',
      benefits: ['Memorización efectiva', 'Aprendizaje a largo plazo', 'Identifica debilidades']
    }
  ];

  // Otros métodos complementarios
  const otherMethods = [
    {
      name: 'Mapas Mentales',
      icon: '🧩',
      description: 'Organiza ideas visualmente',
      color: 'from-green-400 to-green-600',
      route: '#'
    },
    {
      name: 'Cronómetro de Estudio',
      icon: '⏱️',
      description: 'Mide tu tiempo de estudio',
      color: 'from-indigo-400 to-indigo-600',
      route: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Métodos de Estudio 📚
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre técnicas probadas para estudiar de forma más efectiva y alcanzar tus metas académicas
          </p>
        </div>

        {/* Mensaje si ya hizo el cuestionario */}
        {recommendedMethod && (
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold text-gray-800">
                ✨ Basado en tu cuestionario, te recomendamos comenzar con el método que tiene el badge 
                <span className="text-purple-600"> "Recomendado para ti"</span>
              </p>
            </div>
          </div>
        )}

        {/* Botón del cuestionario */}
        {!recommendedMethod && (
          <div className="text-center mb-12 animate-fade-in">
            <button
              onClick={() => navigate('/cuestionario')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
            >
              <span className="text-2xl">🎯</span>
              ¿No sabes cuál elegir? Haz nuestro cuestionario
            </button>
          </div>
        )}

        {/* Métodos Principales (Grid de 4) */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Métodos Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-slide-up relative"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(method.route)}
              >
                {/* Badge "Recomendado para ti" */}
                {recommendedMethod === method.id && (
                  <div className="absolute -top-3 -right-3">
                    <div className={`bg-gradient-to-br ${method.color} text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transform rotate-12`}>
                      ⭐ Recomendado para ti
                    </div>
                  </div>
                )}

                {/* Icono con gradiente */}
                <div className={`bg-gradient-to-br ${method.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto shadow-lg`}>
                  {method.icon}
                </div>

                {/* Nombre */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                  {method.name}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 mb-4 text-center text-sm">
                  {method.description}
                </p>

                {/* Beneficios */}
                <div className="space-y-2 mb-4">
                  {method.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Botón */}
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-300">
                  Conocer más →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Laterales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 border-2 border-yellow-300">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Consejo Pro</h3>
            <p className="text-gray-700">
              Puedes combinar diferentes métodos según el tipo de materia. Por ejemplo: 
              usa Pomodoro para gestionar tu tiempo mientras aplicas Feynman para entender conceptos.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Empieza Simple</h3>
            <p className="text-gray-700">
              No intentes aplicar todos los métodos a la vez. Elige uno, practícalo durante 
              2 semanas y luego evalúa si funciona para ti.
            </p>
          </div>
        </div>

        {/* Otros Métodos */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Herramientas Complementarias
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {otherMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer opacity-60"
                onClick={() => {
                  if (method.route !== '#') navigate(method.route);
                }}
              >
                <div className={`bg-gradient-to-br ${method.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{method.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <span className="text-xs text-gray-500 italic">Próximamente...</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para mejorar tu forma de estudiar? 🚀
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Descubre cuál es el método perfecto para ti en solo 2 minutos
          </p>
          <button
            onClick={() => navigate('/cuestionario')}
            className="bg-white text-[#1e3a5f] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
          >
            Hacer el cuestionario
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default MetodosEstudio;