import React, { useState } from 'react';
import {
  Globe,
  Music2,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../stores/useAppStore';
import { api } from '../../lib/api';
import { cn, fileToDataUrl } from '../../lib/utils';
import type { StoryWidget } from '../../types/social';

const STORY_PRESETS = [
  { label: 'Tokyo Neon', url: '/media/story-tokyo-rain.svg' },
  { label: 'Morning Pour', url: '/media/story-coffee-setup.svg' },
  { label: 'Studio WIP', url: '/media/story-studio-wip.svg' },
  { label: 'Inner Circle', url: '/media/story-close-friends.svg' },
];

const POST_PRESETS = [
  { label: 'Obsidian Desk', url: '/media/post-desk-setup.svg', w: 1200, h: 750 },
  { label: 'Shibuya Rain', url: '/media/post-shibuya-night.svg', w: 800, h: 1000 },
  { label: 'Sunlit Gallery', url: '/media/post-gallery-sun.svg', w: 800, h: 1000 },
  { label: 'Kyoto Mist', url: '/media/post-kyoto-bamboo.svg', w: 800, h: 1000 },
];

export const CreateModal: React.FC = () => {
  const { createModal, closeCreateModal, pushToast } = useAppStore();
  const queryClient = useQueryClient();

  const [tabOverride, setTabOverride] = useState<'post' | 'story' | null>(null);
  const tab = tabOverride ?? createModal.tab;
  const setTab = (next: 'post' | 'story') => setTabOverride(next);

  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState<'public' | 'close_friends'>('public');
  const [mediaUrl, setMediaUrl] = useState('/media/story-coffee-setup.svg');
  const [postImageUrl, setPostImageUrl] = useState('/media/post-desk-setup.svg');
  const [stickerKind, setStickerKind] = useState<'none' | 'poll' | 'slider'>('poll');
  const [pollQ, setPollQ] = useState('Which palette feels sharpest?');
  const [pollA, setPollA] = useState('Obsidian Dark');
  const [pollB, setPollB] = useState('Alabaster Light');
  const [sliderPrompt, setSliderPrompt] = useState('Rate this vibe');
  const musicTitle = 'Delilah (pull me out of this)';
  const musicArtist = 'Fred again..';
  const [includeMusic, setIncludeMusic] = useState(true);
  const [highlightTitle, setHighlightTitle] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  if (!createModal.isOpen) return null;

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const uploaded = await api.uploadMedia(dataUrl, file.name, file.type);
    if (tab === 'story') setMediaUrl(uploaded.url);
    else setPostImageUrl(uploaded.url);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    try {
      if (tab === 'story') {
        let interactive_widget: StoryWidget | null = null;
        if (createModal.addYoursPrompt) {
          interactive_widget = {
            kind: 'add_yours',
            prompt: createModal.addYoursPrompt.prompt,
            chain_id: createModal.addYoursPrompt.chain_id,
            participants: [{ username: 'alex_chen', avatar_url: '/media/avatar-alex.svg' }],
            total_count: 20,
          };
        } else if (stickerKind === 'poll' && pollQ.trim()) {
          interactive_widget = {
            kind: 'poll',
            question: pollQ.trim(),
            options: [
              { id: 'sp-1', label: pollA.trim() || 'Yes', votes: 1 },
              { id: 'sp-2', label: pollB.trim() || 'No', votes: 0 },
            ],
          };
        } else if (stickerKind === 'slider') {
          interactive_widget = {
            kind: 'slider',
            prompt: sliderPrompt.trim() || 'Rate this moment',
            emoji: '🔥',
            average: 88,
            votes: 1,
          };
        }

        await api.createStory({
          media_url: mediaUrl,
          media_type: 'image',
          duration_ms: 5500,
          audience,
          caption: caption.trim(),
          music_track: includeMusic ? { title: musicTitle, artist: musicArtist } : null,
          interactive_widget,
          highlight_title: highlightTitle.trim() || null,
        });
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        pushToast('Published 24h Ephemeral Story', 'emerald');
      } else {
        await api.createPost({
          caption: caption.trim() || 'Fresh studio capture.',
          media_items: [
            {
              url: postImageUrl,
              type: 'image',
              width: 800,
              height: 1000,
              alt: caption.trim() || 'Studio image',
            },
          ],
          audience,
          audio_title: includeMusic ? `${musicTitle} — ${musicArtist}` : '',
        });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        pushToast('Published new post to Feed', 'emerald');
      }
      setCaption('');
      setTabOverride(null);
      closeCreateModal();
    } catch (err) {
      pushToast((err as Error).message || 'Publish failed', 'rose');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={closeCreateModal}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-surface-elevated border border-divider shadow-2xl overflow-hidden animate-msg-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-divider flex items-center justify-between">
          <div className="flex items-center gap-2 bg-surface-secondary p-1 rounded-xl border border-divider">
            <button
              type="button"
              onClick={() => setTab('post')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                tab === 'post' ? 'bg-surface-elevated text-primary-ink shadow-xs' : 'text-muted-ink'
              )}
            >
              Feed Post
            </button>
            <button
              type="button"
              onClick={() => setTab('story')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                tab === 'story' ? 'bg-surface-elevated text-primary-ink shadow-xs' : 'text-muted-ink'
              )}
            >
              24h Story
            </button>
          </div>
          <button
            type="button"
            onClick={closeCreateModal}
            className="p-1.5 rounded-full hover:bg-surface-secondary text-muted-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {createModal.addYoursPrompt && tab === 'story' && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2.5 text-xs">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                Joining Add Yours Chain
              </div>
              <div className="text-primary-ink font-semibold mt-0.5">
                “{createModal.addYoursPrompt.prompt}”
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Live Visual Preview */}
            <div className="space-y-2">
              <div
                className={cn(
                  'rounded-2xl overflow-hidden border border-divider bg-black relative',
                  tab === 'story' ? 'aspect-[9/14] max-h-64 mx-auto' : 'aspect-[4/5] max-h-64 mx-auto'
                )}
              >
                <img
                  src={tab === 'story' ? mediaUrl : postImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {tab === 'story' && caption && (
                  <div className="absolute inset-x-3 bottom-3 px-2.5 py-1.5 rounded-xl glass-hud text-[11px] text-white text-center">
                    {caption}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(tab === 'story' ? STORY_PRESETS : POST_PRESETS).map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      tab === 'story' ? setMediaUrl(preset.url) : setPostImageUrl(preset.url)
                    }
                    className={cn(
                      'px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer',
                      (tab === 'story' ? mediaUrl : postImageUrl) === preset.url
                        ? 'border-[#2563EB] bg-[#2563EB]/15 text-[#2563EB]'
                        : 'border-divider bg-surface-secondary text-muted-ink'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border border-divider bg-surface-secondary text-primary-ink hover:border-[#2563EB] cursor-pointer">
                  <Upload className="w-3 h-3" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadFile} />
                </label>
              </div>
            </div>

            {/* Settings & Interactive Stickers */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                  Caption
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={
                    tab === 'story'
                      ? 'Add a living moment caption...'
                      : 'Write a caption with @mentions and #tags...'
                  }
                  className="mt-1 w-full rounded-xl bg-surface-secondary border border-divider px-3 py-2 text-xs text-primary-ink outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-ink uppercase tracking-wider block mb-1">
                  Audience Ring & Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAudience('public')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer',
                      audience === 'public'
                        ? 'border-[#2563EB] bg-[#2563EB]/15 text-[#2563EB]'
                        : 'border-divider bg-surface-secondary text-muted-ink'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience('close_friends')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer',
                      audience === 'close_friends'
                        ? 'border-[#10B981] bg-[#10B981]/15 text-[#10B981]'
                        : 'border-divider bg-surface-secondary text-muted-ink'
                    )}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" /> Close Friends
                  </button>
                </div>
              </div>

              {tab === 'story' && !createModal.addYoursPrompt && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-ink uppercase tracking-wider block">
                    Interactive Sticker
                  </label>
                  <div className="flex gap-1.5">
                    {(['none', 'poll', 'slider'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setStickerKind(k)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-[11px] font-semibold border capitalize cursor-pointer',
                          stickerKind === k
                            ? 'border-[#2563EB] bg-[#2563EB]/15 text-[#2563EB]'
                            : 'border-divider bg-surface-secondary text-muted-ink'
                        )}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  {stickerKind === 'poll' && (
                    <div className="space-y-1.5">
                      <input
                        value={pollQ}
                        onChange={(e) => setPollQ(e.target.value)}
                        placeholder="Poll question"
                        className="w-full rounded-lg bg-surface-secondary border border-divider px-2.5 py-1.5 text-xs outline-none"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          value={pollA}
                          onChange={(e) => setPollA(e.target.value)}
                          placeholder="Option A"
                          className="rounded-lg bg-surface-secondary border border-divider px-2.5 py-1.5 text-xs outline-none"
                        />
                        <input
                          value={pollB}
                          onChange={(e) => setPollB(e.target.value)}
                          placeholder="Option B"
                          className="rounded-lg bg-surface-secondary border border-divider px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {stickerKind === 'slider' && (
                    <input
                      value={sliderPrompt}
                      onChange={(e) => setSliderPrompt(e.target.value)}
                      placeholder="Emoji slider prompt"
                      className="w-full rounded-lg bg-surface-secondary border border-divider px-2.5 py-1.5 text-xs outline-none"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-primary-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMusic}
                    onChange={(e) => setIncludeMusic(e.target.checked)}
                    className="accent-[#2563EB]"
                  />
                  <Music2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Attach music overlay</span>
                </label>
              </div>

              {tab === 'story' && (
                <input
                  value={highlightTitle}
                  onChange={(e) => setHighlightTitle(e.target.value)}
                  placeholder="Optional Highlight capsule (e.g. Tokyo '26)"
                  className="w-full rounded-lg bg-surface-secondary border border-divider px-2.5 py-1.5 text-xs outline-none"
                />
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-divider flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-full text-xs font-semibold text-muted-ink hover:text-primary-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBusy ? 'Publishing...' : tab === 'story' ? 'Share to Story' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
