import React, { useEffect, useRef } from 'react';
import {
  Bell,
  Bookmark,
  Compass,
  Film,
  Hash,
  Home,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Hand,
} from 'lucide-react';
import {
  useConversations,
  useDiscovery,
  useFeedInfinite,
  useMe,
  useNotifications,
} from '../../hooks/useSocialQueries';
import { useAppStore } from '../../stores/useAppStore';
import { triggerQuickOpenDm, useMessengerStore } from '../../stores/useMessengerStore';
import { api } from '../../lib/api';
import { StoryAvatar } from '../common/StoryAvatar';
import { RelationshipButton } from '../common/RelationshipButton';
import { FeedLensBar } from '../feed/FeedLensBar';
import { StoryTray } from '../stories/StoryTray';
import { QuickComposerCard } from '../feed/QuickComposerCard';
import { FeedPostCard } from '../feed/FeedPostCard';
import { ProfileStage } from '../profile/ProfileStage';
import { MessengerWorkspace } from '../messages/MessengerWorkspace';
import { ExploreView } from '../views/ExploreView';
import { ReelsView } from '../views/ReelsView';
import { NotificationsView } from '../views/NotificationsView';
import { BookmarksView } from '../views/BookmarksView';
import { cn, formatCompactCount } from '../../lib/utils';
import type { AppView } from '../../types/social';

export const SocialDashboardLayout: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeView,
    setActiveView,
    activeLens,
    navigateToProfile,
    navigateToExploreTag,
    openCreateModal,
    setCommandPaletteOpen,
    pushToast,
  } = useAppStore();

  const { wsStatus, presenceByUser } = useMessengerStore();
  const { data: meData } = useMe();
  const { data: convData } = useConversations();
  const { data: notifData } = useNotifications();
  const { data: discoveryData } = useDiscovery();

  const {
    data: feedPages,
    isLoading: isFeedLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedInfinite(activeLens);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || activeView !== 'feed') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '220px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeView]);

  const me = meData?.user;
  const unreadMessages = convData?.totalUnread || 0;
  const unreadNotifs = notifData?.unreadCount || 0;
  const posts = feedPages?.pages.flatMap((p) => p.items) || [];

  const showRightSidebar =
    activeView === 'feed' ||
    activeView === 'explore' ||
    activeView === 'bookmarks' ||
    activeView === 'notifications';

  const navItems: Array<{
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeTone?: 'crimson' | 'cobalt';
  }> = [
    { id: 'feed', label: 'Home Feed', icon: Home },
    { id: 'explore', label: 'Explore & Topics', icon: Compass },
    { id: 'reels', label: 'Reels & Video', icon: Film },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadMessages,
      badgeTone: 'crimson',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs,
      badgeTone: 'cobalt',
    },
    { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
  ];

  const handleNavClick = (id: AppView) => {
    setActiveView(id);
  };

  return (
    <div className="min-h-screen bg-canvas text-primary-ink flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 px-4 h-14 border-b border-divider bg-[var(--canvas)]/90 backdrop-blur-md flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveView('feed')}
          className="flex items-center gap-2 font-display font-bold text-lg cursor-pointer"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F59E0B] via-[#EC4899] to-[#2563EB] flex items-center justify-center text-white text-xs font-black">
            L
          </span>
          <span>Lumen</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-full bg-surface-elevated border border-divider text-muted-ink cursor-pointer"
            aria-label="Search or switch persona"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('post')}
            className="p-2 rounded-full bg-[#2563EB] text-white cursor-pointer"
            aria-label="Create post or story"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-surface-elevated border border-divider text-primary-ink cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* LEFT NAVIGATION RAIL (250px fixed on md+) */}
      <aside className="hidden md:flex w-[250px] shrink-0 sticky top-0 h-screen border-r border-divider bg-surface-elevated/70 backdrop-blur-md flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveView('feed')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F59E0B] via-[#EC4899] to-[#2563EB] flex items-center justify-center text-white font-display font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-base leading-none text-primary-ink">
                  Lumen
                </div>
                <div className="text-[10px] text-muted-ink font-mono-tabular mt-0.5 flex items-center gap-1">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      wsStatus === 'connected' ? 'bg-[#10B981]' : 'bg-amber-400'
                    )}
                  />
                  <span>{wsStatus === 'connected' ? 'Realtime Sync' : 'Connecting'}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              title="Command Palette (⌘K)"
              className="px-2 py-1 rounded-lg bg-surface-secondary border border-divider text-[10px] font-mono-tabular text-muted-ink hover:text-primary-ink cursor-pointer"
            >
              ⌘K
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer',
                    active
                      ? 'bg-[#2563EB]/12 text-[#2563EB] dark:text-[#60A5FA] font-bold'
                      : 'text-primary-ink/85 hover:bg-surface-secondary font-medium'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full font-mono-tabular text-[11px] font-bold text-white',
                        item.badgeTone === 'crimson' ? 'bg-[#F43F5E]' : 'bg-[#2563EB]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* My Profile link with mini StoryAvatar */}
            {me && (
              <button
                type="button"
                onClick={() => navigateToProfile(me.username)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer',
                  activeView === 'profile' && useAppStore.getState().profileUsername === me.username
                    ? 'bg-[#2563EB]/12 text-[#2563EB] dark:text-[#60A5FA] font-bold'
                    : 'text-primary-ink/85 hover:bg-surface-secondary font-medium'
                )}
              >
                <StoryAvatar
                  src={me.avatar_url}
                  alt={me.display_name}
                  size="xs"
                  hasActiveStory={me.has_active_story}
                  hasUnseenStory={me.has_unseen_story}
                  hasCloseFriendStory={me.has_close_friend_story}
                />
                <span>My Profile</span>
              </button>
            )}
          </nav>

          {/* Primary Composer CTA */}
          <button
            type="button"
            onClick={() => openCreateModal('post')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Post / Story</span>
            </span>
            <span className="font-mono-tabular text-[10px] opacity-80 bg-white/15 px-1.5 py-0.5 rounded">
              ⌘N
            </span>
          </button>
        </div>

        {/* Bottom User Capsule + Theme Toggle */}
        {me && (
          <div className="pt-3 border-t border-divider flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              title="Switch active persona or jump (⌘K)"
              className="flex items-center gap-2.5 min-w-0 flex-1 p-1.5 rounded-xl hover:bg-surface-secondary transition-colors text-left cursor-pointer"
            >
              <StoryAvatar
                src={me.avatar_url}
                alt={me.display_name}
                size="sm"
                isOnline
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-primary-ink truncate">
                  {me.display_name}
                </div>
                <div className="text-[11px] text-muted-ink truncate">@{me.username}</div>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Alabaster Light' : 'Switch to Obsidian Dark'}
              className="p-2 rounded-xl bg-surface-secondary border border-divider text-primary-ink hover:border-[#2563EB] transition-colors shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        )}
      </aside>

      {/* CENTER STAGE */}
      <main className="flex-1 min-w-0 px-3 sm:px-6 pb-20 md:pb-8">
        {activeView === 'feed' && (
          <div
            className={cn(
              'mx-auto py-4',
              activeLens === 'media' ? 'max-w-3xl' : 'max-w-[620px]'
            )}
          >
            <FeedLensBar />
            <StoryTray />
            <QuickComposerCard />

            {isFeedLoading ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-96 rounded-2xl border border-divider bg-surface-elevated animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-divider bg-surface-elevated p-12 text-center space-y-2">
                <p className="font-display font-bold text-base text-primary-ink">
                  Quiet in this lens right now
                </p>
                <p className="text-xs text-muted-ink">
                  Try switching feed lenses above or share a new post with your circle.
                </p>
              </div>
            ) : activeLens === 'media' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((p) => (
                  <FeedPostCard key={p.id} post={p} compact />
                ))}
              </div>
            ) : (
              <div>
                {posts.map((p) => (
                  <FeedPostCard key={p.id} post={p} />
                ))}
              </div>
            )}

            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {hasNextPage ? (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-4 py-2 rounded-full bg-surface-elevated border border-divider text-xs font-semibold text-primary-ink hover:border-[#2563EB] cursor-pointer"
                >
                  {isFetchingNextPage ? 'Loading more posts...' : 'Load more posts'}
                </button>
              ) : (
                posts.length > 0 && (
                  <span className="text-xs text-muted-ink">
                    You’re all caught up on this stream ✨
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {activeView === 'profile' && <ProfileStage />}
        {activeView === 'messages' && <MessengerWorkspace />}
        {activeView === 'explore' && <ExploreView />}
        {activeView === 'reels' && <ReelsView />}
        {activeView === 'notifications' && <NotificationsView />}
        {activeView === 'bookmarks' && <BookmarksView />}
      </main>

      {/* RIGHT CONTEXT SIDEBAR (320px sticky on xl+) */}
      {showRightSidebar && (
        <aside className="hidden xl:block w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-divider bg-canvas p-5 space-y-6">
          {/* Active Now / Ambient Friends Radar */}
          <section className="rounded-2xl border border-divider bg-surface-elevated p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                Active Friends Radar
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono-tabular text-[#10B981] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {(discoveryData?.activeFriends || []).length} online
              </span>
            </div>

            <div className="space-y-2.5">
              {(discoveryData?.activeFriends || []).map((friend) => {
                const live = presenceByUser[friend.id];
                const activity = live?.activity || friend.current_activity || 'Active now';
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between gap-2 group"
                  >
                    <button
                      type="button"
                      onClick={() => navigateToProfile(friend.username)}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      <StoryAvatar
                        src={friend.avatar_url}
                        alt={friend.display_name}
                        size="sm"
                        hasActiveStory={friend.has_active_story}
                        hasUnseenStory={friend.has_unseen_story}
                        hasCloseFriendStory={friend.has_close_friend_story}
                        isOnline={live?.isOnline ?? friend.is_online}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-primary-ink truncate group-hover:underline">
                          {friend.display_name}
                        </div>
                        <div className="text-[11px] text-muted-ink truncate">{activity}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerQuickOpenDm(friend.id, api.openConversationWith, 'dock');
                        pushToast(`Opened quick chat with ${friend.display_name}`, 'cobalt');
                      }}
                      title="Wave / Quick DM"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-secondary border border-divider text-[11px] font-semibold text-primary-ink hover:border-[#2563EB] shrink-0 cursor-pointer"
                    >
                      <Hand className="w-3 h-3 text-amber-500" />
                      <span>DM</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Who to Follow & Mutual Overlap Cards */}
          {(discoveryData?.suggestions || []).length > 0 && (
            <section className="rounded-2xl border border-divider bg-surface-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                  Who to Follow
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              </div>

              <div className="space-y-3">
                {(discoveryData?.suggestions || []).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => navigateToProfile(person.username)}
                      className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer group"
                    >
                      <StoryAvatar
                        src={person.avatar_url}
                        alt={person.display_name}
                        size="md"
                        hasActiveStory={person.has_active_story}
                        hasUnseenStory={person.has_unseen_story}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-primary-ink truncate group-hover:underline">
                          {person.display_name}
                        </div>
                        <div className="text-[10px] text-muted-ink truncate">
                          {person.mutuals_count > 0 && person.mutual_preview[0]
                            ? `Followed by @${person.mutual_preview[0].username} + ${person.mutuals_count} mutuals`
                            : `@${person.username}`}
                        </div>
                      </div>
                    </button>
                    <RelationshipButton profile={person} compact />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Topics & Curated Tags */}
          <section className="rounded-2xl border border-divider bg-surface-elevated p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-ink">
              Trending Topics
            </h2>
            <div className="space-y-2">
              {(discoveryData?.trendingTags || []).map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => navigateToExploreTag(t.tag)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-surface-secondary transition-colors text-left cursor-pointer group"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-primary-ink group-hover:text-[#2563EB]">
                    <Hash className="w-3.5 h-3.5 text-[#2563EB]" />
                    {t.tag}
                  </span>
                  <span className="font-mono-tabular text-[11px] text-muted-ink">
                    {formatCompactCount(t.posts_count)} posts
                  </span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-divider bg-[var(--surface-elevated)]/95 backdrop-blur-md flex items-center justify-around px-2">
        {[
          { id: 'feed' as AppView, icon: Home, label: 'Feed' },
          { id: 'explore' as AppView, icon: Compass, label: 'Explore' },
          { id: 'reels' as AppView, icon: Film, label: 'Reels' },
          { id: 'messages' as AppView, icon: MessageCircle, label: 'DMs', badge: unreadMessages },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center p-2 cursor-pointer',
                active ? 'text-[#2563EB]' : 'text-muted-ink'
              )}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-0.5 px-1 min-w-[16px] h-4 rounded-full bg-[#F43F5E] text-white font-mono-tabular text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {me && (
          <button
            type="button"
            onClick={() => navigateToProfile(me.username)}
            className="p-1 cursor-pointer"
            aria-label="Profile"
          >
            <StoryAvatar src={me.avatar_url} alt={me.display_name} size="xs" />
          </button>
        )}
      </nav>
    </div>
  );
};

