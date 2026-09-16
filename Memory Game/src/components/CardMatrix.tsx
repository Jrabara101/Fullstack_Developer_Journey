import React, { useEffect } from 'react';
import { CardData, DifficultyConfig, GameStatus } from '../types';
import { Card } from './Card';

interface CardMatrixProps {
  cards: CardData[];
  config: DifficultyConfig;
  status: GameStatus;
  isBoardLocked: boolean;
  glimpseCountdown: number;
  focusedIndex: number;
  reducedMotion: boolean;
  onCardClick: (index: number) => void;
  setFocusedIndex: (index: number) => void;
  onResume: () => void;
}

export const CardMatrix: React.FC<CardMatrixProps> = ({
  cards,
  config,
  status,
  isBoardLocked,
  glimpseCountdown,
  focusedIndex,
  reducedMotion,
  onCardClick,
  setFocusedIndex,
  onResume
}) => {
  // Keyboard navigation across the grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or modal is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const total = cards.length;
      if (total === 0) return;

      const cols = config.gridCols;

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setFocusedIndex((focusedIndex + 1) % total);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setFocusedIndex((focusedIndex - 1 + total) % total);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setFocusedIndex((focusedIndex + cols) % total);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setFocusedIndex((focusedIndex - cols + total) % total);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          onCardClick(focusedIndex);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, config.gridCols, focusedIndex, onCardClick, setFocusedIndex]);

  // Determine grid column styling
  const getGridColsClass = () => {
    if (config.gridCols === 4) return 'grid-cols-4 max-w-[680px]';
    if (config.gridCols === 6) return 'grid-cols-3 sm:grid-cols-6 max-w-[880px]';
    return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 max-w-[1080px]';
  };

  return (
    <main
      className="relative z-10 flex-1 flex flex-col items-center justify-center my-3 max-w-6xl mx-auto w-full px-3"
      aria-label="Memory Card Matrix"
    >
      {/* GLIMPSE PRIMING PHASE BANNER */}
      {status === 'glimpse' && (
        <div className="absolute top-2 z-30 flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-container/90 text-on-primary-container backdrop-blur-md shadow-[0_0_30px_rgba(128,131,255,0.7)] border border-primary animate-pulse">
          <span className="material-symbols-outlined text-2xl animate-spin" style={{ animationDuration: '4s' }}>
            neurology
          </span>
          <div className="flex flex-col">
            <span className="font-headline text-xs uppercase tracking-widest font-bold">
              Neural Anchoring Active • Glimpse Priming
            </span>
            <span className="text-[11px] font-mono opacity-90">
              Memorize initial node positions ({glimpseCountdown}s remaining)
            </span>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl p-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary mb-4 shadow-[0_0_24px_rgba(192,193,255,0.3)]">
            <span className="material-symbols-outlined text-4xl">pause_circle</span>
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface">Protocol Suspended</h3>
          <p className="text-sm text-outline mt-1 mb-6">Timer frozen. Matrix state preserved.</p>
          <button
            type="button"
            onClick={onResume}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-sm font-bold shadow-[0_4px_0_#494bd6] hover:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Resume Protocol</span>
          </button>
        </div>
      )}

      {/* CARD GRID MATRIX */}
      <div
        className={`grid gap-3 md:gap-3.5 w-full transition-all duration-300 ${getGridColsClass()}`}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            isBoardLocked={isBoardLocked}
            isFocused={focusedIndex === index}
            reducedMotion={reducedMotion}
            onCardClick={onCardClick}
            onCardFocus={setFocusedIndex}
          />
        ))}
      </div>
    </main>
  );
};
