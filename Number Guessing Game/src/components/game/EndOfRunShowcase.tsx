import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent } from '../ui/dialog';
import { ArchetypeResult } from '../../types/game';
import {
  LockOpen,
  Lock,
  Share2,
  Check,
  RotateCcw,
  Zap,
  Clock,
  Award,
} from 'lucide-react';

interface EndOfRunShowcaseProps {
  open: boolean;
  onClose: () => void;
  won: boolean;
  target: number;
  attemptsUsed: number;
  maxAttempts: number;
  timeElapsed: number;
  score: number;
  archetypeResult: ArchetypeResult | null;
  shareString: string;
  onPlayAgain: () => void;
}

export function EndOfRunShowcase({
  open,
  onClose,
  won,
  target,
  attemptsUsed,
  maxAttempts,
  timeElapsed,
  score,
  archetypeResult,
  shareString,
  onPlayAgain,
}: EndOfRunShowcaseProps) {
  const [copied, setCopied] = useState(false);

  // Trigger celebration on victory
  useEffect(() => {
    if (open && won) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [open, won]);

  const handleCopyShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const tierColors = {
    S: 'bg-primary/20 text-primary border-primary shadow-neon-cyan',
    A: 'bg-tertiary/20 text-tertiary border-tertiary shadow-neon-emerald',
    B: 'bg-secondary/20 text-secondary border-secondary shadow-neon-amber',
    C: 'bg-surface-container-high text-on-surface border-outline-variant',
    D: 'bg-error/20 text-error border-error shadow-neon-crimson',
  };

  const currentTier = archetypeResult?.ratingTier || 'C';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md p-6 bg-surface-container-lowest border-outline-variant/60">
        <div className="flex flex-col items-center text-center">
          {/* Header Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-2xl ${
              won
                ? 'bg-tertiary/20 text-tertiary shadow-neon-emerald'
                : 'bg-error/20 text-error shadow-neon-crimson'
            }`}
          >
            {won ? <LockOpen className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>

          <span
            className={`font-mono text-xs tracking-widest uppercase mb-1 font-bold ${
              won ? 'text-tertiary' : 'text-error'
            }`}
          >
            {won ? 'CIPHER OVERRIDDEN // VAULT BREACHED' : 'CIRCUIT OVERLOAD // SECURITY LOCKOUT'}
          </span>

          <h2 className="font-mono text-3xl font-extrabold text-on-surface tracking-tight mb-2 uppercase">
            {won ? 'VAULT BREACHED' : 'SECTOR LOCKOUT'}
          </h2>

          <p className="font-sans text-sm text-on-surface-variant max-w-sm mb-4">
            {won ? (
              <>
                Target vector was{' '}
                <span className="font-mono text-primary font-bold text-base px-1.5 py-0.5 rounded bg-primary/10">
                  {String(target).padStart(2, '0')}
                </span>
                . Cracked in {attemptsUsed} of {maxAttempts} attempts.
              </>
            ) : (
              <>
                Failed to decrypt core cipher. The target vector was locked at{' '}
                <span className="font-mono text-error font-bold text-base px-1.5 py-0.5 rounded bg-error/10">
                  {String(target).padStart(2, '0')}
                </span>
                .
              </>
            )}
          </p>

          {/* Archetype & Logarithmic Deduction Analysis Card */}
          {archetypeResult && (
            <div className="w-full bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 mb-4 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  Deduction Archetype
                </span>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded font-black border ${tierColors[currentTier]}`}
                >
                  TIER {currentTier}
                </span>
              </div>

              <div className="font-mono text-base font-bold text-primary mb-1">
                {archetypeResult.title}
              </div>

              <p className="font-sans text-xs text-on-surface-variant mb-3 leading-relaxed">
                {archetypeResult.description}
              </p>

              {/* Benchmarking Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/30 text-center font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant">Efficiency</span>
                  <span className="font-bold text-tertiary">
                    {archetypeResult.efficiencyRating}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant">Optimal O(log₂N)</span>
                  <span className="font-bold text-on-surface">
                    {archetypeResult.optimalSteps} Steps
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant">Actual Probes</span>
                  <span className="font-bold text-secondary">{attemptsUsed} Steps</span>
                </div>
              </div>
            </div>
          )}

          {/* High-Level Score Card */}
          <div className="w-full grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-on-surface-variant">Time Elapsed</span>
                <span className="font-bold text-on-surface">{timeElapsed}s</span>
              </div>
            </div>

            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-on-surface-variant">Net Score</span>
                <span className="font-bold text-secondary">{score.toLocaleString()} PTS</span>
              </div>
            </div>
          </div>

          {/* Action Rails */}
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleCopyShare}
              className="flex-1 py-3 px-4 bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-tertiary" />
                  <span className="text-tertiary">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Result Grid</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayAgain();
              }}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary-light text-on-primary font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-neon-cyan active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Sector</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
