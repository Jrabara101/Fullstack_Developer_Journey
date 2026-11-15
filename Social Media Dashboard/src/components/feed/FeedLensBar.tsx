import React from 'react';
import { Clock, HeartHandshake, LayoutGrid, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { FeedLens } from '../../types/social';
import { cn } from '../../lib/utils';

const LENSES: Array<{ id: FeedLens; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'for_you', label: 'For You', shortLabel: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', shortLabel: 'Following', icon: Clock },
  { id: 'close_friends', label: 'Close Friends', shortLabel: 'Close Friends', icon: HeartHandshake },
  { id: 'media', label: 'Media Grid', shortLabel: 'Media', icon: LayoutGrid },
];

export const FeedLensBar: React.FC = () => {
  const activeLens = useAppStore((s) => s.activeLens);
  const setActiveLens = useAppStore((s) => s.setActiveLens);
  const saveLensScroll = useAppStore((s) => s.saveLensScroll);
  const lensScrollMemory = useAppStore((s) => s.lensScrollMemory);

  const handleSelectLens = (nextLens: FeedLens) => {
    if (nextLens === activeLens) return;
    saveLensScroll(activeLens, window.scrollY);
    setActiveLens(nextLens);
    requestAnimationFrame(() => {
      window.scrollTo({ top: lensScrollMemory[nextLens] || 0, behavior: 'instant' as ScrollBehavior });
    });
  };

  return (
    <div className="sticky top-0 z-30 -mx-2 px-2 py-2.5 mb-4 backdrop-blur-md bg-[var(--canvas)]/85 border-b border-divider">
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-secondary border border-divider overflow-x-auto no-scrollbar">
        {LENSES.map((lens) => {
          const isActive = activeLens === lens.id;
          const Icon = lens.icon;
          return (
            <button
              key={lens.id}
              type="button"
              onClick={() => handleSelectLens(lens.id)}
              className={cn(
                'flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                isActive
                  ? lens.id === 'close_friends'
                    ? 'bg-[#10B981] text-white shadow-xs'
                    : 'bg-surface-elevated text-primary-ink shadow-xs border border-divider'
                  : 'text-muted-ink hover:text-primary-ink'
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5',
                  isActive && lens.id === 'for_you' && 'text-[#2563EB]',
                  isActive && lens.id === 'close_friends' && 'text-white'
                )}
              />
              <span className="hidden sm:inline">{lens.label}</span>
              <span className="sm:hidden">{lens.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

