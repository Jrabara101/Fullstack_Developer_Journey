import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DailyStats } from '../../types/game';
import { Trophy, Flame, Target, BarChart2, ShieldCheck } from 'lucide-react';

interface DailyStatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: DailyStats;
}

export function DailyStatsModal({ open, onClose, stats }: DailyStatsModalProps) {
  const winRate =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  // Max count in guess distribution for scaling bars
  const maxFreq = Math.max(1, ...Object.values(stats.guessDistribution));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md p-6 bg-surface-container-lowest border-outline-variant/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <BarChart2 className="w-5 h-5" />
            <span>Vault Diagnostics // Career Records</span>
          </DialogTitle>
        </DialogHeader>

        {/* 4 Key Stat Badges */}
        <div className="grid grid-cols-4 gap-2 mb-6 font-mono text-center">
          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-on-surface">
              {stats.played}
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase mt-1">
              Played
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-tertiary">
              {winRate}%
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase mt-1">
              Win Rate
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-secondary flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {stats.currentStreak}
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase mt-1">
              Streak
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-primary flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              {stats.maxStreak}
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase mt-1">
              Max Stk
            </span>
          </div>
        </div>

        {/* Guess Distribution Graph */}
        <div className="mb-6 font-mono">
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            Guess Distribution (Attempts 1 - 7)
          </h4>

          <div className="flex flex-col gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const count = stats.guessDistribution[num] || 0;
              const pct = (count / maxFreq) * 100;
              const hasCount = count > 0;

              return (
                <div key={num} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-on-surface-variant font-bold">{num}</span>
                  <div className="flex-1 h-5 bg-surface-container-low rounded overflow-hidden flex items-center p-0.5">
                    <div
                      className={`h-full rounded-sm transition-all duration-500 flex items-center justify-end px-2 text-[10px] font-bold ${
                        hasCount
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Game Log */}
        {stats.history.length > 0 && (
          <div className="font-mono text-xs">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              Recent Interceptions
            </h4>
            <div className="max-h-32 overflow-y-auto cyber-scroll flex flex-col gap-1.5 pr-1">
              {stats.history.slice(0, 5).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/30 text-[11px]"
                >
                  <span className="text-on-surface-variant">{h.date}</span>
                  <span className={h.won ? 'text-tertiary font-bold' : 'text-error font-bold'}>
                    {h.won ? `BREACHED (${h.attempts}/7)` : 'LOCKOUT'}
                  </span>
                  <span className="text-secondary">{h.score.toLocaleString()} PTS</span>
                  <span className="text-primary">{h.archetype}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
