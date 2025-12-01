import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Coffee, CheckCircle, Zap } from 'lucide-react';

const MetodoPomodoro = () => {
  const steps = [
    {
      number: 1,
      title: "Elige una tarea",
      description: "Selecciona la tarea o tema que quieres estudiar"
    },
    {
      number: 2,
      title: "Ajusta el temporizador",
      description: "Configura el timer a 25 minutos (1 pomodoro)"
    },
    {
      number: 3,
      title: "Trabaja sin distracciones",
      description: "Concéntrate completamente en la tarea hasta que suene la alarma"
    },
    {
      number: 4,
      title: "Toma un descanso corto",
      description: "Descansa 5 minutos al finalizar cada pomodoro"
    },
    {
      number: 5,
      title: "Repite el proceso",
      description: "Después de 4 pomodoros, toma un descanso largo de 15-30 minutos"
    }
  ];

  const benefits = [
    "Mejora la concentración y enfoque",
    "Reduce la procrastinación",
    "Aumenta la productividad",
    "Previene el agotamiento mental",
    "Ayuda a gestionar mejor el tiempo"
  ];

  const tips = [
    "Elimina todas las distracciones antes de comenzar",
    "No interrumpas un pomodoro una vez iniciado",
    "Si terminas la tarea antes, revisa o profundiza",
    "Usa los descansos para moverte y estirarte",
    "Ajusta los tiempos según tu nivel de concentración"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
      <div className="container-custom py-12">
        {/* Back Button */}
        <Link
          to="/metodos-estudio"
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-[#1e3a5f] transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Volver a métodos de estudio</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl">
            🍅
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Método Pomodoro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            El método Pomodoro te permite estudiar con intervalos de tiempo personalizados y tomar descansos entre bloques de trabajo, impulsando un trabajo que da espacio a la relajación y evita sobrecarga estudiantil.
          </p>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 animate-fade-in">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Qué es el método Pomodoro?</h2>
              <p className="text-gray-600 leading-relaxed">
                Desarrollado por Francesco Cirillo en los años 80, el método Pomodoro es una técnica de gestión del tiempo que divide el trabajo en intervalos de 25 minutos (llamados "pomodoros"), separados por breves descansos. Esta técnica se basa en la idea de que las pausas frecuentes pueden mejorar la agilidad mental y mantener la concentración.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
            ¿Cómo funciona?
          </h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits and Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Benefits */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Beneficios</h2>
            </div>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            <div className="flex items-center space-x-3 mb-6">
              <Coffee className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Consejos</h2>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">💡</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center animate-slide-up">
  <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
  <p className="text-red-100 mb-6 max-w-2xl mx-auto">
    Comienza a usar el método Pomodoro hoy mismo y transforma tu forma de estudiar.
  </p>
  
  {/* CAMBIO AQUÍ: Usamos Link en lugar de Button */}
  <Link 
    to="/iniciar-pomodoro" 
    className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-all duration-300 shadow-lg"
  >
    Iniciar temporizador Pomodoro
  </Link>
</div>
      </div>
    </div>
  );
};

export default MetodoPomodoro;