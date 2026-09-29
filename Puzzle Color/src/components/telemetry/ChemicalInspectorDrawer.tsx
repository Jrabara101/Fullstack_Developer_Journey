import React from 'react';
import { X, Activity, Atom, Layers, Sparkles } from 'lucide-react';
import { ColorData } from '../../types/color';
import { rgbToHsl, rgbToCmyk } from '../../lib/colorMath';

interface ChemicalInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: ColorData;
  targetColor: ColorData;
  deltaE: number;
  currentVolumeMl: number;
  moveCount: number;
}

export const ChemicalInspectorDrawer: React.FC<ChemicalInspectorDrawerProps> = ({
  isOpen,
  onClose,
  currentColor,
  targetColor,
  deltaE,
  currentVolumeMl,
  moveCount,
}) => {
  if (!isOpen) return null;

  const currentHsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
  const targetHsl = rgbToHsl(targetColor.r, targetColor.g, targetColor.b);

  const currentCmyk = rgbToCmyk(currentColor.r, currentColor.g, currentColor.b);
  const targetCmyk = rgbToCmyk(targetColor.r, targetColor.g, targetColor.b);

  const deltaL = Math.round((currentColor.lab.l - targetColor.lab.l) * 100) / 100;
  const deltaA = Math.round((currentColor.lab.a - targetColor.lab.a) * 100) / 100;
  const deltaB = Math.round((currentColor.lab.b - targetColor.lab.b) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-low border-l border-surface-high h-full overflow-y-auto p-5 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-high">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-primary" />
            <h2 className="font-mono text-base font-bold text-slate-100">
              Chemical & Colorimetric Inspector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delta-E Summary Card */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-high flex items-center justify-between shadow-lg">
          <div>
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider block">
              CIELAB Delta-E 2000
            </span>
            <span className="font-mono text-2xl font-black text-amber-300">
              {deltaE.toFixed(2)} ΔE
            </span>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Moves: <span className="text-primary font-bold">{moveCount}</span></div>
            <div>Volume: <span className="text-secondary font-bold">{currentVolumeMl.toFixed(1)}ml</span></div>
          </div>
        </div>

        {/* Swatch Comparative Preview */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase font-bold text-slate-400">
            Aperture Verification
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-container flex flex-col gap-2">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Target Specimen</span>
              <div
                className="w-full h-16 rounded-lg shadow-inner border border-white/10"
                style={{ backgroundColor: targetColor.hex }}
              />
              <span className="font-mono text-xs font-bold text-slate-200">{targetColor.hex}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-container flex flex-col gap-2">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Crucible Synthesis</span>
              <div
                className="w-full h-16 rounded-lg shadow-inner border border-white/10"
                style={{ backgroundColor: currentColor.hex }}
              />
              <span className="font-mono text-xs font-bold text-slate-200">{currentColor.hex}</span>
            </div>
          </div>
        </div>

        {/* CIELAB Coordinate Decomposition */}
        <div className="p-4 rounded-xl bg-surface-lowest border border-surface-container flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>CIELAB Space Vectors</span>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="p-2 rounded bg-surface-low border border-surface-high text-center">
              <div className="text-slate-400 text-[10px]">ΔL* (Lightness)</div>
              <div className={`font-bold ${deltaL > 0 ? 'text-amber-300' : 'text-slate-200'}`}>
                {deltaL > 0 ? `+${deltaL}` : deltaL}
              </div>
            </div>
            <div className="p-2 rounded bg-surface-low border border-surface-high text-center">
              <div className="text-slate-400 text-[10px]">Δa* (Green-Red)</div>
              <div className={`font-bold ${deltaA > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {deltaA > 0 ? `+${deltaA}` : deltaA}
              </div>
            </div>
            <div className="p-2 rounded bg-surface-low border border-surface-high text-center">
              <div className="text-slate-400 text-[10px]">Δb* (Blue-Yellow)</div>
              <div className={`font-bold ${deltaB > 0 ? 'text-yellow-400' : 'text-sky-400'}`}>
                {deltaB > 0 ? `+${deltaB}` : deltaB}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Color Space Telemetry Tables */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Multi-Coordinate Spaces</span>
          </div>

          <table className="w-full text-left font-mono text-xs border border-surface-container rounded-xl overflow-hidden">
            <thead className="bg-surface-high text-slate-300">
              <tr>
                <th className="p-2">Model</th>
                <th className="p-2">Crucible Active</th>
                <th className="p-2">Target Specimen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-lowest text-slate-300">
              <tr>
                <td className="p-2 font-bold text-primary">sRGB</td>
                <td className="p-2">rgb({currentColor.r}, {currentColor.g}, {currentColor.b})</td>
                <td className="p-2">rgb({targetColor.r}, {targetColor.g}, {targetColor.b})</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-secondary">HEX</td>
                <td className="p-2">{currentColor.hex}</td>
                <td className="p-2">{targetColor.hex}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-amber-400">HSL</td>
                <td className="p-2">{currentHsl.h}°, {currentHsl.s}%, {currentHsl.l}%</td>
                <td className="p-2">{targetHsl.h}°, {targetHsl.s}%, {targetHsl.l}%</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-emerald-400">CMYK</td>
                <td className="p-2">{currentCmyk.c}%, {currentCmyk.m}%, {currentCmyk.y}%, {currentCmyk.k}%</td>
                <td className="p-2">{targetCmyk.c}%, {targetCmyk.m}%, {targetCmyk.y}%, {targetCmyk.k}%</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-cyan-400">CIELAB</td>
                <td className="p-2">L*{currentColor.lab.l} a*{currentColor.lab.a} b*{currentColor.lab.b}</td>
                <td className="p-2">L*{targetColor.lab.l} a*{targetColor.lab.a} b*{targetColor.lab.b}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kubelka-Munk Absorption Theory Card */}
        <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-high/60 flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Kubelka-Munk Optics Formula</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            In physical pigment layers, reflectance is governed by the ratio of absorption (K) to scattering (S):
          </p>
          <div className="p-2 rounded bg-surface-lowest text-center text-primary font-bold border border-surface-container">
            K/S = (1 - R∞)² / (2R∞)
          </div>
        </div>
      </div>
    </div>
  );
};
