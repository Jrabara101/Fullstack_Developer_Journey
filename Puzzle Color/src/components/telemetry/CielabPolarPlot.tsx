import React from 'react';
import { ColorData } from '../../types/color';

interface CielabPolarPlotProps {
  currentColor: ColorData;
  targetColor: ColorData;
  deltaE: number;
}

export const CielabPolarPlot: React.FC<CielabPolarPlotProps> = ({
  currentColor,
  targetColor,
  deltaE,
}) => {
  // Map a* (-80 to +80) to X% (10% to 90%), b* (-80 to +80) to Y% (90% to 10%)
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const targetX = clamp(50 + (targetColor.lab.a / 80) * 40, 8, 92);
  const targetY = clamp(50 - (targetColor.lab.b / 80) * 40, 8, 92);

  const currentX = clamp(50 + (currentColor.lab.a / 80) * 40, 8, 92);
  const currentY = clamp(50 - (currentColor.lab.b / 80) * 40, 8, 92);

  return (
    <div className="bg-surface-lowest border border-surface-high/60 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden shadow-inner">
      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
        <span className="font-semibold uppercase text-slate-300">a* vs b* Polar Coordinates</span>
        <span className="text-amber-400 font-bold">ΔE: {deltaE.toFixed(2)}</span>
      </div>

      {/* Interactive Vector Plot Chart Canvas */}
      <div className="relative w-full h-32 bg-surface-low/60 rounded-lg flex items-center justify-center overflow-hidden border border-surface-container">
        {/* Polar Circles and Axes */}
        <div className="w-full h-px bg-slate-700/50 absolute" />
        <div className="h-full w-px bg-slate-700/50 absolute" />
        <div className="w-20 h-20 rounded-full border border-dashed border-slate-700/40 absolute pointer-events-none" />
        <div className="w-12 h-12 rounded-full border border-slate-700/30 absolute pointer-events-none" />

        {/* Quadrant labels */}
        <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-500">+a +b (Red/Yellow)</span>
        <span className="absolute top-1 left-2 text-[9px] font-mono text-slate-500">-a +b (Green/Yellow)</span>
        <span className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-500">-a -b (Green/Blue)</span>
        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">+a -b (Red/Blue)</span>

        {/* Connecting Laser Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1={`${targetX}%`}
            y1={`${targetY}%`}
            x2={`${currentX}%`}
            y2={`${currentY}%`}
            stroke="#eab308"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Target Coordinate Indicator */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-secondary border border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_10px_#f43f5e]"
          style={{ left: `${targetX}%`, top: `${targetY}%` }}
          title={`Target: a* ${targetColor.lab.a}, b* ${targetColor.lab.b}`}
        >
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>

        {/* Crucible Current Coordinate Indicator */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-primary border border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_12px_#38bdf8]"
          style={{ left: `${currentX}%`, top: `${currentY}%` }}
          title={`Crucible: a* ${currentColor.lab.a}, b* ${currentColor.lab.b}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        </div>
      </div>

      {/* Coordinate Values Readout */}
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-secondary font-semibold">
          TGT [{targetColor.lab.a}, {targetColor.lab.b}]
        </span>
        <span className="text-primary font-semibold">
          ACT [{currentColor.lab.a}, {currentColor.lab.b}]
        </span>
      </div>
    </div>
  );
};
