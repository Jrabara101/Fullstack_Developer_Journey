import React, { useMemo } from 'react';
import { ColorData } from '../../types/color';
import { generateSpectralReflectanceCurve } from '../../lib/colorMath';

interface SpectralCurveProps {
  currentColor: ColorData;
  targetColor: ColorData;
}

export const SpectralCurve: React.FC<SpectralCurveProps> = ({ currentColor, targetColor }) => {
  const currentPoints = useMemo(() => generateSpectralReflectanceCurve(currentColor), [currentColor]);
  const targetPoints = useMemo(() => generateSpectralReflectanceCurve(targetColor), [targetColor]);

  // Convert points to SVG polyline / bezier paths (viewBox: 0 0 100 60)
  const buildSvgPath = (points: { wavelength: number; reflectance: number }[]) => {
    return points
      .map((p, idx) => {
        // wavelength 380 to 740 -> x 0 to 100
        const x = ((p.wavelength - 380) / (740 - 380)) * 100;
        // reflectance 0.0 to 1.0 -> y 55 to 5
        const y = 55 - p.reflectance * 50;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const currentPath = buildSvgPath(currentPoints);
  const targetPath = buildSvgPath(targetPoints);

  return (
    <div className="bg-surface-lowest border border-surface-high/60 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden shadow-inner">
      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
        <span className="font-semibold uppercase text-slate-300">Spectral Reflectance</span>
        <span className="text-primary font-bold">380 - 740nm</span>
      </div>

      {/* SVG Graph Viewport */}
      <div className="relative w-full h-32 bg-surface-low/60 rounded-lg flex items-end p-2 overflow-hidden border border-surface-container">
        {/* Wavelength gradient background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-emerald-600/10 to-rose-600/10 pointer-events-none" />

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 opacity-15 pointer-events-none">
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
        </div>

        <svg
          className="w-full h-full overflow-visible z-10"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
        >
          {/* Target Curve (Dashed Secondary) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            opacity="0.8"
          />

          {/* Current Active Curve (Glowing Solid Primary) */}
          <path
            d={currentPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            className="transition-all duration-300 drop-shadow-[0_0_8px_#38bdf8]"
          />
        </svg>
      </div>

      {/* Spectrum Regions Legend */}
      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span className="text-indigo-400 font-semibold">UV / Violet (400)</span>
        <span className="text-emerald-400 font-semibold">Visible Green (540)</span>
        <span className="text-rose-400 font-semibold">Near-IR (700)</span>
      </div>
    </div>
  );
};
