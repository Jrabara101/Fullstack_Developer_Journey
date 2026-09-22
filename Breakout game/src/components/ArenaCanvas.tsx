import React, { useRef, useEffect } from 'react';
import { BreakoutEngine } from '../game/engine';
import { Play, Zap, MoveHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface ArenaCanvasProps {
  engine: BreakoutEngine | null;
  isWaitingLaunch: boolean;
  isPaused: boolean;
  crtOverlay: boolean;
  onLaunch: () => void;
  onResume: () => void;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  engine,
  isWaitingLaunch,
  isPaused,
  crtOverlay,
  onLaunch,
  onResume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse & Pointer movement directly on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!engine || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    engine.setPaddleTarget(e.clientX, rect);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!engine) return;
    if (isWaitingLaunch) {
      onLaunch();
    } else if (engine.paddle.hasLasers) {
      engine.fireLasers();
    } else if (engine.paddle.caughtBall) {
      engine.launchBall();
    }
  };

  // Mobile Touch Trackpad Zone (Eliminating thumb occlusion)
  const handleTouchSlider = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!engine || e.touches.length === 0) return;
    const touch = e.touches[0];
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const pct = ((touch.clientX - rect.left) / rect.width) * 100;
    engine.setPaddlePercent(pct);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 relative z-10 select-none">
      {/* Main Canvas Arena Frame */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="relative w-full max-w-4xl aspect-[16/10] max-h-[66vh] rounded-2xl overflow-hidden glass-panel border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.18)] flex items-center justify-center cursor-crosshair touch-none"
      >
        {/* CRT Scanline and Grid Layers */}
        {crtOverlay && (
          <>
            <div className="absolute inset-0 crt-grid pointer-events-none opacity-40"></div>
            <div className="absolute inset-0 crt-lines pointer-events-none opacity-25 z-10"></div>
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none animate-scanline z-10"></div>
          </>
        )}

        {/* Cyberpunk HUD Corner Brackets */}
        <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none"></div>

        {/* The 2D Simulation Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          id="game-arena-canvas"
          className="w-full h-full block"
        />

        {/* OVERLAY: LAUNCH PROMPT (When ball is waiting on paddle) */}
        {isWaitingLaunch && !isPaused && (
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-all duration-300">
            <div className="glass-panel-glow p-6 md:p-7 rounded-2xl text-center max-w-sm border border-cyan-500/40 shadow-2xl animate-float">
              <div className="inline-flex p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-3 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Play className="w-6 h-6 fill-cyan-400/30" />
              </div>
              <h2 className="text-xl font-display font-black uppercase tracking-wider text-white">
                GRID SYNCHRONIZED
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 font-sans leading-relaxed">
                Move paddle with cursor or keys. Angle deflections with 5 paddle zones. Hit space or tap to eject photon core.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunch();
                }}
                className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs md:text-sm tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>ENGAGE DISK [SPACE]</span>
                <Play className="w-4 h-4 fill-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: PAUSED STATE */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="glass-panel-glow p-6 rounded-2xl text-center max-w-xs border border-cyan-500/40 shadow-2xl">
              <h2 className="text-xl font-display font-black uppercase tracking-wider text-white">
                SIMULATION PAUSED
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Tactical hold initiated. Press Space or click below to resume.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResume();
                }}
                className="mt-4 w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                RESUME BATTLE
              </button>
            </div>
          </div>
        )}

        {/* Mobile Laser Fire Button (when lasers are equipped) */}
        {engine?.paddle.hasLasers && !isWaitingLaunch && !isPaused && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              engine.fireLasers();
            }}
            className="md:hidden absolute bottom-3 right-3 z-20 p-3 rounded-full bg-rose-600/90 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] border border-rose-400 active:scale-90 transition-transform"
          >
            <Zap className="w-5 h-5 fill-white" />
          </button>
        )}
      </div>

      {/* MOBILE TOUCH TRACKPAD ZONE (Bottom 25% zone preventing thumb occlusion) */}
      <div 
        onTouchMove={handleTouchSlider}
        onTouchStart={handleTouchSlider}
        className="md:hidden mt-2 w-full max-w-4xl h-12 glass-panel-glow rounded-xl flex items-center justify-between px-3 relative overflow-hidden border border-cyan-500/40 touch-none shadow-md"
      >
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 uppercase">
          <MoveHorizontal className="w-4 h-4 animate-pulse" />
          <span>Trackpad</span>
        </div>
        <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-full shadow-[0_0_10px_#06b6d4] -translate-x-1/2"
            style={{ 
              left: `${Math.min(95, Math.max(5, (engine ? (engine.paddle.x / (engine.ARENA_WIDTH - engine.paddle.width)) * 100 : 50)))}%` 
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400">Slide here</span>
      </div>
    </div>
  );
};
