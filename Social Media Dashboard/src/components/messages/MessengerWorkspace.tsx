import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  BellOff,
  Check,
  Eye,
  Heart,
  Image as ImageIcon,
  Info,
  Mic,
  Phone,
  Search,
  Smile,
  Sparkles,
  Square,
  Video,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useConversations,
  useDiscovery,
  useMe,
  useMessagesInfinite,
  useSendMessage,
} from '../../hooks/useSocialQueries';
import { useMessengerStore } from '../../stores/useMessengerStore';
import { useAppStore } from '../../stores/useAppStore';
import { api, getActiveUserId } from '../../lib/api';
import { StoryAvatar } from '../common/StoryAvatar';
import { MessageBubble } from './MessageBubble';
import { cn, fileToDataUrl, formatRelativeTime } from '../../lib/utils';
import type { Message } from '../../types/social';

type InboxFilter = 'all' | 'unread' | 'close_friends' | 'requests';

const COMPOSER_EMOJIS = ['😊', '🔥', '❤️', '😂', '👏', '✨', '🎧', '☕'] as const;

const THEME_SWATCHES: Array<{
  id: 'cobalt' | 'sunset' | 'emerald' | 'violet';
  label: string;
  bg: string;
}> = [
  { id: 'cobalt', label: 'Cobalt', bg: 'bg-[#2563EB]' },
  { id: 'sunset', label: 'Sunset', bg: 'bg-gradient-to-r from-[#F59E0B] to-[#EC4899]' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-[#10B981]' },
  { id: 'violet', label: 'Violet', bg: 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899]' },
];

export const MessengerWorkspace: React.FC = () => {
  const { data: meData } = useMe();
  const { data: convData } = useConversations();
  const { data: discoveryData } = useDiscovery();
  const {
    activeStudioConversationId,
    setActiveStudioConversation,
    typingByConversation,
    presenceByUser,
    sendTyping,
  } = useMessengerStore();
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const pushToast = useAppStore((s) => s.pushToast);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<InboxFilter>('all');
  const [search, setSearch] = useState('');
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeCallMode, setActiveCallMode] = useState<'audio' | 'video' | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStartRef = useRef<number>(0);
  const typingTimerRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allConversations = convData?.conversations || [];
  const activeUserId = getActiveUserId();
  const me = meData?.user;

  const filteredConversations = allConversations.filter((c) => {
    if (filter === 'requests') return c.is_request;
    if (c.is_request) return false;
    if (filter === 'unread' && c.unread_count === 0) return false;
    if (filter === 'close_friends' && !c.participant.is_close_friend) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        c.participant.display_name.toLowerCase().includes(q) ||
        c.participant.username.toLowerCase().includes(q) ||
        (c.last_message?.content || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeConv =
    allConversations.find((c) => c.id === activeStudioConversationId) ||
    filteredConversations[0] ||
    allConversations[0] ||
    null;

  const { data: msgPages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessagesInfinite(activeConv?.id || null);
  const sendMessage = useSendMessage(activeConv?.id || null);

  const messages = msgPages ? [...msgPages.pages].reverse().flatMap((p) => p.items) : [];
  const latestReadId = [...messages]
    .reverse()
    .find((m) => m.sender_id === activeUserId && m.read_at)?.id;

  const activeConvId = activeConv?.id;
  const activeConvUnread = activeConv?.unread_count || 0;

  useEffect(() => {
    if (activeConvId && activeConvUnread > 0) {
      api
        .markConversationRead(activeConvId)
        .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))
        .catch(() => {});
    }
  }, [activeConvId, activeConvUnread, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.id, messages.length]);

  const handleDraftChange = (val: string) => {
    setDraft(val);
    if (!activeConv) return;
    sendTyping(activeConv.id, val.length > 0);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      sendTyping(activeConv.id, false);
    }, 1500);
  };

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.trim() || !activeConv) return;
    sendTyping(activeConv.id, false);
    sendMessage.mutate({
      content: draft.trim(),
      reply_to_message_id: replyTo?.id ?? null,
    });
    setDraft('');
    setReplyTo(null);
  };

  const handleSendHeart = () => {
    if (!activeConv) return;
    sendMessage.mutate({ content: '❤️' });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    const dataUrl = await fileToDataUrl(file);
    const uploaded = await api.uploadMedia(dataUrl, file.name, file.type);
    sendMessage.mutate({
      content: '',
      media_url: uploaded.url,
      media_type: 'image',
    });
  };

  const handleVoiceClip = async () => {
    if (!activeConv) return;
    if (isRecording) {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      } else {
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recStartRef.current = Date.now();
      recorderRef.current = rec;
      setIsRecording(true);

      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const duration = Math.max(1500, Math.min(30000, Date.now() - recStartRef.current));
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const dataUrl = await fileToDataUrl(blob);
        const uploaded = await api.uploadMedia(dataUrl, 'dm-voice.webm', 'audio/webm');
        sendMessage.mutate({
          content: 'Voice message',
          media_url: uploaded.url,
          media_type: 'audio',
          voice_duration_ms: duration,
          voice_waveform: Array.from({ length: 32 }, () => Math.round(25 + Math.random() * 70)),
        });
      };

      rec.start();
    } catch {
      setIsRecording(false);
      sendMessage.mutate({
        content: 'Voice clip',
        media_url: '/media/voice-maya-note.wav',
        media_type: 'audio',
        voice_duration_ms: 5000,
        voice_waveform: [
          22, 48, 72, 60, 88, 92, 54, 40, 74, 86, 68, 50, 78, 90, 62, 44,
          68, 84, 56, 42, 70, 88, 60, 48, 72, 82, 54, 38, 62, 74, 44, 24,
        ],
      });
      pushToast('Microphone unavailable — sent studio voice clip sample', 'cobalt');
    }
  };

  const requestCount = allConversations.filter((c) => c.is_request).length;
  const activeNotes = (discoveryData?.activeFriends || []).filter((p) => p.status_text);

  // Shared media gallery extracted from conversation messages
  const sharedGallery = messages.flatMap((m) => {
    const items: Array<{ id: string; url: string; label: string }> = [];
    if (m.media_url && m.media_type === 'image') {
      items.push({ id: m.id, url: m.media_url, label: 'Photo' });
    }
    if (m.story_snapshot?.media_url) {
      items.push({
        id: `${m.id}-story`,
        url: m.story_snapshot.media_url,
        label: 'Story',
      });
    }
    if (m.shared_post?.media_items[0]?.url) {
      items.push({
        id: `${m.id}-post`,
        url: m.shared_post.media_items[0].url,
        label: 'Post',
      });
    }
    return items;
  });

  const activePresence = activeConv ? presenceByUser[activeConv.participant.id] : null;
  const isRecipientTyping =
    activeConv && (typingByConversation[activeConv.id] || []).length > 0;

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)] my-2 md:my-4 rounded-2xl border border-divider bg-surface-elevated overflow-hidden flex shadow-sm">
      {/* LEFT PANE: Thread Roster (320px) */}
      <aside
        className={cn(
          'w-full md:w-[320px] shrink-0 border-r border-divider flex flex-col bg-surface-elevated',
          mobileShowThread && 'hidden md:flex'
        )}
      >
        <div className="p-4 border-b border-divider space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-primary-ink">Messages</h2>
            <span className="font-mono-tabular text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Live
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-ink absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people or messages... ⌘K"
              className="w-full h-9 rounded-xl bg-surface-secondary border border-divider pl-8 pr-3 text-xs text-primary-ink placeholder:text-muted-ink outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'close_friends', label: 'Close Friends' },
              { id: 'requests', label: `Requests (${requestCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id as InboxFilter)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
                  filter === f.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-surface-secondary text-muted-ink hover:text-primary-ink'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Story Notes Row */}
        {activeNotes.length > 0 && (
          <div className="px-3 py-2.5 border-b border-divider flex items-center gap-3 overflow-x-auto no-scrollbar bg-surface-secondary/35">
            {activeNotes.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() =>
                  api.openConversationWith(friend.id).then(({ id }) => {
                    setActiveStudioConversation(id);
                    setMobileShowThread(true);
                  })
                }
                className="flex flex-col items-center gap-1 shrink-0 w-16 group cursor-pointer"
              >
                <div className="px-2 py-0.5 rounded-full bg-surface-elevated border border-divider text-[9px] text-primary-ink truncate max-w-full shadow-2xs">
                  {friend.status_emoji} {friend.status_text}
                </div>
                <StoryAvatar
                  src={friend.avatar_url}
                  alt={friend.display_name}
                  size="md"
                  isOnline={friend.is_online}
                />
                <span className="text-[10px] text-muted-ink truncate w-full text-center">
                  {friend.display_name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--divider)]/50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-ink">
              No matching conversations.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const selected = activeConv?.id === c.id;
              const p = presenceByUser[c.participant.id];
              const isOnline = p?.isOnline ?? c.participant.is_online;
              const preview = c.last_message?.story_snapshot
                ? `Replied to your story: ${c.last_message.content}`
                : c.last_message?.shared_post
                  ? `Shared a post by @${c.last_message.shared_post.author.username}`
                  : c.last_message?.media_type === 'audio'
                    ? '🎙️ Voice message'
                    : c.last_message?.content || 'Start a conversation';

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveStudioConversation(c.id);
                    setMobileShowThread(true);
                  }}
                  className={cn(
                    'w-full px-3.5 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer',
                    selected
                      ? 'bg-[#2563EB]/10 dark:bg-[#2563EB]/15'
                      : 'hover:bg-surface-secondary/70'
                  )}
                >
                  <StoryAvatar
                    src={c.participant.avatar_url}
                    alt={c.participant.display_name}
                    size="lg"
                    hasActiveStory={c.participant.has_active_story}
                    hasUnseenStory={c.participant.has_unseen_story}
                    hasCloseFriendStory={c.participant.has_close_friend_story}
                    isOnline={isOnline}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-primary-ink truncate">
                        {c.participant.display_name}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-muted-ink shrink-0">
                        {c.last_message
                          ? formatRelativeTime(c.last_message.created_at)
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span
                        className={cn(
                          'text-xs truncate',
                          c.unread_count > 0
                            ? 'font-semibold text-primary-ink'
                            : 'text-muted-ink'
                        )}
                      >
                        {preview}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* CENTER PANE: Active Conversation Stage */}
      <section
        className={cn(
          'flex-1 flex flex-col min-w-0 bg-[var(--canvas)]/35',
          !mobileShowThread && 'hidden md:flex'
        )}
      >
        {activeConv ? (
          <>
            {/* Top Thread Header */}
            <header className="px-4 py-3 border-b border-divider bg-surface-elevated flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 rounded-full hover:bg-surface-secondary cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <StoryAvatar
                  src={activeConv.participant.avatar_url}
                  alt={activeConv.participant.display_name}
                  size="md"
                  hasActiveStory={activeConv.participant.has_active_story}
                  hasUnseenStory={activeConv.participant.has_unseen_story}
                  isOnline={activePresence?.isOnline ?? activeConv.participant.is_online}
                  onClick={() => navigateToProfile(activeConv.participant.username)}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigateToProfile(activeConv.participant.username)}
                      className="font-display font-bold text-sm text-primary-ink hover:underline truncate cursor-pointer"
                    >
                      {activeConv.participant.display_name}
                    </button>
                    {activeConv.participant.relationship_state === 'mutual_friends' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mutual-pill">
                        <Sparkles className="w-2.5 h-2.5 text-violet-500" />
                        Mutual
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-ink truncate">
                    {isRecipientTyping
                      ? 'Typing...'
                      : activePresence?.activity ||
                        (activeConv.participant.is_online
                          ? `Active now • ${activeConv.participant.location || 'Local'}`
                          : `@${activeConv.participant.username}`)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveCallMode('audio')}
                  className="p-2 rounded-full hover:bg-surface-secondary text-muted-ink hover:text-primary-ink transition-colors cursor-pointer"
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCallMode('video')}
                  className="p-2 rounded-full hover:bg-surface-secondary text-muted-ink hover:text-primary-ink transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorOpen((v) => !v)}
                  className={cn(
                    'p-2 rounded-full transition-colors cursor-pointer',
                    inspectorOpen
                      ? 'bg-[#2563EB]/15 text-[#2563EB]'
                      : 'hover:bg-surface-secondary text-muted-ink hover:text-primary-ink'
                  )}
                  title="Toggle Thread Inspector"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Message Request Accept Banner */}
            {activeConv.is_request && (
              <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-primary-ink">
                  Message request from <strong>@{activeConv.participant.username}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    api
                      .updateConversationSettings(activeConv.id, { accept_request: true })
                      .then(() => {
                        queryClient.invalidateQueries({ queryKey: ['conversations'] });
                        pushToast('Accepted message request', 'emerald');
                      });
                  }}
                  className="px-3 py-1 rounded-full bg-[#2563EB] text-white font-semibold cursor-pointer"
                >
                  Accept Request
                </button>
              </div>
            )}

            {/* Message Stream Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {hasNextPage && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-3 py-1 rounded-full bg-surface-elevated border border-divider text-[11px] font-semibold text-muted-ink hover:text-primary-ink cursor-pointer"
                  >
                    {isFetchingNextPage ? 'Loading history...' : 'Load older messages'}
                  </button>
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isMine={m.sender_id === activeUserId}
                  isLatestReadByRecipient={m.id === latestReadId}
                  recipient={activeConv.participant}
                  themeAccent={activeConv.theme_accent}
                  onReply={(msg) => setReplyTo(msg)}
                />
              ))}

              {isRecipientTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-ink px-2 py-1">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce [animation-delay:240ms]" />
                  </span>
                  <span>
                    {activeConv.participant.display_name.split(' ')[0]} is typing...
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Bottom Capsule Composer */}
            <div className="p-3 border-t border-divider bg-surface-elevated">
              {replyTo && (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-surface-secondary border border-divider flex items-center justify-between text-xs">
                  <span className="truncate text-muted-ink">
                    Replying to:{' '}
                    <strong className="text-primary-ink">{replyTo.content || 'Media'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-muted-ink hover:text-primary-ink cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendText}
                className="rounded-2xl border border-divider bg-surface-secondary px-3 py-2 flex items-center gap-2 relative"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-ink hover:text-primary-ink cursor-pointer"
                  title="Attach photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleVoiceClip}
                  className={cn(
                    'p-1.5 rounded-full transition-colors cursor-pointer',
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'hover:bg-black/5 dark:hover:bg-white/10 text-muted-ink hover:text-primary-ink'
                  )}
                  title={isRecording ? 'Stop recording' : 'Record voice clip'}
                >
                  {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent text-sm text-primary-ink placeholder:text-muted-ink outline-none min-w-0"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEmojiMenuOpen((v) => !v)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-ink hover:text-primary-ink cursor-pointer"
                    title="Insert emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  {emojiMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 flex items-center gap-1 px-2 py-1.5 rounded-full bg-surface-elevated border border-divider shadow-xl z-30">
                      {COMPOSER_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            handleDraftChange(draft + em);
                            setEmojiMenuOpen(false);
                          }}
                          className="text-base hover:scale-125 transition-transform cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!draft.trim() ? (
                  <button
                    type="button"
                    onClick={handleSendHeart}
                    className="p-1.5 rounded-full text-[#F43F5E] hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Send quick heart"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
                    aria-label="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-ink">
            Select a thread to begin messaging.
          </div>
        )}
      </section>

      {/* RIGHT PANE: Collapsible Thread Inspector Drawer (280px) */}
      {inspectorOpen && activeConv && (
        <aside className="hidden xl:flex w-[280px] shrink-0 border-l border-divider flex-col bg-surface-elevated overflow-y-auto p-4 space-y-5">
          {/* Profile Overview */}
          <div className="flex flex-col items-center text-center space-y-2 pt-2">
            <StoryAvatar
              src={activeConv.participant.avatar_url}
              alt={activeConv.participant.display_name}
              size="tray"
              hasActiveStory={activeConv.participant.has_active_story}
              hasUnseenStory={activeConv.participant.has_unseen_story}
              isOnline={activePresence?.isOnline ?? activeConv.participant.is_online}
              onClick={() => navigateToProfile(activeConv.participant.username)}
            />
            <div>
              <h3 className="font-display font-bold text-base text-primary-ink">
                {activeConv.participant.display_name}
              </h3>
              <p className="text-xs text-muted-ink">@{activeConv.participant.username}</p>
            </div>
            <button
              type="button"
              onClick={() => navigateToProfile(activeConv.participant.username)}
              className="px-3.5 py-1 rounded-full bg-surface-secondary border border-divider text-xs font-semibold text-primary-ink hover:border-[#2563EB] cursor-pointer"
            >
              View Profile
            </button>
          </div>

          {/* Chat Theme Accent Picker */}
          <div className="space-y-2 pt-3 border-t border-divider">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">
              Chat Theme Accent
            </div>
            <div className="grid grid-cols-4 gap-2">
              {THEME_SWATCHES.map((sw) => {
                const active = activeConv.theme_accent === sw.id;
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => {
                      api
                        .updateConversationSettings(activeConv.id, { theme_accent: sw.id })
                        .then(() =>
                          queryClient.invalidateQueries({ queryKey: ['conversations'] })
                        );
                    }}
                    title={sw.label}
                    className={cn(
                      'h-8 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105',
                      sw.bg,
                      active && 'ring-2 ring-offset-2 ring-[#2563EB] ring-offset-[var(--surface-elevated)]'
                    )}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Notification Switches */}
          <div className="space-y-2.5 pt-3 border-t border-divider text-xs">
            <button
              type="button"
              onClick={() => {
                api
                  .updateConversationSettings(activeConv.id, {
                    is_muted: !activeConv.is_muted,
                  })
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    pushToast(
                      activeConv.is_muted ? 'Unmuted thread alerts' : 'Muted thread alerts',
                      'cobalt'
                    );
                  });
              }}
              className="w-full flex items-center justify-between py-1.5 text-primary-ink cursor-pointer"
            >
              <span className="flex items-center gap-2 font-medium">
                <BellOff className="w-3.5 h-3.5 text-muted-ink" /> Mute notifications
              </span>
              <span
                className={cn(
                  'w-8 h-4 rounded-full transition-colors p-0.5 flex items-center',
                  activeConv.is_muted ? 'bg-[#2563EB] justify-end' : 'bg-surface-secondary justify-start border border-divider'
                )}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </span>
            </button>

            {me && (
              <button
                type="button"
                onClick={() => {
                  api
                    .updateMe({ read_receipts_enabled: !me.read_receipts_enabled })
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['me'] });
                      pushToast(
                        !me.read_receipts_enabled
                          ? 'Read receipts enabled'
                          : 'Read receipts hidden for privacy',
                        'cobalt'
                      );
                    });
                }}
                className="w-full flex items-center justify-between py-1.5 text-primary-ink cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Eye className="w-3.5 h-3.5 text-muted-ink" /> Send read receipts
                </span>
                <span
                  className={cn(
                    'w-8 h-4 rounded-full transition-colors p-0.5 flex items-center',
                    me.read_receipts_enabled
                      ? 'bg-[#10B981] justify-end'
                      : 'bg-surface-secondary justify-start border border-divider'
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                </span>
              </button>
            )}
          </div>

          {/* 3-Column Shared Media, Posts & Stories Gallery */}
          <div className="space-y-2 pt-3 border-t border-divider">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-ink">
              <span>Shared Media & Posts</span>
              <span className="font-mono-tabular">{sharedGallery.length}</span>
            </div>

            {sharedGallery.length === 0 ? (
              <p className="text-xs text-muted-ink py-4 text-center">
                Shared posts & stories appear here.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedGallery.slice(0, 9).map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-divider bg-surface-secondary"
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/65 text-[8px] font-semibold text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Lightweight Call Overlay Modal */}
      {activeCallMode && activeConv && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-surface-elevated border border-divider p-6 text-center space-y-4 shadow-2xl animate-msg-spring">
            <StoryAvatar
              src={activeConv.participant.avatar_url}
              alt={activeConv.participant.display_name}
              size="hero"
              isOnline
              className="mx-auto"
            />
            <div>
              <h3 className="font-display font-bold text-lg text-primary-ink">
                {activeConv.participant.display_name}
              </h3>
              <p className="text-xs text-[#10B981] font-medium mt-0.5">
                Connecting encrypted {activeCallMode} channel...
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveCallMode(null)}
              className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg cursor-pointer"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
