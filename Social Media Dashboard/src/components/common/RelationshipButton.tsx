import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Star, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import type { ProfileSummary } from '../../types/social';
import { useToggleCloseFriend, useToggleFollow } from '../../hooks/useSocialQueries';
import { cn } from '../../lib/utils';

interface RelationshipButtonProps {
  profile: ProfileSummary;
  compact?: boolean;
}

export const RelationshipButton: React.FC<RelationshipButtonProps> = ({
  profile,
  compact = false,
}) => {
  const toggleFollow = useToggleFollow();
  const toggleCloseFriend = useToggleCloseFriend();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  if (profile.relationship_state === 'self') return null;

  const isConnected =
    profile.relationship_state === 'mutual_friends' ||
    profile.relationship_state === 'following';

  if (!isConnected) {
    const isFollowBack = profile.relationship_state === 'follow_back';
    const isRequested = profile.relationship_state === 'requested';

    return (
      <button
        type="button"
        onClick={() => toggleFollow.mutate(profile.id)}
        disabled={toggleFollow.isPending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold transition-all active:scale-95 cursor-pointer',
          compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
          isRequested
            ? 'bg-surface-secondary text-muted-ink border border-divider'
            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
        )}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>
          {isRequested ? 'Requested' : isFollowBack ? 'Follow Back ⮂' : 'Follow'}
        </span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold transition-all active:scale-95 cursor-pointer',
          compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
          profile.relationship_state === 'mutual_friends'
            ? 'mutual-pill text-primary-ink hover:opacity-90'
            : 'bg-surface-secondary border border-divider text-primary-ink hover:bg-black/5 dark:hover:bg-white/10'
        )}
      >
        {profile.relationship_state === 'mutual_friends' ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Mutual Friends</span>
          </>
        ) : (
          <>
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Following</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-surface-elevated border border-divider shadow-xl py-1.5 z-50">
          <button
            type="button"
            onClick={() => {
              toggleCloseFriend.mutate(profile.id);
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Star
                className={cn(
                  'w-3.5 h-3.5',
                  profile.is_close_friend
                    ? 'text-[#10B981] fill-[#10B981]'
                    : 'text-muted-ink'
                )}
              />
              Close Friend
            </span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                profile.is_close_friend
                  ? 'bg-emerald-500/15 text-[#10B981]'
                  : 'text-muted-ink'
              )}
            >
              {profile.is_close_friend ? 'Active' : 'Add'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              toggleFollow.mutate(profile.id);
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-rose-500 flex items-center gap-2 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Unfollow @{profile.username}</span>
          </button>
        </div>
      )}
    </div>
  );
};

