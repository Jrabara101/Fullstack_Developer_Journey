import { useEffect, useState } from 'react';
import { Slider } from '../ui/slider';
import {
  Split,
  RotateCcw,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface TumblerTerminalProps {
  tumblerValue: number;
  onValueChange: (val: number) => void;
  onStep: (delta: number) => void;
  onBisect: () => void;
  optimalBisect: number;
  onReset: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  isEvaluating?: boolean;
}

export function TumblerTerminal({
  tumblerValue,
  onValueChange,
  onStep,
  onBisect,
  optimalBisect,
  onReset,
  onSubmit,
  disabled = false,
  isEvaluating = false,
}: TumblerTerminalProps) {
  const [directInputOpen, setDirectInputOpen] = useState(false);
  const [manualInputStr, setManualInputStr] = useState('');

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || isEvaluating) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter') {
          onSubmit();
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'a') onStep(-5);
      else if (key === 's') onStep(-1);
      else if (key === 'k') onStep(1);
      else if (key === 'l') onStep(5);
      else if (key === 'b') onBisect();
      else if (key === 'r') onReset();
      else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isEvaluating, onStep, onBisect, onReset, onSubmit]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualInputStr, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onValueChange(val);
      setDirectInputOpen(false);
      setManualInputStr('');
    }
  };

  return (
    <div className="relative bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/40 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
      {/* Ambient Circuit Flare */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="w-full flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] sm:text-xs text-on-surface-variant tracking-wider uppercase flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-primary" />
          Tactile Frequency Tuner
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirectInputOpen(!directInputOpen)}
            className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1"
          >
            {directInputOpen ? 'Hide Keypad' : 'Direct Keypad'}
          </button>
          <span className="hidden sm:inline font-mono text-[11px] text-outline-variant">
            [A/S/K/L]
          </span>
        </div>
      </div>

      {/* Direct Keypad Drawer */}
      {directInputOpen && (
        <form
          onSubmit={handleManualSubmit}
          className="w-full max-w-xs mb-4 p-3 bg-surface-container rounded-lg border border-outline-variant/50 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
        >
          <input
            type="number"
            min={1}
            max={100}
            autoFocus
            value={manualInputStr}
            onChange={(e) => setManualInputStr(e.target.value)}
            placeholder="Enter 1-100"
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-primary text-on-primary font-mono text-xs font-bold rounded uppercase hover:bg-primary-light transition-colors"
          >
            Set
          </button>
        </form>
      )}

      {/* Stepper Assembly */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 my-3">
        {/* Left Decrement Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled || tumblerValue <= 1}
            onClick={() => onStep(-5)}
            className="w-12 sm:w-16 h-12 bg-surface-container hover:bg-surface-container-high active:scale-95 text-primary border border-outline-variant/40 rounded-lg flex flex-col items-center justify-center transition-all shadow-sm group disabled:opacity-40"
          >
            <span className="font-mono text-base sm:text-lg font-bold leading-none">-5</span>
            <span className="font-mono text-[9px] text-outline-variant group-hover:text-primary transition-colors">
              [A]
            </span>
          </button>
          <button
            type="button"
            disabled={disabled || tumblerValue <= 1}
            onClick={() => onStep(-1)}
            className="w-12 sm:w-16 h-12 bg-surface-container hover:bg-surface-container-high active:scale-95 text-primary border border-outline-variant/40 rounded-lg flex flex-col items-center justify-center transition-all shadow-sm group disabled:opacity-40"
          >
            <span className="font-mono text-base sm:text-lg font-bold leading-none">-1</span>
            <span className="font-mono text-[9px] text-outline-variant group-hover:text-primary transition-colors">
              [S]
            </span>
          </button>
        </div>

        {/* Central Tumbler Mechanical Readout Display */}
        <div className="relative w-44 sm:w-56 h-28 sm:h-32 bg-surface-container-low rounded-xl border border-outline-variant/50 shadow-inner-dark flex flex-col items-center justify-center overflow-hidden">
          {/* Horizontal Horizon Grid Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/80 via-transparent to-surface-container-lowest/80 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/20 pointer-events-none" />

          {/* Tumbler Readout */}
          <div className="flex items-baseline gap-1 select-none z-10">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold text-primary tracking-tighter leading-none transition-transform drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {String(tumblerValue).padStart(2, '0')}
            </span>
          </div>

          <div className="absolute bottom-2 flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span className="font-mono text-[10px] text-tertiary uppercase tracking-widest font-semibold">
              SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Right Increment Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled || tumblerValue >= 100}
            onClick={() => onStep(1)}
            className="w-12 sm:w-16 h-12 bg-surface-container hover:bg-surface-container-high active:scale-95 text-secondary border border-outline-variant/40 rounded-lg flex flex-col items-center justify-center transition-all shadow-sm group disabled:opacity-40"
          >
            <span className="font-mono text-base sm:text-lg font-bold leading-none">+1</span>
            <span className="font-mono text-[9px] text-outline-variant group-hover:text-secondary transition-colors">
              [K]
            </span>
          </button>
          <button
            type="button"
            disabled={disabled || tumblerValue >= 100}
            onClick={() => onStep(5)}
            className="w-12 sm:w-16 h-12 bg-surface-container hover:bg-surface-container-high active:scale-95 text-secondary border border-outline-variant/40 rounded-lg flex flex-col items-center justify-center transition-all shadow-sm group disabled:opacity-40"
          >
            <span className="font-mono text-base sm:text-lg font-bold leading-none">+5</span>
            <span className="font-mono text-[9px] text-outline-variant group-hover:text-secondary transition-colors">
              [L]
            </span>
          </button>
        </div>
      </div>

      {/* Slider Quick Scrubber */}
      <div className="w-full max-w-md px-2 flex flex-col gap-1.5 mb-4">
        <Slider
          value={tumblerValue}
          min={1}
          max={100}
          onValueChange={onValueChange}
          disabled={disabled}
        />
        <div className="flex justify-between font-mono text-[10px] text-outline-variant">
          <span>RANGE MIN (01)</span>
          <span className="text-primary font-semibold">PROBE SELECTOR</span>
          <span>RANGE MAX (100)</span>
        </div>
      </div>

      {/* Primary Crack Trigger & Quick Action Rail */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          disabled={disabled || isEvaluating}
          onClick={onSubmit}
          className="w-full flex-1 py-3 px-4 bg-tertiary hover:bg-tertiary-light text-on-tertiary font-mono text-sm font-bold uppercase tracking-wider rounded-lg shadow-neon-emerald active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isEvaluating ? 'EVALUATING...' : 'SUBMIT CODE'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-on-tertiary/20">
            [↵ ENTER]
          </span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Bisect Shortcut Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={onBisect}
            title={`Bisect current bracket to ${optimalBisect}`}
            className="flex-1 sm:flex-initial py-3 px-3.5 bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-mono text-xs uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <Split className="w-3.5 h-3.5" />
            <span>BISECT [{optimalBisect}]</span>
          </button>

          {/* Reset Value Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={onReset}
            title="Recalibrate / Center to 50"
            className="p-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface-variant hover:text-error rounded-lg transition-colors shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
