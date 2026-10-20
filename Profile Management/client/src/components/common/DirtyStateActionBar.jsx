import React from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

export function DirtyStateActionBar({ isDirty, isSaving, onSave, onRevert }) {
  if (!isDirty) return null;

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutLabel = isMac ? '⌘S' : 'Ctrl+S';

  return (
    <aside 
      aria-label="Unsaved changes notification"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-slide-up"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/30 dark:border-amber-400/20 bg-white/95 dark:bg-[#181B22]/95 backdrop-blur-md text-text-primary">
        {/* Left: Pulsing indicator & label */}
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <div>
            <p className="text-sm font-medium tracking-tight text-slate-900 dark:text-slate-100">
              Careful — you have unsaved changes
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Save now or your live edits will remain local
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRevert}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-blue-700/60 text-blue-100 rounded border border-blue-500/40">
                  {shortcutLabel}
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
