import React, { useState } from 'react';
import { PlaytimeSentimentBracket } from '../types';
import { Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PlaytimeSentimentHorizonProps {
  brackets: PlaytimeSentimentBracket[];
  gameTitle: string;
}

export const PlaytimeSentimentHorizon: React.FC<PlaytimeSentimentHorizonProps> = ({
  brackets,
  gameTitle,
}) => {
  const [activeBracket, setActiveBracket] = useState<PlaytimeSentimentBracket | null>(
    brackets[0] || null
  );

  if (!brackets || brackets.length === 0) return null;

  const maxSamples = Math.max(...brackets.map((b) => b.sampleCount));

  return (
    <div className="bg-[#10141F] border border-[#1E293B] rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-base tracking-wide">
              "Dropped vs. Devoured" Playtime Sentiment Horizon
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rating evolution & drop-off velocity mapped across hours invested in {gameTitle}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Mean Rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-400">Drop-off Rate</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizon Bars Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {brackets.map((b, idx) => {
          const isSelected = activeBracket?.bracket === b.bracket;
          const isHighDrop = b.dropRatePercent >= 18;
          const isDevoured = b.ratingAvg >= 4.8 && b.dropRatePercent <= 5;

          return (
            <div
              key={b.bracket}
              onClick={() => setActiveBracket(b)}
              className={`group cursor-pointer rounded-lg p-3.5 border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-[#181F30] border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                  : 'bg-[#151B2B]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#151B2B]'
              }`}
            >
              {/* Top Accent line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
                  isHighDrop
                    ? 'bg-rose-500'
                    : isDevoured
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                    : 'bg-cyan-500/50'
                }`}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {b.bracket}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {b.sampleCount} reviews
                </span>
              </div>

              {/* Score Display */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-extrabold text-amber-400">
                    {b.ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-xs text-amber-500">★</span>
                </div>

                {/* Drop rate pill */}
                <div
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isHighDrop
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse-subtle'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                  title={`${b.dropRatePercent}% of reviewers stopped playing in this window`}
                >
                  {b.dropRatePercent}% Drop
                </div>
              </div>

              {/* Relative sample bar */}
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(b.sampleCount / maxSamples) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Bracket Deep Dive Callout */}
      {activeBracket && (
        <div className="mt-4 p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-start gap-3">
          {activeBracket.dropRatePercent >= 18 ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          ) : activeBracket.ratingAvg >= 4.8 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <span>Cohort Window: {activeBracket.bracket}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-mono">
                {activeBracket.sampleCount} logged critics
              </span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              {activeBracket.sentimentSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
