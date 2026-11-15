import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Reply,
  SmilePlus,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedPost, Message, ProfileSummary } from '../../types/social';
import { AudioWaveformPlayer } from '../common/AudioWaveformPlayer';
import { useToggleLike } from '../../hooks/useSocialQueries';
import { api } from '../../lib/api';
import { useAppStore } from '../../stores/useAppStore';
import { cn, formatRelativeTime } from '../../lib/utils';

const REACTION_CHOICES = ['❤️', '😂', '🔥', '👏', '😮'] as const;

const InlineSharedPostCard: React.FC<{ post: FeedPost }> = ({ post }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [burst, setBurst] = useState(false);
  const toggleLike = useToggleLike();
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);

  const media = post.media_items[slideIdx];

  const handleDoubleTap = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), 750);
    if (!post.is_liked) toggleLike.mutate(post.id);
  };

  return (
    <div className="w-64 rounded-2xl border border-divider bg-surface-elevated text-primary-ink overflow-hidden shadow-md">
      <div className="px-3 py-2 flex items-center justify-between border-b border-divider">
        <button
          type="button"
          onClick={() => navigateToProfile(post.author.username)}
          className="flex items-center gap-2 min-w-0 cursor-pointer"
        >
          <img
            src={post.author.avatar_url}
            alt={post.author.username}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs font-bold truncate hover:underline">
            @{post.author.username}
          </span>
        </button>
        {post.media_items.length > 1 && (
          <span className="font-mono-tabular text-[10px] text-muted-ink">
            {slideIdx + 1}/{post.media_items.length}
          </span>
        )}
      </div>

      {media && (
        <div
          onDoubleClick={handleDoubleTap}
          className="relative aspect-[4/3] bg-black overflow-hidden select-none group cursor-pointer"
        >
          {media.type === 'video' ? (
            <video
              src={media.url}
              controls
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={media.url}
              alt={media.alt || post.caption}
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}

          {post.media_items.length > 1 && slideIdx > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((i) => i - 1);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass-hud text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {post.media_items.length > 1 && slideIdx < post.media_items.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((i) => i + 1);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass-hud text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {burst && (
            <div className="absolute left-1/2 top-1/2 pointer-events-none animate-heart-burst">
              <Heart className="w-14 h-14 text-[#F43F5E] fill-[#F43F5E]" />
            </div>
          )}
        </div>
      )}

      <div className="p-2.5 space-y-1.5">
        <p className="text-xs line-clamp-2 text-primary-ink/90">{post.caption}</p>
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => toggleLike.mutate(post.id)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
          >
            <Heart
              className={cn(
                'w-3.5 h-3.5',
                post.is_liked ? 'text-[#F43F5E] fill-[#F43F5E]' : 'text-muted-ink'
              )}
            />
            {!post.hide_like_count && (
              <span className="font-mono-tabular text-muted-ink">{post.likes_count}</span>
            )}
          </button>
          <span className="text-[10px] text-muted-ink">Double-tap to react</span>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isLatestReadByRecipient: boolean;
  recipient: ProfileSummary;
  themeAccent?: 'cobalt' | 'sunset' | 'emerald' | 'violet';
  compact?: boolean;
  onReply?: (msg: Message) => void;
}

const ACCENT_CLASSES: Record<string, string> = {
  cobalt: 'outbound-bubble',
  sunset: 'bg-gradient-to-br from-[#F59E0B] via-[#EC4899] to-[#8B5CF6] text-white',
  emerald: 'bg-gradient-to-br from-[#059669] to-[#10B981] text-white',
  violet: 'bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white',
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  isLatestReadByRecipient,
  recipient,
  themeAccent = 'cobalt',
  compact = false,
  onReply,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleReact = async (emoji: string) => {
    setPickerOpen(false);
    try {
      await api.reactToMessage(message.id, emoji);
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversation_id] });
    } catch {}
  };

  const reactionEntries = Object.entries(message.reactions || {}).filter(
    ([, users]) => users.length > 0
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-1 group animate-msg-spring',
        isMine ? 'items-end' : 'items-start'
      )}
    >
      {/* Contextual Story-Reply Snapshot Card */}
      {message.story_snapshot && (
        <div
          className={cn(
            'flex items-center gap-2.5 pl-2.5 border-l-2 border-[#EC4899]/70 mb-0.5',
            isMine && 'flex-row-reverse border-l-0 border-r-2 pl-0 pr-2.5'
          )}
        >
          <div className="relative w-12 h-20 rounded-xl overflow-hidden border border-divider bg-black shrink-0 shadow-sm">
            <img
              src={message.story_snapshot.media_url}
              alt="Story snapshot"
              className="w-full h-full object-cover"
            />
            {message.story_snapshot.expired && (
              <span className="absolute inset-x-0 bottom-0 bg-black/75 text-[8px] text-white/80 text-center py-0.5 font-mono-tabular">
                Archive
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-ink max-w-[170px]">
            <div className="font-semibold text-primary-ink flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#EC4899]" />
              <span>Replied to story</span>
            </div>
            {message.story_snapshot.caption && (
              <p className="line-clamp-2 opacity-80 mt-0.5">{message.story_snapshot.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Quote-Reply Reference */}
      {message.reply_to_message && (
        <div
          className={cn(
            'px-2.5 py-1 rounded-xl bg-surface-secondary border border-divider text-[11px] text-muted-ink max-w-[240px] truncate',
            isMine ? 'mr-1' : 'ml-1'
          )}
        >
          <span className="font-semibold text-primary-ink">
            {message.reply_to_message.sender_name}:
          </span>{' '}
          {message.reply_to_message.content}
        </div>
      )}

      {/* Playable Shared Feed Post Card */}
      {message.shared_post && (
        <div className="my-0.5">
          <InlineSharedPostCard post={message.shared_post} />
        </div>
      )}

      {/* Main Message Bubble + Hover Reaction Controls */}
      {(message.content || message.media_url) && (
        <div
          className={cn(
            'relative flex items-center gap-1.5 max-w-[85%]',
            isMine ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <div
            onDoubleClick={() => handleReact('❤️')}
            className={cn(
              'relative rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-2xs select-text',
              compact && 'text-xs px-3 py-1.5',
              isMine
                ? ACCENT_CLASSES[themeAccent] || 'outbound-bubble'
                : 'bg-surface-secondary border border-divider text-primary-ink'
            )}
          >
            {message.media_url && message.media_type === 'audio' && (
              <div className="min-w-[220px] sm:min-w-[250px]">
                <AudioWaveformPlayer
                  url={message.media_url}
                  durationMs={message.voice_duration_ms || 4000}
                  waveform={message.voice_waveform || []}
                  variant={isMine ? 'dm-outbound' : 'dm-inbound'}
                />
              </div>
            )}

            {message.media_url && message.media_type === 'image' && (
              <img
                src={message.media_url}
                alt="Attachment"
                className="rounded-xl max-h-56 object-cover mb-1.5"
              />
            )}

            {message.content && message.media_type !== 'audio' && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {/* Overlapping Emoji Reaction Pills */}
            {reactionEntries.length > 0 && (
              <div
                className={cn(
                  'absolute -bottom-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-elevated border border-divider shadow-md text-[11px]',
                  isMine ? 'right-2' : 'left-2'
                )}
              >
                {reactionEntries.map(([emoji, users]) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReact(emoji)}
                    className="inline-flex items-center gap-0.5 text-primary-ink cursor-pointer"
                  >
                    <span>{emoji}</span>
                    {users.length > 1 && (
                      <span className="font-mono-tabular text-[10px] font-bold">
                        {users.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hover Reply & Emoji Quick Bar */}
          {!compact && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity relative">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="p-1 rounded-full hover:bg-surface-secondary text-muted-ink hover:text-primary-ink cursor-pointer"
                title="React"
              >
                <SmilePlus className="w-3.5 h-3.5" />
              </button>
              {onReply && (
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  className="p-1 rounded-full hover:bg-surface-secondary text-muted-ink hover:text-primary-ink cursor-pointer"
                  title="Quote reply"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
              )}

              {pickerOpen && (
                <div className="absolute bottom-full mb-1 left-0 flex items-center gap-1 px-2 py-1 rounded-full bg-surface-elevated border border-divider shadow-xl z-30">
                  {REACTION_CHOICES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handleReact(e)}
                      className="text-sm hover:scale-125 transition-transform cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timestamp & Optimistic Delivery / Read Indicator */}
      <div
        className={cn(
          'flex items-center gap-1.5 text-[10px] text-muted-ink font-mono-tabular px-1',
          reactionEntries.length > 0 && 'mt-2'
        )}
      >
        <span>{formatRelativeTime(message.created_at)}</span>
        {isMine && (
          <span className="inline-flex items-center gap-0.5">
            {message.status === 'sending' ? (
              <Clock className="w-2.5 h-2.5" />
            ) : message.read_at ? (
              <>
                <CheckCheck className="w-3 h-3 text-[#2563EB]" />
                {isLatestReadByRecipient && (
                  <img
                    src={recipient.avatar_url}
                    alt={`Seen by ${recipient.display_name}`}
                    title={`Seen by ${recipient.display_name}`}
                    className="w-3.5 h-3.5 rounded-full object-cover ml-0.5 ring-1 ring-divider"
                  />
                )}
              </>
            ) : (
              <Check className="w-3 h-3" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

