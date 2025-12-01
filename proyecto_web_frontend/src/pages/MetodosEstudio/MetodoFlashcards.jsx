import React from 'react';
import { useNavigate } from 'react-router-dom';

function MetodoFlashcards() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header con Badge */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            🗂️ Método Flashcards
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Método de Flashcards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Memoriza información de forma efectiva mediante tarjetas de estudio y repetición activa
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 animate-fade-in">
          
          {/* ¿Qué es? */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💡
              </div>
              <h2 className="text-3xl font-bold text-gray-800">¿Qué son las Flashcards?</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Las <strong>flashcards</strong> (o tarjetas de estudio) son herramientas de aprendizaje que consisten en 
              tarjetas con una pregunta o concepto en un lado y la respuesta en el otro. Este método se basa en la 
              <strong> repetición espaciada</strong> y el <strong>recuerdo activo</strong>, dos técnicas científicamente 
              comprobadas para mejorar la retención de información a largo plazo.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              A diferencia de simplemente releer tus apuntes, las flashcards te obligan a <strong>recuperar 
              activamente</strong> la información de tu memoria, lo que fortalece las conexiones neuronales y 
              mejora significativamente tu capacidad de recordar.
            </p>
          </section>

          {/* Pasos del Método */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📋
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Cómo Usar las Flashcards</h2>
            </div>

            <div className="space-y-6">
              {/* Paso 1 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Crea tus tarjetas</h3>
                    <p className="text-gray-700">
                      En un lado escribe una <strong>pregunta</strong>, <strong>término</strong> o <strong>concepto</strong>. 
                      En el otro lado escribe la <strong>respuesta</strong> o <strong>definición</strong>. Mantén cada 
                      tarjeta simple y enfocada en una sola idea. Puedes usar tarjetas físicas o aplicaciones digitales 
                      como Anki, Quizlet o Brainscape.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Estudia activamente</h3>
                    <p className="text-gray-700">
                      Lee la pregunta y <strong>trata de responder sin ver la respuesta</strong>. Esto es crucial: 
                      el esfuerzo de recordar es lo que fortalece tu memoria. Después de intentar responder, voltea 
                      la tarjeta y verifica si acertaste.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Separa por grupos</h3>
                    <p className="text-gray-700">
                      Organiza tus tarjetas en <strong>tres pilas</strong>: "Sé bien", "Sé más o menos" y "No sé". 
                      Las tarjetas que dominas las repasas con menos frecuencia, mientras que las difíciles las 
                      revisas más seguido. Este sistema es la base de la <strong>repetición espaciada</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Repite regularmente</h3>
                    <p className="text-gray-700">
                      Repasa tus tarjetas <strong>diariamente</strong> al principio, luego cada vez con más espacios 
                      de tiempo (cada 2 días, cada semana, etc.). Las aplicaciones digitales calculan automáticamente 
                      cuándo debes repasar cada tarjeta para maximizar tu retención.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Beneficios */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                ⭐
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Beneficios del Método</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Memorización efectiva</h3>
                <p className="text-gray-700">
                  El recuerdo activo fortalece las conexiones neuronales, haciendo que la información 
                  sea más fácil de recordar a largo plazo.
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Identifica debilidades</h3>
                <p className="text-gray-700">
                  Rápidamente descubres qué temas dominas y cuáles necesitas repasar más, 
                  optimizando tu tiempo de estudio.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Sesiones cortas</h3>
                <p className="text-gray-700">
                  Puedes estudiar efectivamente en sesiones de 10-15 minutos, perfecto para 
                  aprovechar tiempos muertos.
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Portabilidad</h3>
                <p className="text-gray-700">
                  Tanto físicas como digitales, puedes llevar tus flashcards a cualquier 
                  lugar y estudiar cuando tengas tiempo libre.
                </p>
              </div>
            </div>
          </section>

          {/* Consejos Prácticos */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💡
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Consejos para Mejores Resultados</h2>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Mantén las tarjetas simples</h4>
                  <p className="text-gray-700">
                    Una pregunta = una respuesta. No sobrecargues una tarjeta con múltiples conceptos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Usa imágenes cuando sea posible</h4>
                  <p className="text-gray-700">
                    Los elementos visuales ayudan a crear asociaciones más fuertes y memorables.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Escribe con tus propias palabras</h4>
                  <p className="text-gray-700">
                    No copies textualmente del libro. Reformular la información te ayuda a comprenderla mejor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Estudia en ambas direcciones</h4>
                  <p className="text-gray-700">
                    A veces lee la pregunta → respuesta, otras veces lee la respuesta → pregunta para 
                    fortalecer las conexiones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Sé consistente con los repasos</h4>
                  <p className="text-gray-700">
                    Mejor 15 minutos diarios que 2 horas una vez a la semana. La repetición espaciada 
                    funciona mejor con constancia.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* 🚨 NUEVA SECCIÓN DE BOTÓN DE ACCIÓN */}
          <section className="mt-12 pt-8 border-t border-gray-200">
             <div className="flex justify-center">
                <button
                   onClick={() => navigate('/iniciar/flashcards')}
                   className="w-full md:w-3/4 lg:w-1/2 px-10 py-4 bg-gradient-to-r from-orange-500 to-yellow-600 text-white text-xl font-bold rounded-xl shadow-2xl hover:from-orange-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100"
                >
                    🚀 Empezar a Crear Flashcards
                </button>
             </div>
          </section>
          <br>
          </br>
          {/* Ejemplo Práctico */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📝
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Ejemplo de Flashcard</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Frente */}
              <div className="bg-white border-4 border-yellow-400 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-4">
                  <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold">
                    FRENTE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">Pregunta:</h3>
                <p className="text-lg text-gray-700 text-center">
                  ¿Qué es la fotosíntesis?
                </p>
              </div>

              {/* Reverso */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl p-8 shadow-xl text-white">
                <div className="text-center mb-4">
                  <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-bold">
                    REVERSO
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Respuesta:</h3>
                <p className="text-lg text-center">
                  Proceso por el cual las plantas convierten la luz solar, agua y CO₂ en 
                  glucosa y oxígeno, produciendo su propio alimento.
                </p>
              </div>
            </div>

            {/* Apps Recomendadas */}
            <div className="mt-8 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📱 Apps Recomendadas
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="font-bold text-gray-800">Anki</p>
                  <p className="text-sm text-gray-600">Gratis • Repetición espaciada avanzada</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">Quizlet</p>
                  <p className="text-sm text-gray-600">Freemium • Fácil de usar</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">RemNote</p>
                  <p className="text-sm text-gray-600">Freemium • Notas + Flashcards</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Botones de Navegación */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate('/metodos-estudio')}
            className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            ← Volver a Métodos
          </button>
          <button
            onClick={() => navigate('/cuestionario')}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-700 transition-all duration-300 shadow-lg"
          >
            Hacer el Cuestionario 🎯
          </button>
        </div>

        {/* Mensaje Motivacional */}
        <div className="text-center">
          <p className="text-gray-600 italic">
            "La repetición es la madre del aprendizaje" 💪
          </p>
        </div>
      </div>
    </div>
  );
}

export default MetodoFlashcards;