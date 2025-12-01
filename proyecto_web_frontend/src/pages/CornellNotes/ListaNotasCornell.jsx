// src/pages/CornellNotes/ListaNotasCornell.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cornellAPI } from '../../services/api';

function ListaNotasCornell() {
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Consultar el endpoint que devuelve todas las notas
      const data = await cornellAPI.getNotes(); 
      
      // Asumimos que data es un array o un objeto con una clave 'notes' que contiene el array
      const notesArray = data.notes || data;
      
      if (notesArray && Array.isArray(notesArray)) {
        setNotes(notesArray);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Error cargando notas:', err);
      setError('No se pudieron cargar las notas. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteClick = (noteId) => {
    // Navegar al componente de edición/visualización (IniciarCornell.jsx)
    navigate(`/iniciar/cornell/${noteId}`);
  };

  if (isLoading) {
    return <p className="text-center mt-8 text-blue-600">Cargando notas...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Notas Cornell 📝</h1>
      
      {error && <p className="text-red-500 mb-4">⚠️ {error}</p>}

      <button
        onClick={() => navigate('/iniciar/cornell')}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        + Crear Nueva Nota
      </button>

      {notes.length === 0 ? (
        <p className="text-gray-600 italic">No tienes notas de Cornell guardadas. ¡Crea la primera!</p>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div 
              key={note.note_id} 
              onClick={() => handleNoteClick(note.note_id)}
              className="bg-white p-5 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-semibold text-gray-800">{note.title || 'Nota sin título'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Materia: {note.subject || 'N/A'} | Creada: {new Date(note.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaNotasCornell;