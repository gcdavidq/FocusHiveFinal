export function Spinner({ className = 'h-12 w-12 border-b-4 border-[#1e3a5f]' }) {
  return <div className={`animate-spin rounded-full ${className}`} role="status" aria-label="Cargando" />;
}

export function FullPageSpinner({ label = 'Cargando...' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Spinner className="h-16 w-16 border-b-4 border-[#1e3a5f] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{label}</p>
      </div>
    </div>
  );
}
