import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cornellAPI } from '../../services/api';

function IniciarCornell() {
  const navigate = useNavigate();
  const { noteId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    notes_section: '',
    cues_section: '',
    summary_section: ''
  });
  const [currentNoteId, setCurrentNoteId] = useState(noteId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Cargar nota si estamos editando
  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
    }
  }, [noteId]);

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    if (!formData.title) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, currentNoteId]);

  const loadNote = async (id) => {
    setIsLoading(true);
    try {
      const note = await cornellAPI.getNote(id);
      setFormData({
        title: note.title || '',
        subject: note.subject || '',
        notes_section: note.notes_section || '',
        cues_section: note.cues_section || '',
        summary_section: note.summary_section || ''
      });
      setCurrentNoteId(note.note_id);
    } catch (err) {
      console.error('Error al cargar nota:', err);
      setError('Error al cargar la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      if (currentNoteId) {
        await cornellAPI.updateNote(currentNoteId, formData);
      } else {
        const newNote = await cornellAPI.createNote(formData);
        setCurrentNoteId(newNote.note_id);
        // Actualizar URL sin recargar
        window.history.replaceState(null, '', `/iniciar/cornell/${newNote.note_id}`);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Error al auto-guardar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim()) {
      setError('Por favor, ingresa un título para la nota');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (currentNoteId) {
        await cornellAPI.updateNote(currentNoteId, formData);
      } else {
        const newNote = await cornellAPI.createNote(formData);
        setCurrentNoteId(newNote.note_id);
        window.history.replaceState(null, '', `/iniciar/cornell/${newNote.note_id}`);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar nota:', err);
      setError('Error al guardar la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    setFormData({
      title: '',
      subject: '',
      notes_section: '',
      cues_section: '',
      summary_section: ''
    });
    setCurrentNoteId(null);
    setError(null);
    navigate('/iniciar/cornell');
  };

  // Pantalla de carga inicial
  if (isLoading && noteId && !formData.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando nota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            📝 Método Cornell
          </h1>
          <p className="text-gray-600">
            Sistema de toma de notas en 3 secciones
          </p>
          
          {/* Indicadores de estado */}
          <div className="flex justify-center gap-4 mt-2">
            {isSaving && (
              <span className="text-sm text-blue-600 flex items-center gap-1">
                <span className="animate-pulse">💾</span> Guardando...
              </span>
            )}
            {showSuccess && !isSaving && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                ✅ Nota guardada exitosamente
              </span>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto">
            ⚠️ {error}
          </div>
        )}

        {/* Configuración inicial */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título de la nota *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Introducción a la Física Cuántica"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Materia/Tema (opcional)
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Ej: Física, Matemáticas, Biología..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Editor Cornell Layout */}
        <div className="bg-white shadow-xl">
          <div className="grid md:grid-cols-3 border-t-2 border-blue-200">
            
            {/* Sección izquierda: Palabras clave (30%) */}
            <div className="md:col-span-1 border-r-2 border-blue-200 p-4 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">
                  🔑
                </div>
                <h3 className="text-lg font-bold text-gray-800">Palabras clave</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Conceptos importantes, preguntas, ideas principales
              </p>
              <textarea
                value={formData.cues_section}
                onChange={(e) => setFormData({...formData, cues_section: e.target.value})}
                placeholder="• Concepto 1&#10;• ¿Pregunta clave?&#10;• Idea principal&#10;• Término importante"
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none min-h-[350px] text-sm resize-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Escribe preguntas que te ayuden a repasar
              </p>
            </div>

            {/* Sección derecha: Notas principales (70%) */}
            <div className="md:col-span-2 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">
                  📄
                </div>
                <h3 className="text-lg font-bold text-gray-800">Notas principales</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Escribe aquí tus apuntes, definiciones, ejemplos y detalles importantes
              </p>
              <textarea
                value={formData.notes_section}
                onChange={(e) => setFormData({...formData, notes_section: e.target.value})}
                placeholder="Escribe tus notas aquí...&#10;&#10;• Usa viñetas para organizar ideas&#10;• Incluye definiciones importantes&#10;• Agrega ejemplos que te ayuden a entender&#10;• Anota fórmulas o datos relevantes"
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none min-h-[350px] resize-none transition-colors"
              />
            </div>
          </div>

          {/* Sección inferior: Resumen */}
          <div className="border-t-2 border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow">
                📋
              </div>
              <h3 className="text-lg font-bold text-gray-800">Resumen</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Resume los puntos principales en 3-5 oraciones (escríbelo en tus propias palabras)
            </p>
            <textarea
              value={formData.summary_section}
              onChange={(e) => setFormData({...formData, summary_section: e.target.value})}
              placeholder="Resume aquí los puntos más importantes de tus notas. Esto te ayudará a repasar rápidamente el contenido..."
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none min-h-[100px] resize-none transition-colors"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                💡 Un buen resumen te permite repasar sin leer todas las notas
              </p>
              <p className="text-xs text-gray-600">
                {formData.summary_section.length} caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            onClick={handleNewNote}
            className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            📄 Nueva Nota
          </button>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
  onClick={() => navigate('/metodo/cornell/list')} // <- ¡CORRECCIÓN!
  className="w-full md:w-auto px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all"
>
  Ver Mis Notas
</button>
            
            <button
              onClick={handleSaveNote}
              disabled={isLoading || !formData.title.trim()}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span> Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Nota
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/metodo/cornell')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}

export default IniciarCornell;