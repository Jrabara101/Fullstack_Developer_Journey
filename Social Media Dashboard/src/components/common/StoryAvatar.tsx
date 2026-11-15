import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'tray' | 'hero';

const SIZE_MAP: Record<AvatarSize, { px: number; ringStroke: number; gap: number }> = {
  xs: { px: 24, ringStroke: 1.5, gap: 1.5 },
  sm: { px: 36, ringStroke: 2, gap: 2 },
  md: { px: 40, ringStroke: 2, gap: 2 },
  lg: { px: 48, ringStroke: 2.2, gap: 2 },
  tray: { px: 64, ringStroke: 2.5, gap: 2.5 },
  hero: { px: 104, ringStroke: 3, gap: 3 },
};

interface StoryAvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  hasActiveStory?: boolean;
  hasUnseenStory?: boolean;
  hasCloseFriendStory?: boolean;
  segmentsCount?: number;
  seenSegmentsCount?: number;
  isOnline?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const StoryAvatar: React.FC<StoryAvatarProps> = ({
  src,
  alt,
  size = 'md',
  hasActiveStory = false,
  hasUnseenStory = false,
  hasCloseFriendStory = false,
  segmentsCount = 1,
  seenSegmentsCount = 0,
  isOnline = false,
  onClick,
  className,
}) => {
  const { px, ringStroke, gap } = SIZE_MAP[size];
  const outerPx = hasActiveStory ? px + (ringStroke + gap) * 2 : px;
  const center = outerPx / 2;
  const radius = outerPx / 2 - ringStroke / 2 - 0.5;
  const circumference = 2 * Math.PI * radius;

  const totalSegs = Math.max(1, segmentsCount);
  const gapPx = totalSegs > 1 ? 4 : 0;
  const segArc = (circumference - totalSegs * gapPx) / totalSegs;
  const gradId = React.useId();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as React.MouseEvent);
              }
            }
          : undefined
      }
      style={{ width: outerPx, height: outerPx }}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none',
        onClick && 'cursor-pointer group',
        className
      )}
    >
      {hasActiveStory && (
        <svg
          width={outerPx}
          height={outerPx}
          viewBox={`0 0 ${outerPx} ${outerPx}`}
          className="absolute inset-0 -rotate-90 pointer-events-none"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {Array.from({ length: totalSegs }).map((_, idx) => {
            const isSeen = !hasUnseenStory || idx < seenSegmentsCount;
            const offset = -(idx * (segArc + gapPx));
            const strokeColor = isSeen
              ? 'var(--ring-seen)'
              : hasCloseFriendStory
                ? '#10B981'
                : `url(#${gradId})`;
            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isSeen ? Math.max(1.5, ringStroke - 0.7) : ringStroke}
                strokeLinecap="round"
                strokeDasharray={`${Math.max(1, segArc)} ${circumference}`}
                strokeDashoffset={offset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      )}

      <img
        src={src}
        alt={alt}
        style={{ width: px, height: px }}
        className={cn(
          'rounded-full object-cover bg-surface-secondary transition-transform duration-200',
          onClick && 'group-hover:scale-[0.97]',
          !hasActiveStory && 'ring-1 ring-black/10 dark:ring-white/15'
        )}
      />

      {hasCloseFriendStory && hasUnseenStory && size !== 'xs' && (
        <span
          title="Close Friends Story"
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center ring-2 ring-[var(--canvas)] shadow-xs"
        >
          <Star className="w-2.5 h-2.5 fill-current" />
        </span>
      )}

      {isOnline && !hasCloseFriendStory && (
        <span
          title="Active now"
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-[#10B981] ring-2 ring-[var(--canvas)]',
            size === 'hero' ? 'w-4 h-4' : size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          )}
        >
          <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-50" />
        </span>
      )}
    </div>
  );
};

