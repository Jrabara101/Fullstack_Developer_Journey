import React, { useState, useRef } from 'react';
import { ReagentSource, PatternTexture } from '../../types/color';
import { getPatternStyle } from '../../lib/daltonize';

interface ReagentFlaskProps {
  reagent: ReagentSource;
  index: number;
  onDispense: (reagentId: string, volumeMl: number, tool: 'pipette' | 'pour') => void;
  patternsEnabled: boolean;
  disabled?: boolean;
}

export const ReagentFlask: React.FC<ReagentFlaskProps> = ({
  reagent,
  index,
  onDispense,
  patternsEnabled,
  disabled = false,
}) => {
  const [isHoldingPour, setIsHoldingPour] = useState(false);
  const [holdingVolume, setHoldingVolume] = useState(0);
  const pourIntervalRef = useRef<number | null>(null);

  const fillPercent = Math.max(0, Math.min(100, (reagent.remainingVolumeMl / reagent.maxVolumeMl) * 100));

  // Click-and-hold pour mechanics (0.1ml increments)
  const startPour = (e: React.PointerEvent) => {
    if (disabled || reagent.remainingVolumeMl <= 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsHoldingPour(true);
    setHoldingVolume(0.1);

    onDispense(reagent.id, 0.1, 'pour');

    // Trigger visual droplet event for canvas
    window.dispatchEvent(
      new CustomEvent('reagent-dispensed', {
        detail: { colorHex: reagent.color.hex, reagentId: reagent.id },
      })
    );

    let accumulated = 0.1;
    pourIntervalRef.current = window.setInterval(() => {
      accumulated = Math.round((accumulated + 0.1) * 10) / 10;
      setHoldingVolume(accumulated);
      onDispense(reagent.id, 0.1, 'pour');
    }, 120);
  };

  const stopPour = (e: React.PointerEvent) => {
    if (pourIntervalRef.current) {
      clearInterval(pourIntervalRef.current);
      pourIntervalRef.current = null;
    }
    setIsHoldingPour(false);
    setHoldingVolume(0);
  };

  // 1-drop click handler
  const handleSingleDrop = () => {
    if (disabled || reagent.remainingVolumeMl <= 0) return;
    onDispense(reagent.id, 0.5, 'pipette');
    window.dispatchEvent(
      new CustomEvent('reagent-dispensed', {
        detail: { colorHex: reagent.color.hex, reagentId: reagent.id },
      })
    );
  };

  // Drag-and-drop Pipette transfer support
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ reagentId: reagent.id, volumeMl: 0.5 }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const patternStyle = getPatternStyle(reagent.patternTexture, patternsEnabled);

  return (
    <div
      draggable={!disabled && reagent.remainingVolumeMl > 0}
      onDragStart={handleDragStart}
      className={`snap-center shrink-0 w-36 bg-surface-low border border-surface-high/60 rounded-xl p-3 flex flex-col gap-2 shadow-lg transition-all duration-200 select-none group hover:border-primary/40 ${
        disabled || reagent.remainingVolumeMl <= 0 ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Header with Code and Remaining Volume */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: reagent.color.hex }} />
          {reagent.code}
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {reagent.remainingVolumeMl.toFixed(1)}ml
        </span>
      </div>

      {/* Pipette Flask Physical Graphic Container */}
      <div className="h-20 w-full rounded-lg bg-surface-lowest flex items-end p-1.5 relative overflow-hidden border border-surface-container shadow-inner">
        {/* Metric graduation ticks */}
        <div className="absolute inset-0 opacity-15 flex flex-col justify-around py-1.5 px-2 pointer-events-none">
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
        </div>

        {/* Tactile Pattern Layer on Flask */}
        <div className="absolute inset-0 pointer-events-none opacity-40" style={patternStyle} />

        {/* Liquid Column */}
        <div
          className="w-full rounded transition-all duration-300 relative shadow-lg"
          style={{
            height: `${fillPercent}%`,
            backgroundColor: reagent.color.hex,
            boxShadow: `0 0 14px ${reagent.color.hex}60`,
          }}
        >
          {/* Meniscus curvature highlight */}
          <div className="absolute -top-1 inset-x-0 h-1.5 rounded-full bg-white/30 backdrop-blur-sm" />
        </div>

        {/* Hotkey Tag (1, 2, 3...) */}
        <div className="absolute top-1 right-1 bg-surface-container/90 text-slate-400 font-mono text-[9px] px-1 rounded border border-surface-high">
          [{index + 1}]
        </div>
      </div>

      {/* Interactive Titration Buttons */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {/* +1 Pipette Drop (+0.5ml) */}
        <button
          onClick={handleSingleDrop}
          disabled={disabled || reagent.remainingVolumeMl <= 0}
          className="w-full py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-high text-slate-200 font-mono text-xs font-semibold active:scale-95 flex items-center justify-center gap-1 transition-all border border-surface-high/60 shadow-sm"
          title={`Dispense 0.5ml via precision dropper (Key: ${index + 1})`}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: reagent.color.hex }} />
          +0.5ml Drop
        </button>

        {/* Click-and-Hold Fluid Pour Button */}
        <button
          onPointerDown={startPour}
          onPointerUp={stopPour}
          onPointerLeave={stopPour}
          onPointerCancel={stopPour}
          disabled={disabled || reagent.remainingVolumeMl <= 0}
          className={`w-full py-1 px-2 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold active:scale-95 transition-all border ${
            isHoldingPour
              ? 'bg-primary/20 text-primary border-primary animate-pulse'
              : 'bg-surface-lowest text-slate-400 hover:text-slate-200 border-surface-high/40'
          }`}
          title="Hold to pour continuous fluid"
        >
          {isHoldingPour ? `Pouring +${holdingVolume.toFixed(1)}ml` : 'Hold to Pour'}
        </button>
      </div>
    </div>
  );
};
