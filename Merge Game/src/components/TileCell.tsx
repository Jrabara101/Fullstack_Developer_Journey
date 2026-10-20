// ----------------------------------------------------
// Recessed Grid Tile Cell Component
// ----------------------------------------------------

import React from 'react';
import type { BoardItem, BoardAnomaly, Coordinate } from '../engine/types';
import { ItemToken } from './ItemToken';

interface TileCellProps {
  x: number;
  y: number;
  item: BoardItem | null;
  anomaly: BoardAnomaly | null;
  isHovered: boolean;
  isValidTarget: boolean;
  isDragSource: boolean;
  onPointerDown: (e: React.PointerEvent, item: BoardItem, pos: Coordinate) => void;
  onPointerEnter: (pos: Coordinate) => void;
  onPointerUp: (pos: Coordinate) => void;
}

export const TileCell: React.FC<TileCellProps> = ({
  x,
  y,
  item,
  anomaly,
  isHovered,
  isValidTarget,
  isDragSource,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
}) => {
  const isUrgent = anomaly && anomaly.turnsLeft <= 3;

  return (
    <div
      data-x={x}
      data-y={y}
      onPointerEnter={() => onPointerEnter({ x, y })}
      onPointerUp={() => onPointerUp({ x, y })}
      className={`relative w-full aspect-square rounded-xl flex items-center justify-center p-1 transition-all duration-150 select-none ${
        isHovered && isValidTarget
          ? 'cell-slot-hover ring-2 ring-emerald-400 scale-[1.03] z-20'
          : isHovered
          ? 'ring-1 ring-cyan-500/50 bg-[#1E2942]'
          : 'cell-slot'
      } ${isUrgent ? 'anomaly-warning-vignette' : ''}`}
    >
      {/* Coordinate Telemetry for debug/tactile detail */}
      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-700/60 pointer-events-none">
        {x},{y}
      </span>

      {/* Dimensional Anomaly Hazard */}
      {anomaly && (
        <div
          className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-1 border ${
            anomaly.type === 'rift'
              ? 'bg-rose-950/60 border-rose-500/80 text-rose-300'
              : anomaly.type === 'geode'
              ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
              : 'bg-purple-950/60 border-purple-500/80 text-purple-300'
          } ${isUrgent ? 'animate-pulse glow-anomaly' : ''}`}
        >
          {/* Anomaly Icon */}
          <div className="text-xl sm:text-2xl animate-spin-slow">
            {anomaly.type === 'rift' ? '🌀' : anomaly.type === 'geode' ? '💎' : '☣️'}
          </div>

          {/* Anomaly Status Badge */}
          <span className="text-[9px] font-mono font-bold tracking-tight uppercase mt-0.5">
            {anomaly.type}
          </span>

          {/* Turns countdown & hits indicator */}
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`text-[9px] font-mono px-1 rounded ${
                isUrgent ? 'bg-red-500 text-white font-extrabold animate-bounce' : 'bg-slate-800 text-slate-300'
              }`}
            >
              ⏳ {anomaly.turnsLeft}t
            </span>
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">
              ⚡ {anomaly.hitsTaken}/{anomaly.hitsRequired}
            </span>
          </div>
        </div>
      )}

      {/* Item Token (if present and not anomaly) */}
      {item && (
        <div
          onPointerDown={e => onPointerDown(e, item, { x, y })}
          className="w-full h-full touch-none"
        >
          <ItemToken item={item} isGhost={isDragSource} />
        </div>
      )}
    </div>
  );
};
