import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * MutualBadge: Lightweight, animated chip rendered next to usernames.
 * Features subtle ambient glow and shimmer micro-interaction.
 */
export function MutualBadge({ size = 'md', showLabel = true, className = '' }) {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border transition-all duration-300 select-none
        bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/20 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]
        ${isSm ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'}
        ${className}
      `}
      title="Mutual Friends: Verified Bidirectional Connection"
    >
      <Sparkles className={`${isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-amber-400 fill-amber-400/30 animate-pulse`} />
      {showLabel && (
        <span className="tracking-wide font-semibold text-amber-300 drop-shadow-sm">
          Mutual
        </span>
      )}
    </span>
  );
}
