import React, { useEffect } from 'react';
import { RefreshCw, RotateCcw, Wind, Trash2 } from 'lucide-react';

interface CrucibleControlsProps {
  onStir: () => void;
  onUndo: () => void;
  onRedo?: () => void;
  onFlush: () => void;
  canUndo: boolean;
  canRedo?: boolean;
  isStirring: boolean;
  disabled?: boolean;
  onDropDispense?: (reagentId: string, volumeMl: number) => void;
}

export const CrucibleControls: React.FC<CrucibleControlsProps> = ({
  onStir,
  onUndo,
  onFlush,
  canUndo,
  isStirring,
  disabled = false,
  onDropDispense,
}) => {
  // Global Keyboard Shortcuts (Space to stir, Z to undo, R to flush)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onStir();
      } else if (e.key === 'z' || e.key === 'Z') {
        if (canUndo && !disabled) onUndo();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!disabled) onFlush();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStir, onUndo, onFlush, canUndo, disabled]);

  // Drag and drop drop zone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.reagentId && onDropDispense) {
        onDropDispense(data.reagentId, data.volumeMl || 0.5);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex items-center justify-center gap-3 w-full my-2"
    >
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo || disabled}
        className="px-3 py-2 rounded-xl bg-surface-low border border-surface-high text-slate-300 hover:text-primary hover:border-primary/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 font-mono text-xs shadow-md"
        title="Revert last titration step (Key: Z)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Undo</span>
      </button>

      {/* Primary Stir Button */}
      <button
        onClick={onStir}
        disabled={disabled || isStirring}
        className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold active:scale-95 transition-all flex items-center gap-2 shadow-lg border ${
          isStirring
            ? 'bg-primary/20 text-primary border-primary animate-pulse'
            : 'bg-primary text-slate-950 border-primary-container hover:bg-sky-300 hover:shadow-primary/30'
        }`}
        title="Homogenize fluid via magnetic vortex (Key: Space)"
      >
        {isStirring ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Vortex Stirring...</span>
          </>
        ) : (
          <>
            <Wind className="w-4 h-4" />
            <span>Stir Crucible [Space]</span>
          </>
        )}
      </button>

      {/* Flush / Decontaminate Button */}
      <button
        onClick={onFlush}
        disabled={disabled}
        className="px-3 py-2 rounded-xl bg-surface-low border border-surface-high text-slate-300 hover:text-rose-400 hover:border-rose-500/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 font-mono text-xs shadow-md"
        title="Flush crucible with clean solvent baseline (Key: R)"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Flush</span>
      </button>
    </div>
  );
};
