import React, { useRef, useState, useEffect } from 'react';
import { Sword, Shield, Zap, Snowflake, Flame } from 'lucide-react';

interface TouchControlsProps {
  onMove: (vec: { x: number; y: number }) => void;
  onTriggerAbility: (id: string) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onTriggerAbility,
}) => {
  const stickRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  // Virtual Analog Stick handler
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        touchIdRef.current = null;
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!stickRef.current) return;
    const rect = stickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 45;

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onMove({ x: dx / maxRadius, y: dy / maxRadius });
    } else {
      const clampedX = (dx / dist) * maxRadius;
      const clampedY = (dy / dist) * maxRadius;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove({ x: clampedX / maxRadius, y: clampedY / maxRadius });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none md:hidden">
      {/* Bottom-Left: Virtual Analog Stick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={stickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-32 h-32 rounded-full bg-slate-950/60 border-2 border-amber-500/20 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl"
        >
          {/* Inner Knob */}
          <div
            className="w-14 h-14 rounded-full bg-amber-500/40 border border-amber-400/80 shadow-lg"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          />
        </div>
      </div>

      {/* Bottom-Right: Clustered Action Satellite Buttons */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-center">
        <div className="relative w-44 h-44">
          {/* Central Attack Button [LMB Slash] */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTriggerAbility('SLASH'); }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg active:scale-90 border-2 border-amber-300"
          >
            <Sword className="w-8 h-8 fill-slate-950" />
          </button>

          {/* Satellite: Parry [RMB] */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTriggerAbility('PARRY'); }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 flex items-center justify-center active:scale-90 shadow-md"
          >
            <Shield className="w-5 h-5" />
          </button>

          {/* Satellite: Dash [Space] */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTriggerAbility('DASH'); }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 flex items-center justify-center active:scale-90 shadow-md"
          >
            <Zap className="w-5 h-5" />
          </button>

          {/* Satellite: Frost Nova [Q] */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTriggerAbility('FROST_NOVA'); }}
            className="absolute top-1/2 left-2 -translate-y-1/2 w-12 h-12 rounded-full bg-sky-950/90 border border-sky-400 text-sky-300 flex items-center justify-center active:scale-90 shadow-md"
          >
            <Snowflake className="w-5 h-5" />
          </button>

          {/* Satellite: Flame Sweep [E] */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTriggerAbility('FLAME_SWEEP'); }}
            className="absolute top-1/2 right-2 -translate-y-1/2 w-12 h-12 rounded-full bg-orange-950/90 border border-orange-400 text-orange-300 flex items-center justify-center active:scale-90 shadow-md"
          >
            <Flame className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
