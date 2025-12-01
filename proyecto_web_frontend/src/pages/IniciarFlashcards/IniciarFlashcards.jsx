import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardSessionAPI } from '../../services/api';
import api from '../../services/api';

function IniciarFlashcards() {
  const navigate = useNavigate();
  
  // Estados
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionData, setSessionData] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar colecciones al iniciar
  useEffect(() => {
    loadCollections();
  }, []);

  // Timer
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, startTime]);

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/flashcards/collections');
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error al cargar colecciones:', err);
      setError('Error al cargar tus colecciones de flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (collection) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/flashcards/collections/${collection.collection_id}`);
      const cards = response.data.flashcards || [];
      
      if (cards.length === 0) {
        setError('Esta colección no tiene flashcards. Agrega algunas primero.');
        setIsLoading(false);
        return;
      }

      // Mezclar tarjetas aleatoriamente
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      
      setFlashcards(shuffled);
      setSelectedCollection(collection);
      setIsSessionActive(true);
      setIsSessionFinished(false);
      setStartTime(Date.now());
      setCurrentCardIndex(0);
      setSessionData({ easy: 0, medium: 0, hard: 0 });
      setIsFlipped(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al iniciar la sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDifficulty = async (difficulty) => {
    // Registrar dificultad
    const newSessionData = {
      ...sessionData,
      [difficulty]: sessionData[difficulty] + 1
    };
    setSessionData(newSessionData);

    // Siguiente tarjeta o finalizar
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Sesión completada
      await finishSession(newSessionData);
    }
  };

  const finishSession = async (finalData) => {
    setIsSessionActive(false);
    setIsSessionFinished(true);
    
    const durationMinutes = Math.max(1, Math.ceil(elapsedTime / 60));
    const totalCards = finalData.easy + finalData.medium + finalData.hard;

    try {
      await flashcardSessionAPI.createSession({
        collection_id: selectedCollection.collection_id,
        cards_studied: totalCards,
        cards_easy: finalData.easy,
        cards_medium: finalData.medium,
        cards_hard: finalData.hard,
        duration_minutes: durationMinutes,
        notes: `Sesión de estudio: ${selectedCollection.collection_name}`
      });
    } catch (err) {
      console.error('Error al guardar sesión:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setIsSessionFinished(false);
    setSelectedCollection(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setSessionData({ easy: 0, medium: 0, hard: 0 });
    setElapsedTime(0);
    setIsFlipped(false);
  };

  // Vista de resumen final
  if (isSessionFinished) {
    const total = sessionData.easy + sessionData.medium + sessionData.hard;
    const easyPercent = total > 0 ? Math.round((sessionData.easy / total) * 100) : 0;
    const mediumPercent = total > 0 ? Math.round((sessionData.medium / total) * 100) : 0;
    const hardPercent = total > 0 ? Math.round((sessionData.hard / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Sesión Completada!
            </h1>
            <p className="text-gray-600 mb-8">
              {selectedCollection?.collection_name}
            </p>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-3xl mb-2">😊</div>
                <div className="text-2xl font-bold text-green-600">{sessionData.easy}</div>
                <div className="text-sm text-gray-600">Fácil ({easyPercent}%)</div>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="text-3xl mb-2">🤔</div>
                <div className="text-2xl font-bold text-yellow-600">{sessionData.medium}</div>
                <div className="text-sm text-gray-600">Media ({mediumPercent}%)</div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-3xl mb-2">😰</div>
                <div className="text-2xl font-bold text-red-600">{sessionData.hard}</div>
                <div className="text-sm text-gray-600">Difícil ({hardPercent}%)</div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <div className="flex justify-center gap-8 text-gray-600">
                <div>
                  <span className="font-semibold">⏱️ Tiempo:</span> {formatTime(elapsedTime)}
                </div>
                <div>
                  <span className="font-semibold">📚 Tarjetas:</span> {total}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetSession}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
              >
                🔄 Nueva Sesión
              </button>
              <button
                onClick={() => navigate('/seguimiento')}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
              >
                📊 Ver Progreso
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de sesión activa
  if (isSessionActive && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🗂️ {selectedCollection.collection_name}
            </h1>
            
            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tarjeta {currentCardIndex + 1} de {flashcards.length}</span>
                <span>⏱️ {formatTime(elapsedTime)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tarjeta */}
          <div className="mb-6">
            <div
              onClick={handleFlip}
              className={`bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all duration-500 min-h-[350px] flex items-center justify-center hover:shadow-3xl ${
                isFlipped ? 'bg-gradient-to-br from-green-50 to-white' : ''
              }`}
            >
              <div className="text-center w-full">
                {!isFlipped ? (
                  <>
                    <div className="text-sm text-gray-500 mb-4">PREGUNTA</div>
                    <div className="text-2xl font-bold text-gray-800 mb-6">
                      {currentCard.question}
                    </div>
                    <p className="text-gray-400 text-sm">
                      👆 Toca para ver la respuesta
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-green-600 mb-4">RESPUESTA</div>
                    <div className="text-xl text-gray-800">
                      {currentCard.answer}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botones de dificultad (solo si está volteada) */}
          {isFlipped && (
            <div className="grid grid-cols-3 gap-4 animate-fade-in">
              <button
                onClick={() => handleDifficulty('easy')}
                className="bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="text-2xl mb-1">😊</div>
                <div>Fácil</div>
              </button>
              
              <button
                onClick={() => handleDifficulty('medium')}
                className="bg-yellow-500 text-white py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="text-2xl mb-1">🤔</div>
                <div>Media</div>
              </button>
              
              <button
                onClick={() => handleDifficulty('hard')}
                className="bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="text-2xl mb-1">😰</div>
                <div>Difícil</div>
              </button>
            </div>
          )}

          {/* Botón cancelar */}
          <div className="mt-8 text-center">
            <button
              onClick={resetSession}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              ✕ Cancelar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de selección de colección
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🗂️ Sesión de Flashcards
          </h1>
          <p className="text-gray-600">
            Selecciona una colección para comenzar a estudiar
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Lista de colecciones */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Tus Colecciones
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando colecciones...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
                <div className="text-5xl mb-4">📭</div>
                <p>No tienes colecciones de flashcards aún.</p>
              </div>
          ) : (
            <div className="space-y-4">
              {collections.map((collection) => (
                <div
                  key={collection.collection_id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `#${collection.collection_color || '10B981'}` }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {collection.collection_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {collection.flashcards?.length || 0} tarjetas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => startSession(collection)}
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 group-hover:scale-105"
                    >
                      Estudiar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/mis-flashcards')}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
          >
            ➕ Crear Nueva Colección
          </button>
        </div>

        {/* Botón para volver */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/metodo/flashcards')}
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}

export default IniciarFlashcards;