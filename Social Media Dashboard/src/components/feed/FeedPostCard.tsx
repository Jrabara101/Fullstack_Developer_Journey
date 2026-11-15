import React, { useRef, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Globe,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Pin,
  Repeat2,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedPost, PostComment } from '../../types/social';
import { StoryAvatar } from '../common/StoryAvatar';
import { ProfileHovercard } from '../common/ProfileHovercard';
import { AudioWaveformPlayer } from '../common/AudioWaveformPlayer';
import {
  useCollections,
  useConversations,
  useMe,
  useStories,
  useToggleBookmark,
  useToggleLike,
} from '../../hooks/useSocialQueries';
import { useAppStore } from '../../stores/useAppStore';
import { useStoryPlayerStore } from '../../stores/useStoryPlayerStore';
import { api, getActiveUserId } from '../../lib/api';
import { cn, formatCompactCount, formatRelativeTime, generateClientUuid } from '../../lib/utils';

interface FeedPostCardProps {
  post: FeedPost;
  compact?: boolean;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({ post, compact = false }) => {
  const { data: meData } = useMe();
  const { data: storiesData } = useStories();
  const { data: convData } = useConversations();
  const { data: collectionsData } = useCollections();

  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const openStoryQueue = useStoryPlayerStore((s) => s.openStoryQueue);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const navigateToExploreTag = useAppStore((s) => s.navigateToExploreTag);
  const pushToast = useAppStore((s) => s.pushToast);
  const queryClient = useQueryClient();

  const [slideIdx, setSlideIdx] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [heartBursts, setHeartBursts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [allComments, setAllComments] = useState<PostComment[] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const activeUserId = getActiveUserId();
  const isAuthor = post.author.id === activeUserId || post.co_author?.id === activeUserId;

  const mediaCount = post.media_items.length;
  const activeMedia = post.media_items[slideIdx];
  const isWideAspect =
    activeMedia && activeMedia.width > activeMedia.height ? 'aspect-[16/10]' : 'aspect-[4/5]';

  const handleOpenAuthorStoryOrProfile = (author: FeedPost['author']) => {
    const groups = storiesData?.groups || [];
    const hasGroup = groups.some((g) => g.author.id === author.id);
    if (author.has_active_story && hasGroup) {
      openStoryQueue(groups, author.id);
    } else {
      navigateToProfile(author.username);
    }
  };

  const handleDoubleTapMedia = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setHeartBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((b) => b.id !== id));
    }, 800);

    if (!post.is_liked) {
      toggleLike.mutate(post.id);
    }
  };

  const loadComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) {
      try {
        const res = await api.getComments(post.id);
        setAllComments(res.items);
      } catch {}
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post.can_viewer_reply) return;
    setIsSubmittingComment(true);
    try {
      const created = await api.addComment(post.id, commentText.trim());
      setCommentText('');
      setAllComments((prev) => (prev ? [...prev, created] : [created]));
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      pushToast((err as Error).message || 'Could not post comment', 'rose');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePinComment = async (commentId: string) => {
    try {
      const updated = await api.pinComment(commentId);
      setAllComments((prev) =>
        prev
          ? prev
              .map((c) => (c.id === updated.id ? updated : c))
              .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))
          : null
      );
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      pushToast(updated.is_pinned ? 'Comment pinned to top' : 'Comment unpinned', 'cobalt');
    } catch (err) {
      pushToast((err as Error).message || 'Failed to pin comment', 'rose');
    }
  };

  const handleShareToConversation = async (conversationId: string, recipientName: string) => {
    setShareOpen(false);
    try {
      await api.sendMessage(conversationId, {
        client_msg_id: generateClientUuid(),
        content: `Shared a post by @${post.author.username}`,
        shared_post_id: post.id,
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      pushToast(`Sent post to ${recipientName} in Messages`, 'emerald');
    } catch {
      pushToast('Failed to share post', 'rose');
    }
  };

  const handleVotePoll = async (optionId: string) => {
    try {
      await api.votePostPoll(post.id, optionId);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch {}
  };

  const handleUpdateSafety = async (patch: {
    hide_like_count?: boolean;
    reply_policy?: 'everyone' | 'mutuals';
    is_pinned?: boolean;
  }) => {
    setMenuOpen(false);
    try {
      await api.updatePostSettings(post.id, patch);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      pushToast('Post settings updated', 'cobalt');
    } catch {}
  };

  const renderRichCaption = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((tok, i) => {
      if (tok.startsWith('@') && tok.length > 1) {
        const clean = tok.slice(1).replace(/[.,!?;:]+$/, '');
        return (
          <button
            key={i}
            type="button"
            onClick={() => navigateToProfile(clean)}
            className="text-[#2563EB] dark:text-[#60A5FA] font-medium hover:underline cursor-pointer"
          >
            {tok}
          </button>
        );
      }
      if (tok.startsWith('#') && tok.length > 1) {
        const clean = tok.slice(1).replace(/[.,!?;:]+$/, '');
        return (
          <button
            key={i}
            type="button"
            onClick={() => navigateToExploreTag(clean)}
            className="text-[#2563EB] dark:text-[#60A5FA] font-medium hover:underline cursor-pointer"
          >
            {tok}
          </button>
        );
      }
      return <React.Fragment key={i}>{tok}</React.Fragment>;
    });
  };

  const displayedComments = commentsOpen ? allComments ?? post.top_comments : post.top_comments;

  return (
    <article className="rounded-2xl border border-divider bg-surface-elevated overflow-visible mb-6 shadow-2xs transition-colors">
      {/* Card Header */}
      <header className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Single or Dual Co-Author Avatar Stack */}
          <div className="relative flex items-center shrink-0">
            <ProfileHovercard profile={post.author}>
              <StoryAvatar
                src={post.author.avatar_url}
                alt={post.author.display_name}
                size="md"
                hasActiveStory={post.author.has_active_story}
                hasUnseenStory={post.author.has_unseen_story}
                hasCloseFriendStory={post.author.has_close_friend_story}
                segmentsCount={post.author.story_segments_count}
                seenSegmentsCount={post.author.story_seen_segments}
                isOnline={post.author.is_online}
                onClick={() => handleOpenAuthorStoryOrProfile(post.author)}
              />
            </ProfileHovercard>

            {post.co_author && (
              <div className="-ml-3 ring-2 ring-[var(--surface-elevated)] rounded-full">
                <ProfileHovercard profile={post.co_author}>
                  <StoryAvatar
                    src={post.co_author.avatar_url}
                    alt={post.co_author.display_name}
                    size="sm"
                    hasActiveStory={post.co_author.has_active_story}
                    hasUnseenStory={post.co_author.has_unseen_story}
                    hasCloseFriendStory={post.co_author.has_close_friend_story}
                    onClick={() => handleOpenAuthorStoryOrProfile(post.co_author!)}
                  />
                </ProfileHovercard>
              </div>
            )}
          </div>

          {/* Author Attribution & Context Chips */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <ProfileHovercard profile={post.author}>
                <button
                  type="button"
                  onClick={() => navigateToProfile(post.author.username)}
                  className="font-semibold text-sm text-primary-ink hover:underline cursor-pointer truncate"
                >
                  {post.author.display_name}
                </button>
              </ProfileHovercard>

              {post.co_author && (
                <>
                  <span className="text-xs text-muted-ink">&amp;</span>
                  <ProfileHovercard profile={post.co_author}>
                    <button
                      type="button"
                      onClick={() => navigateToProfile(post.co_author!.username)}
                      className="font-semibold text-sm text-primary-ink hover:underline cursor-pointer truncate"
                    >
                      {post.co_author.display_name}
                    </button>
                  </ProfileHovercard>
                </>
              )}

              {post.author.relationship_state === 'mutual_friends' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mutual-pill">
                  <Sparkles className="w-2.5 h-2.5 text-violet-500" />
                  Mutual
                </span>
              )}

              <span className="text-xs text-muted-ink">@{post.author.username}</span>
              <span className="text-xs text-muted-ink font-mono-tabular">
                • {formatRelativeTime(post.created_at)}
              </span>
            </div>

            {(post.location || post.audio_title) && (
              <div className="flex items-center gap-2.5 text-[11px] text-muted-ink mt-0.5 truncate">
                {post.location && (
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {post.location}
                  </span>
                )}
                {post.audio_title && (
                  <span className="inline-flex items-center gap-1 truncate">
                    <Music2 className="w-3 h-3 shrink-0 text-[#2563EB]" />
                    {post.audio_title}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Audience Badge & Options Menu */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {post.is_pinned && (
            <span
              title="Pinned to profile"
              className="p-1 rounded-full bg-amber-500/10 text-amber-500"
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </span>
          )}

          {post.audience === 'close_friends' ? (
            <span
              title="Close Friends Only"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold"
            >
              <Star className="w-2.5 h-2.5 fill-current" /> Close Friends
            </span>
          ) : post.audience === 'followers' ? (
            <span title="Followers Only" className="text-muted-ink p-1">
              <Users className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span title="Public Post" className="text-muted-ink p-1">
              <Globe className="w-3.5 h-3.5" />
            </span>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-full hover:bg-surface-secondary text-muted-ink hover:text-primary-ink transition-colors cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-surface-elevated border border-divider shadow-2xl py-1.5 z-40">
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSafety({ hide_like_count: !post.hide_like_count })
                    }
                    className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-surface-secondary cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {post.hide_like_count ? 'Show public like count' : 'Hide public like count'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSafety({
                        reply_policy:
                          post.reply_policy === 'mutuals' ? 'everyone' : 'mutuals',
                      })
                    }
                    className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-surface-secondary cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                    <span>
                      {post.reply_policy === 'mutuals'
                        ? 'Allow everyone to reply'
                        : 'Restrict replies to Mutuals'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateSafety({ is_pinned: !post.is_pinned })}
                    className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-surface-secondary cursor-pointer"
                  >
                    <Pin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{post.is_pinned ? 'Unpin from Profile' : 'Pin to Profile Bento'}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigateToProfile(post.author.username);
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-surface-secondary cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-muted-ink" />
                <span>View @{post.author.username}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Media Carousel Stage */}
      {mediaCount > 0 && activeMedia && (
        <div className="px-3">
          <div
            onDoubleClick={handleDoubleTapMedia}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (dx < -40 && slideIdx < mediaCount - 1) setSlideIdx((i) => i + 1);
              else if (dx > 40 && slideIdx > 0) setSlideIdx((i) => i - 1);
            }}
            className={cn(
              'relative w-full rounded-xl overflow-hidden bg-surface-secondary select-none group',
              compact ? 'aspect-square' : isWideAspect
            )}
          >
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                controls
                playsInline
                loop
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia.alt || post.caption}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}

            {/* Top-right slide counter */}
            {mediaCount > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full glass-hud text-white font-mono-tabular text-[11px] font-semibold">
                {slideIdx + 1} / {mediaCount}
              </div>
            )}

            {/* Left / Right carousel chevrons */}
            {mediaCount > 1 && slideIdx > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIdx((i) => i - 1);
                }}
                aria-label="Previous slide"
                className="opacity-0 group-hover:opacity-100 absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-hud text-white flex items-center justify-center transition-opacity cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {mediaCount > 1 && slideIdx < mediaCount - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIdx((i) => i + 1);
                }}
                aria-label="Next slide"
                className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-hud text-white flex items-center justify-center transition-opacity cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Bottom pagination dots */}
            {mediaCount > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-sm">
                {post.media_items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIdx(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      'rounded-full transition-all cursor-pointer',
                      idx === slideIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/45'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Bottom-left Tagged Users Pill + Interactive Pins */}
            {activeMedia.tagged_users && activeMedia.tagged_users.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTags((v) => !v);
                  }}
                  className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full glass-hud text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer hover:bg-black/80"
                >
                  <UserIcon className="w-3 h-3" />
                  <span>{activeMedia.tagged_users.length} people</span>
                </button>

                {showTags &&
                  activeMedia.tagged_users.map((tag) => (
                    <button
                      key={tag.username}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProfile(tag.username);
                      }}
                      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full glass-hud text-white text-[11px] font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer animate-msg-spring"
                    >
                      @{tag.username}
                    </button>
                  ))}
              </>
            )}

            {/* Double-Tap Heart Burst & Particle Ring */}
            {heartBursts.map((b) => (
              <React.Fragment key={b.id}>
                <span
                  style={{ left: b.x, top: b.y }}
                  className="absolute w-24 h-24 rounded-full border-2 border-[#F43F5E] pointer-events-none animate-particle-ring"
                />
                <div
                  style={{ left: b.x, top: b.y }}
                  className="absolute pointer-events-none animate-heart-burst drop-shadow-2xl"
                >
                  <Heart className="w-20 h-20 text-[#F43F5E] fill-[#F43F5E]" />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Quote Card / Voice Note / Poll Modules */}
      <div className="px-4 pt-3 space-y-2.5">
        {post.quote_card && (
          <div className="rounded-xl border border-divider bg-surface-secondary p-3.5 border-l-4 border-l-[#2563EB]">
            <p className="font-display font-semibold text-sm text-primary-ink italic">
              “{post.quote_card.text}”
            </p>
            {post.quote_card.attribution && (
              <p className="text-[11px] text-muted-ink mt-1 font-mono-tabular">
                — {post.quote_card.attribution}
              </p>
            )}
          </div>
        )}

        {post.voice_note && (
          <AudioWaveformPlayer
            url={post.voice_note.url}
            durationMs={post.voice_note.duration_ms}
            waveform={post.voice_note.waveform}
            title={post.voice_note.title}
            variant="post"
          />
        )}

        {post.poll && (
          <div className="rounded-xl border border-divider bg-surface-secondary p-3.5">
            <p className="text-xs font-bold text-primary-ink mb-2.5">{post.poll.question}</p>
            <div className="space-y-1.5">
              {post.poll.options.map((opt) => {
                const total = post.poll!.options.reduce((a, b) => a + b.votes, 0);
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                const voted = Boolean(post.poll!.user_voted_option_id);
                const isMine = post.poll!.user_voted_option_id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleVotePoll(opt.id)}
                    className={cn(
                      'relative w-full rounded-lg overflow-hidden px-3 py-2 text-left text-xs font-medium border transition-colors cursor-pointer',
                      isMine
                        ? 'border-[#2563EB] text-primary-ink'
                        : 'border-divider bg-surface-elevated text-primary-ink hover:border-[#2563EB]/50'
                    )}
                  >
                    {voted && (
                      <span
                        className={cn(
                          'absolute inset-y-0 left-0 transition-all duration-500',
                          isMine ? 'bg-[#2563EB]/20' : 'bg-black/5 dark:bg-white/5'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-between">
                      <span>{opt.label}</span>
                      {voted && <span className="font-mono-tabular font-semibold">{pct}%</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Action Bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggleLike.mutate(post.id)}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-transform active:scale-90 cursor-pointer"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                post.is_liked
                  ? 'text-[#F43F5E] fill-[#F43F5E]'
                  : 'text-primary-ink hover:text-[#F43F5E]'
              )}
            />
            {post.hide_like_count ? (
              <span className="text-xs text-muted-ink">Liked</span>
            ) : (
              <span className="font-mono-tabular text-xs text-primary-ink">
                {formatCompactCount(post.likes_count)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={loadComments}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-mono-tabular text-xs">
              {formatCompactCount(post.comments_count)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => pushToast('Reposted to your followers stream', 'cobalt')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink hover:text-emerald-500 transition-colors cursor-pointer"
          >
            <Repeat2 className="w-5 h-5" />
            <span className="font-mono-tabular text-xs">
              {formatCompactCount(post.reposts_count)}
            </span>
          </button>

          {/* Direct Share Quick Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-primary-ink hover:text-[#2563EB] transition-colors cursor-pointer"
              title="Send to Friend in DM"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>

            {shareOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-60 rounded-2xl bg-surface-elevated border border-divider shadow-2xl p-2 z-40 animate-msg-spring">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-ink">
                  Send to Friend
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(convData?.conversations || []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleShareToConversation(c.id, c.participant.display_name)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-secondary text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={c.participant.avatar_url}
                        alt={c.participant.display_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-primary-ink truncate">
                          {c.participant.display_name}
                        </div>
                        <div className="text-[10px] text-muted-ink truncate">
                          @{c.participant.username}
                        </div>
                      </div>
                      <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookmark + Collection Picker */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleBookmark.mutate({ postId: post.id })}
            onContextMenu={(e) => {
              e.preventDefault();
              setCollectionOpen((v) => !v);
            }}
            className="p-1 text-primary-ink hover:text-amber-500 transition-colors cursor-pointer"
            title="Bookmark (Right-click to choose collection)"
          >
            <Bookmark
              className={cn(
                'w-5 h-5 transition-colors',
                post.is_bookmarked && 'text-amber-500 fill-amber-500'
              )}
            />
          </button>

          {collectionsData && collectionsData.collections.length > 0 && (
            <button
              type="button"
              onClick={() => setCollectionOpen((v) => !v)}
              className="text-[10px] font-medium text-muted-ink hover:text-primary-ink cursor-pointer"
              title="Assign to Saved Collection"
            >
              ▾
            </button>
          )}

          {collectionOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-surface-elevated border border-divider shadow-2xl p-1.5 z-40">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-ink">
                Save to Collection
              </div>
              {(collectionsData?.collections || []).map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    toggleBookmark.mutate({ postId: post.id, collection_id: col.id });
                    setCollectionOpen(false);
                    pushToast(`Saved to "${col.name}"`, 'cobalt');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-surface-secondary flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{col.name}</span>
                  <span className="text-[10px] text-muted-ink">
                    {col.is_public ? 'Public' : 'Private'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Caption & Inline Discourse Footer */}
      <footer className="px-4 pb-4 space-y-2.5">
        {post.hide_like_count && post.likes_count > 0 && (
          <p className="text-xs text-muted-ink">
            Liked by <strong className="text-primary-ink">@elena_rostova</strong> and{' '}
            <strong className="text-primary-ink">others</strong>
          </p>
        )}

        {post.caption && (
          <div className="text-[14px] text-primary-ink leading-relaxed">
            <button
              type="button"
              onClick={() => navigateToProfile(post.author.username)}
              className="font-semibold mr-1.5 hover:underline cursor-pointer"
            >
              {post.author.username}
            </button>
            <span className={!isCaptionExpanded && post.caption.length > 150 ? 'line-clamp-2' : ''}>
              {renderRichCaption(post.caption)}
            </span>
            {post.caption.length > 150 && !isCaptionExpanded && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded(true)}
                className="text-xs text-muted-ink hover:text-primary-ink font-medium ml-1 cursor-pointer"
              >
                …more
              </button>
            )}
          </div>
        )}

        {/* Inline Pinned / Top Comments */}
        {displayedComments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {displayedComments.map((cmt) => (
              <div key={cmt.id} className="flex items-start justify-between gap-2 text-xs group">
                <div className="min-w-0 leading-snug">
                  {cmt.is_pinned && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500 mr-1.5">
                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateToProfile(cmt.author.username)}
                    className="font-semibold text-primary-ink hover:underline mr-1.5 cursor-pointer"
                  >
                    {cmt.author.username}
                  </button>
                  <span className="text-primary-ink/90">{cmt.content}</span>
                </div>

                {isAuthor && commentsOpen && (
                  <button
                    type="button"
                    onClick={() => handlePinComment(cmt.id)}
                    title={cmt.is_pinned ? 'Unpin comment' : 'Pin comment (max 3)'}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-secondary transition-opacity shrink-0 cursor-pointer',
                      cmt.is_pinned ? 'opacity-100 text-amber-500' : 'text-muted-ink'
                    )}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {post.comments_count > 2 && !commentsOpen && (
          <button
            type="button"
            onClick={loadComments}
            className="text-xs text-muted-ink hover:text-primary-ink font-medium cursor-pointer"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Compact Comment Input */}
        {post.can_viewer_reply ? (
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center gap-2 pt-1.5 border-t border-divider/60"
          >
            {meData?.user && (
              <img
                src={meData.user.avatar_url}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            )}
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                post.reply_policy === 'mutuals'
                  ? 'Add a mutuals-only reply...'
                  : 'Add a comment...'
              }
              className="flex-1 bg-transparent text-xs text-primary-ink placeholder:text-muted-ink outline-none py-1"
            />
            {commentText.trim() && (
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
              >
                Post
              </button>
            )}
          </form>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-ink pt-1.5 border-t border-divider/60">
            <Lock className="w-3 h-3" />
            <span>Replies limited to mutual friends of @{post.author.username}</span>
          </div>
        )}
      </footer>
    </article>
  );
};

