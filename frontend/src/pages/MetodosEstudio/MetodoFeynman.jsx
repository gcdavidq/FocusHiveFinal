import React from 'react';
import { useNavigate } from 'react-router-dom';

function MetodoFeynman() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header con Badge */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-purple-400 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            🧠 Técnica Feynman
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Técnica Feynman
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Aprende cualquier tema explicándolo con palabras simples, como si se lo enseñaras a un niño
          </p>
        </div>

        {/* CTA del Tutorial - NUEVO */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 md:p-8 text-center text-white shadow-2xl mb-8 animate-fade-in">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            ¿Listo para aplicar el Método Feynman?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Te guiaremos paso a paso en un tutorial interactivo
          </p>
          <button
            onClick={() => navigate('/iniciar/feynman')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
          >
            🧠 Comenzar Método Feynman
            <span>→</span>
          </button>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 animate-fade-in">
          
          {/* ¿Qué es? */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💡
              </div>
              <h2 className="text-3xl font-bold text-gray-800">¿Qué es la Técnica Feynman?</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Nombrada en honor al físico Richard Feynman, esta técnica se basa en un principio simple pero poderoso: 
              <strong> si no puedes explicar algo con palabras simples, realmente no lo entiendes</strong>.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              El método Feynman te obliga a identificar exactamente qué partes de un concepto comprendes y cuáles no, 
              revelando los vacíos en tu conocimiento para que puedas llenarlos de manera efectiva.
            </p>
          </section>

          {/* Los 4 Pasos */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📋
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Los 4 Pasos del Método</h2>
            </div>

            <div className="space-y-6">
              {/* Paso 1 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Elige el concepto</h3>
                    <p className="text-gray-700">
                      Selecciona el tema que quieres aprender. Escribe el nombre del concepto en la parte superior 
                      de una hoja en blanco o documento digital.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-600">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Explícalo con palabras simples</h3>
                    <p className="text-gray-700">
                      Escribe una explicación del concepto <strong>como si se lo estuvieras enseñando a un niño de 12 años</strong>. 
                      Usa lenguaje sencillo, sin jerga técnica. Si no puedes hacerlo simple, es señal de que no lo entiendes 
                      completamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Identifica los vacíos</h3>
                    <p className="text-gray-700">
                      Revisa tu explicación. <strong>¿Dónde te trabaste? ¿Qué partes fueron confusas?</strong> Esos 
                      son tus vacíos de conocimiento. Vuelve al material fuente (libro, apuntes, videos) y llena esas 
                      lagunas específicas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-600">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Simplifica y usa analogías</h3>
                    <p className="text-gray-700">
                      Ahora que llenaste los vacíos, reescribe tu explicación de forma aún más simple. 
                      <strong> Usa analogías y ejemplos del día a día</strong> para hacer el concepto más accesible. 
                      Si suena demasiado complejo, simplifícalo más.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Beneficios */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                ⭐
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Beneficios de este Método</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Comprensión profunda</h3>
                <p className="text-gray-700">
                  No solo memorizas, realmente entiendes los conceptos y puedes aplicarlos en diferentes contextos.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Identifica vacíos</h3>
                <p className="text-gray-700">
                  Descubres exactamente qué partes no entiendes, en lugar de tener una falsa sensación de 
                  conocimiento.
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mejora la retención</h3>
                <p className="text-gray-700">
                  El proceso de explicar activamente refuerza las conexiones neuronales, mejorando tu memoria 
                  a largo plazo.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-3xl mb-3">🗣️</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Habilidades de comunicación</h3>
                <p className="text-gray-700">
                  Practicar explicar conceptos complejos de forma simple mejora tu capacidad de enseñar y 
                  presentar ideas.
                </p>
              </div>
            </div>
          </section>

          {/* Consejos */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💡
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Consejos para Mejores Resultados</h2>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Sé honesto contigo mismo</h4>
                  <p className="text-gray-700">
                    No te engañes. Si usas palabras complicadas o jerga técnica, probablemente no lo entiendes 
                    tan bien como crees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Explícalo en voz alta</h4>
                  <p className="text-gray-700">
                    Hablar en voz alta (aunque estés solo) hace el ejercicio más efectivo. Nota dónde te trabas 
                    al hablar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Usa analogías cotidianas</h4>
                  <p className="text-gray-700">
                    Relaciona conceptos abstractos con cosas del día a día. Por ejemplo: "El ADN es como un libro 
                    de instrucciones para construir un ser vivo".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Practica con alguien más</h4>
                  <p className="text-gray-700">
                    Explícale el concepto a un amigo o familiar. Sus preguntas revelarán aspectos que aún necesitas 
                    aclarar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Repite el proceso</h4>
                  <p className="text-gray-700">
                    El método Feynman no es de una sola vez. Cada vez que repasas, puedes simplificar y entender 
                    mejor el tema.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ejemplo */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📝
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Ejemplo Práctico</h2>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tema: Fotosíntesis</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-purple-600 mb-2">❌ Explicación complicada (antes de Feynman):</p>
                  <p className="text-gray-700 italic">
                    "La fotosíntesis es el proceso metabólico mediante el cual los organismos autótrofos 
                    sintetizan moléculas orgánicas utilizando la energía lumínica..."
                  </p>
                </div>

                <div>
                  <p className="font-bold text-green-600 mb-2">✅ Explicación simple (después de Feynman):</p>
                  <p className="text-gray-700 italic">
                    "La fotosíntesis es como la forma en que las plantas 'comen'. Nosotros comemos comida, 
                    pero las plantas crean su propia comida usando la luz del sol, agua y el aire que respiramos. 
                    Es como si tuvieran una fábrica en sus hojas que convierte la luz solar en energía. 
                    Como bonus, nos regalan oxígeno limpio en el proceso."
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Final al Tutorial */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para dominar cualquier tema? 🚀
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Sigue nuestro tutorial interactivo paso a paso
          </p>
          <button
            onClick={() => navigate('/iniciar/feynman')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
          >
            🧠 Comenzar Método Feynman
            <span>→</span>
          </button>
        </div>

        {/* Botones de Navegación */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate('/metodos-estudio')}
            className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            ← Volver a Métodos de Estudio
          </button>
          <button
            onClick={() => navigate('/cuestionario')}
            className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Hacer el Cuestionario 🎯
          </button>
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

export default MetodoFeynman;