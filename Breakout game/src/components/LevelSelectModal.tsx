import React from 'react';
import { SECTORS } from '../game/levels';
import { X, Layers, ChevronRight, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface LevelSelectModalProps {
  isOpen: boolean;
  activeSectorId: number;
  onSelectSector: (sectorId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  activeSectorId,
  onSelectSector,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-glow rounded-2xl w-full max-w-lg border border-cyan-500/40 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-white">Sector Matrix Select</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {SECTORS.map((sector) => {
            const isCurrent = sector.id === activeSectorId;
            return (
              <div
                key={sector.id}
                onClick={() => {
                  onSelectSector(sector.id);
                  onClose();
                }}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                  isCurrent 
                    ? "bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]" 
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                )}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-sm border",
                      isCurrent 
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md" 
                        : "bg-slate-800 text-slate-300 border-slate-700 group-hover:border-cyan-500/50"
                    )}
                  >
                    0{sector.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-white text-sm tracking-wide">
                        {sector.name}
                      </h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans line-clamp-1">
                      {sector.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    {sector.rows}x{sector.cols} Grid
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                    {isCurrent ? <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] font-mono text-slate-400">
            Each sector features unique ceiling tunnels and risk-reward power-up drops.
          </p>
        </div>
      </div>
    </div>
  );
};
