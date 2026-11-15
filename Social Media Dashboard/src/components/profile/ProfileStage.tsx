import React, { useState } from 'react';
import {
  Bell,
  Bookmark,
  Calendar,
  Check,
  Edit3,
  Film,
  Grid,
  Heart,
  Layers,
  Link2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Pin,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileStudio, useStories } from '../../hooks/useSocialQueries';
import { useAppStore } from '../../stores/useAppStore';
import { useStoryPlayerStore } from '../../stores/useStoryPlayerStore';
import { triggerQuickOpenDm } from '../../stores/useMessengerStore';
import { api, getActiveUserId } from '../../lib/api';
import { StoryAvatar } from '../common/StoryAvatar';
import { RelationshipButton } from '../common/RelationshipButton';
import { FeedPostCard } from '../feed/FeedPostCard';
import { SocialGraphModal } from './SocialGraphModal';
import { cn, formatCompactCount } from '../../lib/utils';
import type { FeedPost } from '../../types/social';

type ProfileTab = 'grid' | 'bento' | 'threads' | 'reels' | 'tagged' | 'collections';

export const ProfileStage: React.FC = () => {
  const username = useAppStore((s) => s.profileUsername);
  const pushToast = useAppStore((s) => s.pushToast);
  const { data, isLoading } = useProfileStudio(username);
  const { data: storiesData } = useStories();
  const openStoryQueue = useStoryPlayerStore((s) => s.openStoryQueue);
  const openHighlightSlides = useStoryPlayerStore((s) => s.openHighlightSlides);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<ProfileTab>('grid');
  const [graphTab, setGraphTab] = useState<
    'followers' | 'following' | 'mutuals' | 'close_friends' | null
  >(null);
  const [selectedPostModal, setSelectedPostModal] = useState<FeedPost | null>(null);
  const [notifsMuted, setNotifsMuted] = useState(false);

  // Own profile inline status & bio editing
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusEmoji, setStatusEmoji] = useState('');
  const [statusText, setStatusText] = useState('');

  if (isLoading || !data) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <div className="h-48 rounded-b-3xl bg-surface-secondary animate-pulse" />
        <div className="h-32 rounded-2xl bg-surface-secondary animate-pulse" />
      </div>
    );
  }

  const { profile, posts, tagged_posts, highlights, collections } = data;
  const isOwn = profile.id === getActiveUserId();
  const pinnedPosts = posts.filter((p) => p.is_pinned).slice(0, 3);
  const threadPosts = posts.filter(
    (p) => p.quote_card || p.voice_note || p.poll || p.media_items.length === 0
  );
  const reelPosts = posts.filter((p) => p.media_items.some((m) => m.type === 'video'));
  const mediaPosts = posts.filter((p) => p.media_items.length > 0);

  const handleAvatarClick = () => {
    const groups = storiesData?.groups || [];
    if (profile.has_active_story && groups.some((g) => g.author.id === profile.id)) {
      openStoryQueue(groups, profile.id);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateMe({
        status_emoji: statusEmoji || profile.status_emoji,
        status_text: statusText,
      });
      setEditingStatus(false);
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      pushToast('Updated live status pill', 'emerald');
    } catch {}
  };

  const renderGridTile = (p: FeedPost, tall = false) => {
    const firstMedia = p.media_items[0];
    return (
      <button
        key={p.id}
        type="button"
        onClick={() => setSelectedPostModal(p)}
        className={cn(
          'relative rounded-xl overflow-hidden bg-surface-secondary border border-divider group cursor-pointer',
          tall ? 'h-full min-h-[260px]' : 'aspect-[4/5]'
        )}
      >
        {firstMedia ? (
          firstMedia.type === 'video' ? (
            <video
              src={firstMedia.url}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={firstMedia.url}
              alt={firstMedia.alt || p.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full p-4 flex items-center justify-center text-center text-xs text-primary-ink bg-surface-elevated">
            <span className="line-clamp-4">{p.caption}</span>
          </div>
        )}

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {p.is_pinned && (
            <span className="p-1 rounded-full bg-black/60 text-amber-400 backdrop-blur-xs">
              <Pin className="w-3 h-3 fill-current" />
            </span>
          )}
          {p.media_items.length > 1 && (
            <span className="p-1 rounded-full bg-black/60 text-white backdrop-blur-xs">
              <Layers className="w-3 h-3" />
            </span>
          )}
          {firstMedia?.type === 'video' && (
            <span className="p-1 rounded-full bg-black/60 text-white backdrop-blur-xs">
              <Film className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Hover Engagement Scrim */}
        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-5 text-white font-mono-tabular text-xs font-bold">
          {!p.hide_like_count && (
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-white" /> {formatCompactCount(p.likes_count)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 fill-white" /> {formatCompactCount(p.comments_count)}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Panoramic Hero Banner */}
      <div className="relative h-48 rounded-b-3xl overflow-hidden border-x border-b border-divider bg-surface-secondary">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt={`${profile.display_name} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      </div>

      {/* Overlapping Avatar & Status Bubble */}
      <div className="px-4 sm:px-6 -mt-14 relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="relative flex items-end gap-3">
            <div className="rounded-full p-1 bg-[var(--canvas)]">
              <StoryAvatar
                src={profile.avatar_url}
                alt={profile.display_name}
                size="hero"
                hasActiveStory={profile.has_active_story}
                hasUnseenStory={profile.has_unseen_story}
                hasCloseFriendStory={profile.has_close_friend_story}
                segmentsCount={profile.story_segments_count}
                seenSegmentsCount={profile.story_seen_segments}
                isOnline={profile.is_online}
                onClick={profile.has_active_story ? handleAvatarClick : undefined}
              />
            </div>

            {/* Live Status Pill */}
            {(profile.status_text || isOwn) && !editingStatus && (
              <button
                type="button"
                onClick={() => {
                  if (!isOwn) return;
                  setStatusEmoji(profile.status_emoji);
                  setStatusText(profile.status_text);
                  setEditingStatus(true);
                }}
                className={cn(
                  'mb-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-divider shadow-md text-xs text-primary-ink flex items-center gap-1.5 max-w-[260px]',
                  isOwn && 'hover:border-[#2563EB] cursor-pointer'
                )}
              >
                <span>{profile.status_emoji}</span>
                <span className="truncate font-medium">
                  {profile.status_text || 'Set your live status...'}
                </span>
                {isOwn && <Edit3 className="w-3 h-3 text-muted-ink shrink-0" />}
              </button>
            )}

            {editingStatus && (
              <form
                onSubmit={handleSaveStatus}
                className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-[#2563EB] shadow-lg"
              >
                <input
                  value={statusEmoji}
                  onChange={(e) => setStatusEmoji(e.target.value)}
                  className="w-7 text-center bg-transparent text-xs outline-none"
                  maxLength={4}
                />
                <input
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="What are you up to?"
                  className="w-40 bg-transparent text-xs text-primary-ink outline-none"
                  autoFocus
                />
                <button type="submit" className="text-[#10B981] cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStatus(false)}
                  className="text-muted-ink cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Relationship & Action Deck */}
          <div className="flex items-center gap-2 pb-1">
            <RelationshipButton profile={profile} />

            {!isOwn && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    triggerQuickOpenDm(profile.id, api.openConversationWith, 'studio')
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-elevated border border-divider text-sm font-semibold text-primary-ink hover:bg-surface-secondary transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNotifsMuted((m) => !m);
                    pushToast(
                      notifsMuted
                        ? `Enabled post alerts for @${profile.username}`
                        : `Muted post alerts for @${profile.username}`,
                      'cobalt'
                    );
                  }}
                  className="p-2 rounded-full bg-surface-elevated border border-divider text-primary-ink hover:bg-surface-secondary cursor-pointer"
                  title="Post notifications"
                >
                  <Bell className={cn('w-4 h-4', !notifsMuted && 'text-[#2563EB]')} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Identity Row */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display font-bold text-2xl text-primary-ink">
              {profile.display_name}
            </h1>
            {profile.pronouns && (
              <span className="px-2 py-0.5 rounded-full bg-surface-secondary border border-divider text-[11px] font-medium text-muted-ink">
                {profile.pronouns}
              </span>
            )}
            {profile.relationship_state === 'mutual_friends' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mutual-pill text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-violet-500" />
                <span className="mutual-gradient-text">Mutual Friends</span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-ink">@{profile.username}</p>
        </div>

        {/* Bio, Chips & Mutual Social Proof */}
        <div className="mt-3 space-y-2.5">
          <p className="text-sm text-primary-ink/95 leading-relaxed max-w-2xl">{profile.bio}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-ink">
            {profile.website && (
              <span className="inline-flex items-center gap-1 text-[#2563EB] font-medium">
                <Link2 className="w-3.5 h-3.5" /> {profile.website}
              </span>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {profile.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined{' '}
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Mutual Social Proof Strip */}
          {!isOwn && profile.mutuals_count > 0 && (
            <button
              type="button"
              onClick={() => setGraphTab('mutuals')}
              className="flex items-center gap-2.5 text-xs text-muted-ink hover:text-primary-ink transition-colors cursor-pointer"
            >
              <div className="flex items-center -space-x-2">
                {profile.mutual_preview.map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar_url}
                    alt={m.display_name}
                    className="w-6 h-6 rounded-full ring-2 ring-[var(--canvas)] object-cover"
                  />
                ))}
              </div>
              <span>
                Followed by{' '}
                <strong className="text-primary-ink">
                  {profile.mutual_preview.map((m) => m.display_name.split(' ')[0]).join(', ')}
                </strong>
                {profile.mutuals_count > profile.mutual_preview.length &&
                  ` and ${profile.mutuals_count - profile.mutual_preview.length} others you know`}
              </span>
            </button>
          )}

          {/* Tabular Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm tabular-nums">
            <div>
              <strong className="font-mono-tabular text-primary-ink">{posts.length}</strong>{' '}
              <span className="text-muted-ink text-xs">Posts</span>
            </div>
            <button
              type="button"
              onClick={() => setGraphTab('followers')}
              className="hover:underline cursor-pointer"
            >
              <strong className="font-mono-tabular text-primary-ink">
                {formatCompactCount(profile.followers_count)}
              </strong>{' '}
              <span className="text-muted-ink text-xs">Followers</span>
            </button>
            <button
              type="button"
              onClick={() => setGraphTab('following')}
              className="hover:underline cursor-pointer"
            >
              <strong className="font-mono-tabular text-primary-ink">
                {formatCompactCount(profile.following_count)}
              </strong>{' '}
              <span className="text-muted-ink text-xs">Following</span>
            </button>
            {!isOwn && (
              <button
                type="button"
                onClick={() => setGraphTab('mutuals')}
                className="hover:underline cursor-pointer"
              >
                <strong className="font-mono-tabular text-primary-ink">
                  {profile.mutuals_count}
                </strong>{' '}
                <span className="text-muted-ink text-xs">Mutuals</span>
              </button>
            )}
            {isOwn && (
              <button
                type="button"
                onClick={() => setGraphTab('close_friends')}
                className="hover:underline cursor-pointer text-[#10B981] font-semibold text-xs"
              >
                Manage Close Friends 💚
              </button>
            )}
          </div>
        </div>

        {/* Story Highlights Capsule Rail */}
        {highlights.length > 0 && (
          <div className="mt-6 flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            {highlights.map((hl) => (
              <button
                key={hl.title}
                type="button"
                onClick={() => openHighlightSlides(profile, hl.title, hl.slides)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="w-[62px] h-[62px] rounded-full p-[2px] border border-divider bg-surface-elevated group-hover:scale-105 transition-transform">
                  <img
                    src={hl.cover_url}
                    alt={hl.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-muted-ink group-hover:text-primary-ink max-w-[70px] truncate">
                  {hl.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Segmented Content Matrix Tabs */}
        <div className="mt-6 border-b border-divider flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'grid', label: `Grid (${mediaPosts.length})`, icon: Grid },
            { id: 'bento', label: `Pinned Bento (${pinnedPosts.length})`, icon: Pin },
            { id: 'threads', label: `Thoughts (${threadPosts.length})`, icon: MessageSquareText },
            { id: 'reels', label: `Reels (${reelPosts.length})`, icon: Film },
            { id: 'tagged', label: `Tagged (${tagged_posts.length})`, icon: Tag },
            { id: 'collections', label: `Collections (${collections.length})`, icon: Bookmark },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as ProfileTab)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                  active
                    ? 'border-[#2563EB] text-primary-ink'
                    : 'border-transparent text-muted-ink hover:text-primary-ink'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="mt-5">
          {tab === 'grid' && (
            <div className="space-y-5">
              {/* Top Pinned Bento Row preview when pinned posts exist */}
              {pinnedPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">{renderGridTile(pinnedPosts[0], true)}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                    {pinnedPosts.slice(1, 3).map((p) => renderGridTile(p))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                {mediaPosts.map((p) => renderGridTile(p))}
              </div>
            </div>
          )}

          {tab === 'bento' &&
            (pinnedPosts.length === 0 ? (
              <div className="rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
                No pinned flagship posts yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">{renderGridTile(pinnedPosts[0], true)}</div>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5">
                  {pinnedPosts.slice(1, 3).map((p) => renderGridTile(p))}
                </div>
              </div>
            ))}

          {tab === 'threads' && (
            <div className="max-w-xl mx-auto">
              {threadPosts.length === 0 ? (
                <div className="rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
                  No thoughts, voice notes, or polls published yet.
                </div>
              ) : (
                threadPosts.map((p) => <FeedPostCard key={p.id} post={p} />)
              )}
            </div>
          )}

          {tab === 'reels' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {reelPosts.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
                  No video reels uploaded yet.
                </div>
              ) : (
                reelPosts.map((p) => renderGridTile(p))
              )}
            </div>
          )}

          {tab === 'tagged' && (
            <div className="grid grid-cols-3 gap-1.5">
              {tagged_posts.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
                  No tagged posts yet.
                </div>
              ) : (
                tagged_posts.map((p) => renderGridTile(p))
              )}
            </div>
          )}

          {tab === 'collections' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
                  No visible collections yet.
                </div>
              ) : (
                collections.map((col) => (
                  <div
                    key={col.id}
                    className="rounded-2xl border border-divider bg-surface-elevated p-3 space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-[4/3] bg-surface-secondary">
                      {col.cover_urls.slice(0, 4).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <div className="font-semibold text-sm text-primary-ink">{col.name}</div>
                        <div className="text-[11px] text-muted-ink font-mono-tabular">
                          {col.post_count} items
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-secondary border border-divider text-[10px] font-semibold text-muted-ink">
                        {col.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Social Graph Modal */}
      {graphTab && (
        <SocialGraphModal
          username={profile.username}
          initialTab={graphTab}
          isOwnProfile={isOwn}
          onClose={() => setGraphTab(null)}
        />
      )}

      {/* Selected Grid Post Detail Modal */}
      {selectedPostModal && (
        <div
          className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPostModal(null)}
        >
          <div
            className="w-full max-w-xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setSelectedPostModal(null)}
                className="p-2 rounded-full glass-hud text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FeedPostCard post={selectedPostModal} />
          </div>
        </div>
      )}
    </div>
  );
};

