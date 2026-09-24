import React from 'react';
import { History, Share2, Award, Calendar } from 'lucide-react';

interface TelemetryDockProps {
  history: number[];
  totalRounds: number;
  currentRound: number;
  onOpenJournal: () => void;
  onOpenPassport: () => void;
}

export const TelemetryDock: React.FC<TelemetryDockProps> = ({
  history,
  totalRounds,
  onOpenJournal,
  onOpenPassport,
}) => {
  const averageMs =
    history.length > 0
      ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1)
      : null;

  return (
    <footer className="relative z-30 pb-6 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-none">
      {/* 5 Dynamic Round Slots */}
      <div className="pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-zinc-900/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
        <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest pr-2 border-r border-zinc-800 hidden sm:inline">
          COMBINE_5
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalRounds }).map((_, index) => {
            const score = history[index];
            const roundNum = index + 1;

            let colorClasses = 'bg-zinc-950/80 border-zinc-800 text-zinc-600';
            if (score !== undefined) {
              if (score < 190) {
                colorClasses =
                  'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]';
              } else if (score < 250) {
                colorClasses =
                  'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
              } else {
                colorClasses = 'bg-zinc-900 border-zinc-700 text-zinc-300';
              }
            }

            return (
              <div
                key={roundNum}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border font-mono text-[11px] sm:text-xs transition-all ${colorClasses}`}
              >
                <span className="text-[10px] text-zinc-500">R{roundNum}</span>
                <span className="font-bold">
                  {score !== undefined ? `${Math.round(score)}ms` : '---'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stream Telemetry & Quick Action Portals */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
        {/* Live Running Average */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs font-mono">
          <span className="text-zinc-500 text-[10px] uppercase">COMBINE_AVG:</span>
          <span className="text-cyan-400 font-bold">
            {averageMs ? `${averageMs} ms` : '---'}
          </span>
        </div>

        {/* Bio-Journal Trigger */}
        <button
          onClick={onOpenJournal}
          title="Open Circadian Fatigue & Bio-Rhythm Journal"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/60 text-zinc-300 hover:text-cyan-300 font-mono text-xs backdrop-blur-md shadow-lg transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">BIO_JOURNAL</span>
        </button>

        {/* Reflex Passport Trigger */}
        <button
          onClick={onOpenPassport}
          title="View & Export Shareable Reflex Passport"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>PASSPORT</span>
        </button>
      </div>
    </footer>
  );
};
