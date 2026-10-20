import React from 'react';

/**
 * MutualBadge: Lightweight, animated chip rendered next to usernames in comments,
 * headers, hovercards, and search lists.
 */
export function MutualBadge({ size = 'md', className = '' }) {
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${
        isSmall
          ? 'px-2 py-0.5 text-[11px]'
          : 'px-2.5 py-1 text-xs'
      } bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/30 text-violet-700 dark:text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.15)] ${className}`}
      title="Mutual Friendship: You both follow each other"
    >
      {/* Linked two-rings glyph */}
      <svg
        className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8.5" cy="12" r="5" className="stroke-violet-500 dark:stroke-violet-400" />
        <circle cx="15.5" cy="12" r="5" className="stroke-pink-500 dark:stroke-pink-400" />
      </svg>
      <span>Mutual Friend</span>
    </span>
  );
}
