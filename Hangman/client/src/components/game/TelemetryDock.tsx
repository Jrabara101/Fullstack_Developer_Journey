import React from 'react';
import { Radar, Zap, BarChart2, Lightbulb, Compass } from 'lucide-react';
import { ENGLISH_LETTER_FREQUENCY } from '../../../../shared/types';
import { audioEngine } from '../../lib/audio';

interface TelemetryDockProps {
  hintsAvailable: number;
  unlockedHints: string[];
  category: string;
  difficulty: string;
  guessedLetters: string[];
  onUseHint: () => void;
  showFrequencyHeatmap: boolean;
  onToggleHeatmap: () => void;
  disabled?: boolean;
}

export const TelemetryDock: React.FC<TelemetryDockProps> = ({
  hintsAvailable,
  unlockedHints,
  category,
  difficulty,
  guessedLetters,
  onUseHint,
  showFrequencyHeatmap,
  onToggleHeatmap,
  disabled = false,
}) => {
  // Compute top remaining high-probability letters
  const unguessedLetterFreqs = Object.entries(ENGLISH_LETTER_FREQUENCY)
    .filter(([letter]) => !guessedLetters.includes(letter))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const optimalLetter = unguessedLetterFreqs[0]?.[0] || 'NONE';

  const handleSpendHint = () => {
    audioEngine.playRadarPing();
    onUseHint();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* TOOL 1: CONTEXTUAL RADAR HINT ENGINE */}
      <div className="bg-surface-low border border-surface-high/60 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-tertiary">
            <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">
              HINT RADAR // CONSOLE
            </span>
          </div>
          <span className="font-mono text-[11px] text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full">
            {hintsAvailable} TOKENS LEFT
          </span>
        </div>

        {/* Dynamic intel box */}
        <div className="bg-surface-container/70 border border-surface-high/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              DOMAIN: <strong className="text-[#eae1da]">{category}</strong> ({difficulty})
            </span>
          </div>

          {unlockedHints.length > 0 ? (
            <div className="space-y-1.5 pt-1 border-t border-surface-high/40">
              <span className="font-mono text-[10px] text-tertiary uppercase flex items-center gap-1 font-bold">
                <Lightbulb className="w-3 h-3" /> INTEL DECRYPTED:
              </span>
              {unlockedHints.map((hint, idx) => (
                <div
                  key={idx}
                  className="font-mono text-xs text-[#eae1da] bg-surface-low/80 p-1.5 rounded border border-surface-high/40 flex items-center gap-1.5"
                >
                  <span className="text-tertiary font-bold">›</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground italic leading-relaxed">
              Progressive intel unlocks automatically after 3 mistakes. Or expend a token to force-reveal a letter.
            </p>
          )}
        </div>

        {/* Hint button */}
        <button
          type="button"
          onClick={handleSpendHint}
          disabled={disabled || hintsAvailable <= 0}
          className="w-full py-2 px-3 bg-surface-high hover:bg-surface-bright text-tertiary border border-tertiary/30 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:border-tertiary/60"
        >
          <Zap className="w-4 h-4 text-tertiary" />
          <span>EXPEND RADAR TOKEN [REVEAL GLYPH]</span>
        </button>
      </div>

      {/* TOOL 2: LETTER FREQUENCY TELEMETRY */}
      <div className="bg-surface-low border border-surface-high/60 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">
              CORPUS TELEMETRY
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleHeatmap}
            className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
              showFrequencyHeatmap
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-surface-high text-muted-foreground border-surface-high'
            }`}
          >
            HEATMAP: {showFrequencyHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Sparkline frequency distribution bars */}
        <div className="space-y-1.5 py-1">
          {unguessedLetterFreqs.map(([char, freq]) => (
            <div key={char} className="flex items-center gap-2">
              <span className="w-4 font-mono text-xs font-bold text-center text-[#eae1da]">
                {char}
              </span>
              <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden border border-surface-high/40">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, freq * 7.5)}%` }}
                />
              </div>
              <span className="w-9 font-mono text-[10px] text-muted-foreground text-right">
                {freq.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-surface-high/40 font-mono text-[10px] text-muted-foreground">
          <span>OPTIMAL STRIKE:</span>
          <span className="text-primary font-bold bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
            GLYPH '{optimalLetter}'
          </span>
        </div>
      </div>
    </div>
  );
};
