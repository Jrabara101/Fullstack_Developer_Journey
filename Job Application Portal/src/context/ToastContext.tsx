import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => addToast(title, message, 'success'), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast(title, message, 'warning'), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast(title, message, 'error'), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast(title, message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, warning, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';
          const isError = t.type === 'error';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border backdrop-blur-md transition-all duration-200 transform translate-y-0 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                  : isError
                  ? 'bg-red-950/90 border-red-500/30 text-red-100'
                  : 'bg-surface-elevated-dark/95 border-divider-dark text-slate-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {isError && <AlertCircle className="w-4 h-4 text-red-400" />}
                  {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight">{t.title}</p>
                  {t.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">{t.message}</p>}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-white p-0.5 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
