import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  index: number;
  isBoardLocked: boolean;
  isFocused: boolean;
  reducedMotion: boolean;
  onCardClick: (index: number) => void;
  onCardFocus: (index: number) => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  index,
  isBoardLocked,
  isFocused,
  reducedMotion,
  onCardClick,
  onCardFocus
}) => {
  const isRevealed = card.isFlipped || card.isMatched;
  const isDimmed = isBoardLocked && !isRevealed;

  return (
    <div
      className={`relative aspect-[3/4] w-full perspective-1000 select-none ${
        card.isShaking ? 'animate-shake' : ''
      } ${card.isHighlighted ? 'ring-4 ring-tertiary rounded-xl shadow-[0_0_24px_rgba(255,185,95,0.8)]' : ''}`}
    >
      <button
        type="button"
        role="button"
        id={`card-${index}`}
        tabIndex={0}
        aria-label={
          isRevealed
            ? `Revealed: ${card.label}, ${card.archetype} archetype`
            : `Hidden card position ${index + 1}`
        }
        aria-pressed={isRevealed}
        disabled={card.isMatched || isBoardLocked}
        onClick={() => onCardClick(index)}
        onFocus={() => onCardFocus(index)}
        className={`w-full h-full rounded-xl p-0.5 card-flipper relative outline-none transition-all duration-300 ${
          isRevealed ? 'card-is-flipped' : ''
        } ${isFocused ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-[1.02]' : ''} ${
          isDimmed ? 'opacity-65 filter brightness-90' : 'opacity-100'
        } ${reducedMotion ? 'reduced-motion' : ''}`}
      >
        {/* ================= CARD FRONT (FACE UP - REVEALED) ================= */}
        <div
          className={`card-face-front absolute inset-0 w-full h-full rounded-xl transition-all ${
            card.isMatched
              ? 'bg-surface-container-high shadow-[0_0_24px_rgba(78,222,163,0.35)] scale-[0.98]'
              : 'bg-surface-container-high shadow-[0_8px_0_#312e81,0_18px_32px_rgba(192,193,255,0.35)] -translate-y-1'
          } p-0.5`}
        >
          {card.isMatched ? (
            /* Matched State: Emerald Bloom */
            <div className="w-full h-full rounded-[10px] bg-secondary-container/20 flex flex-col items-center justify-center relative text-secondary overflow-hidden border border-secondary/30 animate-bloom">
              <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
                <span className="material-symbols-outlined text-xs font-bold">check</span>
              </div>

              {/* Dual-Coding: Shape Badge in top-left */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[10px] font-mono uppercase tracking-wider text-secondary">
                {card.shape}
              </div>

              <span className="material-symbols-outlined text-4xl drop-shadow-[0_0_12px_rgba(78,222,163,0.6)]">
                {card.icon}
              </span>
              <span className="font-headline text-xs tracking-wider mt-1.5 uppercase font-bold text-on-surface">
                {card.label}
              </span>
              <span className="font-mono text-[10px] text-secondary tracking-widest uppercase">
                Synchronized
              </span>
            </div>
          ) : (
            /* Active Flipped State */
            <div
              className="w-full h-full rounded-[10px] bg-surface-container-lowest flex flex-col items-center justify-center relative text-primary border border-primary/30 overflow-hidden"
              style={{ borderColor: `${card.accentColor}55` }}
            >
              <div
                className="absolute inset-0 opacity-10 animate-pulse"
                style={{ backgroundColor: card.accentColor }}
              />

              {/* Dual-Coding: Shape Tag */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-high/80 text-[10px] font-mono uppercase tracking-wider text-primary-fixed-dim">
                {card.shape}
              </div>

              {/* Archetype category tag in top-right */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface-container-high/80 text-[10px] font-mono uppercase tracking-wider text-outline">
                {card.archetype}
              </div>

              <span
                className="material-symbols-outlined text-4xl drop-shadow-[0_0_14px_rgba(192,193,255,0.7)] animate-pulse"
                style={{ color: card.accentColor }}
              >
                {card.icon}
              </span>
              <span className="font-headline text-xs tracking-wider mt-2 uppercase font-bold text-on-surface">
                {card.label}
              </span>
              <span className="font-mono text-[9px] text-outline uppercase tracking-widest mt-0.5">
                Active Node
              </span>
            </div>
          )}
        </div>

        {/* ================= CARD BACK (FACE DOWN - TACTILE) ================= */}
        <div className="card-face-back absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-primary-container via-[#3a39aa] to-surface-container-lowest p-0.5 shadow-[0_6px_0_#28277a,0_12px_24px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:shadow-[0_8px_0_#28277a,0_16px_28px_rgba(128,131,255,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#28277a] transition-all">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-primary-container/40 to-surface-container-lowest flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Subtle cyber background grid / radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,193,255,0.12)_0%,transparent_70%)]" />

            {/* Central tactile emblem */}
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/80 flex items-center justify-center text-primary-fixed-dim shadow-inner group-hover:scale-110 group-hover:text-primary transition-all duration-300 border border-primary/10">
              <span className="material-symbols-outlined text-2xl">memory</span>
            </div>

            {/* Card Index Identifier */}
            <span className="font-mono text-[11px] text-primary-fixed-dim/60 tracking-widest mt-2 uppercase font-semibold">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Cyber scanline indicator on hover */}
            <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
