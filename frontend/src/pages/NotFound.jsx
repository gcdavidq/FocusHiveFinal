import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md w-full">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-8">La ruta que buscas no existe o fue movida.</p>
        <Link to="/" className="inline-block bg-[#1e3a5f] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#2a4a6f] transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
