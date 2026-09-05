import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, flashcardSessionAPI, flashcardsAPI } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useUI } from '../../hooks/useUI';
import { formatClock } from '../../utils/format';
import { ErrorBanner } from '../../components/ui/ErrorState';

const DIFFICULTIES = [
  { key: 'easy', label: 'Fácil', icon: '😊', className: 'bg-green-500 hover:bg-green-600' },
  { key: 'medium', label: 'Media', icon: '🤔', className: 'bg-yellow-500 hover:bg-yellow-600' },
  { key: 'hard', label: 'Difícil', icon: '😰', className: 'bg-red-500 hover:bg-red-600' },
];

/** Sesión de repaso de flashcards. Al terminar guarda el detalle y registra la sesión en el dashboard. */
export default function IniciarFlashcards() {
  const navigate = useNavigate();
  const ui = useUI();
  const collections = useAsync(() => flashcardsAPI.getCollections(), []);

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [counts, setCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(null);

  useEffect(() => {
    if (!startedAt || finished) return undefined;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startedAt, finished]);

  const startSession = (collection) => {
    const available = (collection.flashcards || []).filter((card) => card.is_active !== false);
    if (available.length === 0) {
      ui.warning('Esta colección no tiene flashcards. Agrega algunas primero.');
      return;
    }
    setCards([...available].sort(() => Math.random() - 0.5));
    setSelectedCollection(collection);
    setCurrentIndex(0);
    setCounts({ easy: 0, medium: 0, hard: 0 });
    setIsFlipped(false);
    setElapsed(0);
    setStartedAt(new Date().getTime());
    setFinished(null);
  };

  const finishSession = async (finalCounts) => {
    const durationMinutes = Math.min(1440, Math.max(1, Math.round(elapsed / 60)));
    const total = finalCounts.easy + finalCounts.medium + finalCounts.hard;
    let newAchievements = [];
    try {
      await flashcardSessionAPI.createSession({
        collection_id: selectedCollection.collection_id,
        cards_studied: total,
        cards_easy: finalCounts.easy,
        cards_medium: finalCounts.medium,
        cards_hard: finalCounts.hard,
        duration_minutes: durationMinutes,
        notes: `Repaso de "${selectedCollection.collection_name}"`,
      });
      const response = await dashboardAPI.createSession({
        metodo: 'flashcards',
        fecha_inicio: new Date(startedAt).toISOString(),
        duracion_minutos: durationMinutes,
        fue_completada: true,
        descripcion: `Flashcards: ${selectedCollection.collection_name} (${total} tarjetas)`,
      });
      newAchievements = response.new_achievements || [];
      ui.success('Sesión registrada en tu progreso');
    } catch (error) {
      ui.error(`La sesión terminó pero no se pudo guardar: ${error.message}`);
    }
    setFinished({ counts: finalCounts, total, durationMinutes, newAchievements });
  };

  const handleDifficulty = (key) => {
    const updated = { ...counts, [key]: counts[key] + 1 };
    setCounts(updated);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((index) => index + 1);
      setIsFlipped(false);
    } else {
      finishSession(updated);
    }
  };

  const reset = () => {
    setSelectedCollection(null);
    setCards([]);
    setStartedAt(null);
    setFinished(null);
    setElapsed(0);
  };

  // Resumen final
  if (finished) {
    const percent = (value) => (finished.total ? Math.round((value / finished.total) * 100) : 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Sesión completada!</h1>
          <p className="text-gray-600 mb-8">{selectedCollection?.collection_name}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold text-green-600">{finished.counts.easy}</div>
              <div className="text-sm text-gray-600">Fácil ({percent(finished.counts.easy)}%)</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="text-3xl mb-2">🤔</div>
              <div className="text-2xl font-bold text-yellow-600">{finished.counts.medium}</div>
              <div className="text-sm text-gray-600">Media ({percent(finished.counts.medium)}%)</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-3xl mb-2">😰</div>
              <div className="text-2xl font-bold text-red-600">{finished.counts.hard}</div>
              <div className="text-sm text-gray-600">Difícil ({percent(finished.counts.hard)}%)</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 flex justify-center gap-8 text-gray-600">
            <div>
              <span className="font-semibold">⏱️ Tiempo:</span> {formatClock(elapsed)}
            </div>
            <div>
              <span className="font-semibold">📚 Tarjetas:</span> {finished.total}
            </div>
          </div>
          {finished.newAchievements.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8 text-yellow-800 font-semibold">🏆 ¡Nuevo logro desbloqueado!</div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={reset} className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all">
              🔄 Nueva sesión
            </button>
            <button onClick={() => navigate('/seguimiento')} className="flex-1 px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2a4a6f] transition-all">
              📊 Ver mi progreso
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sesión activa
  if (selectedCollection && cards.length > 0) {
    const card = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">🗂️ {selectedCollection.collection_name}</h1>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Tarjeta {currentIndex + 1} de {cards.length}
              </span>
              <span>⏱️ {formatClock(elapsed)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFlipped((flipped) => !flipped)}
            className={`w-full bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transition-all duration-500 min-h-[350px] flex items-center justify-center mb-6 text-center ${
              isFlipped ? 'bg-gradient-to-br from-green-50 to-white' : ''
            }`}
          >
            {!isFlipped ? (
              <div>
                <div className="text-sm text-gray-500 mb-4">PREGUNTA</div>
                <div className="text-2xl font-bold text-gray-800 mb-6">{card.question}</div>
                <p className="text-gray-400 text-sm">👆 Toca para ver la respuesta</p>
              </div>
            ) : (
              <div>
                <div className="text-sm text-green-600 mb-4">RESPUESTA</div>
                <div className="text-xl text-gray-800">{card.answer}</div>
              </div>
            )}
          </button>

          {isFlipped && (
            <div className="grid grid-cols-3 gap-4 animate-fade-in">
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty.key}
                  onClick={() => handleDifficulty(difficulty.key)}
                  className={`${difficulty.className} text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl`}
                >
                  <div className="text-2xl mb-1">{difficulty.icon}</div>
                  <div>{difficulty.label}</div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button onClick={reset} className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
              ✕ Cancelar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Selección de colección
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🗂️ Sesión de Flashcards</h1>
          <p className="text-gray-600">Selecciona una colección para comenzar a estudiar</p>
        </div>

        <ErrorBanner message={collections.error} onRetry={collections.reload} />

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Tus colecciones</h2>
          {collections.loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando colecciones...</p>
            </div>
          ) : !collections.data?.length ? (
            <div className="text-center py-12 text-gray-600">
              <div className="text-5xl mb-4">📭</div>
              <p>No tienes colecciones de flashcards aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collections.data.map((collection) => (
                <div key={collection.collection_id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 transition-all group">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: `#${collection.collection_color || '10B981'}` }} />
                      <div>
                        <h3 className="font-semibold text-gray-800">{collection.collection_name}</h3>
                        <p className="text-sm text-gray-500">{collection.flashcards?.length || 0} tarjetas</p>
                      </div>
                    </div>
                    <button
                      onClick={() => startSession(collection)}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all group-hover:scale-105"
                    >
                      Estudiar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/mis-flashcards')} className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all">
            ➕ Gestionar mis flashcards
          </button>
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/metodo/flashcards')} className="text-green-600 hover:text-green-700 font-medium transition-colors">
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}
