import React from 'react';
import { Eye, Check, X, Shield, Sparkles } from 'lucide-react';

interface AccessibilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patternsEnabled: boolean;
  colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  onTogglePatterns: () => void;
  onSelectColorBlindFilter: (filter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
}

export const AccessibilityDialog: React.FC<AccessibilityDialogProps> = ({
  isOpen,
  onClose,
  patternsEnabled,
  colorBlindFilter,
  onTogglePatterns,
  onSelectColorBlindFilter,
}) => {
  if (!isOpen) return null;

  const filters = [
    { id: 'none', name: 'Standard Vision (Full Trichromacy)', desc: 'Standard unfiltered spectrum' },
    { id: 'protanopia', name: 'Protanopia (Red-Insensitive)', desc: 'L-cone red deficient simulation' },
    { id: 'deuteranopia', name: 'Deuteranopia (Green-Insensitive)', desc: 'M-cone green deficient simulation (most common)' },
    { id: 'tritanopia', name: 'Tritanopia (Blue-Insensitive)', desc: 'S-cone blue deficient simulation' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-surface-low border border-surface-high rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-high">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-mono text-base font-bold text-slate-100">
              Universal Daltonization & Accessibility
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactile Texture Overlays Toggle */}
        <div className="p-4 rounded-xl bg-surface-lowest border border-surface-container flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold text-slate-200">
              Tactile Texture Overlays
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Dots (Yellow), Diagonal Hatching (Cyan), Waves (Magenta), Crosshatch (Carbon)
            </span>
          </div>

          <button
            onClick={onTogglePatterns}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 border ${
              patternsEnabled ? 'bg-primary border-primary' : 'bg-surface-container border-surface-high'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                patternsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Daltonization Simulation Matrix Selection */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase font-bold text-slate-300">
            Real-Time Daltonization Simulation Filter
          </span>

          <div className="flex flex-col gap-2">
            {filters.map((f) => {
              const isSelected = colorBlindFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectColorBlindFilter(f.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all font-mono ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-slate-100 shadow-md'
                      : 'bg-surface-lowest border-surface-container text-slate-400 hover:text-slate-200 hover:border-surface-high'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-200">{f.name}</span>
                    <span className="text-[10px] text-slate-400">{f.desc}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-high text-slate-200 font-mono text-xs font-bold transition-all border border-surface-high"
        >
          Save & Close Settings
        </button>
      </div>
    </div>
  );
};
