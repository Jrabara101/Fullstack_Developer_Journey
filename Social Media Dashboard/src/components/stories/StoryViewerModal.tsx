import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Music2,
  Pause,
  Play,
  Plus,
  Send,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useStoryPlayerStore } from '../../stores/useStoryPlayerStore';
import { useAppStore } from '../../stores/useAppStore';
import { useMessengerStore } from '../../stores/useMessengerStore';
import { api, getActiveUserId } from '../../lib/api';
import { cn, formatRelativeTime, generateClientUuid } from '../../lib/utils';
import type { StorySlide } from '../../types/social';

const QUICK_REACTIONS = ['🔥', '😍', '👏', '😂', '😮', '❤️'] as const;

export const StoryViewerModal: React.FC = () => {
  const {
    isOpen,
    isHighlightMode,
    highlightTitle,
    authorQueue,
    activeAuthorIndex,
    activeSlideIndex,
    progress,
    isPaused,
    isMuted,
    isHudHidden,
    close,
    nextSlide,
    prevSlide,
    jumpToAuthor,
    setProgress,
    setPaused,
    togglePaused,
    toggleMuted,
    setHudHidden,
    updateSlideWidgetInQueue,
  } = useStoryPlayerStore();

  const pushToast = useAppStore((s) => s.pushToast);
  const openCreateModal = useAppStore((s) => s.openCreateModal);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const sendActivity = useMessengerStore((s) => s.sendActivity);
  const queryClient = useQueryClient();

  const [replyText, setReplyText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; left: number }>>([]);
  const [flyThumbUrl, setFlyThumbUrl] = useState<string | null>(null);
  const [sliderDraftState, setSliderDraftState] = useState<{
    slideId: string;
    value: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const isHoldActiveRef = useRef(false);
  const viewedSetRef = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeGroup = authorQueue[activeAuthorIndex];
  const activeSlide: StorySlide | undefined = activeGroup?.slides[activeSlideIndex];
  const prevGroup = activeAuthorIndex > 0 ? authorQueue[activeAuthorIndex - 1] : null;
  const nextGroup =
    activeAuthorIndex + 1 < authorQueue.length ? authorQueue[activeAuthorIndex + 1] : null;

  const isOwnStory = activeGroup?.author.id === getActiveUserId();

  const activeSlideId = activeSlide?.id;
  const activeSlideDuration = activeSlide?.duration_ms || 5500;
  const activeAuthorUsername = activeGroup?.author.username;
  const sliderDraft =
    sliderDraftState && sliderDraftState.slideId === activeSlideId ? sliderDraftState.value : null;

  // Mark slide viewed & update live activity
  useEffect(() => {
    if (!isOpen || !activeSlideId || !activeAuthorUsername) return;

    if (!isOwnStory) {
      sendActivity(`Viewing @${activeAuthorUsername}'s story 👀`);
    }

    if (!viewedSetRef.current.has(activeSlideId)) {
      viewedSetRef.current.add(activeSlideId);
      api
        .viewStory(activeSlideId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['stories'] });
          queryClient.invalidateQueries({ queryKey: ['feed'] });
        })
        .catch(() => {});
    }
  }, [isOpen, activeSlideId, activeAuthorUsername, isOwnStory, sendActivity, queryClient]);

  // Restore activity on close
  useEffect(() => {
    if (!isOpen) {
      sendActivity('Active now');
    }
  }, [isOpen, sendActivity]);

  // Sync video mute/pause state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = isMuted;
    if (isPaused) vid.pause();
    else vid.play().catch(() => {});
  }, [isPaused, isMuted, activeSlideId]);

  // requestAnimationFrame 60fps progression loop
  useEffect(() => {
    if (!isOpen || !activeSlideId || isPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastFrameRef.current;
      lastFrameRef.current = now;
      const currentProgress = useStoryPlayerStore.getState().progress;
      const nextProgress = currentProgress + dt / activeSlideDuration;
      if (nextProgress >= 1) {
        nextSlide();
        return;
      }
      setProgress(nextProgress);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, activeSlideId, activeSlideDuration, isPaused, nextSlide, setProgress]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') close();
        return;
      }
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === ' ') {
        e.preventDefault();
        togglePaused();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMuted();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, nextSlide, prevSlide, togglePaused, toggleMuted]);

  if (!isOpen || !activeGroup || !activeSlide) return null;

  const triggerStoryToDmFeedback = (emoji?: string) => {
    if (emoji) {
      const base = Date.now();
      const burst = Array.from({ length: 4 }, (_, i) => ({
        id: base + i,
        emoji,
        left: 28 + Math.random() * 44,
      }));
      setFloatingEmojis((prev) => [...prev, ...burst]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id < base));
      }, 950);
    }

    setFlyThumbUrl(activeSlide.media_url);
    setTimeout(() => setFlyThumbUrl(null), 540);
  };

  const handleQuickReaction = async (emoji: string) => {
    if (isOwnStory) return;
    triggerStoryToDmFeedback(emoji);
    try {
      await api.replyToStory(activeSlide.id, {
        reaction_emoji: emoji,
        content: `Reacted ${emoji} to your story`,
        client_msg_id: generateClientUuid(),
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      pushToast(`Sent ${emoji} to @${activeGroup.author.username} in Messages`, 'emerald');
    } catch {
      pushToast('Could not send reaction', 'rose');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isOwnStory) return;
    const text = replyText.trim();
    setReplyText('');
    triggerStoryToDmFeedback();
    setPaused(false);
    try {
      await api.replyToStory(activeSlide.id, {
        content: text,
        client_msg_id: generateClientUuid(),
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      pushToast(`Sent to @${activeGroup.author.username} in Messages`, 'emerald');
    } catch {
      pushToast('Failed to send story reply', 'rose');
    }
  };

  const handlePollVote = async (optionId: string) => {
    try {
      const updated = await api.interactStory(activeSlide.id, { optionId });
      updateSlideWidgetInQueue(updated);
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    } catch {}
  };

  const handleSliderCommit = async (value: number) => {
    try {
      const updated = await api.interactStory(activeSlide.id, { sliderValue: value });
      updateSlideWidgetInQueue(updated);
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    } catch {}
  };

  const handleToggleHighlight = async () => {
    try {
      const updated = await api.highlightStory(activeSlide.id, {
        is_highlighted: !activeSlide.is_highlighted,
        highlight_title: activeSlide.highlight_title || 'Highlights',
      });
      updateSlideWidgetInQueue(updated);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      pushToast(
        updated.is_highlighted ? 'Pinned to Story Highlights' : 'Removed from Highlights',
        'cobalt'
      );
    } catch {}
  };

  // Tactile Press-and-Hold Physics: pauses progression + fades out all HUD overlays
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-story-interactive="true"]')) return;
    isHoldActiveRef.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      isHoldActiveRef.current = true;
      setPaused(true);
      setHudHidden(true);
    }, 160);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldActiveRef.current) {
      isHoldActiveRef.current = false;
      setPaused(false);
      setHudHidden(false);
      return;
    }
    if (target.closest('[data-story-interactive="true"]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.3) prevSlide();
    else nextSlide();
  };

  const widget = activeSlide.interactive_widget;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#050608]/95 backdrop-blur-xl flex items-center justify-center select-none overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Top-right modal close */}
      <button
        type="button"
        onClick={close}
        className="hidden md:flex fixed top-6 right-6 z-30 w-10 h-10 rounded-full glass-hud text-white items-center justify-center hover:bg-white/15 cursor-pointer"
        aria-label="Close story viewer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-center gap-6 lg:gap-10 w-full max-w-6xl px-3">
        {/* Previous Neighbor Preview (3D Flank) */}
        <div className="hidden lg:flex w-[220px] justify-end">
          {prevGroup && (
            <button
              type="button"
              onClick={() => jumpToAuthor(activeAuthorIndex - 1)}
              className="relative w-[200px] h-[360px] rounded-2xl overflow-hidden opacity-45 hover:opacity-75 scale-90 hover:scale-95 transition-all border border-white/15 shadow-xl cursor-pointer group"
            >
              <img
                src={prevGroup.slides[0]?.media_url}
                alt={prevGroup.author.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col items-center justify-center gap-2 p-3">
                <img
                  src={prevGroup.author.avatar_url}
                  alt={prevGroup.author.username}
                  className="w-12 h-12 rounded-full ring-2 ring-white/50 object-cover"
                />
                <span className="text-xs font-semibold text-white">
                  @{prevGroup.author.username}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Left Chevron */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous story"
          className="hidden sm:flex w-10 h-10 rounded-full glass-hud text-white items-center justify-center hover:bg-white/20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Active Story Frame (400 x 710) */}
        <div
          onPointerDown={handleCanvasPointerDown}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={() => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
            if (isHoldActiveRef.current) {
              isHoldActiveRef.current = false;
              setPaused(false);
              setHudHidden(false);
            }
          }}
          className="relative w-[400px] h-[710px] max-w-[94vw] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black shrink-0 touch-none cursor-pointer"
        >
          {/* Story Media */}
          {activeSlide.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={activeSlide.media_url}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeSlide.media_url}
              alt={activeSlide.caption || activeGroup.author.display_name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}

          {/* Top & Bottom subtle readability scrims */}
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none transition-opacity duration-200',
              isHudHidden && 'opacity-0'
            )}
          />
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none transition-opacity duration-200',
              isHudHidden && 'opacity-0'
            )}
          />

          {/* Top Segmented Progress Bars + Header Strip */}
          <div
            data-story-interactive="true"
            className={cn(
              'absolute inset-x-0 top-0 z-20 px-4 pt-3.5 transition-opacity duration-200',
              isHudHidden && 'opacity-0 pointer-events-none'
            )}
          >
            {/* Segmented Progress Tracks */}
            <div className="flex items-center gap-1.5 mb-3">
              {activeGroup.slides.map((s, idx) => {
                const fillPct =
                  idx < activeSlideIndex
                    ? 100
                    : idx === activeSlideIndex
                      ? Math.min(100, progress * 100)
                      : 0;
                return (
                  <div
                    key={s.id}
                    className="h-[2.5px] flex-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Header Info & Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    navigateToProfile(activeGroup.author.username);
                  }}
                  className="shrink-0 cursor-pointer"
                >
                  <img
                    src={activeGroup.author.avatar_url}
                    alt={activeGroup.author.username}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-white/40"
                  />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {isHighlightMode && highlightTitle
                        ? highlightTitle
                        : activeGroup.author.username}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-white/70">
                      {formatRelativeTime(activeSlide.created_at)}
                    </span>
                    {activeSlide.audience === 'close_friends' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#10B981] text-white text-[9px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> Close Friends
                      </span>
                    )}
                  </div>
                  {activeSlide.music_track && (
                    <div className="flex items-center gap-1 text-[11px] text-white/85 truncate mt-0.5">
                      <Music2 className="w-3 h-3 animate-pulse shrink-0" />
                      <span className="truncate">
                        {activeSlide.music_track.title} • {activeSlide.music_track.artist}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isOwnStory && (
                  <button
                    type="button"
                    onClick={handleToggleHighlight}
                    title={
                      activeSlide.is_highlighted ? 'Highlighted on profile' : 'Pin to Highlights'
                    }
                    className={cn(
                      'p-1.5 rounded-full transition-colors cursor-pointer',
                      activeSlide.is_highlighted
                        ? 'bg-amber-400 text-black'
                        : 'text-white/85 hover:bg-white/15'
                    )}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={togglePaused}
                  aria-label={isPaused ? 'Play story' : 'Pause story'}
                  className="p-1.5 rounded-full text-white/90 hover:bg-white/15 cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMuted}
                  aria-label={isMuted ? 'Unmute story' : 'Mute story'}
                  className="p-1.5 rounded-full text-white/90 hover:bg-white/15 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="md:hidden p-1.5 rounded-full text-white/90 hover:bg-white/15 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Story Stickers */}
          {widget && (
            <div
              data-story-interactive="true"
              className={cn(
                'absolute inset-x-5 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-200',
                isHudHidden && 'opacity-0 pointer-events-none'
              )}
              onPointerDown={() => setPaused(true)}
            >
              {widget.kind === 'poll' && (
                <div className="rounded-2xl glass-hud p-4 shadow-2xl text-white">
                  <p className="text-sm font-bold text-center mb-3">{widget.question}</p>
                  <div className="space-y-2">
                    {widget.options.map((opt) => {
                      const totalVotes = widget.options.reduce((a, b) => a + b.votes, 0);
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const isVoted = widget.user_vote === opt.id;
                      const hasVoted = Boolean(widget.user_vote);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePollVote(opt.id)}
                          className={cn(
                            'relative w-full rounded-xl overflow-hidden px-3.5 py-2.5 text-left text-xs font-semibold border transition-all cursor-pointer',
                            isVoted
                              ? 'border-white bg-white/15'
                              : 'border-white/20 bg-white/10 hover:bg-white/15'
                          )}
                        >
                          {hasVoted && (
                            <span
                              className="absolute inset-y-0 left-0 bg-[#2563EB]/65 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <span className="relative z-10 flex items-center justify-between">
                            <span>{opt.label}</span>
                            {hasVoted && (
                              <span className="font-mono-tabular">{pct}%</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {widget.kind === 'slider' && (
                <div className="rounded-2xl glass-hud p-4 shadow-2xl text-white">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-bold">{widget.prompt}</p>
                    {(typeof widget.user_value === 'number' || sliderDraft !== null) && (
                      <span className="font-mono-tabular text-[11px] px-2 py-0.5 rounded-full bg-white/15">
                        Avg {widget.average}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{widget.emoji}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderDraft ?? widget.user_value ?? 65}
                      onChange={(e) =>
                        setSliderDraftState({
                          slideId: activeSlide.id,
                          value: Number(e.target.value),
                        })
                      }
                      onMouseUp={(e) => handleSliderCommit(Number(e.currentTarget.value))}
                      onTouchEnd={(e) => handleSliderCommit(Number(e.currentTarget.value))}
                      className="w-full accent-[#EC4899] cursor-pointer"
                    />
                    <span className="font-mono-tabular text-xs w-9 text-right">
                      {sliderDraft ?? widget.user_value ?? 65}%
                    </span>
                  </div>
                </div>
              )}

              {widget.kind === 'add_yours' && (
                <div className="rounded-2xl glass-hud p-4 shadow-2xl text-white text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                    Add Yours Chain
                  </div>
                  <p className="text-sm font-bold mb-3">{widget.prompt}</p>
                  <div className="flex items-center justify-center -space-x-2 mb-3">
                    {widget.participants.map((p) => (
                      <img
                        key={p.username}
                        src={p.avatar_url}
                        alt={p.username}
                        className="w-7 h-7 rounded-full ring-2 ring-[#0F1115] object-cover"
                      />
                    ))}
                    <span className="pl-3 text-xs text-white/80 font-mono-tabular">
                      +{widget.total_count}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      openCreateModal('story', {
                        prompt: widget.prompt,
                        chain_id: widget.chain_id,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Yours
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Story Caption Overlay */}
          {activeSlide.caption && (
            <div
              className={cn(
                'absolute inset-x-5 bottom-28 z-10 text-center pointer-events-none transition-opacity duration-200',
                isHudHidden && 'opacity-0'
              )}
            >
              <p className="inline-block px-3.5 py-2 rounded-2xl glass-hud text-xs text-white leading-relaxed shadow-lg">
                {activeSlide.caption}
              </p>
            </div>
          )}

          {/* Emoji Particle Fountain */}
          <div className="absolute inset-x-0 bottom-20 pointer-events-none z-30">
            {floatingEmojis.map((item) => (
              <span
                key={item.id}
                style={{ left: `${item.left}%` }}
                className="absolute bottom-0 text-3xl animate-emoji-float"
              >
                {item.emoji}
              </span>
            ))}
          </div>

          {/* Story-to-DM Fly-Away Miniature Clone */}
          {flyThumbUrl && (
            <img
              src={flyThumbUrl}
              alt=""
              className="w-14 h-24 rounded-xl object-cover border border-white/40 shadow-2xl absolute bottom-14 left-10 z-40 pointer-events-none animate-fly-to-dm"
            />
          )}

          {/* Bottom Quick-Reply & Reaction HUD */}
          <div
            data-story-interactive="true"
            className={cn(
              'absolute inset-x-0 bottom-0 z-20 p-4 transition-opacity duration-200',
              isHudHidden && 'opacity-0 pointer-events-none'
            )}
          >
            {isOwnStory ? (
              <div className="flex items-center justify-between text-xs text-white/85 glass-hud rounded-2xl px-4 py-2.5">
                <span className="font-mono-tabular">
                  {activeSlide.view_count} {activeSlide.view_count === 1 ? 'view' : 'views'}
                </span>
                <span className="text-[11px] text-white/70">Hold screen to hide HUD</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleQuickReaction(emoji)}
                      className="w-9 h-9 rounded-full glass-hud flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
                  <input
                    value={replyText}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to @${activeGroup.author.username}...`}
                    className="flex-1 h-10 rounded-full glass-hud px-4 text-xs text-white placeholder:text-white/60 outline-none focus:border-white/40"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="w-10 h-10 rounded-full bg-[#2563EB] disabled:opacity-40 text-white flex items-center justify-center shrink-0 hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                    aria-label="Send story reply"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Chevron */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next story"
          className="hidden sm:flex w-10 h-10 rounded-full glass-hud text-white items-center justify-center hover:bg-white/20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Next Neighbor Preview (3D Flank) */}
        <div className="hidden lg:flex w-[220px] justify-start">
          {nextGroup && (
            <button
              type="button"
              onClick={() => jumpToAuthor(activeAuthorIndex + 1)}
              className="relative w-[200px] h-[360px] rounded-2xl overflow-hidden opacity-45 hover:opacity-75 scale-90 hover:scale-95 transition-all border border-white/15 shadow-xl cursor-pointer group"
            >
              <img
                src={nextGroup.slides[0]?.media_url}
                alt={nextGroup.author.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col items-center justify-center gap-2 p-3">
                <img
                  src={nextGroup.author.avatar_url}
                  alt={nextGroup.author.username}
                  className="w-12 h-12 rounded-full ring-2 ring-white/50 object-cover"
                />
                <span className="text-xs font-semibold text-white">
                  @{nextGroup.author.username}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
