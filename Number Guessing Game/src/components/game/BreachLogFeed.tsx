import { GuessRecord } from '../../types/game';
import { ScrollArea } from '../ui/scroll-area';
import { History, ArrowUp, ArrowDown, CheckCircle2, Binary } from 'lucide-react';

interface BreachLogFeedProps {
  history: GuessRecord[];
}

export function BreachLogFeed({ history }: BreachLogFeedProps) {
  return (
    <div className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/40 shadow-sm flex flex-col gap-3">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
        <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-primary" />
          Breach Log // Telemetry
        </span>
        <span className="font-mono text-[11px] text-on-surface-variant">
          {history.length} {history.length === 1 ? 'ENTRY' : 'ENTRIES'}
        </span>
      </div>

      {/* History Items or Empty Prompt */}
      {history.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-outline-variant font-mono text-xs">
          <Binary className="w-8 h-8 mb-2 opacity-30 text-primary" />
          <span>NO TELEMETRY LOGGED</span>
          <span className="text-[11px] opacity-70 mt-0.5">
            Calibrate tumbler and commit initial probe code
          </span>
        </div>
      ) : (
        <ScrollArea maxHeight="220px">
          <div className="flex flex-col gap-2">
            {history.map((record, index) => {
              const attemptNum = history.length - index;
              const isCorrect = record.direction === 'CORRECT';
              const isHigh = record.direction === 'TOO_HIGH';

              return (
                <div
                  key={record.timestamp}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 transition-all hover:border-outline-variant"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-on-surface-variant font-semibold">
                      #{String(attemptNum).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-base font-bold text-on-surface">
                      {String(record.value).padStart(2, '0')}
                    </span>
                    {record.eliminatedPossibilities > 0 && (
                      <span className="hidden sm:inline font-mono text-[10px] text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">
                        -{record.eliminatedPossibilities} Eliminated
                      </span>
                    )}
                  </div>

                  {/* Feedback Badge */}
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary/15 text-tertiary border border-tertiary/30 font-mono text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>UNLOCKED // SYSTEM DECRYPTED</span>
                    </div>
                  ) : isHigh ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[11px] font-bold">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>TOO HIGH // CEILING SET</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/30 font-mono text-[11px] font-bold">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>TOO LOW // BASELINE SET</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
