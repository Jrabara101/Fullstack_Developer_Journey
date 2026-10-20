// ----------------------------------------------------
// GameViewport: Root Orchestrator & Viewport Constraint
// ----------------------------------------------------

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { HeaderHUD } from './HeaderHUD';
import { AnomalyTracker } from './AnomalyTracker';
import { MergeBoard } from './MergeBoard';
import { SpawnerDock } from './SpawnerDock';
import { DiscoveryCodexSheet } from './DiscoveryCodexSheet';
import { DailyChallengeModal } from './DailyChallengeModal';
import { Sparkles } from 'lucide-react';

export const GameViewport: React.FC = () => {
  const { initDailyChallenge, isLoadingChallenge } = useGameStore();

  // Initialize on mount
  useEffect(() => {
    initDailyChallenge();
  }, [initDailyChallenge]);

  return (
    <div className="relative min-h-screen w-full bg-[#080A10] ambient-crucible-glow flex flex-col justify-between py-3 px-2 sm:px-4 text-slate-100 select-none overflow-x-hidden">
      {/* Background ambient runes & cosmic dust aura */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#24304A_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Main Container constrained to 1120px desktop */}
      <div className="relative z-10 w-full max-w-[1120px] mx-auto flex-1 flex flex-col justify-between">
        {/* Header HUD */}
        <HeaderHUD />

        {/* Loading overlay for challenge seed */}
        {isLoadingChallenge ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <p className="font-mono text-cyan-300 text-sm">
              Synchronizing authoritative daily crucible seed...
            </p>
          </div>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center my-auto">
            {/* Dynamic Hazard Banner */}
            <AnomalyTracker />

            {/* Centered 7x7 Interactive Matrix Board */}
            <MergeBoard />

            {/* Bottom Spawner & Tool Dock */}
            <SpawnerDock />
          </main>
        )}

        {/* Minimal Footer Hotkey Bar */}
        <footer className="mt-3 py-1.5 px-3 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-400 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Merge: 5 identical items = 2 upgrades + Solar Catalyst</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">
              Drag Catalyst on Sprouts to Awaken Mythic Branches!
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>[1-9 / Space] Drop</span>
            <span>•</span>
            <span>[Z] Undo</span>
            <span>•</span>
            <span>[S] Auto-Sort</span>
          </div>
        </footer>
      </div>

      {/* Modal Layers */}
      <DiscoveryCodexSheet />
      <DailyChallengeModal />
    </div>
  );
};
