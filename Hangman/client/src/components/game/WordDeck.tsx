import React from 'react';

interface WordDeckProps {
  maskedWord: (string | null)[];
  status: 'IDLE' | 'PLAYING' | 'WON' | 'LOST';
  secretWord?: string; // used when game over to show missed letters in red
}

export const WordDeck: React.FC<WordDeckProps> = ({
  maskedWord,
  status,
  secretWord,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
      {maskedWord.map((char, index) => {
        const isRevealed = char !== null;
        const missedChar = !isRevealed && status === 'LOST' && secretWord ? secretWord[index] : null;

        return (
          <div
            key={index}
            className={`relative w-10 h-14 sm:w-14 sm:h-18 md:w-16 md:h-20 rounded-lg flex flex-col items-center justify-center transition-all duration-300 select-none ${
              isRevealed
                ? 'bg-surface-container border border-primary/40 shadow-[0_0_15px_rgba(78,222,163,0.15)] animate-card-flip'
                : missedChar
                ? 'bg-secondary-container/20 border border-secondary/40'
                : 'bg-surface-container-low border border-surface-high/60 shadow-md'
            }`}
          >
            {/* Glyph position index */}
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Letter Value */}
            <span
              className={`font-mono text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider ${
                isRevealed
                  ? 'text-primary scale-100 transition-transform'
                  : missedChar
                  ? 'text-secondary animate-pulse'
                  : 'text-transparent'
              }`}
            >
              {isRevealed ? char : missedChar || '·'}
            </span>

            {/* Tactical baseline bar */}
            <span
              className={`absolute bottom-1.5 w-6 sm:w-8 h-0.5 rounded-full transition-all duration-300 ${
                isRevealed
                  ? 'bg-primary shadow-[0_0_8px_#4edea3]'
                  : missedChar
                  ? 'bg-secondary shadow-[0_0_8px_#ffb4ab]'
                  : 'bg-surface-highest'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
