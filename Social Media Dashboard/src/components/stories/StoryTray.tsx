import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useMe, useStories } from '../../hooks/useSocialQueries';
import { useStoryPlayerStore } from '../../stores/useStoryPlayerStore';
import { useAppStore } from '../../stores/useAppStore';
import { StoryAvatar } from '../common/StoryAvatar';
import { cn } from '../../lib/utils';

export const StoryTray: React.FC = () => {
  const { data: meData } = useMe();
  const { data: storiesData, isLoading } = useStories();
  const openStoryQueue = useStoryPlayerStore((s) => s.openStoryQueue);
  const openCreateModal = useAppStore((s) => s.openCreateModal);

  const me = meData?.user;
  const groups = storiesData?.groups || [];
  const myGroup = groups.find((g) => g.author.id === me?.id);
  const friendGroups = groups.filter((g) => g.author.id !== me?.id);

  return (
    <section
      aria-label="Active Stories"
      className="rounded-2xl bg-surface-elevated border border-divider px-3 py-3.5 mb-5"
    >
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5 px-1">
        {/* Item 0: Your Story Pod */}
        {me && (
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]">
            <div className="relative">
              <StoryAvatar
                src={me.avatar_url}
                alt={me.display_name}
                size="tray"
                hasActiveStory={Boolean(myGroup)}
                hasUnseenStory={Boolean(myGroup?.has_unseen)}
                hasCloseFriendStory={Boolean(myGroup?.has_close_friends)}
                segmentsCount={myGroup?.slides.length || 1}
                seenSegmentsCount={
                  myGroup ? myGroup.slides.filter((s) => s.is_viewed).length : 0
                }
                onClick={() => {
                  if (myGroup) {
                    openStoryQueue(groups, me.id);
                  } else {
                    openCreateModal('story');
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCreateModal('story');
                }}
                title="Add Story"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center ring-2 ring-[var(--surface-elevated)] shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
              </button>
            </div>
            <span className="text-[12px] font-medium text-muted-ink truncate w-full text-center">
              {myGroup ? 'Your Story' : 'Add Story'}
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]">
              <div className="w-16 h-16 rounded-full bg-surface-secondary animate-pulse" />
              <div className="w-12 h-3 rounded bg-surface-secondary animate-pulse" />
            </div>
          ))}

        {/* Active Friend Story Pods */}
        {friendGroups.map((group) => {
          const seenCount = group.slides.filter((s) => s.is_viewed).length;
          const isVideo = group.slides.some((s) => s.media_type === 'video');
          const hasInteractive = group.slides.some((s) => s.interactive_widget !== null);
          return (
            <button
              key={group.author.id}
              type="button"
              onClick={() => openStoryQueue(groups, group.author.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[74px] group cursor-pointer focus:outline-none"
            >
              <div className="relative">
                <StoryAvatar
                  src={group.author.avatar_url}
                  alt={group.author.display_name}
                  size="tray"
                  hasActiveStory
                  hasUnseenStory={group.has_unseen}
                  hasCloseFriendStory={group.has_close_friends}
                  segmentsCount={group.slides.length}
                  seenSegmentsCount={seenCount}
                />

                {group.has_close_friends ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#10B981] text-white text-[9px] font-bold tracking-wide ring-2 ring-[var(--surface-elevated)] shadow-xs flex items-center gap-0.5">
                    💚
                  </span>
                ) : isVideo ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider ring-2 ring-[var(--surface-elevated)] shadow-xs">
                    LIVE
                  </span>
                ) : hasInteractive && group.has_unseen ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[9px] font-bold ring-2 ring-[var(--surface-elevated)] shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                ) : null}
              </div>

              <span
                className={cn(
                  'text-[12px] truncate w-full text-center transition-colors',
                  group.has_unseen
                    ? 'font-semibold text-primary-ink'
                    : 'font-normal text-muted-ink'
                )}
              >
                {group.author.username}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

