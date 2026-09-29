import * as React from "react";
import { cn } from "../../lib/utils.js";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
}

export function Slider({ value, min, max, step = 10, onChange, className }: SliderProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min || 1)) * 100));

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center py-4", className)}>
      <div className="relative h-3 w-full grow overflow-hidden rounded-full bg-slate-800 border border-slate-700">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
      />
      <div
        className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-amber-300 bg-amber-500 shadow-md shadow-amber-950 transition-all -translate-x-1/2"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
