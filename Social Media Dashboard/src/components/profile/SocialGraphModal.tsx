import React, { useState } from 'react';
import { MessageCircle, Sparkles, Star, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getActiveUserId } from '../../lib/api';
import type { ProfileSummary } from '../../types/social';
import { StoryAvatar } from '../common/StoryAvatar';
import { RelationshipButton } from '../common/RelationshipButton';
import { useAppStore } from '../../stores/useAppStore';
import { useToggleCloseFriend } from '../../hooks/useSocialQueries';
import { triggerQuickOpenDm } from '../../stores/useMessengerStore';
import { cn } from '../../lib/utils';

type GraphTab = 'followers' | 'following' | 'mutuals' | 'close_friends';

interface SocialGraphModalProps {
  username: string;
  initialTab: GraphTab;
  isOwnProfile: boolean;
  onClose: () => void;
}

export const SocialGraphModal: React.FC<SocialGraphModalProps> = ({
  username,
  initialTab,
  isOwnProfile,
  onClose,
}) => {
  const [tab, setTab] = useState<GraphTab>(initialTab);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const toggleCloseFriend = useToggleCloseFriend();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['profile-graph', username, tab],
    queryFn: () => api.getProfileGraph(username, tab),
  });
  const items: ProfileSummary[] = data?.items || [];

  const tabs: Array<{ id: GraphTab; label: string }> = [
    { id: 'followers', label: 'Followers' },
    { id: 'following', label: 'Following' },
    { id: 'mutuals', label: 'Mutuals' },
    ...(isOwnProfile ? [{ id: 'close_friends' as const, label: 'Close Friends 💚' }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-[105] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface-elevated border border-divider shadow-2xl overflow-hidden animate-msg-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
          <span className="font-display font-bold text-sm text-primary-ink">
            @{username} • Social Graph
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-secondary text-muted-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-3 pt-2.5 border-b border-divider overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                tab === t.id
                  ? 'border-[#2563EB] text-primary-ink'
                  : 'border-transparent text-muted-ink hover:text-primary-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-10 text-center text-xs text-muted-ink">Loading network...</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-ink">
              No connections in this circle yet.
            </div>
          ) : (
            items.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-surface-secondary transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigateToProfile(person.username);
                  }}
                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                >
                  <StoryAvatar
                    src={person.avatar_url}
                    alt={person.display_name}
                    size="md"
                    hasActiveStory={person.has_active_story}
                    hasUnseenStory={person.has_unseen_story}
                    hasCloseFriendStory={person.has_close_friend_story}
                    isOnline={person.is_online}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary-ink truncate">
                        {person.display_name}
                      </span>
                      {person.relationship_state === 'mutual_friends' && (
                        <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-muted-ink truncate">@{person.username}</div>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isOwnProfile && person.id !== getActiveUserId() && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleCloseFriend.mutate(person.id, {
                          onSuccess: () => {
                            queryClient.invalidateQueries({
                              queryKey: ['profile-graph', username, tab],
                            });
                          },
                        });
                      }}
                      title="Toggle Close Friend"
                      className={cn(
                        'p-1.5 rounded-full border transition-colors cursor-pointer',
                        person.is_close_friend
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : 'bg-surface-elevated text-muted-ink border-divider'
                      )}
                    >
                      <Star
                        className={cn('w-3.5 h-3.5', person.is_close_friend && 'fill-current')}
                      />
                    </button>
                  )}

                  {person.id !== getActiveUserId() && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        triggerQuickOpenDm(person.id, api.openConversationWith, 'dock');
                      }}
                      className="p-1.5 rounded-full bg-surface-elevated border border-divider text-muted-ink hover:text-primary-ink cursor-pointer"
                      title="Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <RelationshipButton profile={person} compact />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
