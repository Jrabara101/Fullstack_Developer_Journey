import React from 'react';
import { ColorData, PatternTexture } from '../../types/color';
import { getDeltaEInterpretation } from '../../lib/colorMath';
import { getPatternStyle } from '../../lib/daltonize';

interface SplitSwatchLensProps {
  targetColor: ColorData;
  currentColor: ColorData;
  deltaE: number;
  patternsEnabled: boolean;
  targetPattern?: PatternTexture;
}

export const SplitSwatchLens: React.FC<SplitSwatchLensProps> = ({
  targetColor,
  currentColor,
  deltaE,
  patternsEnabled,
  targetPattern = 'waves',
}) => {
  const { rating, badgeClass, accuracy } = getDeltaEInterpretation(deltaE);
  const patternStyle = getPatternStyle(targetPattern, patternsEnabled);

  return (
    <div className="relative w-full h-24 rounded-2xl bg-surface-lowest overflow-hidden flex items-center shadow-2xl border border-surface-high/60">
      {/* Target Specimen (Immutable Left Half) */}
      <div
        className="relative w-1/2 h-full flex flex-col justify-end p-3 transition-colors duration-500 overflow-hidden"
        style={{ backgroundColor: targetColor.hex }}
      >
        {/* Tactile Pattern Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={patternStyle} />

        {/* Target Header Pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-200">
            Target
          </span>
        </div>

        {/* Target Telemetry Label */}
        <div className="font-mono text-xs font-bold text-white drop-shadow-md flex flex-col z-10">
          <span>{targetColor.hex}</span>
          <span className="text-[10px] text-slate-200/80">
            L*{targetColor.lab.l} a*{targetColor.lab.a} b*{targetColor.lab.b}
          </span>
        </div>
      </div>

      {/* Live Crucible Specimen (Dynamic Right Half) */}
      <div
        className="relative w-1/2 h-full flex flex-col justify-end items-end p-3 transition-colors duration-300 overflow-hidden"
        style={{ backgroundColor: currentColor.hex }}
      >
        {/* Synthesis Header Pill */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary">
            Crucible
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        </div>

        {/* Current Telemetry Label */}
        <div className="font-mono text-xs font-bold text-white drop-shadow-md flex flex-col items-end z-10">
          <span>{currentColor.hex}</span>
          <span className="text-[10px] text-slate-200/80">
            L*{currentColor.lab.l} a*{currentColor.lab.a} b*{currentColor.lab.b}
          </span>
        </div>
      </div>

      {/* Vertical Laser Split Meridian Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_#ffffff] z-20 pointer-events-none -translate-x-1/2" />

      {/* Floating Dynamic Delta-E Status Shield */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
        {/* Delta-E numeric pill */}
        <div className="bg-slate-950/90 border border-slate-700/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 shadow-2xl">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400">ΔE</span>
          <span className="font-mono text-sm font-extrabold text-amber-300 tracking-tight">
            {deltaE.toFixed(2)}
          </span>
          <span className="font-mono text-[10px] text-slate-400">({accuracy}%)</span>
        </div>

        {/* Human Rating Pill */}
        <span
          className={`mt-1 font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold tracking-wider border shadow-sm transition-all duration-300 ${badgeClass}`}
        >
          {rating}
        </span>
      </div>
    </div>
  );
};
