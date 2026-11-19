import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { CheckCircle2, Info, Handshake, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toastMessage, setToast } = useOnboardingStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {toastMessage.type === 'success' && (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {toastMessage.type === 'delegated' && (
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300 flex items-center justify-center font-bold text-sm">
              🤝
            </div>
          )}
          {toastMessage.type === 'info' && (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {toastMessage.title}
          </h4>
          {toastMessage.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {toastMessage.subtitle}
            </p>
          )}
        </div>

        <button
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
