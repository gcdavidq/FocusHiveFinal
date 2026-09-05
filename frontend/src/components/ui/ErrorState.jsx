import { AlertCircle } from 'lucide-react';

/** Mensaje de error con botón de reintento. Úsalo cuando falla la carga de una pantalla completa. */
export function ErrorState({ message = 'Algo salió mal', onRetry }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2a4a6f] transition-colors">
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

/** Banner de error inline para formularios y secciones. */
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-red-700 underline hover:no-underline">
          Reintentar
        </button>
      )}
    </div>
  );
}
