import React from 'react';
import { Cloud, Check, Loader2, WifiOff } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters.ts';

interface AutosaveStatusBarProps {
  status: 'saving' | 'saved' | 'offline' | 'idle';
  lastSavedAt?: string;
  className?: string;
}

export const AutosaveStatusBar: React.FC<AutosaveStatusBarProps> = ({
  status,
  lastSavedAt,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tabular-nums transition-all duration-200 border ${
        status === 'saving'
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          : status === 'offline'
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === 'saving' ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          <span className="font-medium">Saving draft...</span>
        </>
      ) : status === 'offline' ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium">⚡ Offline — Saved to device</span>
        </>
      ) : (
        <>
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Draft saved {lastSavedAt ? formatTimeAgo(lastSavedAt) : 'just now'}
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500 ml-1.5">• Safe to close tab</span>
          </span>
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        </>
      )}
    </div>
  );
};
