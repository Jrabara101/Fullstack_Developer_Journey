import React from 'react';
import { Bell, CheckCheck, Heart, MessageCircle, Sparkles, UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useSocialQueries';
import { useAppStore } from '../../stores/useAppStore';
import { api } from '../../lib/api';
import { StoryAvatar } from '../common/StoryAvatar';
import { RelationshipButton } from '../common/RelationshipButton';
import { cn, formatRelativeTime } from '../../lib/utils';

export const NotificationsView: React.FC = () => {
  const { data, isLoading } = useNotifications();
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const queryClient = useQueryClient();

  const items = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

  const markAllRead = async () => {
    await api.markNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const iconForType = (type: string) => {
    if (type === 'like') return <Heart className="w-3.5 h-3.5 text-[#F43F5E] fill-[#F43F5E]" />;
    if (type === 'comment') return <MessageCircle className="w-3.5 h-3.5 text-[#2563EB]" />;
    if (type === 'follow' || type === 'follow_request')
      return <UserPlus className="w-3.5 h-3.5 text-[#10B981]" />;
    return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-primary-ink">Notifications</h1>
            <p className="text-xs text-muted-ink font-mono-tabular">
              {unreadCount} unread updates
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-divider text-xs font-semibold text-primary-ink hover:border-[#2563EB] cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#2563EB]" /> Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-divider bg-surface-elevated divide-y divide-[var(--divider)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-ink">Loading activity...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-ink">
            All caught up — no notifications yet.
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={cn(
                'p-4 flex items-center justify-between gap-3 transition-colors',
                !n.is_read && 'bg-[#2563EB]/5'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <StoryAvatar
                    src={n.actor.avatar_url}
                    alt={n.actor.display_name}
                    size="md"
                    hasActiveStory={n.actor.has_active_story}
                    hasUnseenStory={n.actor.has_unseen_story}
                    onClick={() => navigateToProfile(n.actor.username)}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-surface-elevated border border-divider flex items-center justify-center shadow-xs">
                    {iconForType(n.type)}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-primary-ink leading-relaxed">
                    <button
                      type="button"
                      onClick={() => navigateToProfile(n.actor.username)}
                      className="font-bold hover:underline mr-1 cursor-pointer"
                    >
                      {n.actor.display_name}
                    </button>
                    <span className="text-primary-ink/90">{n.preview_text}</span>
                  </p>
                  <span className="font-mono-tabular text-[10px] text-muted-ink">
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(n.type === 'follow' || n.type === 'follow_request') && (
                  <RelationshipButton profile={n.actor} compact />
                )}
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

