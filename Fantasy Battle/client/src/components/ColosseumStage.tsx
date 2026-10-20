import React, { useEffect } from 'react';
import type { ArenaGameState } from '../types';

interface ColosseumStageProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: ArenaGameState;
}

export const ColosseumStage: React.FC<ColosseumStageProps> = ({ canvasRef, gameState }) => {
  // Auto-resize canvas buffer to match screen resolution with crisp HiDPI
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  const isLowHp = (gameState.player.hp / gameState.player.maxHp) < 0.25;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080D]">
      {/* Main HTML5 2D Combat Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Low Health Pulsing Danger Vignette */}
      {isLowHp && gameState.status === 'BATTLE_ACTIVE' && (
        <div className="absolute inset-0 pointer-events-none vignette-danger z-10 transition-opacity duration-300" />
      )}

      {/* Wave Countdown Banner */}
      {gameState.status === 'WAVE_COUNTDOWN' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="text-amber-500 font-cinzel text-xl tracking-[0.3em] font-semibold uppercase mb-2">
            Colosseum Gauntlet
          </div>
          <div className="text-5xl md:text-7xl font-cinzel font-black tracking-wider text-white drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-4">
            WAVE {gameState.currentWave}
          </div>
          <div className="text-6xl font-mono font-bold text-amber-400 animate-pulse">
            {gameState.countdownSeconds}
          </div>
          <div className="text-slate-400 font-outfit text-sm tracking-widest uppercase mt-4">
            Prepare Your Stance &bull; Right-Click to Parry
          </div>
        </div>
      )}

      {/* Wave Cleared Banner */}
      {gameState.status === 'WAVE_CLEARED' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="text-cyan-400 font-cinzel text-xl tracking-[0.3em] font-semibold uppercase mb-2">
            Runic Flames Subside
          </div>
          <div className="text-5xl md:text-7xl font-cinzel font-black tracking-wider text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-3">
            WAVE {gameState.currentWave} CLEARED
          </div>
          <div className="text-slate-300 font-outfit text-sm tracking-widest uppercase">
            Advancing to next trial in 2 seconds...
          </div>
        </div>
      )}
    </div>
  );
};
