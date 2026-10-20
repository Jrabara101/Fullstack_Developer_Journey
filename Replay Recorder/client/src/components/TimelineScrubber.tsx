import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ReplayEventMarker,
  ReplaySessionState,
  EventCategory
} from '../types/replay';
import { Skull, Crosshair, Zap, Flag, Award } from 'lucide-react';

interface TimelineScrubberProps {
  sessionState: ReplaySessionState;
  markers: ReplayEventMarker[];
  onSeek: (tick: number, magnetSnap?: boolean) => void;
  onStartScrubbing: () => void;
  onScrub: (tick: number) => void;
  onEndScrubbing: () => void;
  onSetLoopRange: (range: [number, number] | null) => void;
  onTogglePlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpSeconds: (sec: number) => void;
  onToggleGhost: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  sessionState,
  markers,
  onSeek,
  onStartScrubbing,
  onScrub,
  onEndScrubbing,
  onSetLoopRange,
  onTogglePlayPause,
  onStepForward,
  onStepBackward,
  onJumpSeconds,
  onToggleGhost
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [hoverTick, setHoverTick] = useState<number | null>(null);
  const [hoverMarker, setHoverMarker] = useState<ReplayEventMarker | null>(null);

  const totalTicks = Math.max(1, sessionState.totalTicks);
  const currentTick = sessionState.currentTick;
  const progressPercent = Math.min(100, Math.max(0, (currentTick / totalTicks) * 100));

  // Loop bounds
  const loopRange = sessionState.loopRange;
  const loopStartPct = loopRange ? (loopRange[0] / totalTicks) * 100 : null;
  const loopEndPct = loopRange ? (loopRange[1] / totalTicks) * 100 : null;

  // Convert mouse event X to tick index
  const getTickFromMouseEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    return Math.round(ratio * totalTicks);
  }, [totalTicks]);

  // Keyboard shortcuts listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlayPause();
          break;
        case 'KeyJ':
          e.preventDefault();
          onJumpSeconds(-5);
          break;
        case 'KeyL':
          e.preventDefault();
          onJumpSeconds(5);
          break;
        case 'Comma':
          e.preventDefault();
          onStepBackward();
          break;
        case 'Period':
          e.preventDefault();
          onStepForward();
          break;
        case 'KeyG':
          e.preventDefault();
          onToggleGhost();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlayPause, onJumpSeconds, onStepBackward, onStepForward, onToggleGhost]);

  // Scrub Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    onStartScrubbing();
    const tick = getTickFromMouseEvent(e);
    onScrub(tick);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const moveTick = getTickFromMouseEvent(moveEvent);
      onScrub(moveTick);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        onEndScrubbing();
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMoveHover = (e: React.MouseEvent) => {
    const t = getTickFromMouseEvent(e);
    setHoverTick(t);

    // Check if hovering near a marker
    const nearby = markers.find(m => Math.abs(m.tick - t) <= Math.max(10, totalTicks * 0.015));
    setHoverMarker(nearby || null);
  };

  const handleMouseLeave = () => {
    setHoverTick(null);
    setHoverMarker(null);
  };

  const formatTime = (tick: number) => {
    const totalMs = Math.round((tick / 60) * 1000);
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const getMarkerIcon = (cat: EventCategory) => {
    switch (cat) {
      case 'kill': return <Crosshair className="w-3 h-3 text-amber-400" />;
      case 'death': return <Skull className="w-3 h-3 text-rose-500" />;
      case 'ability': return <Zap className="w-3 h-3 text-violet-400" />;
      case 'checkpoint': return <Flag className="w-3 h-3 text-emerald-400" />;
      case 'milestone': return <Award className="w-3 h-3 text-sky-400" />;
    }
  };

  const getMarkerColor = (cat: EventCategory) => {
    switch (cat) {
      case 'kill': return 'bg-amber-500 border-amber-300 shadow-amber-500/50';
      case 'death': return 'bg-rose-500 border-rose-300 shadow-rose-500/50';
      case 'ability': return 'bg-violet-500 border-violet-300 shadow-violet-500/50';
      case 'checkpoint': return 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50';
      case 'milestone': return 'bg-sky-500 border-sky-300 shadow-sky-500/50';
    }
  };

  return (
    <div className="w-full select-none px-4 py-2 flex flex-col gap-1.5 bg-[#0A0E1A]/95 backdrop-blur-md border-t border-slate-800">
      {/* Top Telemetry Tick Counter & Keyframe Intervals */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-semibold">{formatTime(currentTick)}</span>
          <span className="text-slate-600">/</span>
          <span>{formatTime(totalTicks)}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 text-[11px]">TICK: {String(currentTick).padStart(6, '0')} / {String(totalTicks).padStart(6, '0')}</span>
        </div>

        {/* Hover preview readout */}
        {hoverTick !== null && (
          <div className="flex items-center gap-2 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60 text-[11px] text-sky-300">
            <span>SEEK: {formatTime(hoverTick)} (TICK {hoverTick})</span>
            {hoverMarker && (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                {getMarkerIcon(hoverMarker.category)} {hoverMarker.label}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">60 TICK/S</span>
          {sessionState.isLooping && loopRange && (
            <span className="text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60 font-semibold">
              LOOP: [{formatTime(loopRange[0])} - {formatTime(loopRange[1])}]
            </span>
          )}
        </div>
      </div>

      {/* Main Draggable Scrubber Well */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveHover}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-11 bg-slate-950/90 rounded-lg border border-slate-800/80 cursor-pointer overflow-hidden group shadow-inner"
      >
        {/* Subtle Waveform / Tick Grid Visualization */}
        <div className="absolute inset-0 flex items-center justify-between opacity-25 px-2 pointer-events-none">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className={`w-[1px] bg-slate-600 ${i % 4 === 0 ? 'h-6 bg-slate-400' : 'h-3'}`}
            />
          ))}
        </div>

        {/* Loop Bracket Hazard Stripes (Bounded Region) */}
        {loopStartPct !== null && loopEndPct !== null && (
          <div
            className="absolute top-0 bottom-0 hazard-stripes border-l-2 border-r-2 border-sky-400 pointer-events-none transition-all"
            style={{
              left: `${loopStartPct}%`,
              width: `${Math.max(0, loopEndPct - loopStartPct)}%`
            }}
          />
        )}

        {/* Completed Progress Track Fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-600/30 to-sky-400/20 pointer-events-none transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Interactive Event Markers Ribbon */}
        {markers.map(marker => {
          const mPercent = (marker.tick / totalTicks) * 100;
          const isActive = sessionState.activeMarkerId === marker.id;

          return (
            <div
              key={marker.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(marker.tick, false);
              }}
              title={`${marker.label} (${formatTime(marker.tick)})`}
              className={`absolute top-0 bottom-0 w-3 -ml-1.5 flex flex-col items-center justify-between py-1 z-20 group/marker cursor-pointer transition-transform ${
                isActive ? 'scale-125' : 'hover:scale-125'
              }`}
              style={{ left: `${mPercent}%` }}
            >
              {/* Top Pin Pip */}
              <div
                className={`w-2.5 h-2.5 rounded-full border shadow-md flex items-center justify-center transition-all ${getMarkerColor(
                  marker.category
                )} ${isActive ? 'ring-2 ring-white scale-125' : ''}`}
              />

              {/* Center Line Guide */}
              <div className="w-[1px] h-full bg-slate-600/60 group-hover/marker:bg-white" />

              {/* Hover Tooltip Card */}
              <div className="hidden group-hover/marker:flex absolute bottom-full mb-2 flex-col items-center z-50 pointer-events-none">
                <div className="bg-[#141C30] border border-slate-700 shadow-xl rounded px-2.5 py-1 text-xs whitespace-nowrap flex items-center gap-1.5 text-slate-100">
                  {getMarkerIcon(marker.category)}
                  <span className="font-semibold text-slate-100">{marker.label}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{formatTime(marker.tick)}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-[#141C30] border-r border-b border-slate-700 transform rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}

        {/* Laser Scanning Playhead Beam */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-sky-400 shadow-[0_0_12px_#38BDF8] z-30 pointer-events-none transition-transform duration-75"
          style={{ left: `${progressPercent}%` }}
        >
          {/* Top Playhead Triangle Indicator */}
          <div className="absolute -top-1 -left-[5px] w-3 h-3 bg-sky-400 transform rotate-45 shadow-[0_0_8px_#38BDF8]" />
          {/* Bottom Playhead Triangle Indicator */}
          <div className="absolute -bottom-1 -left-[5px] w-3 h-3 bg-sky-400 transform rotate-45 shadow-[0_0_8px_#38BDF8]" />
        </div>
      </div>
    </div>
  );
};
