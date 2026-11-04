import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  Volume2, 
  VolumeX, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Video
} from 'lucide-react';
import { MediaItem } from '../types';
import { calculateFinishTime } from '../services/finishByCalculator';

interface HeroBillboardProps {
  item: MediaItem;
  featuredItems: MediaItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onPlay: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  isInShortlist: boolean;
  onOpenDetails: (item: MediaItem) => void;
  referenceTime: Date;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({
  item,
  featuredItems,
  currentIndex,
  onSelectIndex,
  onPlay,
  onToggleShortlist,
  isInShortlist,
  onOpenDetails,
  referenceTime,
  isMuted,
  onToggleMute
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Compute live finish by time
  const finishInfo = calculateFinishTime(item.durationMinutes, 0, referenceTime);

  const prevItem = () => {
    const nextIdx = (currentIndex - 1 + featuredItems.length) % featuredItems.length;
    onSelectIndex(nextIdx);
  };

  const nextItem = () => {
    const nextIdx = (currentIndex + 1) % featuredItems.length;
    onSelectIndex(nextIdx);
  };

  return (
    <section className="relative w-full h-[82vh] min-h-[580px] max-h-[860px] overflow-hidden select-none bg-[#0B0C0E]">
      {/* Background Media Container (Ken Burns Image or Live Video Simulation) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {isPlayingPreview ? (
          <div className="w-full h-full relative">
            {/* Animated high-definition trailer simulation canvas / video */}
            <div className="w-full h-full relative overflow-hidden bg-black">
              <img
                src={item.backdropUrl}
                alt={item.title}
                className="w-full h-full object-cover scale-105 filter brightness-90 contrast-105 transition-all duration-1000"
              />
              {/* Subtle simulated pulsing cinematic scanline */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute top-28 right-12 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                <span>TRAILER PREVIEW ACTIVE</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <img
              src={item.backdropUrl}
              alt={item.title}
              className="w-full h-full object-cover animate-ken-burns filter brightness-90 contrast-105 transition-all duration-700"
            />
          </div>
        )}

        {/* Seamless Vignettes */}
        <div className="absolute inset-0 vignette-hero-left pointer-events-none" />
        <div className="absolute inset-0 vignette-hero-bottom pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0C0E]/90 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content Stack (Bottom-Left Aligned, max-width 640px) */}
      <div className="relative z-10 max-w-[1760px] mx-auto h-full px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-28 sm:pb-32">
        <div className="max-w-[620px] space-y-4">
          {/* Context Kicker Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />
            <span>
              {item.isTop10 ? `#${item.isTop10} IN MOVIES TODAY` : 'PERFECT FOR TONIGHT'}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[#FBBF24] font-medium">CURATOR’S PICK</span>
          </div>

          {/* Title Treatment */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05] drop-shadow-2xl">
            {item.title}
          </h1>

          {/* Decision Metadata Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="text-[#34D399] font-bold text-sm tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {item.matchScores.alex || 96}% Match
            </span>
            <span className="text-white/30">•</span>
            <span className="px-1.5 py-0.5 rounded bg-white/15 text-white/90 border border-white/20 text-[11px] font-mono-numbers">
              {item.maturityRating}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/80 font-mono-numbers">
              {finishInfo.durationFormatted}
            </span>
            <span className="text-white/30">•</span>

            {/* Live "Finish By" Timestamp Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] font-mono-numbers font-medium shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>Finish by {finishInfo.finishTimeFormatted}</span>
            </div>

            {/* Cognitive Load Indicator */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[11px] border border-white/10">
              <ShieldCheck className="w-3 h-3 text-[#34D399]" />
              {item.cognitiveLoad}
            </span>
          </div>

          {/* "Why Watch Tonight" Hook & Synopsis */}
          <div className="space-y-1.5">
            <p className="text-sm sm:text-base font-semibold text-white/95 leading-snug drop-shadow-md">
              "{item.editorialHook}"
            </p>
            <p className="text-xs sm:text-sm text-[#F8FAFC]/75 leading-relaxed line-clamp-2 max-w-[56ch]">
              {item.synopsis}
            </p>
          </div>

          {/* Pacing & Vibe Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {item.pacingTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.8 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Primary CTA: Play */}
            <button
              onClick={() => onPlay(item)}
              className="h-11 px-6 rounded-xl bg-white hover:bg-white/90 text-[#0B0C0E] font-bold text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current text-[#0B0C0E]" />
              <span>Play Now</span>
            </button>

            {/* Secondary CTA: Add to Tonight's Shortlist */}
            <button
              onClick={() => onToggleShortlist(item)}
              className={`h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${
                isInShortlist
                  ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40 hover:bg-[#34D399]/30'
                  : 'glass-pill text-white hover:bg-white/20'
              }`}
            >
              {isInShortlist ? (
                <>
                  <Check className="w-4 h-4 text-[#34D399]" />
                  <span>In Shortlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tonight's Shortlist</span>
                </>
              )}
            </button>

            {/* Tertiary CTA: More Info & Pacing */}
            <button
              onClick={() => onOpenDetails(item)}
              className="h-11 px-4 rounded-xl glass-pill text-white/90 hover:text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition-all"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Pacing & Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Edge Controls: Trailer Toggle, Mute, Carousel Nav */}
      <div className="absolute right-4 sm:right-8 lg:right-12 bottom-28 sm:bottom-32 z-20 flex flex-col items-end gap-3">
        {/* Non-intrusive Trailer Preview Toggle */}
        <button
          onClick={() => setIsPlayingPreview(!isPlayingPreview)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-semibold text-white/90 hover:text-white backdrop-blur-md shadow-xl transition-all"
          title="Toggle preview video"
        >
          <Video className="w-3.5 h-3.5 text-[#E50914]" />
          <span>{isPlayingPreview ? 'Show Calm Key-Art' : 'Preview Trailer'}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Mute / Unmute Button with persistent audio memory */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>

          {/* Featured Title Selector Carousel Controls */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 p-1 rounded-full">
            <button
              onClick={prevItem}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              title="Previous Featured Title"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-1">
              {featuredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectIndex(idx)}
                  className={`transition-all rounded-full ${
                    currentIndex === idx
                      ? 'w-5 h-1.5 bg-[#E50914]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`Title ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextItem}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              title="Next Featured Title"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

