import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

export const ToastStack: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold animate-msg-spring border',
            t.tone === 'emerald' &&
              'bg-[#064E3B]/95 text-emerald-100 border-emerald-400/30 backdrop-blur-md',
            t.tone === 'cobalt' &&
              'bg-[#1E3A8A]/95 text-blue-100 border-blue-400/30 backdrop-blur-md',
            t.tone === 'rose' &&
              'bg-[#881337]/95 text-rose-100 border-rose-400/30 backdrop-blur-md'
          )}
        >
          {t.tone === 'emerald' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

