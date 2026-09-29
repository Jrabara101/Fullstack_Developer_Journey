import React from 'react';
import { ENGLISH_LETTER_FREQUENCY } from '../../../../shared/types';
import { audioEngine } from '../../lib/audio';

interface TactileKeyboardProps {
  guessedLetters: string[];
  correctLetters: string[];
  incorrectLetters: string[];
  onGuess: (letter: string) => void;
  disabled?: boolean;
  showFrequencyHeatmap?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const TactileKeyboard: React.FC<TactileKeyboardProps> = ({
  guessedLetters,
  correctLetters,
  incorrectLetters,
  onGuess,
  disabled = false,
  showFrequencyHeatmap = false,
}) => {
  const handleKeyClick = (letter: string) => {
    if (disabled || guessedLetters.includes(letter)) return;
    audioEngine.playKeyClick();
    onGuess(letter);
  };

  // Helper to determine frequency intensity for telemetry heatmap
  const getFrequencyBadge = (letter: string) => {
    const freq = ENGLISH_LETTER_FREQUENCY[letter] || 0;
    if (freq >= 7.0) return { bg: 'bg-primary/20 text-primary border-primary/40', label: 'HIGH' };
    if (freq >= 3.0) return { bg: 'bg-tertiary/20 text-tertiary border-tertiary/40', label: 'MID' };
    return { bg: 'bg-surface-highest/40 text-muted-foreground border-surface-highest', label: 'LOW' };
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-xl mx-auto items-center py-2 select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center w-full">
          {row.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = correctLetters.includes(letter);
            const isIncorrect = incorrectLetters.includes(letter);
            const freqInfo = getFrequencyBadge(letter);
            const freqPercent = (ENGLISH_LETTER_FREQUENCY[letter] || 0).toFixed(1);

            let keyStyle = 'bg-surface-high text-[#eae1da] hover:bg-surface-bright tactile-keycap border-t border-surface-highest/60';

            if (isCorrect) {
              keyStyle =
                'bg-primary-container/20 border border-primary/60 text-primary shadow-[0_0_12px_rgba(78,222,163,0.35)] cursor-default';
            } else if (isIncorrect) {
              keyStyle =
                'bg-surface-low/80 text-muted-foreground/40 line-through border border-surface-high/30 cursor-not-allowed';
            }

            return (
              <button
                key={letter}
                type="button"
                onClick={() => handleKeyClick(letter)}
                disabled={disabled || isGuessed}
                aria-label={`Letter ${letter}${isCorrect ? ' (Correct)' : isIncorrect ? ' (Incorrect)' : ''}`}
                className={`relative flex flex-col items-center justify-center rounded-lg font-mono text-sm sm:text-base font-bold transition-all ${
                  row.length === 10
                    ? 'w-8 h-12 sm:w-11 sm:h-14'
                    : row.length === 9
                    ? 'w-8.5 h-12 sm:w-12 sm:h-14'
                    : 'w-9 h-12 sm:w-13 sm:h-14'
                } ${keyStyle}`}
              >
                <span>{letter}</span>

                {/* Tactical Letter Frequency Heatmap Pips */}
                {showFrequencyHeatmap && !isGuessed && (
                  <span
                    className={`absolute -top-1 right-0 text-[8px] px-1 rounded-sm border font-mono ${freqInfo.bg}`}
                    title={`Frequency: ${freqPercent}%`}
                  >
                    {freqPercent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
