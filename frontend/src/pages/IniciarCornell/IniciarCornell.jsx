import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cornellAPI, dashboardAPI } from '../../services/api';
import { useUI } from '../../hooks/useUI';
import { FullPageSpinner } from '../../components/ui/Spinner';

const EMPTY_NOTE = { title: '', subject: '', notes_section: '', cues_section: '', summary_section: '' };
const AUTOSAVE_MS = 30000;

/**
 * Editor de notas Cornell (palabras clave, notas y resumen) con autoguardado.
 * "Terminar sesión" guarda la nota y registra el tiempo trabajado en el dashboard.
 */
export default function IniciarCornell() {
  const navigate = useNavigate();
  const ui = useUI();
  const { noteId } = useParams();
  const startedAt = useRef(Date.now());
  const autoSaveRef = useRef(null);

  const [formData, setFormData] = useState(EMPTY_NOTE);
  const [currentNoteId, setCurrentNoteId] = useState(noteId ? Number(noteId) : null);
  const [isLoading, setIsLoading] = useState(Boolean(noteId));
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  // Carga la nota cuando la URL trae un id
  useEffect(() => {
    if (!noteId) {
      setFormData(EMPTY_NOTE);
      setCurrentNoteId(null);
      setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    setIsLoading(true);
    cornellAPI
      .getNote(noteId)
      .then((note) => {
        if (cancelled) return;
        setFormData({
          title: note.title || '',
          subject: note.subject || '',
          notes_section: note.notes_section || '',
          cues_section: note.cues_section || '',
          summary_section: note.summary_section || '',
        });
        setCurrentNoteId(note.note_id);
      })
      .catch((err) => !cancelled && setError(err.message || 'Error al cargar la nota'))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  const saveNote = async () => {
    if (!formData.title.trim()) return null;
    setIsSaving(true);
    try {
      let saved;
      if (currentNoteId) {
        saved = await cornellAPI.updateNote(currentNoteId, formData);
      } else {
        saved = await cornellAPI.createNote(formData);
        setCurrentNoteId(saved.note_id);
        window.history.replaceState(null, '', `/iniciar/cornell/${saved.note_id}`);
      }
      setSavedAt(Date.now());
      return saved;
    } finally {
      setIsSaving(false);
    }
  };
  autoSaveRef.current = () => saveNote().catch(() => {});

  useEffect(() => {
    if (!formData.title) return undefined;
    const interval = setInterval(() => autoSaveRef.current?.(), AUTOSAVE_MS);
    return () => clearInterval(interval);
  }, [formData.title]);

  const update = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Ingresa un título para la nota');
      return;
    }
    setError(null);
    try {
      await saveNote();
      ui.success('Nota guardada');
    } catch (err) {
      setError(`Error al guardar la nota: ${err.message}`);
    }
  };

  const handleFinishSession = async () => {
    if (!formData.title.trim()) {
      setError('Ingresa un título antes de terminar la sesión');
      return;
    }
    setError(null);
    try {
      await saveNote();
      const minutes = Math.min(1440, Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)));
      const response = await dashboardAPI.createSession({
        metodo: 'cornell',
        fecha_inicio: new Date(startedAt.current).toISOString(),
        duracion_minutos: minutes,
        fue_completada: true,
        descripcion: `Cornell: ${formData.title}${formData.subject ? ` (${formData.subject})` : ''}`,
      });
      ui.success(response.new_achievements?.length ? '🏆 Sesión registrada y nuevo logro desbloqueado' : `Sesión de ${minutes} min registrada en tu progreso`);
      navigate('/metodo/cornell/list');
    } catch (err) {
      setError(`No se pudo terminar la sesión: ${err.message}`);
    }
  };

  const handleNewNote = () => {
    startedAt.current = Date.now();
    setError(null);
    setSavedAt(null);
    navigate('/iniciar/cornell');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <FullPageSpinner label="Cargando nota..." />
      </div>
    );
  }

  const areaClass = 'w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📝 Método Cornell</h1>
          <p className="text-gray-600">Sistema de toma de notas en 3 secciones</p>
          <div className="flex justify-center gap-4 mt-2 h-5 text-sm">
            {isSaving && <span className="text-blue-600 flex items-center gap-1"><span className="animate-pulse">💾</span> Guardando...</span>}
            {!isSaving && savedAt && <span className="text-green-600">✅ Guardado</span>}
          </div>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto">⚠️ {error}</div>}

        <div className="bg-white rounded-t-2xl shadow-xl p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="note-title">
                Título de la nota *
              </label>
              <input
                id="note-title"
                type="text"
                value={formData.title}
                onChange={update('title')}
                placeholder="Ej: Introducción a la Física Cuántica"
                maxLength={255}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="note-subject">
                Materia o tema (opcional)
              </label>
              <input
                id="note-subject"
                type="text"
                value={formData.subject}
                onChange={update('subject')}
                placeholder="Ej: Física, Matemáticas, Biología..."
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl">
          <div className="grid md:grid-cols-3 border-t-2 border-blue-200">
            <div className="md:col-span-1 border-r-2 border-blue-200 p-4 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">🔑</div>
                <h3 className="text-lg font-bold text-gray-800">Palabras clave</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Conceptos importantes, preguntas, ideas principales</p>
              <textarea
                value={formData.cues_section}
                onChange={update('cues_section')}
                placeholder={'• Concepto 1\n• ¿Pregunta clave?\n• Idea principal'}
                className={`${areaClass} min-h-[350px] text-sm`}
                aria-label="Palabras clave"
              />
              <p className="text-xs text-gray-500 mt-2">💡 Escribe preguntas que te ayuden a repasar</p>
            </div>

            <div className="md:col-span-2 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">📄</div>
                <h3 className="text-lg font-bold text-gray-800">Notas principales</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Apuntes, definiciones, ejemplos y detalles importantes</p>
              <textarea
                value={formData.notes_section}
                onChange={update('notes_section')}
                placeholder={'Escribe tus notas aquí...\n\n• Usa viñetas para organizar ideas\n• Incluye definiciones importantes\n• Agrega ejemplos que te ayuden a entender'}
                className={`${areaClass} min-h-[350px]`}
                aria-label="Notas principales"
              />
            </div>
          </div>

          <div className="border-t-2 border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">📋</div>
              <h3 className="text-lg font-bold text-gray-800">Resumen</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Resume los puntos principales en 3 a 5 oraciones, con tus propias palabras</p>
            <textarea
              value={formData.summary_section}
              onChange={update('summary_section')}
              placeholder="Resume aquí los puntos más importantes de tus notas..."
              className={`${areaClass} min-h-[100px]`}
              aria-label="Resumen"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">💡 Un buen resumen te permite repasar sin leer todas las notas</p>
              <p className="text-xs text-gray-600">{formData.summary_section.length} caracteres</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={handleNewNote} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              📄 Nueva nota
            </button>
            <button onClick={() => navigate('/metodo/cornell/list')} className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all">
              Ver mis notas
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Guardar nota
            </button>
            <button
              onClick={handleFinishSession}
              disabled={isSaving || !formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Terminar sesión de estudio
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/metodo/cornell')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}
