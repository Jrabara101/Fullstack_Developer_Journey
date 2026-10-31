import React from 'react';
import { PriorityWeights } from '../types';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, Zap, Feather, ShieldCheck, DollarSign, Tag } from 'lucide-react';

interface PriorityAlchemistRibbonProps {
  weights: PriorityWeights;
  onChange: (weights: PriorityWeights) => void;
  historicalLowOnly: boolean;
  onToggleHistoricalLow: (val: boolean) => void;
}

export const PriorityAlchemistRibbon: React.FC<PriorityAlchemistRibbonProps> = ({
  weights,
  onChange,
  historicalLowOnly,
  onToggleHistoricalLow,
}) => {
  const { isAlchemistOpen, toggleAlchemist } = useDiscoveryStore();

  const handleSliderChange = (key: keyof PriorityWeights, val: number) => {
    onChange({
      ...weights,
      [key]: val,
    });
  };

  const applyBlendPreset = (presetWeights: PriorityWeights) => {
    onChange(presetWeights);
  };

  return (
    <div className="w-full bg-[#0F131D] border-b border-[#1E2638] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all">
      {/* Ribbon Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-slate-100 tracking-tight">
                PRIORITY ALCHEMIST™
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-medium">
                Cosine Similarity Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Tune multi-axis performance dimensions to dynamically compute personalized 0-100% Fit Match scores.
            </p>
          </div>
        </div>

        {/* Quick Presets & Collapse toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 mr-2">
            <span className="text-[11px] font-mono text-slate-500 mr-1">PRESETS:</span>
            <button
              onClick={() => applyBlendPreset({ performance: 95, portability: 40, durability: 90, value: 65 })}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#171D2B] hover:bg-[#20283A] text-slate-300 hover:text-cyan-300 border border-[#1E2638] flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3 h-3 text-cyan-400" /> High-Spec
            </button>
            <button
              onClick={() => applyBlendPreset({ performance: 75, portability: 100, durability: 75, value: 80 })}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#171D2B] hover:bg-[#20283A] text-slate-300 hover:text-cyan-300 border border-[#1E2638] flex items-center gap-1 transition-colors"
            >
              <Feather className="w-3 h-3 text-indigo-400" /> Ultralight
            </button>
            <button
              onClick={() => applyBlendPreset({ performance: 85, portability: 60, durability: 100, value: 70 })}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#171D2B] hover:bg-[#20283A] text-slate-300 hover:text-cyan-300 border border-[#1E2638] flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Expedition
            </button>
            <button
              onClick={() => applyBlendPreset({ performance: 70, portability: 70, durability: 75, value: 100 })}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#171D2B] hover:bg-[#20283A] text-slate-300 hover:text-cyan-300 border border-[#1E2638] flex items-center gap-1 transition-colors"
            >
              <DollarSign className="w-3 h-3 text-amber-400" /> Best Value
            </button>
          </div>

          {/* True Historical Deal Switch */}
          <button
            onClick={() => onToggleHistoricalLow(!historicalLowOnly)}
            className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              historicalLowOnly
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-[#171D2B] text-slate-400 border-[#1E2638] hover:text-slate-200'
            }`}
          >
            <Tag className={`w-3.5 h-3.5 ${historicalLowOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>True Deals Only</span>
          </button>

          <button
            onClick={toggleAlchemist}
            className="p-1.5 rounded-lg bg-[#171D2B] hover:bg-[#20283A] border border-[#1E2638] text-slate-400 hover:text-white transition-colors"
            title={isAlchemistOpen ? 'Collapse Alchemist Ribbon' : 'Expand Alchemist Ribbon'}
          >
            {isAlchemistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Tactile Sliders Tray */}
      {isAlchemistOpen && (
        <div className="border-t border-[#1E2638]/70 bg-[#080A0F]/60 px-4 sm:px-6 py-4 animate-fade-in">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Slider 1: Performance */}
            <div className="bg-[#0F131D] border border-[#1E2638] rounded-xl p-3 shadow-specular hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> PERFORMANCE
                </span>
                <span className="font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  {weights.performance}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.performance}
                onChange={(e) => handleSliderChange('performance', Number(e.target.value))}
                aria-label="Performance priority percentage"
                className="w-full accent-cyan-400 h-1.5 bg-[#171D2B] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Passable</span>
                <span>Maximum Power</span>
              </div>
            </div>

            {/* Slider 2: Portability */}
            <div className="bg-[#0F131D] border border-[#1E2638] rounded-xl p-3 shadow-specular hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-indigo-400" /> PORTABILITY / UL
                </span>
                <span className="font-mono font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {weights.portability}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.portability}
                onChange={(e) => handleSliderChange('portability', Number(e.target.value))}
                aria-label="Portability priority percentage"
                className="w-full accent-indigo-400 h-1.5 bg-[#171D2B] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Heavy Duty</span>
                <span>Featherweight</span>
              </div>
            </div>

            {/* Slider 3: Durability */}
            <div className="bg-[#0F131D] border border-[#1E2638] rounded-xl p-3 shadow-specular hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> DURABILITY & BUILD
                </span>
                <span className="font-mono font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {weights.durability}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.durability}
                onChange={(e) => handleSliderChange('durability', Number(e.target.value))}
                aria-label="Durability priority percentage"
                className="w-full accent-emerald-400 h-1.5 bg-[#171D2B] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Standard</span>
                <span>Bombproof</span>
              </div>
            </div>

            {/* Slider 4: Value */}
            <div className="bg-[#0F131D] border border-[#1E2638] rounded-xl p-3 shadow-specular hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> VALUE FOR MONEY
                </span>
                <span className="font-mono font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  {weights.value}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.value}
                onChange={(e) => handleSliderChange('value', Number(e.target.value))}
                aria-label="Value priority percentage"
                className="w-full accent-amber-400 h-1.5 bg-[#171D2B] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Cost Insensitive</span>
                <span>Peak Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
