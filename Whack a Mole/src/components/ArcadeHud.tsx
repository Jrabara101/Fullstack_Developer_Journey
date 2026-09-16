import React from 'react';
import { useArcadeStore } from '../store/useArcadeStore';
import { formatNum, formatTime } from '../utils/formatters';

export const ArcadeHud: React.FC = () => {
  const score = useArcadeStore((s) => s.score);
  const highScore = useArcadeStore((s) => s.highScore);
  const combo = useArcadeStore((s) => s.combo);
  const timeLeft = useArcadeStore((s) => s.timeLeft);
  const initialDuration = useArcadeStore((s) => s.initialDuration);

  // Dynamic Combo label and style
  let comboLabel = 'CRUISING';
  let comboValStyle = 'text-cyan-300 text-glow-cyan';

  if (combo > 4) {
    comboLabel = 'NITRO OVERDRIVE!';
    comboValStyle = 'text-yellow-300 text-glow-gold scale-110';
  } else if (combo > 2) {
    comboLabel = 'TURBO SURGE';
    comboValStyle = 'text-pink-400 text-glow-pink';
  }

  const comboPct = Math.min(100, (combo / 8) * 100);
  const timerPct = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className="w-full max-w-3xl mb-4 bg-[#110524]/90 backdrop-blur-lg border-2 border-fuchsia-500 neon-pink-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
      {/* Multiplier & Boost Meter */}
      <div className="flex items-center gap-3 w-full sm:w-auto min-w-[150px]">
        <div className="p-2 bg-black/60 border border-yellow-400/60 flex flex-col items-start w-full sm:min-w-[150px]">
          <span className="text-xs text-yellow-300 tracking-widest flex items-center gap-1 font-['Righteous'] uppercase">
            <span className="material-symbols-outlined text-yellow-400 text-sm">flash_on</span>
            TURBO MULTIPLIER
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`font-['Righteous'] text-3xl font-black tracking-tight transition-transform duration-100 ${comboValStyle}`}>
              x{combo}
            </span>
            <span className="text-xs text-fuchsia-300 tracking-wider font-bold">
              {comboLabel}
            </span>
          </div>
          {/* Boost Nitro Gauge */}
          <div className="w-full h-2 bg-fuchsia-950/80 border border-yellow-500/40 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-200"
              style={{ width: `${comboPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Round Timer with Synth Neon Pulse */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-ping'}`} />
          <span className="text-xs font-['Righteous'] text-cyan-300 tracking-[0.2em] uppercase">
            HORIZON RUN TIME
          </span>
        </div>
        <div className={`flex items-center gap-2 bg-black/70 border px-4 py-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] ${
          isUrgent ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'border-cyan-400/80'
        }`}>
          <span className={`material-symbols-outlined text-xl ${isUrgent ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            speed
          </span>
          <span className={`font-['VT323'] text-4xl font-black tracking-widest tabular-nums ${
            isUrgent ? 'text-red-400 animate-pulse' : 'text-cyan-300 text-glow-cyan'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="w-40 h-2 bg-cyan-950/80 border border-cyan-500/40 mt-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 linear shadow-[0_0_8px_#00f0ff] ${
              isUrgent ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-cyan-400'
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Right Score Metric */}
      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto min-w-[150px]">
        <span className="text-xs text-pink-300 font-['Righteous'] tracking-widest uppercase">
          MIAMI GRID SCORE
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-['VT323'] text-4xl font-black text-white tracking-wider tabular-nums text-glow-pink">
            {formatNum(score)}
          </span>
          <span className="text-xs text-cyan-400 font-bold">MPH</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-300/90 mt-0.5">
          <span className="text-xs tracking-wider">ALL-TIME:</span>
          <span className="text-xs text-yellow-300 font-bold tracking-widest">
            {formatNum(highScore)}
          </span>
        </div>
      </div>
    </div>
  );
};
