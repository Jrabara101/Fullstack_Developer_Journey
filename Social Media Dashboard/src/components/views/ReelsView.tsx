import React from 'react';
import { Film, Music2 } from 'lucide-react';
import { useFeedInfinite } from '../../hooks/useSocialQueries';
import { FeedPostCard } from '../feed/FeedPostCard';

export const ReelsView: React.FC = () => {
  const { data } = useFeedInfinite('for_you');
  const allPosts = data?.pages.flatMap((p) => p.items) || [];
  const reelAndAudioPosts = allPosts.filter(
    (p) =>
      p.media_items.some((m) => m.type === 'video') ||
      Boolean(p.voice_note) ||
      Boolean(p.audio_title)
  );

  return (
    <div className="max-w-[540px] mx-auto py-6 px-2 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-primary-ink">
              Reels &amp; Motion Audio
            </h1>
            <p className="text-xs text-muted-ink">
              Short kinetic loops, modular synths, and curated soundtracks
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-elevated border border-divider text-[11px] font-mono-tabular text-muted-ink">
          <Music2 className="w-3 h-3 text-[#EC4899]" /> {reelAndAudioPosts.length} streams
        </span>
      </div>

      {reelAndAudioPosts.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
          No video reels or audio streams available yet.
        </div>
      ) : (
        reelAndAudioPosts.map((p) => <FeedPostCard key={p.id} post={p} />)
      )}
    </div>
  );
};

