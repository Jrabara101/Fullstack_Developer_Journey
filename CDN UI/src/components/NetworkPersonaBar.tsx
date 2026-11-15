import React from 'react';
import { 
  Globe2, 
  Radio, 
  RotateCw, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { NetworkPersona } from '../types';
import { POP_REGIONS } from '../data/mockAssets';

interface NetworkPersonaBarProps {
  personas: NetworkPersona[];
  selectedPersona: NetworkPersona;
  onSelectPersona: (persona: NetworkPersona) => void;
  saveDataEnabled: boolean;
  onToggleSaveData: () => void;
  onTriggerPurge: () => void;
  isPurging: boolean;
  purgeStep: number;
}

export const NetworkPersonaBar: React.FC<NetworkPersonaBarProps> = ({
  personas,
  selectedPersona,
  onSelectPersona,
  saveDataEnabled,
  onToggleSaveData,
  onTriggerPurge,
  isPurging,
  purgeStep,
}) => {
  return (
    <div className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        
        {/* Left Telemetry Metrics */}
        <div className="flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white font-tabular">
                1.84 <span className="text-edge-cyan text-lg">TB</span>
              </span>
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full bg-edge-emerald/15 text-edge-emerald border border-edge-emerald/30">
                💰 ~$147 Saved
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              Egress Avoided This Month
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-edge-emerald animate-pulse"></span>
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-edge-emerald font-tabular">
                99.4%
              </span>
              <span className="text-[11px] font-semibold text-gray-400 font-mono">
                0 Origin Wakeups
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              Global Edge Hit Health
            </div>
          </div>
        </div>

        {/* Center: Real-World Global Latency Simulator */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            <Globe2 className="w-4 h-4 text-edge-cyan" />
            <span>Viewer Network:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            {personas.map((persona) => {
              const isSelected = selectedPersona.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelectPersona(persona)}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-edge-well border-edge-cyan shadow-md shadow-edge-cyan/10 ring-1 ring-edge-cyan/40 text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="text-lg leading-none">{persona.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate flex items-center justify-between">
                      <span>{persona.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        persona.latencyMs < 30 ? 'text-edge-emerald bg-edge-emerald/10' :
                        persona.latencyMs < 150 ? 'text-edge-amber bg-edge-amber/10' : 'text-edge-rose bg-edge-rose/10'
                      }`}>
                        {persona.latencyMs}ms
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {persona.networkType} • {persona.bandwidthMbps} Mbps
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Smart Save-Data & Purge Worldwide */}
        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 shrink-0 justify-between sm:justify-end">
          {/* Save-Data Auto-Downgrade empathy switch */}
          <button
            onClick={onToggleSaveData}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              saveDataEnabled 
                ? 'bg-edge-amber/15 border-edge-amber text-edge-amber ring-1 ring-edge-amber/30' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
            title="Simulate client Save-Data: on and 3G ECT header negotiation"
          >
            <Radio className={`w-3.5 h-3.5 ${saveDataEnabled ? 'animate-pulse text-edge-amber' : ''}`} />
            <div className="text-left">
              <div className="font-semibold leading-tight">Save-Data Empathy</div>
              <div className="text-[10px] text-gray-400 leading-tight">
                {saveDataEnabled ? 'Active (Auto-Downgrade)' : 'Normal Stream'}
              </div>
            </div>
          </button>

          {/* Purge Edge Cache Button */}
          <button
            onClick={onTriggerPurge}
            disabled={isPurging}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
              isPurging 
                ? 'bg-edge-emerald/20 text-edge-emerald border border-edge-emerald/40 cursor-wait'
                : 'bg-gradient-to-r from-edge-cyan to-edge-emerald text-edge-obsidian font-bold hover:brightness-110 shadow-lg shadow-edge-cyan/25 active:scale-95'
            }`}
          >
            {isPurging ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Propagating Wave ({purgeStep}/4)...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Purge Worldwide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Regional Propagation Strip when purging */}
      {isPurging && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs font-medium text-gray-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-edge-cyan">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Surrogate-Key Wave Invalidation across 284 Edge PoPs</span>
            </span>
            <span className="font-mono text-[11px] text-gray-400 font-semibold">Atomic Surrogate: All Variants Invalidated</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POP_REGIONS.map((pop, idx) => {
              const isDone = purgeStep > idx;
              const isCurrent = purgeStep === idx;
              return (
                <div
                  key={pop.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                    isDone
                      ? 'bg-edge-emerald/15 border-edge-emerald/40 text-edge-emerald'
                      : isCurrent
                      ? 'bg-edge-cyan/15 border-edge-cyan text-edge-cyan animate-pulse'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-edge-emerald shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"></span>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{pop.name}</div>
                    <div className="text-[10px] opacity-75 font-mono">{isDone ? 'Purged ✓' : 'Invalidating...'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
