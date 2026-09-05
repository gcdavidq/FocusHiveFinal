import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { UIContext } from './ui-context';

const TOAST_STYLES = {
  success: { icon: CheckCircle, className: 'bg-green-600 text-white' },
  error: { icon: XCircle, className: 'bg-red-600 text-white' },
  info: { icon: Info, className: 'bg-[#1e3a5f] text-white' },
  warning: { icon: AlertTriangle, className: 'bg-amber-500 text-white' },
};

/**
 * Notificaciones (toast) y diálogos de confirmación compartidos por toda la app.
 * Reemplazan a alert() y window.confirm().
 */
export default function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const counter = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = ++counter.current;
      setToasts((current) => [...current, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  const confirm = useCallback(
    ({ title = '¿Confirmar acción?', message = '', confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false } = {}) =>
      new Promise((resolve) => {
        setDialog({ title, message, confirmText, cancelText, danger, resolve });
      }),
    [],
  );

  const closeDialog = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const value = useMemo(
    () => ({
      toast,
      success: (message) => toast(message, 'success'),
      error: (message) => toast(message, 'error', 5000),
      info: (message) => toast(message, 'info'),
      warning: (message) => toast(message, 'warning'),
      confirm,
    }),
    [toast, confirm],
  );

  return (
    <UIContext.Provider value={value}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-6 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 items-end pointer-events-none" aria-live="polite">
        {toasts.map(({ id, message, type }) => {
          const style = TOAST_STYLES[type] || TOAST_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-slide-up max-w-sm w-full ${style.className}`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{message}</p>
              <button onClick={() => dismissToast(id)} className="opacity-80 hover:opacity-100" aria-label="Cerrar notificación">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Diálogo de confirmación */}
      {dialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[90] animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{dialog.title}</h3>
            {dialog.message && <p className="text-gray-600 mb-6">{dialog.message}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => closeDialog(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={() => closeDialog(true)}
                autoFocus
                className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                  dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e3a5f] hover:bg-[#2a4a6f]'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
