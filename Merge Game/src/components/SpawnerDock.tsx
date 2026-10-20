// ----------------------------------------------------
// Spawner Vault Dock, Pocket Buffer, Auto-Sort & Trash
// ----------------------------------------------------

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ItemToken } from './ItemToken';
import { Sparkles, ArrowDownUp, Trash2, Box, PackagePlus } from 'lucide-react';

export const SpawnerDock: React.FC = () => {
  const {
    spawnerCharges,
    spawnItem,
    autoSort,
    pocketItem,
    retrievePocket,
    undo,
    draggedItem,
    trashItem,
    storeInPocket,
  } = useGameStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in inputs or modal
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || (e.key >= '1' && e.key <= '9')) {
        e.preventDefault();
        spawnItem();
      } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        autoSort();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spawnItem, undo, autoSort]);

  // Handle dropping onto pocket slot
  const handlePocketDrop = () => {
    if (draggedItem && !pocketItem) {
      storeInPocket(draggedItem);
    }
  };

  // Handle dropping onto trash
  const handleTrashDrop = () => {
    if (draggedItem) {
      trashItem(draggedItem.id);
    }
  };

  return (
    <div className="w-full max-w-[580px] mx-auto mt-3 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl flex items-center justify-between gap-3 select-none">
      {/* Tool 1: Temporary Pocket Slot (Single-item buffer) */}
      <div className="flex flex-col items-center">
        <div
          onPointerUp={handlePocketDrop}
          onClick={() => {
            if (pocketItem) {
              retrievePocket({ x: 3, y: 3 });
            }
          }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
            pocketItem
              ? 'bg-[#161D2E] border-cyan-500/60 shadow-lg ring-1 ring-cyan-400'
              : 'bg-[#101624] border-dashed border-slate-700 hover:border-slate-500'
          }`}
          title={pocketItem ? 'Click to place pocket item onto board' : 'Drag an item here to store in pocket buffer'}
        >
          {pocketItem ? (
            <ItemToken item={pocketItem} />
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <Box className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-mono">POCKET</span>
            </div>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-400 mt-1">Pocket [P]</span>
      </div>

      {/* Main Feature: Spawner Vault Button */}
      <button
        onClick={() => spawnItem()}
        disabled={spawnerCharges <= 0}
        className={`flex-1 max-w-[240px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 font-sans font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 border ${
          spawnerCharges > 0
            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/40 glow-solar animate-pulse-glow'
            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
        }`}
      >
        <div className="p-1.5 rounded-lg bg-black/20 text-white">
          <PackagePlus className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-extrabold flex items-center gap-1">
            <span>SPAWN CRATE</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="text-[11px] font-mono font-medium opacity-90">
            Charges: <span className="font-bold">{spawnerCharges}</span>/20
          </div>
        </div>
      </button>

      {/* Auxiliary Tools: Auto-Sort & Trash Bin */}
      <div className="flex items-center gap-2">
        {/* Auto-Sort */}
        <div className="flex flex-col items-center">
          <button
            onClick={autoSort}
            title="Auto-Sort Grid by Tier [S]"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-cyan-300 transition-all shadow"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 mt-1">Sort [S]</span>
        </div>

        {/* Trash / Recycle Bin */}
        <div className="flex flex-col items-center">
          <div
            onPointerUp={handleTrashDrop}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all ${
              draggedItem
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
            }`}
            title="Drag an item here to recycle/discard"
          >
            <Trash2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">Recycle</span>
        </div>
      </div>
    </div>
  );
};
