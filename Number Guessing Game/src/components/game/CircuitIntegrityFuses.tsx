import { ShieldAlert } from 'lucide-react';

interface CircuitIntegrityFusesProps {
  attemptsUsed: number;
  maxAttempts: number;
  isDefeated?: boolean;
  isVictory?: boolean;
}

export function CircuitIntegrityFuses({
  attemptsUsed,
  maxAttempts = 7,
  isDefeated = false,
  isVictory = false,
}: CircuitIntegrityFusesProps) {
  const remaining = Math.max(0, maxAttempts - attemptsUsed);
  const isEmergency = remaining <= 2 && !isVictory && !isDefeated;

  return (
    <div className="flex flex-col sm:items-end w-full sm:w-auto">
      <div className="flex items-center gap-1.5 mb-1.5">
        {isEmergency && <ShieldAlert className="w-3.5 h-3.5 text-error animate-ping" />}
        <span
          className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${
            isEmergency ? 'text-error' : 'text-on-surface-variant'
          }`}
        >
          {isDefeated
            ? 'CIRCUITS OVERLOADED // LOCKOUT'
            : isVictory
            ? 'CIRCUITS STABILIZED // DECRYPTED'
            : isEmergency
            ? 'CRITICAL CIRCUIT INTEGRITY!'
            : 'CIRCUIT INTEGRITY CAPSULES'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant/40 shadow-inner">
        {Array.from({ length: maxAttempts }).map((_, idx) => {
          const isSpent = idx < attemptsUsed;
          const isActive = idx === attemptsUsed && !isVictory && !isDefeated;
          const isFinal = idx === maxAttempts - 1;

          if (isVictory) {
            return (
              <div
                key={idx}
                className="w-4 h-7 rounded-sm bg-tertiary/20 border border-tertiary/50 shadow-neon-emerald flex flex-col items-center justify-center transition-all"
                title={`Stabilized Capsule ${idx + 1}`}
              >
                <span className="w-1.5 h-3.5 rounded-full bg-tertiary" />
              </div>
            );
          }

          if (isSpent) {
            return (
              <div
                key={idx}
                className="w-4 h-7 rounded-sm bg-surface-container-highest border border-error/30 opacity-40 shadow-inner flex flex-col items-center justify-center transition-all"
                title={`Spent Capsule #${idx + 1}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-error/60" />
              </div>
            );
          }

          if (isActive) {
            return (
              <div
                key={idx}
                className={`w-4 h-7 rounded-sm border flex flex-col items-center justify-center animate-pulse transition-all ${
                  isFinal
                    ? 'bg-error-container/30 border-error shadow-neon-crimson'
                    : 'bg-secondary/20 border-secondary shadow-neon-amber'
                }`}
                title={`Active Primed Attempt #${idx + 1}`}
              >
                <span
                  className={`w-1.5 h-4 rounded-sm ${
                    isFinal ? 'bg-error' : 'bg-secondary'
                  }`}
                />
              </div>
            );
          }

          // Dormant upcoming capsules
          return (
            <div
              key={idx}
              className="w-4 h-7 rounded-sm bg-surface-container-high border border-outline-variant/30 shadow-inner flex flex-col items-center justify-center transition-all"
              title={`Dormant Capsule #${idx + 1}`}
            >
              <span className="w-1 h-3 rounded-full bg-primary/30" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
