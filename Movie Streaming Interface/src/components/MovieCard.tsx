import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ChevronDown,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { MediaItem } from '../types';
import { calculateFinishTime } from '../services/finishByCalculator';

interface MovieCardProps {
  item: MediaItem;
  jointScore?: number;
  matchExplanation?: string;
  onPlay: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  isInShortlist: boolean;
  onOpenDetails: (item: MediaItem) => void;
  onHoverStateChange?: (item: MediaItem | null) => void;
  referenceTime: Date;
  rank?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  jointScore,
  matchExplanation,
  onPlay,
  onToggleShortlist,
  isInShortlist,
  onOpenDetails,
  onHoverStateChange,
  referenceTime,
  rank
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayMatchScore = jointScore ?? item.matchScores.alex ?? 95;
  const finishInfo = calculateFinishTime(
    item.durationMinutes,
    item.progress?.progressSeconds ?? 0,
    referenceTime
  );

  const handleMouseEnter = () => {
    // 250ms hover intent delay as specified in stitch.md
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
      if (onHoverStateChange) onHoverStateChange(item);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovered(false);
    if (onHoverStateChange) onHoverStateChange(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <div
      className="relative flex-shrink-0 w-[260px] sm:w-[290px] md:w-[320px] aspect-[16/9] group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Idle Base Card */}
      <div className="w-full h-full rounded-lg overflow-hidden bg-[#181A20] border border-white/5 shadow-md relative transition-transform duration-200">
        <img
          src={item.backdropUrl}
          alt={item.title}
          className="w-full h-full object-cover filter brightness-95 group-hover:brightness-105 transition-all duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          {rank !== undefined && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              <Flame className="w-3 h-3 fill-current" />
              TOP {rank}
            </span>
          )}
          {item.isTop10 && rank === undefined && (
            <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-extrabold tracking-wider shadow-md">
              TOP 10
            </span>
          )}
          {item.type === 'series' && (
            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-semibold">
              SERIES
            </span>
          )}
        </div>

        {/* Bottom Title Bar (Idle state) */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between">
          <div className="overflow-hidden pr-2">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
              {item.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-white/70">
              <span className="text-[#34D399] font-bold">{displayMatchScore}% Match</span>
              <span>•</span>
              <span className="font-mono-numbers">{finishInfo.durationFormatted}</span>
            </div>
          </div>
          {item.cognitiveLoad === 'Background-Friendly' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#34D399]/20 text-[#34D399] font-semibold border border-[#34D399]/30 flex-shrink-0">
              Chill
            </span>
          )}
        </div>

        {/* Continue Watching Progress bar if present */}
        {item.progress && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div
              className="h-full bg-[#E50914]"
              style={{
                width: `${Math.min(100, (item.progress.progressSeconds / (item.durationMinutes * 60)) * 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Expanded Hover Card Overlay */}
      {isHovered && (
        <div
          className="absolute -top-16 -left-6 w-[310px] sm:w-[340px] md:w-[370px] z-50 rounded-xl overflow-hidden bg-[#1F222A] border border-white/15 shadow-[0_22px_45px_rgba(0,0,0,0.85)] spring-transition animate-in fade-in zoom-in-95 duration-200"
          style={{ transformOrigin: 'center center' }}
        >
          {/* Top Half: Mini Preview Artwork with Gradient */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
            <img
              src={item.backdropUrl}
              alt={item.title}
              className="w-full h-full object-cover filter brightness-95 scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 vignette-card-bottom pointer-events-none" />

            {/* Title Overlay in preview */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
              <div>
                <h3 className="font-display font-extrabold text-base text-white leading-tight drop-shadow-lg">
                  {item.title}
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-1 italic font-medium">
                  "{item.editorialHook}"
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Info Tray */}
          <div className="p-3.5 space-y-2.5 bg-[#1F222A]">
            {/* 1. Quick Action Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(item);
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>

                {/* Shortlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShortlist(item);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${isInShortlist
                      ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    }`}
                  title={isInShortlist ? "In Shortlist" : "Add to Tonight's Shortlist"}
                >
                  {isInShortlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                {/* Thumbs Up Rating */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${isLiked
                      ? 'bg-[#E50914]/20 border-[#E50914] text-[#E50914]'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80 hover:text-white'
                    }`}
                  title="Rate this title"
                >
                  <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Chevron Down: More Details Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(item);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
                title="More Info & Pacing"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Smart Metadata Line */}
            <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
              <span className="text-[#34D399] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {displayMatchScore}% Match
              </span>
              <span className="text-white/30">•</span>
              <span className="px-1 py-0.2 rounded bg-white/15 text-[10px] text-white/90 font-mono-numbers">
                {item.maturityRating}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-white/80 font-mono-numbers text-[11px]">
                {finishInfo.durationFormatted}
              </span>
            </div>

            {/* Live Finish-By Timestamp Banner */}
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[11px] text-[#FBBF24] font-mono-numbers">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Finish by {finishInfo.finishTimeFormatted}</span>
              </div>
              <span className="text-[10px] opacity-75 font-sans">if started now</span>
            </div>

            {/* 3. Vibe Match Reason */}
            <p className="text-[11px] text-white/70 line-clamp-2 leading-tight">
              {matchExplanation || item.matchReason}
            </p>

            {/* 4. Cognitive Load & Pacing Micro-Tags */}
            <div className="pt-1 flex flex-wrap items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 text-[10px] font-semibold border border-white/15 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-[#34D399]" />
                {item.cognitiveLoad}
              </span>

              {item.pacingTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};