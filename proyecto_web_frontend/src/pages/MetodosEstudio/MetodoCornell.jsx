import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Layout, CheckCircle, BookOpen } from 'lucide-react';

const MetodoCornell = () => {
  const navigate = useNavigate();
  const steps = [
    {
      number: 1,
      title: "Divide tu página",
      description: "Crea tres secciones: columna de preguntas (izquierda), notas (derecha), y resumen (abajo)"
    },
    {
      number: 2,
      title: "Toma notas durante la clase",
      description: "Escribe las ideas principales en la sección de notas mientras estudias o asistes a clase"
    },
    {
      number: 3,
      title: "Formula preguntas clave",
      description: "Después, crea preguntas en la columna izquierda que correspondan a tus notas"
    },
    {
      number: 4,
      title: "Escribe un resumen",
      description: "Al finalizar, resume las ideas principales en la sección inferior"
    },
    {
      number: 5,
      title: "Repasa regularmente",
      description: "Cubre las notas y responde las preguntas para repasar efectivamente"
    }
  ];

  const benefits = [
    "Organiza la información de forma estructurada",
    "Facilita el repaso antes de exámenes",
    "Mejora la retención de información",
    "Promueve el pensamiento crítico",
    "Ahorra tiempo al estudiar"
  ];

  const tips = [
    "Usa abreviaturas para tomar notas más rápido",
    "Revisa y completa tus notas el mismo día",
    "Las preguntas deben ser específicas y claras",
    "El resumen debe ser breve (3-5 oraciones)",
    "Repasa usando solo la columna de preguntas"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
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
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl">
            📝
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Método Cornell
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            El método Cornell organiza tus apuntes en tres secciones: ideas clave, anotaciones y resumen. Esta estructura facilita la comprensión, promueve la síntesis de la información y mejora la preparación para exámenes al repasar de forma más estratégica.
          </p>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 animate-fade-in">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Qué es el método Cornell?</h2>
              <p className="text-gray-600 leading-relaxed">
                Desarrollado en la Universidad de Cornell por Walter Pauk en la década de 1950, este sistema de toma de notas divide la página en tres secciones distintas. Esta estructura promueve el procesamiento activo de la información durante y después de la clase, facilitando un aprendizaje más profundo y un repaso más efectivo.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Layout */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Layout className="w-8 h-8 text-blue-500 mr-3" />
            Estructura de la página
          </h2>
          
          <div className="border-4 border-blue-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-100 p-4 border-b-4 border-blue-200">
              <p className="text-center font-semibold text-blue-900">Título del tema / Fecha</p>
            </div>
            
            {/* Main content area */}
            <div className="grid grid-cols-3">
              {/* Left column - Questions */}
              <div className="col-span-1 border-r-4 border-blue-200 bg-blue-50 p-6">
                <h3 className="font-bold text-blue-900 mb-3">Preguntas / Palabras clave</h3>
                <p className="text-sm text-gray-600">
                  ¿Qué es...?<br/>
                  ¿Cómo...?<br/>
                  ¿Por qué...?<br/>
                  Conceptos importantes
                </p>
              </div>
              
              {/* Right column - Notes */}
              <div className="col-span-2 bg-white p-6">
                <h3 className="font-bold text-gray-900 mb-3">Notas / Anotaciones</h3>
                <p className="text-sm text-gray-600">
                  Ideas principales<br/>
                  Detalles importantes<br/>
                  Ejemplos<br/>
                  Diagramas<br/>
                  Fórmulas
                </p>
              </div>
            </div>
            
            {/* Bottom - Summary */}
            <div className="border-t-4 border-blue-200 bg-blue-50 p-6">
              <h3 className="font-bold text-blue-900 mb-2">Resumen</h3>
              <p className="text-sm text-gray-600">
                Breve resumen de las ideas principales de la página (3-5 oraciones)
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <BookOpen className="w-8 h-8 text-green-500 mr-3" />
            ¿Cómo funciona?
          </h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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
              <FileText className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Consejos</h2>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">💡</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center animate-slide-up">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Comienza a organizar tus apuntes con el método Cornell y mejora tu retención.
          </p>
          <button 
            onClick={() => navigate('/iniciar/cornell')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg"
          >
            📝 Crear Plantilla Cornell
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetodoCornell;