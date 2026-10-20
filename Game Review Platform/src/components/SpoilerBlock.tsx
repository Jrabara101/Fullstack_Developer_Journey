import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useAppStore } from '../store';
import { db } from '../../server/db/database'; // Or check active user's shelves via store or API
import { ShelfStatus } from '../types';

interface SpoilerBlockProps {
  content: string;
  gameId: string;
  userShelfStatus?: ShelfStatus;
}

export const SpoilerBlock: React.FC<SpoilerBlockProps> = ({
  content,
  gameId,
  userShelfStatus,
}) => {
  const { autoRevealSpoilersForCompleted } = useAppStore();

  // If user has beaten or mastered the game, and auto-reveal is enabled, auto unmask
  const isEligibleForAutoReveal =
    autoRevealSpoilersForCompleted &&
    (userShelfStatus === 'BEATEN' || userShelfStatus === 'MASTERED_100');

  const [isRevealed, setIsRevealed] = useState<boolean>(isEligibleForAutoReveal);

  // Sync state if user's shelf status changes
  useEffect(() => {
    if (isEligibleForAutoReveal) {
      setIsRevealed(true);
    }
  }, [isEligibleForAutoReveal]);

  return (
    <span
      onClick={() => setIsRevealed(!isRevealed)}
      className={`group relative inline-block transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 my-0.5 align-baseline ${
        isRevealed
          ? 'bg-rose-950/20 border border-rose-500/30 text-rose-200 shadow-sm'
          : 'bg-[#151B2B]/90 border border-slate-700/50 hover:border-slate-500 select-none'
      }`}
      title={
        isRevealed
          ? 'Spoiler revealed. Click to re-mask.'
          : isEligibleForAutoReveal
          ? 'Auto-unmasked because you beat this game.'
          : 'Spoiler Shield: Click to dissolve frost'
      }
    >
      {/* Blurred text */}
      <span
        className={`transition-all duration-200 ${
          isRevealed
            ? 'filter-none opacity-100'
            : 'filter blur-[7px] opacity-40 select-none pointer-events-none'
        }`}
      >
        {content}
      </span>

      {/* Lock overlay when shrouded */}
      {!isRevealed && (
        <span className="absolute inset-0 flex items-center justify-center gap-1.5 px-2 bg-slate-900/60 backdrop-blur-[2px] rounded text-slate-400 group-hover:text-rose-300 font-mono text-xs transition-colors">
          <Lock className="w-3.5 h-3.5 text-rose-400/80 group-hover:scale-110 transition-transform" />
          <span className="font-semibold tracking-wider text-[11px] uppercase">
            Spoiler Shield • Click to Reveal
          </span>
        </span>
      )}

      {/* Small badge when unmasked */}
      {isRevealed && (
        <span className="inline-flex items-center ml-1.5 text-[9px] font-mono text-rose-400/80 uppercase tracking-widest align-middle">
          <Unlock className="w-2.5 h-2.5 mr-0.5" />
          {isEligibleForAutoReveal ? 'Verified' : 'Revealed'}
        </span>
      )}
    </span>
  );
};

// Helper parser to convert markdown text with `>!spoiler!<` into React elements
export function renderMarkdownWithSpoilers(
  text: string,
  gameId: string,
  userShelfStatus?: ShelfStatus
): React.ReactNode {
  if (!text) return null;

  // Split by `>! ... !<`
  const regex = />!(.*?)!</gs;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before spoiler
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Add SpoilerBlock
    const spoilerContent = match[1];
    parts.push(
      <SpoilerBlock
        key={`spoiler-${match.index}`}
        content={spoilerContent}
        gameId={gameId}
        userShelfStatus={userShelfStatus}
      />
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
    );
  }

  return <>{parts}</>;
}
