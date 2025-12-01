import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardsAPI } from '../../services/api';

function MisFlashcards() {
  const navigate = useNavigate();
  
  // Estados de modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Estados de UI
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState('Guardado correctamente');
  const [expandedCourses, setExpandedCourses] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para nueva flashcard
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    collectionId: ''
  });

  // Estado para nueva colección (curso)
  const [newCourse, setNewCourse] = useState({
    name: '',
    color: '3B82F6' // Azul por defecto (HEX sin #)
  });

  // Estado para datos - colecciones con sus flashcards
  const [collections, setCollections] = useState([]);

  // Colores disponibles para colecciones (HEX sin #)
  const courseColors = [
    { id: '3B82F6', name: 'Azul', gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
    { id: '8B5CF6', name: 'Púrpura', gradient: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
    { id: '22C55E', name: 'Verde', gradient: 'from-green-400 to-green-600', bg: 'bg-green-50', border: 'border-green-300' },
    { id: 'F97316', name: 'Naranja', gradient: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
    { id: 'EC4899', name: 'Rosa', gradient: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', border: 'border-pink-300' },
    { id: '14B8A6', name: 'Turquesa', gradient: 'from-teal-400 to-teal-600', bg: 'bg-teal-50', border: 'border-teal-300' }
  ];

  // Cargar datos del backend al iniciar
  useEffect(() => {
    loadCollections();
  }, []);

  // Cargar colecciones desde el backend
  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const collectionsData = await flashcardsAPI.getCollections();
      
      // Para cada colección, cargar sus flashcards
      const collectionsWithCards = await Promise.all(
        collectionsData.map(async (collection) => {
          try {
            const fullCollection = await flashcardsAPI.getCollectionWithCards(collection.collection_id);
            return {
              ...collection,
              flashcards: fullCollection.flashcards || []
            };
          } catch (err) {
            console.error(`Error cargando flashcards de colección ${collection.collection_id}:`, err);
            return {
              ...collection,
              flashcards: []
            };
          }
        })
      );
      
      setCollections(collectionsWithCards);
    } catch (err) {
      console.error('Error cargando colecciones:', err);
      setError('Error al cargar tus colecciones. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar mensaje de éxito
  const showSuccess = (message = 'Guardado correctamente') => {
    setSuccessText(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Agregar colección (curso)
  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      alert('Por favor ingresa el nombre del curso');
      return;
    }

    setIsSaving(true);
    
    try {
      await flashcardsAPI.createCollection({
        collection_name: newCourse.name.trim(),
        collection_color: newCourse.color
      });

      // Recargar colecciones
      await loadCollections();
      
      // Reset form y cerrar modal
      setNewCourse({ name: '', color: '3B82F6' });
      setShowAddCourseModal(false);
      showSuccess('Curso creado correctamente');
    } catch (err) {
      console.error('Error creando colección:', err);
      alert('Error al crear el curso: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar flashcard
  const handleAddFlashcard = async () => {
    if (!newCard.question.trim() || !newCard.answer.trim() || !newCard.collectionId) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsSaving(true);
    
    try {
      // card_user se obtiene automáticamente del token en el backend
      await flashcardsAPI.createCard(newCard.collectionId, {
        question: newCard.question.trim(),
        answer: newCard.answer.trim()
      });

      // Recargar colecciones para actualizar conteo
      await loadCollections();
      
      // Reset form y cerrar modal
      setNewCard({ question: '', answer: '', collectionId: '' });
      setShowAddModal(false);
      showSuccess('Flashcard creada correctamente');
    } catch (err) {
      console.error('Error creando flashcard:', err);
      alert('Error al crear la flashcard: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar flashcard
  const handleDeleteFlashcard = async (cardId) => {
    if (window.confirm('¿Estás seguro de eliminar esta flashcard?')) {
      try {
        await flashcardsAPI.deleteCard(cardId);
        await loadCollections();
        showSuccess('Flashcard eliminada');
      } catch (err) {
        console.error('Error eliminando flashcard:', err);
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  // Eliminar colección (y sus flashcards)
  const handleDeleteCourse = async (collectionId) => {
    const collection = collections.find(c => c.collection_id === collectionId);
    const cardsCount = collection?.flashcards?.length || 0;
    
    const message = cardsCount > 0
      ? `¿Estás seguro de eliminar este curso? También se eliminarán ${cardsCount} flashcard(s)`
      : '¿Estás seguro de eliminar este curso?';
    
    if (window.confirm(message)) {
      try {
        await flashcardsAPI.deleteCollection(collectionId);
        await loadCollections();
        showSuccess('Curso eliminado');
      } catch (err) {
        console.error('Error eliminando colección:', err);
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  // Toggle expandir curso
  const toggleCourse = (collectionId) => {
    if (expandedCourses.includes(collectionId)) {
      setExpandedCourses(expandedCourses.filter(id => id !== collectionId));
    } else {
      setExpandedCourses([...expandedCourses, collectionId]);
    }
  };

  // Toggle voltear card
  const toggleFlipCard = (cardId) => {
    if (flippedCards.includes(cardId)) {
      setFlippedCards(flippedCards.filter(id => id !== cardId));
    } else {
      setFlippedCards([...flippedCards, cardId]);
    }
  };

  // Obtener color del curso
  const getCourseColor = (colorHex) => {
    return courseColors.find(c => c.id === colorHex) || courseColors[0];
  };

  // Ver flashcard en modal
  const handleViewCard = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  // Calcular totales
  const totalCollections = collections.length;
  const totalFlashcards = collections.reduce((sum, c) => sum + (c.flashcards?.length || 0), 0);

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tus flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            🗂️ Mis Flashcards
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Mis Flashcards de Estudio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organiza tus flashcards por curso y practica con repetición espaciada
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto">
            ⚠️ {error}
            <button 
              onClick={loadCollections}
              className="ml-4 underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estadísticas Rápidas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-800">{totalCollections}</p>
            <p className="text-gray-600">Cursos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🗂️</div>
            <p className="text-3xl font-bold text-gray-800">{totalFlashcards}</p>
            <p className="text-gray-600">Flashcards</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              + Crear Curso
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={collections.length === 0}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Nueva Flashcard
            </button>
          </div>
        </div>

        {/* Lista de Cursos y Flashcards */}
        <div className="space-y-6">
          {collections.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tienes cursos aún</h3>
              <p className="text-gray-600 mb-6">Crea tu primer curso para empezar a agregar flashcards</p>
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                + Crear mi primer curso
              </button>
            </div>
          ) : (
            collections.map((collection) => {
              const colorInfo = getCourseColor(collection.collection_color);
              const isExpanded = expandedCourses.includes(collection.collection_id);
              const flashcards = collection.flashcards || [];
              
              return (
                <div key={collection.collection_id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  {/* Header del Curso */}
                  <div 
                    className={`bg-gradient-to-r ${colorInfo.gradient} p-6 cursor-pointer`}
                    onClick={() => toggleCourse(collection.collection_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{collection.collection_name}</h3>
                          <p className="text-white/80">{flashcards.length} flashcards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(collection.collection_id);
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                        >
                          🗑️
                        </button>
                        <div className={`text-white text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flashcards del Curso */}
                  {isExpanded && (
                    <div className="p-6">
                      {flashcards.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No hay flashcards en este curso</p>
                          <button
                            onClick={() => {
                              setNewCard({ ...newCard, collectionId: collection.collection_id });
                              setShowAddModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            + Agregar primera flashcard
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {flashcards.map((card) => {
                            const isFlipped = flippedCards.includes(card.flashcard_id);
                            
                            return (
                              <div 
                                key={card.flashcard_id}
                                className="perspective-1000"
                              >
                                <div 
                                  className={`relative h-48 cursor-pointer transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
                                  onClick={() => toggleFlipCard(card.flashcard_id)}
                                >
                                  {/* Frente - Pregunta */}
                                  <div className={`absolute inset-0 ${colorInfo.bg} ${colorInfo.border} border-2 rounded-2xl p-4 backface-hidden`}>
                                    <div className="flex flex-col h-full">
                                      <span className="bg-yellow-200 px-2 py-1 rounded-full text-xs font-bold text-yellow-800 self-start mb-2">
                                        PREGUNTA
                                      </span>
                                      <p className="text-gray-800 font-semibold flex-1 flex items-center justify-center text-center">
                                        {card.question}
                                      </p>
                                      <p className="text-xs text-gray-500 text-center mt-2">
                                        Toca para ver respuesta
                                      </p>
                                    </div>
                                  </div>

                                  {/* Reverso - Respuesta */}
                                  <div className={`absolute inset-0 bg-gradient-to-br ${colorInfo.gradient} rounded-2xl p-4 backface-hidden rotate-y-180`}>
                                    <div className="flex flex-col h-full">
                                      <span className="bg-white/30 px-2 py-1 rounded-full text-xs font-bold text-white self-start mb-2">
                                        RESPUESTA
                                      </span>
                                      <p className="text-white font-semibold flex-1 flex items-center justify-center text-center">
                                        {card.answer}
                                      </p>
                                      <div className="flex justify-center gap-2 mt-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewCard(card);
                                          }}
                                          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-all"
                                        >
                                          👁️ Ver
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFlashcard(card.flashcard_id);
                                          }}
                                          className="bg-white/20 hover:bg-red-500/50 text-white px-3 py-1 rounded-lg text-sm transition-all"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Botón agregar más */}
                      {flashcards.length > 0 && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => {
                              setNewCard({ ...newCard, collectionId: collection.collection_id });
                              setShowAddModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            + Agregar más flashcards
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Botones de navegación */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/iniciar/flashcards')}
            disabled={totalFlashcards === 0}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎯 Iniciar Sesión de Estudio
          </button>
          <button
            onClick={() => navigate('/metodo/flashcards')}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            ← Volver al Método
          </button>
        </div>

        {/* Modal Agregar Curso */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Curso</h2>
              
              <div className="space-y-4">
                {/* Nombre del curso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del curso *</label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    placeholder="Ej: Matemáticas, Historia, Biología..."
                    maxLength={100}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                {/* Color del curso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color del curso</label>
                  <div className="grid grid-cols-3 gap-3">
                    {courseColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setNewCourse({...newCourse, color: color.id})}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          newCourse.color === color.id
                            ? `bg-gradient-to-r ${color.gradient} text-white shadow-lg scale-105`
                            : `${color.bg} ${color.border} border-2 text-gray-700`
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setNewCourse({ name: '', color: '3B82F6' });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Crear Curso'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Agregar Flashcard */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Flashcard</h2>
              
              <div className="space-y-4">
                {/* Curso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Curso *</label>
                  <select
                    value={newCard.collectionId}
                    onChange={(e) => setNewCard({...newCard, collectionId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none"
                  >
                    <option value="">Selecciona un curso</option>
                    {collections.map(collection => (
                      <option key={collection.collection_id} value={collection.collection_id}>
                        {collection.collection_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pregunta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pregunta * <span className="text-gray-400 font-normal">({newCard.question.length}/255)</span>
                  </label>
                  <textarea
                    value={newCard.question}
                    onChange={(e) => setNewCard({...newCard, question: e.target.value})}
                    placeholder="¿Qué pregunta quieres hacer?"
                    rows={3}
                    maxLength={255}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none resize-none"
                  />
                </div>

                {/* Respuesta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Respuesta * <span className="text-gray-400 font-normal">({newCard.answer.length}/500)</span>
                  </label>
                  <textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard({...newCard, answer: e.target.value})}
                    placeholder="Escribe la respuesta concisa y clara"
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCard({ question: '', answer: '', collectionId: '' });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddFlashcard}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Crear Flashcard'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver Flashcard */}
        {showCardModal && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles de la Flashcard</h2>
              
              <div className="space-y-6">
                {/* Pregunta */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
                  <span className="bg-yellow-200 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 inline-block mb-3">
                    PREGUNTA
                  </span>
                  <p className="text-gray-800 text-lg font-semibold">
                    {selectedCard.question}
                  </p>
                </div>

                {/* Respuesta */}
                <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6">
                  <span className="bg-orange-200 px-3 py-1 rounded-full text-xs font-bold text-orange-800 inline-block mb-3">
                    RESPUESTA
                  </span>
                  <p className="text-gray-800 text-lg font-semibold">
                    {selectedCard.answer}
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleDeleteFlashcard(selectedCard.flashcard_id);
                    setShowCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
                >
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {showSuccessMessage && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 z-50">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">{successText}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
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

export default MisFlashcards;