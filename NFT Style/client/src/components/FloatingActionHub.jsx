import React from 'react';
import { sounds } from '../utils/soundEffects';

export default function FloatingActionHub({
  unopenedPacks,
  duplicatesCount,
  onOpenPacksClick,
  onOpenTradesClick,
  onLiquidateClick
}) {
  const packsCount = unopenedPacks?.length || 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-container-low/90 backdrop-blur-2xl border border-outline-variant/40 rounded-full px-4 sm:px-6 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center gap-3 sm:gap-4 max-w-[95vw] overflow-x-auto scrollbar-none">
      
      {/* Action 1: Unbox Packs with Amber Pulse */}
      <button
        onClick={() => {
          sounds.playClick();
          onOpenPacksClick();
        }}
        className="flex items-center gap-2 bg-gradient-to-r from-tertiary-container to-tertiary hover:brightness-110 text-on-tertiary-container font-mono text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full shadow-[0_0_16px_rgba(245,158,11,0.5)] transition-all hover:scale-105 whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[18px] animate-bounce">inventory_2</span>
        <span>Unbox Mystery Packs</span>
        {packsCount > 0 && (
          <span className="bg-surface-container-lowest/70 text-tertiary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {packsCount} Ready
          </span>
        )}
      </button>

      <div className="h-4 w-[1px] bg-surface-container-highest hidden sm:block"></div>

      {/* Action 2: P2P Market Pulse */}
      <button
        onClick={() => {
          sounds.playClick();
          onOpenTradesClick();
        }}
        className="flex items-center gap-1.5 text-on-surface hover:text-primary font-mono text-xs font-semibold transition-colors whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-primary text-[18px]">currency_exchange</span>
        <span>P2P Trading Hub</span>
        <span className="text-primary text-[10px] hidden md:inline ml-0.5 font-bold">+14% Vol</span>
      </button>

      <div className="h-4 w-[1px] bg-surface-container-highest hidden sm:block"></div>

      {/* Action 3: Quick Sell Duplicates */}
      {duplicatesCount > 0 ? (
        <button
          onClick={() => {
            sounds.playClick();
            onLiquidateClick();
          }}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-mono text-xs transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-tertiary text-[16px]">recycling</span>
          <span>Liquidate {duplicatesCount} Duplicates</span>
        </button>
      ) : (
        <span className="text-[11px] font-mono text-on-surface-variant/60 hidden lg:inline">
          Obsidian Protocol v2.4.0
        </span>
      )}

    </div>
  );
}
