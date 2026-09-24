import { isPrime, getFactors, getDigitSumRange, getDigitSum } from '../../engine/math';
import { Cpu, Sparkles } from 'lucide-react';

interface TelemetryHintTerminalProps {
  target: number;
  hints: {
    parityRevealed: boolean;
    primeRevealed: boolean;
    digitSumRevealed: boolean;
  };
  onUnlockHint: (key: 'parityRevealed' | 'primeRevealed' | 'digitSumRevealed') => void;
  disabled?: boolean;
}

export function TelemetryHintTerminal({
  target,
  hints,
  onUnlockHint,
  disabled = false,
}: TelemetryHintTerminalProps) {
  const isEven = target % 2 === 0;
  const targetIsPrime = isPrime(target);
  const factors = getFactors(target);
  const digitSumRange = getDigitSumRange(target);
  const actualDigitSum = getDigitSum(target);

  return (
    <div className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/40 shadow-sm flex flex-col justify-between gap-3">
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
        <span className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-tertiary" />
          Cipher Intelligence // Hint Deck
        </span>
        <span className="font-mono text-[10px] text-tertiary uppercase animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
          ACTIVE PROBES
        </span>
      </div>

      {/* Clues Stack */}
      <div className="flex flex-col gap-2 font-mono text-xs">
        {/* 1. Parity Probe */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Parity Diagnostic
            </span>
            {hints.parityRevealed ? (
              <span className="text-tertiary font-bold mt-0.5">
                {isEven ? 'TRUE // EVEN VALUE (2k)' : 'FALSE // ODD VALUE (2k+1)'}
              </span>
            ) : (
              <span className="text-outline-variant text-[11px] mt-0.5">
                Interrogate binary parity bit
              </span>
            )}
          </div>

          {!hints.parityRevealed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUnlockHint('parityRevealed')}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-colors disabled:opacity-40"
            >
              PROBE [-500]
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold">
              UNLOCKED
            </span>
          )}
        </div>

        {/* 2. Prime / Factors Interrogation */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Primality & Factor Analysis
            </span>
            {hints.primeRevealed ? (
              <span className="text-primary font-bold mt-0.5">
                {targetIsPrime
                  ? 'CANONICAL PRIME // NO FACTORS'
                  : `COMPOSITE // FACTORS: [${factors.slice(0, 3).join(', ')}]`}
              </span>
            ) : (
              <span className="text-outline-variant text-[11px] mt-0.5">
                Decompose target prime factors
              </span>
            )}
          </div>

          {!hints.primeRevealed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUnlockHint('primeRevealed')}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-colors disabled:opacity-40"
            >
              PROBE [-800]
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
              UNLOCKED
            </span>
          )}
        </div>

        {/* 3. Digital Sum Matrix */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Digital Sum Matrix
            </span>
            {hints.digitSumRevealed ? (
              <span className="text-secondary font-bold mt-0.5">
                {digitSumRange} (Σ = {actualDigitSum})
              </span>
            ) : (
              <span className="text-outline-variant text-[11px] mt-0.5">
                Bracket base-10 digit sum Σ(d)
              </span>
            )}
          </div>

          {!hints.digitSumRevealed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUnlockHint('digitSumRevealed')}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-colors disabled:opacity-40"
            >
              PROBE [-600]
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold">
              UNLOCKED
            </span>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between text-on-surface-variant font-mono text-[11px] pt-1 border-t border-outline-variant/30">
        <span className="flex items-center gap-1 text-tertiary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROBE PROTOCOL READY</span>
        </span>
        <span className="text-outline-variant">ENC_HASH: 0x9AF4</span>
      </div>
    </div>
  );
}
