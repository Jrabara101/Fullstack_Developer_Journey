import React, { useState } from 'react';
import { Play, Sparkles, Clock, CheckCircle2, Flame, Award, Filter, ArrowRight } from 'lucide-react';
import { Video } from '../../types/video';

interface StreamingCatalogHomeProps {
  videos: Video[];
  onSelectVideo: (ulid: string) => void;
  onOpenUploadStudio: () => void;
}

export const StreamingCatalogHome: React.FC<StreamingCatalogHomeProps> = ({
  videos,
  onSelectVideo,
  onOpenUploadStudio
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const heroVideo = videos[0];

  const categories = [
    'All Films & Talks',
    'System Architecture',
    'Cinema & Color Science',
    'Kernel Internals',
    'Media Codecs & HLS',
    'Distributed Databases'
  ];

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 space-y-10">
      
      {/* 1. FEATURED HERO PREMIERE BANNER */}
      {heroVideo && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] bg-gradient-to-r from-black via-[#0b0c10] to-[#12151e] min-h-[440px] flex items-center p-8 lg:p-14 group">
          {/* Muted Motion Backdrop Image with Depth Vignette */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img 
              src={heroVideo.posterUrl} 
              alt={heroVideo.title}
              className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-75" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080A] via-[#07080A]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 shadow">
                <Sparkles size={12} className="text-indigo-400" />
                <span>CINEMA PREMIERE</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/30">
                4K ULTRA HD
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-xs border border-white/10">
                {formatSec(heroVideo.durationSeconds)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
              {heroVideo.title}
            </h1>

            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {heroVideo.description}
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => onSelectVideo(heroVideo.ulid)}
                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-semibold text-sm flex items-center gap-2 shadow-2xl transition active:scale-95"
              >
                <Play size={16} fill="black" />
                <span>Watch Film Now</span>
              </button>

              <button
                onClick={() => onSelectVideo(heroVideo.ulid)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/15 transition backdrop-blur-md"
              >
                Inspect Transcoding Ladder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. "CONTINUE WATCHING" SESSION-SYNCED RIBBON */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Continue Watching (Session-Synced)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Cross-Device Pick Up</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {videos.slice(0, 3).map((v, idx) => {
            const watchedPercent = [68, 42, 85][idx];
            const resumeSeconds = Math.floor(v.durationSeconds * (watchedPercent / 100));
            return (
              <div 
                key={v.id}
                onClick={() => onSelectVideo(v.ulid)}
                className="group p-3 rounded-2xl bg-[#101217] border border-white/10 hover:border-indigo-500/50 cursor-pointer transition shadow-xl space-y-2.5"
              >
                <div className="aspect-video rounded-xl overflow-hidden relative bg-black">
                  <img 
                    src={v.posterUrl} 
                    alt={v.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Smart Rewind Resume Overlay Badge */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                    <span className="px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                      <Play size={12} fill="white" />
                      <span>Resume at {formatSec(resumeSeconds)} (Smart Rewind -3s)</span>
                    </span>
                  </div>

                  {/* Watched Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${watchedPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition">
                    {v.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{v.channelName}</span>
                    <span className="text-indigo-400">{watchedPercent}% watched</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FACETED CATEGORIES & FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. DISCOVERY CATALOG VIDEO CARDS (4-Column Responsive Grid) */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">Explore High-Bitrate Master Catalog</h2>
          <span className="text-xs text-slate-400 font-mono">{videos.length} Cinema Masters Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((vid) => {
            const isHovered = hoveredCardId === vid.id;
            return (
              <div
                key={vid.id}
                onMouseEnter={() => setHoveredCardId(vid.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectVideo(vid.ulid)}
                className="group cursor-pointer space-y-3"
              >
                {/* Thumbnail Stage with 4s Muted Motion Preview on Hover */}
                <div className="aspect-video rounded-xl overflow-hidden bg-[#12151C] relative border border-white/10 group-hover:border-indigo-500/50 shadow-lg transition">
                  <img
                    src={vid.posterUrl}
                    alt={vid.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isHovered ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Motion Preview Image (Simulated 4s muted motion preview) */}
                  {isHovered && (
                    <img
                      src={vid.motionPreviewUrl}
                      alt={vid.title}
                      className="absolute inset-0 w-full h-full object-cover animate-pulse"
                    />
                  )}

                  {/* Top-Right Badge: 4K */}
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                      4K
                    </span>
                  </div>

                  {/* Bottom-Right Monospace Duration Pill */}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md text-white font-mono text-[11px] tabular-nums border border-white/15">
                      {formatSec(vid.durationSeconds)}
                    </span>
                  </div>

                  {/* Mini Scrubbable Chapter Preview Bar on Hover */}
                  {isHovered && vid.chapters && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 flex gap-[1px]">
                      {vid.chapters.map((ch, cIdx) => (
                        <div key={ch.id} className="flex-1 bg-indigo-500/80 hover:bg-white transition" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Metadata Anatomy */}
                <div className="flex gap-3">
                  <img
                    src={vid.channelAvatar}
                    alt={vid.channelName}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition">
                      {vid.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <span>{vid.channelName}</span>
                      <CheckCircle2 size={12} className="text-indigo-400" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>{vid.viewsCount.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{vid.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
