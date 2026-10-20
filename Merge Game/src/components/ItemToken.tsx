// ----------------------------------------------------
// Draggable Item Token with Tactile Physics & Glow
// ----------------------------------------------------

import React from 'react';
import type { BoardItem } from '../engine/types';
import { getTierColor, CODEX_ENTRIES } from '../engine/codex';
import { ItemIcon } from './ItemIcons';

interface ItemTokenProps {
  item: BoardItem;
  isDragging?: boolean;
  isGhost?: boolean;
  onClick?: () => void;
}

export const ItemToken: React.FC<ItemTokenProps> = ({
  item,
  isDragging = false,
  isGhost = false,
  onClick,
}) => {
  const colors = getTierColor(item.tier, item.category);
  const codexEntry = CODEX_ENTRIES.find(c => c.tier === item.tier && c.category === item.category) ||
    CODEX_ENTRIES.find(c => c.tier === item.tier) ||
    CODEX_ENTRIES[0];

  const tierLabel = item.category === 'catalyst' ? 'CAT' :
    item.category === 'branch_sun' ? 'SUN' :
    item.category === 'branch_void' ? 'VOID' :
    `T${item.tier}`;

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full rounded-xl flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing transition-transform duration-150 ease-out ${
        isGhost ? 'opacity-40 scale-95' : ''
      } ${
        isDragging
          ? 'scale-110 -translate-y-2.5 z-40 shadow-2xl ring-2 ring-emerald-400'
          : 'hover:scale-105 active:scale-95'
      } ${colors.bg} ${colors.glow} border ${colors.border}`}
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {/* Tier Badge Pill (Top-Right) */}
      <div
        className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight bg-slate-950/90 border ${colors.border} ${colors.text} shadow-sm`}
      >
        {tierLabel}
      </div>

      {/* Lock indicator if frozen/locked */}
      {item.isLocked && (
        <div className="absolute top-1 left-1 text-xs text-red-400 font-mono">
          🔒
        </div>
      )}

      {/* Icon Centerpiece with squash/stretch on drag */}
      <div className={`p-1 transition-transform ${isDragging ? 'scale-110' : ''}`}>
        <ItemIcon tier={item.tier} category={item.category} className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      {/* Item Title Telemetry */}
      <span className="text-[10px] sm:text-[11px] font-medium tracking-tight text-slate-200 line-clamp-1 px-1 text-center font-sans">
        {codexEntry.name.split(' ')[0]}
      </span>

      {/* Modifier Sparkle */}
      {item.modifier && (
        <div className="absolute -bottom-1 px-1 rounded text-[9px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
          ★ {item.modifier === 'catalyst_sun' ? 'SOLAR' : 'CHARGED'}
        </div>
      )}
    </div>
  );
};
