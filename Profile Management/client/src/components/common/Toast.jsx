import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] text-text-primary max-w-md">
      {icons[toast.type] || icons.info}
      <div className="flex-1 pr-2">
        {toast.title && <p className="font-semibold text-sm leading-tight">{toast.title}</p>}
        <p className="text-xs text-text-muted mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
