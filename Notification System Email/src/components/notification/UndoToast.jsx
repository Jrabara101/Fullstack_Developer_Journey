import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const UndoToast = () => {
  const { undoState, handleUndo, dismissUndo } = useNotifications();
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    if (!undoState) return;

    setSecondsRemaining(5);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [undoState]);

  if (!undoState) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-badge-pop">
      <div className="relative overflow-hidden flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 dark:bg-[#191B20]/95 text-white backdrop-blur-md border border-slate-700/60 dark:border-zinc-700/80 shadow-2xl">
        <span className="text-xs font-medium text-slate-200">
          {undoState.message}
        </span>

        <button
          onClick={handleUndo}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo ({secondsRemaining}s)</span>
        </button>

        <button
          onClick={dismissUndo}
          className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Animated 5s countdown progress line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all ease-linear"
          style={{
            width: `${(secondsRemaining / 5) * 100}%`,
            transitionDuration: '1000ms',
          }}
        />
      </div>
    </div>
  );
};
