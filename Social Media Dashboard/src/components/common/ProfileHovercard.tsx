import React, { useState, useRef } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import type { ProfileSummary } from '../../types/social';
import { StoryAvatar } from './StoryAvatar';
import { RelationshipButton } from './RelationshipButton';
import { formatCompactCount } from '../../lib/utils';
import { useAppStore } from '../../stores/useAppStore';
import { api } from '../../lib/api';
import { triggerQuickOpenDm } from '../../stores/useMessengerStore';

interface ProfileHovercardProps {
  profile: ProfileSummary;
  children: React.ReactNode;
}

export const ProfileHovercard: React.FC<ProfileHovercardProps> = ({ profile, children }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);

  const handleEnter = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), 240);
  };

  const handleLeave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      {open && (
        <div className="hidden sm:block absolute left-0 top-full mt-2 w-76 rounded-2xl bg-surface-elevated border border-divider shadow-2xl p-4 z-50 animate-msg-spring">
          <div className="flex items-start justify-between gap-3">
            <StoryAvatar
              src={profile.avatar_url}
              alt={profile.display_name}
              size="lg"
              hasActiveStory={profile.has_active_story}
              hasUnseenStory={profile.has_unseen_story}
              hasCloseFriendStory={profile.has_close_friend_story}
              segmentsCount={profile.story_segments_count}
              seenSegmentsCount={profile.story_seen_segments}
              isOnline={profile.is_online}
              onClick={() => navigateToProfile(profile.username)}
            />
            <div className="flex items-center gap-1.5">
              {profile.relationship_state !== 'self' && (
                <button
                  type="button"
                  onClick={() => triggerQuickOpenDm(profile.id, api.openConversationWith, 'dock')}
                  className="p-2 rounded-full bg-surface-secondary border border-divider text-primary-ink hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  title="Quick DM"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              )}
              <RelationshipButton profile={profile} compact />
            </div>
          </div>

          <div
            onClick={() => navigateToProfile(profile.username)}
            className="mt-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-primary-ink hover:underline">
                {profile.display_name}
              </span>
              {profile.relationship_state === 'mutual_friends' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mutual-pill">
                  <Sparkles className="w-2.5 h-2.5 text-violet-500" />
                  Mutual
                </span>
              )}
            </div>
            <p className="text-xs text-muted-ink">@{profile.username}</p>
          </div>

          {profile.status_text && (
            <div className="mt-2 px-2.5 py-1 rounded-lg bg-surface-secondary text-[11px] text-primary-ink truncate">
              {profile.status_emoji} {profile.status_text}
            </div>
          )}

          <p className="mt-2 text-xs text-primary-ink/90 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>

          <div className="mt-3 pt-2.5 border-t border-divider flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 tabular-nums">
              <span>
                <strong className="text-primary-ink">
                  {formatCompactCount(profile.followers_count)}
                </strong>{' '}
                <span className="text-muted-ink">followers</span>
              </span>
              <span>
                <strong className="text-primary-ink">
                  {formatCompactCount(profile.following_count)}
                </strong>{' '}
                <span className="text-muted-ink">following</span>
              </span>
            </div>
            {profile.mutuals_count > 0 && (
              <span className="text-[11px] text-muted-ink tabular-nums">
                {profile.mutuals_count} mutuals
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

