import React, { useRef, useState } from 'react';
import {
  BarChart3,
  EyeOff,
  Globe,
  Image as ImageIcon,
  Mic,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../hooks/useSocialQueries';
import { api } from '../../lib/api';
import { useAppStore } from '../../stores/useAppStore';
import { cn, fileToDataUrl } from '../../lib/utils';
import type { AudienceTier, MediaItem, ReplyPolicy, VoiceNote } from '../../types/social';

export const QuickComposerCard: React.FC = () => {
  const { data: meData } = useMe();
  const me = meData?.user;
  const queryClient = useQueryClient();
  const pushToast = useAppStore((s) => s.pushToast);

  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState<AudienceTier>('public');
  const [replyPolicy, setReplyPolicy] = useState<ReplyPolicy>('everyone');
  const [hideLikes, setHideLikes] = useState(false);
  const [coAuthorId, setCoAuthorId] = useState<string>('');
  const [showCoAuthorPicker, setShowCoAuthorPicker] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [voiceNote, setVoiceNote] = useState<VoiceNote | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStartRef = useRef<number>(0);

  if (!me) return null;

  const coAuthorCandidates = (meData?.personas || []).filter((p) => p.id !== me.id);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files).slice(0, 4)) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const uploaded = await api.uploadMedia(dataUrl, file.name, file.type);
        const isVideo = file.type.startsWith('video/');
        setMediaItems((prev) => [
          ...prev,
          {
            url: uploaded.url,
            type: isVideo ? 'video' : 'image',
            width: 800,
            height: 1000,
            alt: file.name,
          },
        ]);
      } catch {
        pushToast('Failed to upload media file', 'rose');
      }
    }
  };

  const startVoiceRecording = async () => {
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

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const elapsed = Math.max(1500, Math.min(30000, Date.now() - recStartRef.current));
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const dataUrl = await fileToDataUrl(blob);
        const uploaded = await api.uploadMedia(dataUrl, 'voice-note.webm', 'audio/webm');
        setVoiceNote({
          url: uploaded.url,
          duration_ms: elapsed,
          waveform: Array.from({ length: 32 }, () => Math.round(25 + Math.random() * 70)),
          title: 'Quick Voice Note',
        });
      };

      rec.start();
      setTimeout(() => {
        if (rec.state === 'recording') rec.stop();
      }, 30_000);
    } catch {
      // Fallback: attach sample studio audio note when microphone isn't available
      setIsRecording(false);
      setVoiceNote({
        url: '/media/voice-sora-cafe.wav',
        duration_ms: 4000,
        waveform: [
          28, 44, 72, 85, 64, 48, 76, 92, 68, 52, 80, 88, 60, 42, 74, 90,
          56, 38, 66, 82, 58, 44, 70, 86, 62, 40, 58, 74, 48, 36, 26, 20,
        ],
        title: 'Studio Voice Memo',
      });
      pushToast('Microphone unavailable — attached studio voice clip', 'cobalt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !caption.trim() &&
      mediaItems.length === 0 &&
      !voiceNote &&
      !(showPoll && pollQuestion.trim())
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const hashtags = Array.from(caption.matchAll(/#([A-Za-z0-9_]+)/g)).map((m) => m[1]);
      await api.createPost({
        caption: caption.trim(),
        co_author_id: coAuthorId || null,
        media_items: mediaItems,
        voice_note: voiceNote,
        poll:
          showPoll && pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2
            ? { question: pollQuestion.trim(), options: pollOptions.filter((o) => o.trim()) }
            : null,
        tags: hashtags,
        audience,
        reply_policy: replyPolicy,
        hide_like_count: hideLikes,
      });

      setCaption('');
      setMediaItems([]);
      setVoiceNote(null);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setCoAuthorId('');
      setShowCoAuthorPicker(false);

      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      pushToast('Published to feed', 'emerald');
    } catch (err) {
      pushToast((err as Error).message || 'Failed to publish post', 'rose');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'rounded-2xl border bg-surface-elevated p-4 mb-6 transition-all shadow-2xs',
        isDragging ? 'border-[#2563EB] ring-2 ring-[#2563EB]/25' : 'border-divider'
      )}
    >
      <div className="flex gap-3">
        <img
          src={me.avatar_url}
          alt={me.display_name}
          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-black/10 dark:ring-white/15"
        />

        <div className="flex-1 min-w-0">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="What's happening, or drop media here..."
            className="w-full resize-none bg-transparent text-sm text-primary-ink placeholder:text-muted-ink outline-none leading-relaxed"
          />

          {/* Attached Media Thumbnails */}
          {mediaItems.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
              {mediaItems.map((m, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-24 rounded-xl overflow-hidden border border-divider shrink-0 bg-surface-secondary"
                >
                  {m.type === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.url} alt={m.alt} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Voice Note Attached Pill */}
          {voiceNote && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-secondary border border-divider mb-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-primary-ink">
                <Mic className="w-3.5 h-3.5 text-[#2563EB]" />
                {voiceNote.title} ({Math.round(voiceNote.duration_ms / 1000)}s)
              </span>
              <button
                type="button"
                onClick={() => setVoiceNote(null)}
                className="text-muted-ink hover:text-rose-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Inline Poll Builder */}
          {showPoll && (
            <div className="rounded-xl bg-surface-secondary border border-divider p-3 mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
                  Community Poll
                </span>
                <button
                  type="button"
                  onClick={() => setShowPoll(false)}
                  className="text-muted-ink hover:text-primary-ink cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-divider text-xs text-primary-ink outline-none"
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  value={opt}
                  onChange={(e) =>
                    setPollOptions((prev) =>
                      prev.map((item, i) => (i === idx ? e.target.value : item))
                    )
                  }
                  placeholder={`Option ${idx + 1}`}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-divider text-xs text-primary-ink outline-none"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions((p) => [...p, ''])}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Co-Author Selector */}
          {showCoAuthorPicker && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-surface-secondary border border-divider text-xs">
              <Users className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="text-muted-ink shrink-0">Co-author:</span>
              <select
                value={coAuthorId}
                onChange={(e) => setCoAuthorId(e.target.value)}
                className="flex-1 bg-transparent text-primary-ink outline-none cursor-pointer"
              >
                <option value="">None (Solo post)</option>
                {coAuthorCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name} (@{c.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-divider">
            <div className="flex flex-wrap items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-primary-ink transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Photo/Video</span>
              </button>

              <button
                type="button"
                onClick={startVoiceRecording}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-surface-secondary hover:bg-black/5 dark:hover:bg-white/10 text-primary-ink'
                )}
              >
                {isRecording ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-pink-500" />
                    <span>Voice</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPoll((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-primary-ink transition-colors cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                <span>Poll</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCoAuthorPicker((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                  coAuthorId
                    ? 'bg-[#2563EB]/15 text-[#2563EB]'
                    : 'bg-surface-secondary hover:bg-black/5 dark:hover:bg-white/10 text-primary-ink'
                )}
              >
                <Users className="w-3.5 h-3.5 text-violet-500" />
                <span>Co-Author</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              {/* Audience Tier Switcher */}
              <button
                type="button"
                onClick={() =>
                  setAudience((a) =>
                    a === 'public' ? 'followers' : a === 'followers' ? 'close_friends' : 'public'
                  )
                }
                title="Cycle audience visibility"
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer',
                  audience === 'close_friends'
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                    : 'bg-surface-secondary text-muted-ink border-divider hover:text-primary-ink'
                )}
              >
                {audience === 'close_friends' ? (
                  <>
                    <Star className="w-3 h-3 fill-current" /> Close Friends
                  </>
                ) : audience === 'followers' ? (
                  <>
                    <Users className="w-3 h-3" /> Followers
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" /> Public
                  </>
                )}
              </button>

              {/* Psychological Safety toggles */}
              <button
                type="button"
                onClick={() =>
                  setReplyPolicy((p) => (p === 'everyone' ? 'mutuals' : 'everyone'))
                }
                title="Toggle who can reply"
                className={cn(
                  'p-1.5 rounded-full border transition-colors cursor-pointer',
                  replyPolicy === 'mutuals'
                    ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                    : 'bg-surface-secondary text-muted-ink border-divider'
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setHideLikes((h) => !h)}
                title="Hide public like counter"
                className={cn(
                  'p-1.5 rounded-full border transition-colors cursor-pointer',
                  hideLikes
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-surface-secondary text-muted-ink border-divider'
                )}
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (!caption.trim() && mediaItems.length === 0 && !voiceNote && !pollQuestion.trim())
                }
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

