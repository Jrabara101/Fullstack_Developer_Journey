import React, { useState } from 'react';
import { ScoreRecord, Difficulty } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  records: ScoreRecord[];
  onClose: () => void;
  onClear: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  records,
  onClose,
  onClear
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    rec => filterDifficulty === 'all' || rec.difficulty === filterDifficulty
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh] border border-outline-variant/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">leaderboard</span>
            <div>
              <h2 id="leaderboard-title" className="font-headline text-xl font-bold text-on-surface">
                Neural Telemetry & High Scores
              </h2>
              <span className="font-mono text-[11px] text-outline">
                Historical Memory Synchronization Logs
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-1 bg-surface-container-lowest/60 p-1 rounded-lg border border-outline-variant/20">
            {(['all', 'easy', 'medium', 'hard'] as const).map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setFilterDifficulty(tier)}
                className={`px-3 py-1 rounded text-[11px] font-headline font-semibold uppercase tracking-wider transition-all ${
                  filterDifficulty === tier
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {records.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-mono text-outline hover:text-error transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Table / List */}
        <div className="overflow-y-auto flex-1 my-2 pr-1 space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-outline">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">
                history_toggle_off
              </span>
              <p className="text-sm">No telemetry records found for this filter.</p>
              <p className="text-xs text-outline/70 mt-1">
                Complete a session in Arena mode to record your metrics.
              </p>
            </div>
          ) : (
            filteredRecords.map((rec, index) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      index === 0
                        ? 'bg-tertiary text-on-tertiary-container shadow-[0_0_8px_rgba(255,185,95,0.4)]'
                        : index === 1
                        ? 'bg-primary-container text-on-primary'
                        : index === 2
                        ? 'bg-secondary-container text-on-secondary'
                        : 'bg-surface-container-high text-outline'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-xs font-bold text-on-surface uppercase">
                        {rec.difficulty}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container-high text-outline uppercase">
                        {rec.timerMode}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1 rounded ${
                          rec.won ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {rec.won ? 'CLEARED' : 'TIME OUT'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-outline mt-0.5">{rec.date}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-outline">TIME</span>
                    <span className="font-mono text-xs font-bold text-tertiary">
                      {formatTime(rec.timeSeconds)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-outline">ACC</span>
                    <span className="font-mono text-xs font-bold text-secondary">
                      {rec.accuracy}%
                    </span>
                  </div>
                  <div className="flex flex-col items-end min-w-[60px]">
                    <span className="text-[10px] font-mono text-outline">SCORE</span>
                    <span className="font-mono text-xs font-bold text-primary">
                      {rec.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-headline font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
