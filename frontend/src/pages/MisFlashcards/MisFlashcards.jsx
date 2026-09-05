import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardsAPI } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useUI } from '../../hooks/useUI';
import Modal from '../../components/ui/Modal';
import { ErrorBanner } from '../../components/ui/ErrorState';
import { FullPageSpinner } from '../../components/ui/Spinner';

const COURSE_COLORS = [
  { id: '3B82F6', name: 'Azul', gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  { id: '8B5CF6', name: 'Púrpura', gradient: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
  { id: '22C55E', name: 'Verde', gradient: 'from-green-400 to-green-600', bg: 'bg-green-50', border: 'border-green-300' },
  { id: 'F97316', name: 'Naranja', gradient: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
  { id: 'EC4899', name: 'Rosa', gradient: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', border: 'border-pink-300' },
  { id: '14B8A6', name: 'Turquesa', gradient: 'from-teal-400 to-teal-600', bg: 'bg-teal-50', border: 'border-teal-300' },
];

const EMPTY_CARD = { question: '', answer: '', collectionId: '' };
const EMPTY_COURSE = { name: '', color: '3B82F6' };

const getCourseColor = (hex) => COURSE_COLORS.find((color) => color.id === String(hex || '').toUpperCase()) || COURSE_COLORS[0];

/** Gestión de colecciones (cursos) y flashcards del usuario. */
export default function MisFlashcards() {
  const navigate = useNavigate();
  const ui = useUI();
  const collections = useAsync(() => flashcardsAPI.getCollections(), []);

  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newCard, setNewCard] = useState(EMPTY_CARD);
  const [newCourse, setNewCourse] = useState(EMPTY_COURSE);

  const list = collections.data || [];
  const totalCards = list.reduce((sum, collection) => sum + (collection.flashcards?.length || 0), 0);

  const toggle = (setter) => (id) => setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleCourse = toggle(setExpanded);
  const toggleFlip = toggle(setFlipped);

  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      ui.warning('Ingresa el nombre del curso');
      return;
    }
    setIsSaving(true);
    try {
      await flashcardsAPI.createCollection({ collection_name: newCourse.name.trim(), collection_color: newCourse.color });
      await collections.reload();
      setNewCourse(EMPTY_COURSE);
      setShowAddCourse(false);
      ui.success('Curso creado correctamente');
    } catch (error) {
      ui.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.question.trim() || !newCard.answer.trim() || !newCard.collectionId) {
      ui.warning('Completa el curso, la pregunta y la respuesta');
      return;
    }
    setIsSaving(true);
    try {
      await flashcardsAPI.createCard(newCard.collectionId, { question: newCard.question.trim(), answer: newCard.answer.trim() });
      await collections.reload();
      setExpanded((current) => (current.includes(Number(newCard.collectionId)) ? current : [...current, Number(newCard.collectionId)]));
      setNewCard(EMPTY_CARD);
      setShowAddCard(false);
      ui.success('Flashcard creada correctamente');
    } catch (error) {
      ui.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    const ok = await ui.confirm({ title: 'Eliminar flashcard', message: 'Esta acción no se puede deshacer.', confirmText: 'Eliminar', danger: true });
    if (!ok) return;
    try {
      await flashcardsAPI.deleteCard(cardId);
      setSelectedCard(null);
      await collections.reload();
      ui.success('Flashcard eliminada');
    } catch (error) {
      ui.error(error.message);
    }
  };

  const handleDeleteCourse = async (collection) => {
    const count = collection.flashcards?.length || 0;
    const ok = await ui.confirm({
      title: `Eliminar "${collection.collection_name}"`,
      message: count > 0 ? `También se eliminarán sus ${count} flashcard(s).` : 'El curso está vacío.',
      confirmText: 'Eliminar curso',
      danger: true,
    });
    if (!ok) return;
    try {
      await flashcardsAPI.deleteCollection(collection.collection_id);
      await collections.reload();
      ui.success('Curso eliminado');
    } catch (error) {
      ui.error(error.message);
    }
  };

  const openAddCardFor = (collectionId) => {
    setNewCard({ ...EMPTY_CARD, collectionId: String(collectionId) });
    setShowAddCard(true);
  };

  if (collections.loading && !collections.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50">
        <FullPageSpinner label="Cargando tus flashcards..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            🗂️ Mis Flashcards
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Mis flashcards de estudio</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Organiza tus flashcards por curso y practica con repetición activa</p>
        </div>

        <ErrorBanner message={collections.error} onRetry={collections.reload} />

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-800">{list.length}</p>
            <p className="text-gray-600">Cursos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🗂️</div>
            <p className="text-3xl font-bold text-gray-800">{totalCards}</p>
            <p className="text-gray-600">Flashcards</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center">
            <button
              onClick={() => setShowAddCourse(true)}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              + Crear curso
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center">
            <button
              onClick={() => {
                setNewCard(EMPTY_CARD);
                setShowAddCard(true);
              }}
              disabled={list.length === 0}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Nueva flashcard
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {list.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tienes cursos aún</h3>
              <p className="text-gray-600 mb-6">Crea tu primer curso para empezar a agregar flashcards</p>
              <button
                onClick={() => setShowAddCourse(true)}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                + Crear mi primer curso
              </button>
            </div>
          ) : (
            list.map((collection) => {
              const color = getCourseColor(collection.collection_color);
              const isExpanded = expanded.includes(collection.collection_id);
              const cards = collection.flashcards || [];
              return (
                <div key={collection.collection_id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <button
                    type="button"
                    className={`w-full bg-gradient-to-r ${color.gradient} p-6 text-left`}
                    onClick={() => toggleCourse(collection.collection_id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">📚</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{collection.collection_name}</h3>
                          <p className="text-white/80">{cards.length} flashcards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteCourse(collection);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.stopPropagation();
                              handleDeleteCourse(collection);
                            }
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                          aria-label="Eliminar curso"
                        >
                          🗑️
                        </span>
                        <span className={`text-white text-2xl transition-transform duration-300 inline-block ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6">
                      {cards.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No hay flashcards en este curso</p>
                          <button onClick={() => openAddCardFor(collection.collection_id)} className="text-orange-600 hover:text-orange-700 font-semibold">
                            + Agregar primera flashcard
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cards.map((card) => {
                            const isFlipped = flipped.includes(card.card_id);
                            return (
                              <div key={card.card_id} className="flip-scene h-48">
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className={`flip-card h-full cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
                                  onClick={() => toggleFlip(card.card_id)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') toggleFlip(card.card_id);
                                  }}
                                >
                                  <div className={`flip-face ${color.bg} ${color.border} border-2 rounded-2xl p-4`}>
                                    <div className="flex flex-col h-full">
                                      <span className="bg-yellow-200 px-2 py-1 rounded-full text-xs font-bold text-yellow-800 self-start mb-2">PREGUNTA</span>
                                      <p className="text-gray-800 font-semibold flex-1 flex items-center justify-center text-center break-words">{card.question}</p>
                                      <p className="text-xs text-gray-500 text-center mt-2">Toca para ver la respuesta</p>
                                    </div>
                                  </div>
                                  <div className={`flip-face flip-back bg-gradient-to-br ${color.gradient} rounded-2xl p-4`}>
                                    <div className="flex flex-col h-full">
                                      <span className="bg-white/30 px-2 py-1 rounded-full text-xs font-bold text-white self-start mb-2">RESPUESTA</span>
                                      <p className="text-white font-semibold flex-1 flex items-center justify-center text-center break-words">{card.answer}</p>
                                      <div className="flex justify-center gap-2 mt-2">
                                        <button
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedCard(card);
                                          }}
                                          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-all"
                                        >
                                          👁️ Ver
                                        </button>
                                        <button
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteCard(card.card_id);
                                          }}
                                          className="bg-white/20 hover:bg-red-500/60 text-white px-3 py-1 rounded-lg text-sm transition-all"
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
                      {cards.length > 0 && (
                        <div className="mt-6 text-center">
                          <button onClick={() => openAddCardFor(collection.collection_id)} className="text-orange-600 hover:text-orange-700 font-semibold">
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

        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/iniciar/flashcards')}
            disabled={totalCards === 0}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎯 Iniciar sesión de estudio
          </button>
          <button onClick={() => navigate('/metodo/flashcards')} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300">
            ← Volver al método
          </button>
        </div>

        {/* Modal: nuevo curso */}
        <Modal open={showAddCourse} onClose={() => setShowAddCourse(false)} title="Crear nuevo curso">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="course-name">
                Nombre del curso *
              </label>
              <input
                id="course-name"
                type="text"
                value={newCourse.name}
                onChange={(event) => setNewCourse({ ...newCourse, name: event.target.value })}
                placeholder="Ej: Matemáticas, Historia, Biología..."
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">Color del curso</p>
              <div className="grid grid-cols-3 gap-3">
                {COURSE_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setNewCourse({ ...newCourse, color: color.id })}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      newCourse.color === color.id ? `bg-gradient-to-r ${color.gradient} text-white shadow-lg scale-105` : `${color.bg} ${color.border} border-2 text-gray-700`
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAddCourse(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button
              onClick={handleAddCourse}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Crear curso'}
            </button>
          </div>
        </Modal>

        {/* Modal: nueva flashcard */}
        <Modal open={showAddCard} onClose={() => setShowAddCard(false)} title="Crear nueva flashcard">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="card-course">
                Curso *
              </label>
              <select
                id="card-course"
                value={newCard.collectionId}
                onChange={(event) => setNewCard({ ...newCard, collectionId: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none"
              >
                <option value="">Selecciona un curso</option>
                {list.map((collection) => (
                  <option key={collection.collection_id} value={collection.collection_id}>
                    {collection.collection_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="card-question">
                Pregunta * <span className="text-gray-400 font-normal">({newCard.question.length}/255)</span>
              </label>
              <textarea
                id="card-question"
                value={newCard.question}
                onChange={(event) => setNewCard({ ...newCard, question: event.target.value })}
                placeholder="¿Qué pregunta quieres hacer?"
                rows={3}
                maxLength={255}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="card-answer">
                Respuesta * <span className="text-gray-400 font-normal">({newCard.answer.length}/500)</span>
              </label>
              <textarea
                id="card-answer"
                value={newCard.answer}
                onChange={(event) => setNewCard({ ...newCard, answer: event.target.value })}
                placeholder="Escribe la respuesta concisa y clara"
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAddCard(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button
              onClick={handleAddCard}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Crear flashcard'}
            </button>
          </div>
        </Modal>

        {/* Modal: ver flashcard */}
        <Modal open={Boolean(selectedCard)} onClose={() => setSelectedCard(null)} title="Detalle de la flashcard" maxWidth="max-w-2xl">
          {selectedCard && (
            <>
              <div className="space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
                  <span className="bg-yellow-200 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 inline-block mb-3">PREGUNTA</span>
                  <p className="text-gray-800 text-lg font-semibold break-words">{selectedCard.question}</p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6">
                  <span className="bg-orange-200 px-3 py-1 rounded-full text-xs font-bold text-orange-800 inline-block mb-3">RESPUESTA</span>
                  <p className="text-gray-800 text-lg font-semibold break-words">{selectedCard.answer}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleDeleteCard(selectedCard.card_id)}
                  className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all border-2 border-red-200"
                >
                  🗑️ Eliminar
                </button>
                <button onClick={() => setSelectedCard(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                  Cerrar
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
