import React, { useState } from 'react';
import { Dialog, DialogClose } from './ui/dialog';
import { ReactionRecord } from '../types/reaction';
import { clearSavedSessions } from '../utils/analytics';
import {
  Calendar,
  Sun,
  Sunset,
  Moon,
  TrendingDown,
  Trash2,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

interface BioRhythmJournalProps {
  open: boolean;
  sessions: ReactionRecord[];
  onSessionsUpdated: (sessions: ReactionRecord[]) => void;
  onClose: () => void;
}

export const BioRhythmJournal: React.FC<BioRhythmJournalProps> = ({
  open,
  sessions,
  onSessionsUpdated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'history'>('trends');

  // Circadian Aggregations
  const morningSessions = sessions.filter((s) => s.timeBlock === 'morning');
  const afternoonSessions = sessions.filter((s) => s.timeBlock === 'afternoon');
  const nightSessions = sessions.filter((s) => s.timeBlock === 'late-night');

  const getBlockAvg = (list: ReactionRecord[]) => {
    if (list.length === 0) return '---';
    const sum = list.reduce((acc, curr) => acc + curr.averageMs, 0);
    return (sum / list.length).toFixed(1);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored reflex telemetry sessions?')) {
      clearSavedSessions();
      onSessionsUpdated([]);
    }
  };

  // Sparkline data calculation
  const trendPoints = sessions
    .slice(0, 15)
    .reverse()
    .map((s) => s.averageMs);

  const minMs = trendPoints.length > 0 ? Math.min(...trendPoints) * 0.9 : 140;
  const maxMs = trendPoints.length > 0 ? Math.max(...trendPoints) * 1.1 : 320;
  const range = maxMs - minMs || 1;

  const svgWidth = 500;
  const svgHeight = 120;

  const pointsString = trendPoints
    .map((val, idx) => {
      const x = (idx / (trendPoints.length - 1 || 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - 20 - ((val - minMs) / range) * (svgHeight - 40);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogClose onClose={onClose} />
      <div className="flex flex-col p-2 sm:p-4 text-left">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            BIO-RHYTHM & FATIGUE JOURNAL
          </h2>
        </div>
        <p className="font-mono text-xs text-zinc-400 mb-6">
          CIRCADIAN LATENCY TELEMETRY • LONGITUDINAL NEUROMUSCULAR TRACKING
        </p>

        {/* Circadian Breakdown Triad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase font-bold mb-1">
              <Sun className="w-3.5 h-3.5" />
              <span>MORNING</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-white">
              {getBlockAvg(morningSessions)}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {morningSessions.length} sessions
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase font-bold mb-1">
              <Sunset className="w-3.5 h-3.5" />
              <span>AFTERNOON</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-white">
              {getBlockAvg(afternoonSessions)}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {afternoonSessions.length} sessions
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[10px] uppercase font-bold mb-1">
              <Moon className="w-3.5 h-3.5" />
              <span>LATE NIGHT</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-white">
              {getBlockAvg(nightSessions)}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">ms</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {nightSessions.length} sessions
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('trends')}
            className={`font-mono text-xs px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            TREND GRAPH
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`font-mono text-xs px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            HISTORY LOG ({sessions.length})
          </button>
        </div>

        {/* TAB 1: Trend Sparkline */}
        {activeTab === 'trends' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  RECENT SESSIONS LATENCY SPARKLINE
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  LOWER = FASTER REFLEX
                </span>
              </div>

              {trendPoints.length > 1 ? (
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-32 stroke-current text-cyan-400"
                  >
                    {/* Grid lines */}
                    <line
                      x1="20"
                      y1={svgHeight - 20}
                      x2={svgWidth - 20}
                      y2={svgHeight - 20}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                    <line
                      x1="20"
                      y1="20"
                      x2={svgWidth - 20}
                      y2="20"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />

                    {/* Polyline */}
                    <polyline
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="2.5"
                      points={pointsString}
                    />

                    {/* Data Points */}
                    {trendPoints.map((val, idx) => {
                      const x =
                        (idx / (trendPoints.length - 1 || 1)) * (svgWidth - 40) + 20;
                      const y =
                        svgHeight - 20 - ((val - minMs) / range) * (svgHeight - 40);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#22D3EE"
                          stroke="#090A0F"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="py-8 text-center font-mono text-xs text-zinc-500">
                  Complete at least 2 Combine sessions to render latency trends.
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 font-mono leading-relaxed">
              💡 <strong>Fatigue Telemetry Tip</strong>: Late-night motor responses typically
              slow by 20–40ms due to prefrontal synaptic fatigue. Compare your Morning vs.
              Late Night delta to calibrate sleep needs.
            </div>
          </div>
        )}

        {/* TAB 2: History Log */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-zinc-500">
                No past sessions recorded yet. Complete a 5-round combine!
              </div>
            ) : (
              sessions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 font-mono text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.averageMs} ms</span>
                      <span className="text-[10px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded bg-cyan-950/40">
                        {item.archetype}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{item.timeBlock}</span>
                      <span>•</span>
                      <span>Best: {item.bestMs}ms</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-400 font-medium">±{item.stdDevMs}ms</span>
                    <div className="text-[10px] text-zinc-600 uppercase mt-1">
                      {item.mode}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom Actions */}
        {sessions.length > 0 && (
          <div className="flex justify-end pt-4 mt-2 border-t border-zinc-800">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR BIO-TELEMETRY LOGS</span>
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
