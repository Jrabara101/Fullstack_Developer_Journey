import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Send } from 'lucide-react';
import {
  useConversations,
  useMessagesInfinite,
  useSendMessage,
} from '../../hooks/useSocialQueries';
import { useMessengerStore } from '../../stores/useMessengerStore';
import { useAppStore } from '../../stores/useAppStore';
import { api, getActiveUserId } from '../../lib/api';
import { StoryAvatar } from '../common/StoryAvatar';
import { MessageBubble } from './MessageBubble';
import { cn } from '../../lib/utils';

export const FloatingDmDock: React.FC = () => {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const {
    isDockOpen,
    toggleDock,
    setDockOpen,
    activeDockConversationId,
    openQuickChat,
    setActiveStudioConversation,
    typingByConversation,
    sendTyping,
    presenceByUser,
  } = useMessengerStore();

  const { data: convData } = useConversations();
  const conversations = (convData?.conversations || []).filter((c) => !c.is_request);
  const totalUnread = convData?.totalUnread || 0;

  const currentConv =
    conversations.find((c) => c.id === activeDockConversationId) || conversations[0] || null;

  const { data: msgPages } = useMessagesInfinite(isDockOpen ? currentConv?.id || null : null);
  const sendMessage = useSendMessage(currentConv?.id || null);

  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const messages = msgPages ? [...msgPages.pages].reverse().flatMap((p) => p.items) : [];
  const activeUserId = getActiveUserId();
  const currentConvId = currentConv?.id;
  const currentConvUnread = currentConv?.unread_count || 0;

  useEffect(() => {
    if (isDockOpen && currentConvId && currentConvUnread > 0) {
      api.markConversationRead(currentConvId).catch(() => {});
    }
  }, [isDockOpen, currentConvId, currentConvUnread]);

  useEffect(() => {
    if (isDockOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isDockOpen, messages.length]);

  if (activeView === 'messages' || conversations.length === 0) return null;

  const handleInputChange = (val: string) => {
    setDraft(val);
    if (!currentConv) return;
    sendTyping(currentConv.id, val.length > 0);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      sendTyping(currentConv.id, false);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !currentConv) return;
    sendTyping(currentConv.id, false);
    sendMessage.mutate({ content: draft.trim() });
    setDraft('');
  };

  const latestReadId = [...messages]
    .reverse()
    .find((m) => m.sender_id === activeUserId && m.read_at)?.id;

  const isTyping =
    currentConv && (typingByConversation[currentConv.id] || []).length > 0;

  const presence = currentConv ? presenceByUser[currentConv.participant.id] : null;

  return (
    <div className="hidden md:block fixed bottom-0 right-6 z-50">
      {!isDockOpen ? (
        /* Collapsed Dock Pill (w-72 h-12) */
        <button
          type="button"
          onClick={toggleDock}
          className="w-72 h-12 rounded-t-2xl bg-surface-elevated border border-b-0 border-divider shadow-2xl px-4 flex items-center justify-between hover:bg-surface-secondary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center -space-x-2">
              {conversations.slice(0, 3).map((c) => (
                <img
                  key={c.id}
                  src={c.participant.avatar_url}
                  alt={c.participant.display_name}
                  className="w-6 h-6 rounded-full ring-2 ring-[var(--surface-elevated)] object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-primary-ink truncate">
              Messages{' '}
              {totalUnread > 0 && (
                <span className="font-mono-tabular text-[#F43F5E]">({totalUnread} unread)</span>
              )}
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-muted-ink shrink-0" />
        </button>
      ) : (
        /* Expanded Quick-Chat Drawer (360 x 480) */
        <div className="w-[360px] h-[480px] rounded-t-2xl bg-surface-elevated border border-b-0 border-divider shadow-2xl flex flex-col overflow-hidden animate-msg-spring">
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-divider flex items-center justify-between bg-surface-elevated">
            {currentConv && (
              <div className="flex items-center gap-2.5 min-w-0">
                <StoryAvatar
                  src={currentConv.participant.avatar_url}
                  alt={currentConv.participant.display_name}
                  size="sm"
                  isOnline={presence?.isOnline ?? currentConv.participant.is_online}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-ink truncate">
                    {currentConv.participant.display_name}
                  </div>
                  <div className="text-[10px] text-muted-ink truncate">
                    {presence?.activity ||
                      (currentConv.participant.is_online ? 'Active now' : 'Offline')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (currentConv) setActiveStudioConversation(currentConv.id);
                  setDockOpen(false);
                  setActiveView('messages');
                }}
                title="Expand into Full Messenger Studio"
                className="p-1.5 rounded-lg hover:bg-surface-secondary text-muted-ink hover:text-primary-ink cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleDock}
                title="Collapse Quick Chat"
                className="p-1.5 rounded-lg hover:bg-surface-secondary text-muted-ink hover:text-primary-ink cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Thread Chips */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-divider overflow-x-auto no-scrollbar bg-surface-secondary/50">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openQuickChat(c.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border transition-colors cursor-pointer',
                  currentConv?.id === c.id
                    ? 'bg-surface-elevated border-[#2563EB] text-primary-ink'
                    : 'bg-transparent border-transparent text-muted-ink hover:text-primary-ink'
                )}
              >
                <span>{c.participant.display_name.split(' ')[0]}</span>
                {c.unread_count > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                )}
              </button>
            ))}
          </div>

          {/* Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {currentConv &&
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isMine={m.sender_id === activeUserId}
                  isLatestReadByRecipient={m.id === latestReadId}
                  recipient={currentConv.participant}
                  themeAccent={currentConv.theme_accent}
                  compact
                />
              ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-ink px-2">
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-ink animate-bounce [animation-delay:240ms]" />
                </span>
                <span>{currentConv?.participant.display_name.split(' ')[0]} is typing...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Compact Composer */}
          <form
            onSubmit={handleSend}
            className="p-2.5 border-t border-divider flex items-center gap-2 bg-surface-elevated"
          >
            <input
              value={draft}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Message ${currentConv?.participant.display_name.split(' ')[0] || ''}...`}
              className="flex-1 h-9 rounded-full bg-surface-secondary border border-divider px-3.5 text-xs text-primary-ink placeholder:text-muted-ink outline-none focus:border-[#2563EB]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="w-9 h-9 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
