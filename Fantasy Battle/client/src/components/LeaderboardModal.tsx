import React, { useState, useEffect } from 'react';
import { Trophy, X, ShieldCheck, Flame, Medal } from 'lucide-react';

interface LeaderboardRecord {
  id: string;
  callsign: string;
  seed: string;
  fighter_class: string;
  waves_cleared: number;
  wave_reached: number;
  clear_time_ms: number;
  total_parries: number;
  posture_breaks: number;
  score: number;
  verified: number;
  scorecard_emoji: string;
  created_at: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentSeed,
}) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [filterSeed, setFilterSeed] = useState<string>('CURRENT');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const query = filterSeed === 'CURRENT' ? `?seed=${currentSeed}` : '';
    fetch(`/api/arena/leaderboard${query}`)
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard) {
          setRecords(data.leaderboard);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [isOpen, filterSeed, currentSeed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl glass-panel p-6 rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-cinzel text-xl font-bold text-white tracking-wider">
                Colosseum High Ledger
              </h2>
              <div className="text-xs font-mono text-slate-400">
                Deterministic Server-Authoritative High Scores
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={() => setFilterSeed('CURRENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterSeed === 'CURRENT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Today's Seed ({currentSeed})
          </button>
          <button
            onClick={() => setFilterSeed('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterSeed === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All-Time Champions
          </button>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
              Querying SQLite Runic Ledger...
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              No runs recorded for this seed yet. Be the first to claim glory!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((rec, index) => {
                const totalSeconds = Math.floor(rec.clear_time_ms / 1000);
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                const timeStr = `${mins}m ${secs.toString().padStart(2, '0')}s`;

                const isTop3 = index < 3;

                return (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      index === 0
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                        : isTop3
                        ? 'bg-slate-900/80 border-slate-700/60'
                        : 'bg-slate-950/60 border-slate-800/60'
                    }`}
                  >
                    {/* Rank & Callsign */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="w-7 font-mono font-bold text-center">
                        {index === 0 ? (
                          <Medal className="w-5 h-5 text-amber-400 inline" />
                        ) : index === 1 ? (
                          <Medal className="w-5 h-5 text-slate-300 inline" />
                        ) : index === 2 ? (
                          <Medal className="w-5 h-5 text-amber-700 inline" />
                        ) : (
                          <span className="text-slate-500 text-sm">#{index + 1}</span>
                        )}
                      </div>

                      <div className="text-left">
                        <div className="font-outfit font-bold text-sm text-white flex items-center gap-1.5">
                          {rec.callsign}
                          {rec.verified === 1 && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Deterministic Run" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {rec.fighter_class} &bull; Wave {rec.waves_cleared}/5
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">TIME</div>
                        <div className="text-slate-300 font-semibold">{timeStr}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">PARRIES</div>
                        <div className="text-amber-300 font-semibold">{rec.total_parries}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">POSTURE</div>
                        <div className="text-amber-400 font-semibold">{rec.posture_breaks}</div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-amber-400/80 uppercase">Score</div>
                      <div className="font-mono text-base font-black text-amber-400">
                        {rec.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
