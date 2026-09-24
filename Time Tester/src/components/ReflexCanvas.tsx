import React, { useEffect, useState } from 'react';
import { ReactionPhase, ReflexMode, PeripheralTarget } from '../types/reaction';
import { getArchetype, calculatePercentile } from '../utils/analytics';
import {
  Zap,
  AlertTriangle,
  Flame,
  Volume2,
  Crosshair,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReflexCanvasProps {
  phase: ReactionPhase;
  mode: ReflexMode;
  currentRunMs: number | null;
  currentRound: number;
  totalRounds: number;
  escalatingPenaltyDelay: number;
  peripheralTarget: PeripheralTarget | null;
  clickCoords: { x: number; y: number } | null;
  onProceedNext: () => void;
}

export const ReflexCanvas: React.FC<ReflexCanvasProps> = ({
  phase,
  mode,
  currentRunMs,
  currentRound,
  totalRounds,
  escalatingPenaltyDelay,
  peripheralTarget,
  clickCoords,
  onProceedNext,
}) => {
  // Rolling counter state
  const [displayCounter, setDisplayCounter] = useState<string>('0.0');
  const [shockwaves, setShockwaves] = useState<{ id: number; x: number; y: number }[]>([]);

  // Trigger supersonic shockwave & confetti on ultra-fast reaction times
  useEffect(() => {
    if (phase === 'ROUND_RESOLVED' && currentRunMs !== null) {
      if (currentRunMs < 190 && clickCoords) {
        const newId = Date.now() + Math.random();
        setShockwaves((prev) => [...prev, { id: newId, x: clickCoords.x, y: clickCoords.y }]);
        setTimeout(() => {
          setShockwaves((prev) => prev.filter((s) => s.id !== newId));
        }, 700);

        if (currentRunMs < 170) {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#06b6d4', '#10b981'],
          });
        }
      }

      // Smooth roll-up counter animation
      const start = 0;
      const target = currentRunMs;
      const duration = 220;
      const startTime = performance.now();

      let animationFrameId: number;

      const updateCounter = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const val = (start + (target - start) * easeOut).toFixed(1);
        setDisplayCounter(val);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateCounter);
        } else {
          setDisplayCounter(target.toFixed(1));
        }
      };

      animationFrameId = requestAnimationFrame(updateCounter);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [phase, currentRunMs, clickCoords]);

  // Determine background color and kinetic classes based on FSM phase
  const getCanvasBgClass = () => {
    switch (phase) {
      case 'WAITING':
        return 'bg-wait'; // Crimson anticipation
      case 'TRIGGERED':
        return 'bg-trigger'; // Electric emerald flash
      case 'EARLY_PENALTY':
        return 'bg-penalty animate-early-shake'; // Amber alert + violent shake
      case 'ROUND_RESOLVED':
      case 'REPORT_SUMMARY':
      case 'IDLE':
      default:
        return 'bg-void';
    }
  };

  const archetype = currentRunMs ? getArchetype(currentRunMs) : null;
  const percentile = currentRunMs ? calculatePercentile(currentRunMs) : null;
  const delta = currentRunMs ? (currentRunMs - 235).toFixed(1) : '0';

  return (
    <main
      id="strike-arena"
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden touch-manipulation transition-colors duration-0 ${getCanvasBgClass()}`}
    >
      {/* Shockwave ripples for supersonic latencies */}
      {shockwaves.map((sw) => (
        <div
          key={sw.id}
          className="shockwave"
          style={{ left: `${sw.x}px`, top: `${sw.y}px` }}
        />
      ))}

      {/* PHASE 1: IDLE / READY TO ENGAGE */}
      {phase === 'IDLE' && (
        <div className="flex flex-col items-center text-center px-6 max-w-2xl pointer-events-none transition-all animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-950/30 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform">
              {mode === 'audio' ? (
                <Volume2 className="w-10 h-10 text-cyan-400 animate-pulse" />
              ) : mode === 'peripheral' ? (
                <Crosshair className="w-10 h-10 text-cyan-400 animate-pulse" />
              ) : (
                <Zap className="w-10 h-10 text-cyan-400" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-cyan-400 uppercase mb-4 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>BIOMETRIC COMBINE READY • 5 ROUNDS</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-4">
            CLICK TO ENGAGE
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg font-normal mb-8 leading-relaxed">
            {mode === 'audio' ? (
              <>Wait in silence. As soon as the <strong className="text-cyan-400">Audio Burst</strong> fires, strike anywhere as quickly as humanly possible.</>
            ) : mode === 'peripheral' ? (
              <>Focus on center. Strike immediately when the <strong className="text-cyan-400">Target Pip</strong> appears anywhere in your peripheral vision.</>
            ) : (
              <>Once armed, hold steady. As soon as the screen flashes <strong className="text-emerald-400">Emerald Green</strong>, strike anywhere as quickly as humanly possible.</>
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span>WAIT (RED)</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>STRIKE (GREEN)</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span>EARLY = PENALTY</span>
            </div>
          </div>

          <div className="mt-8 font-mono text-[11px] text-zinc-600 bg-zinc-900/60 px-4 py-1.5 rounded-full border border-zinc-800/80">
            OR PRESS <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">[SPACEBAR]</kbd> ANYTIME
          </div>
        </div>
      )}

      {/* PHASE 2: WAITING FOR TRIGGER (Red Anticipation Chamber) */}
      {phase === 'WAITING' && (
        <div className="flex flex-col items-center text-center px-6 max-w-xl pointer-events-none animate-in zoom-in-95 duration-150">
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-75" />
            <div className="w-24 h-24 rounded-full border border-white/40 flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-2xl">
              <Flame className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          <div className="font-mono text-xs sm:text-sm tracking-[0.3em] font-bold text-white/80 uppercase mb-2">
            // PROTOCOL_ARMED: HOLD CONTACT
          </div>
          <h2 className="text-6xl sm:text-8xl font-black tracking-tighter text-white mb-3 uppercase drop-shadow-lg">
            WAIT...
          </h2>
          <p className="font-mono text-xs sm:text-sm text-white/80 max-w-sm tracking-wide font-medium">
            Sensory cortex primed. Do NOT click until stimulus triggers!
          </p>

          {escalatingPenaltyDelay > 0 && (
            <div className="mt-4 px-3 py-1 rounded-full bg-black/30 border border-white/20 font-mono text-[11px] text-amber-200">
              Escalating Delay Active: +{(escalatingPenaltyDelay / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: STRIKE TRIGGER (Green Flash / Stimulus Active) */}
      {phase === 'TRIGGERED' && (
        <div className="flex flex-col items-center text-center px-6 pointer-events-none animate-in zoom-in-90 duration-75">
          {mode === 'peripheral' && peripheralTarget ? (
            // Peripheral target pip placed at random coordinates
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: `${peripheralTarget.x}%`,
                top: `${peripheralTarget.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_#ffffff] animate-ping"
                style={{ width: `${peripheralTarget.size}px`, height: `${peripheralTarget.size}px` }}
              />
              <div
                className="absolute rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center"
                style={{ width: `${peripheralTarget.size * 0.8}px`, height: `${peripheralTarget.size * 0.8}px` }}
              >
                <Crosshair className="w-6 h-6 text-zinc-950" />
              </div>
            </div>
          ) : null}

          <div className="w-28 h-28 mb-4 rounded-full bg-white/20 flex items-center justify-center border-2 border-white animate-bounce shadow-2xl">
            <Zap className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-7xl sm:text-9xl font-black tracking-tight text-white uppercase drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            CLICK!
          </h2>
          <span className="font-mono text-xs sm:text-sm font-bold text-emerald-100 tracking-widest mt-3 uppercase bg-black/25 px-5 py-1.5 rounded-full border border-white/20">
            REFLEX CAPTURE IN FLIGHT
          </span>
        </div>
      )}

      {/* PHASE 4: FALSE START / EARLY PENALTY */}
      {phase === 'EARLY_PENALTY' && (
        <div className="flex flex-col items-center text-center px-6 max-w-xl pointer-events-none animate-in zoom-in-95 duration-100">
          <div className="w-20 h-20 rounded-full bg-black/30 border border-white/30 flex items-center justify-center mb-5 shadow-2xl">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <div className="font-mono text-xs tracking-widest text-white/90 uppercase mb-2">
            // TELEMETRY INVALIDATED
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tight mb-3">
            TOO EARLY!
          </h2>
          <p className="text-white/90 text-sm sm:text-base max-w-md font-medium mb-6 leading-relaxed">
            Motor impulse preceded optical stimulus. Round reset with escalating delay penalty applied.
          </p>
          <div className="px-6 py-2.5 rounded-full bg-black/40 border border-white/30 font-mono text-xs text-white tracking-widest uppercase shadow-xl">
            CLICK ANYWHERE OR PRESS [SPACE] TO RETRY ROUND
          </div>
        </div>
      )}

      {/* PHASE 5: ROUND RESOLVED (Rolling Counter & Archetype) */}
      {phase === 'ROUND_RESOLVED' && currentRunMs !== null && (
        <div className="flex flex-col items-center text-center px-6 max-w-3xl pointer-events-none animate-in zoom-in-95 duration-200">
          {/* Reflex Archetype Badge */}
          {archetype && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${archetype.badgeBg} border ${archetype.badgeBorder} ${archetype.badgeText} font-mono text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md shadow-xl`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{archetype.name}</span>
            </div>
          )}

          {/* Big Rolling Counter */}
          <div className="flex items-baseline justify-center font-mono font-black tracking-tight text-white mb-3">
            <span className="text-7xl sm:text-9xl text-white drop-shadow-[0_0_45px_rgba(34,211,238,0.35)]">
              {displayCounter}
            </span>
            <span className="text-2xl sm:text-4xl text-zinc-500 font-medium ml-3">ms</span>
          </div>

          {/* Delta and Percentile Telemetry */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs mb-8">
            <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              DELTA: <span className={Number(delta) <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {Number(delta) > 0 ? `+${delta}` : delta} ms
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              PERCENTILE: <span className="text-cyan-400 font-bold">TOP {percentile?.toFixed(1)}%</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              ROUND: <span className="text-white font-bold">{currentRound} / {totalRounds}</span>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProceedNext();
              }}
              className="pointer-events-auto flex items-center gap-2 px-8 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold font-mono text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.45)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>
                {currentRound < totalRounds
                  ? `CONTINUE TO ROUND 0${currentRound + 1}`
                  : 'VIEW TELEMETRY SCORECARD'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 font-mono text-[11px] text-zinc-500">
            OR PRESS <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">[SPACE]</kbd> / CLICK ANYWHERE
          </div>
        </div>
      )}
    </main>
  );
};
