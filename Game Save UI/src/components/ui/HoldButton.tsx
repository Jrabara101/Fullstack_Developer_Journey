import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';

export interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onHoldComplete: () => void;
  holdDurationMs?: number; // default 1500ms
  label?: string;
  confirmLabel?: string;
  variant?: 'destructive' | 'cyan' | 'amber';
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  onHoldComplete,
  holdDurationMs = 1500,
  label = 'HOLD TO PURGE',
  className,
  variant = 'destructive'
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const resetHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const handleHoldStart = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsHolding(true);
    sfx.playClick();
    startTimeRef.current = Date.now();

    const loop = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / holdDurationMs) * 100);
      setProgress(pct);

      if (elapsed >= holdDurationMs) {
        resetHold();
        onHoldComplete();
      } else {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handleHoldEnd = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    resetHold();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // SVG circular properties
  const size = 28;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      className={cn(
        'relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold tracking-wider rounded border select-none transition-all cursor-pointer overflow-hidden',
        variant === 'destructive' && (
          isHolding
            ? 'bg-red-950/80 text-red-200 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/60'
        ),
        className
      )}
    >
      {/* Fiery radial fill backdrop when holding */}
      {isHolding && (
        <div
          className="absolute inset-0 bg-red-600/30 transition-all pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Circular SVG Burn Indicator */}
      <svg width={size} height={size} className="relative transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#450a0a"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-75"
        />
      </svg>

      <span className="relative z-10">
        {isHolding ? `PURGING (${Math.round(progress)}%)` : label}
      </span>
    </button>
  );
};
