import { useNavigate } from 'react-router-dom';
import { cornellAPI } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useUI } from '../../hooks/useUI';
import { formatDate } from '../../utils/format';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorState';

/** Listado de notas Cornell del usuario, con acceso a edición y borrado. */
export default function ListaNotasCornell() {
  const navigate = useNavigate();
  const ui = useUI();
  const notes = useAsync(() => cornellAPI.getNotes(0, 50), []);

  const handleDelete = async (note) => {
    const ok = await ui.confirm({
      title: 'Eliminar nota',
      message: `Se eliminará "${note.title || 'Nota sin título'}" de forma permanente.`,
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await cornellAPI.deleteNote(note.note_id);
      notes.setData((current) => (current || []).filter((item) => item.note_id !== note.note_id));
      ui.success('Nota eliminada');
    } catch (error) {
      ui.error(error.message);
    }
  };

  if (notes.loading && !notes.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <FullPageSpinner label="Cargando notas..." />
      </div>
    );
  }

  const list = notes.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Mis notas Cornell 📝</h1>
            <p className="text-gray-600 mt-1">
              {list.length} nota{list.length === 1 ? '' : 's'} guardada{list.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={() => navigate('/iniciar/cornell')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            + Crear nueva nota
          </button>
        </div>

        <ErrorBanner message={notes.error} onRetry={notes.reload} />

        {list.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no tienes notas</h2>
            <p className="text-gray-600 mb-6">Crea tu primera nota Cornell y organiza tus apuntes en tres secciones.</p>
            <button onClick={() => navigate('/iniciar/cornell')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
              Empezar ahora
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((note) => (
              <div key={note.note_id} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 flex items-start justify-between gap-4">
                <button type="button" onClick={() => navigate(`/iniciar/cornell/${note.note_id}`)} className="text-left flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">{note.title || 'Nota sin título'}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {note.subject ? `${note.subject} · ` : ''}Creada el {formatDate(note.created_at)}
                    {note.updated_at ? ` · Editada el ${formatDate(note.updated_at)}` : ''}
                  </p>
                  {note.summary_section && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{note.summary_section}</p>}
                </button>
                <button
                  onClick={() => handleDelete(note)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Eliminar nota"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/metodo/cornell')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← Volver a información del método
          </button>
        </div>
      </div>
    </div>
  );
}
