import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TutorialFeynman() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  
  // Estados para cada paso
  const [formData, setFormData] = useState({
    tema: '',
    desarrollo: '',
    informacion: '',
    reescritura: ''
  });

  // Cargar datos guardados del localStorage al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('feynmanTutorial');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Definición de los 4 pasos del método Feynman
  const steps = [
    {
      id: 1,
      title: 'Elige el tema',
      badge: '📚 Paso 1',
      description: 'Selecciona el concepto o tema que quieres aprender y dominar',
      placeholder: 'Ejemplo: Fotosíntesis, Segunda Ley de Newton, etc.',
      field: 'tema',
      type: 'input',
      tip: '💡 Consejo: Elige un tema específico, no muy amplio. Es mejor dominar "La mitosis" que "Biología celular completa".'
    },
    {
      id: 2,
      title: 'Escríbelo y desarrolla',
      badge: '✍️ Paso 2',
      description: 'Explica el tema con tus propias palabras, como si se lo enseñaras a un niño de 12 años',
      placeholder: 'Escribe aquí tu explicación del tema usando lenguaje simple y claro...',
      field: 'desarrollo',
      type: 'textarea',
      tip: '💡 Consejo: No uses jerga técnica. Si no puedes explicarlo con palabras simples, aún no lo entiendes completamente.'
    },
    {
      id: 3,
      title: 'Completa la información',
      badge: '🔍 Paso 3',
      description: 'Identifica las partes donde tuviste dificultad para explicar y completa esa información',
      placeholder: 'Escribe las áreas confusas que identificaste y su correcta explicación...',
      field: 'informacion',
      type: 'textarea',
      tip: '💡 Consejo: Las áreas donde te trabaste son las que realmente necesitas repasar. Vuelve a tus apuntes o libros.'
    },
    {
      id: 4,
      title: 'Reescribe',
      badge: '📝 Paso 4',
      description: 'Ahora que completaste los vacíos, reescribe tu explicación de forma clara y simple',
      placeholder: 'Reescribe tu explicación final del tema, ya con toda la información...',
      field: 'reescritura',
      type: 'textarea',
      tip: '💡 Consejo: Tu explicación final debe ser tan clara que cualquier persona sin conocimientos previos pueda entenderla.'
    }
  ];

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Guardar en localStorage
  const handleSave = () => {
    localStorage.setItem('feynmanTutorial', JSON.stringify(formData));
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  // Navegar al siguiente paso
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navegar al paso anterior
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Limpiar todos los datos
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todo tu progreso?')) {
      setFormData({
        tema: '',
        desarrollo: '',
        informacion: '',
        reescritura: ''
      });
      localStorage.removeItem('feynmanTutorial');
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calcular progreso
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-purple-400 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            🧠 Tutorial Feynman
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Tutorial del Método Feynman
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprende cualquier tema siguiendo estos 4 pasos y explicándolo con tus propias palabras
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Indicadores de pasos */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center min-w-[80px] cursor-pointer transition-all duration-300 ${
                index === currentStep ? 'scale-110' : 'opacity-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 shadow-lg transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs text-center font-medium text-gray-700">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Card Principal del Paso Actual */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 animate-slide-up">
          
          {/* Badge del paso */}
          <div className="inline-block bg-gradient-to-br from-purple-400 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg mb-6">
            {currentStepData.badge}
          </div>

          {/* Título del paso */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {currentStepData.title}
          </h2>

          {/* Descripción */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Input o Textarea según el paso */}
          <div className="mb-6">
            {currentStepData.type === 'input' ? (
              <input
                type="text"
                value={formData[currentStepData.field]}
                onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                placeholder={currentStepData.placeholder}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-lg transition-all duration-300"
              />
            ) : (
              <textarea
                value={formData[currentStepData.field]}
                onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                placeholder={currentStepData.placeholder}
                rows={8}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-lg resize-none transition-all duration-300"
              />
            )}
          </div>

          {/* Tip del paso */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-500">
            <p className="text-gray-700 leading-relaxed">
              {currentStepData.tip}
            </p>
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Botón Anterior */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ← Anterior
          </button>

          {/* Botón Guardar */}
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
          >
            💾 Guardar trabajo
          </button>

          {/* Botón Siguiente */}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={() => navigate('/metodos-estudio')}
              className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Finalizar ✓
            </button>
          )}
        </div>

        {/* Mensaje de guardado */}
        {showSaveMessage && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 z-50">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Trabajo guardado correctamente</span>
          </div>
        )}

        {/* Botones Adicionales */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate('/metodo/feynman')}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            ← Volver al Método Feynman
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
          >
            🗑️ Borrar todo y empezar de nuevo
          </button>
        </div>

        {/* Resumen de lo completado */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Resumen de tu progreso
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData[step.field]
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="text-center mb-2">
                  {formData[step.field] ? (
                    <span className="text-3xl">✓</span>
                  ) : (
                    <span className="text-3xl opacity-30">⭕</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-700 text-center">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {formData[step.field] ? 'Completado' : 'Pendiente'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje Motivacional */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 italic">
            "Si no puedes explicarlo de forma simple, no lo entiendes lo suficiente" - Albert Einstein 💡
          </p>
        </div>
      </div>
    </div>
  );
}

export default TutorialFeynman;