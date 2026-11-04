import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Film, Smile, Brain, Utensils, RotateCcw, Users } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface HorizontalSwimlaneProps {
  id: string;
  title: string;
  subtitle: string;
  items: MediaItem[];
  iconName?: string;
  jointScores?: Record<string, number>;
  onPlay: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  shortlistIds: string[];
  onOpenDetails: (item: MediaItem) => void;
  onHoverCard?: (item: MediaItem | null) => void;
  referenceTime: Date;
  isRanked?: boolean;
}

export const HorizontalSwimlane: React.FC<HorizontalSwimlaneProps> = ({
  title,
  subtitle,
  items,
  iconName,
  jointScores,
  onPlay,
  onToggleShortlist,
  shortlistIds,
  onOpenDetails,
  onHoverCard,
  referenceTime,
  isRanked = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getIcon = () => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-[#E50914]" />;
      case 'Users': return <Users className="w-5 h-5 text-[#34D399]" />;
      case 'Brain': return <Brain className="w-5 h-5 text-[#A855F7]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#FB923C]" />;
      case 'Smile': return <Smile className="w-5 h-5 text-[#FBBF24]" />;
      case 'Film': return <Film className="w-5 h-5 text-[#38BDF8]" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5 text-[#E50914]" />;
      default: return <Sparkles className="w-5 h-5 text-[#E50914]" />;
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const distance = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative my-9 max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
        </div>

        {/* Explore All link & carousel indicators */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs text-white/40 opacity-0 group-hover/row:opacity-100 transition-opacity font-medium hover:text-white cursor-pointer">
            Explore All ›
          </span>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center transition-all ${
                canScrollLeft ? 'text-white hover:bg-white/25 hover:scale-105' : 'text-white/20 cursor-not-allowed'
              }`}
              title="Previous titles"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center transition-all ${
                canScrollRight ? 'text-white hover:bg-white/25 hover:scale-105' : 'text-white/20 cursor-not-allowed'
              }`}
              title="More titles"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-6 -my-6 px-1"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {items.map((item, index) => {
          const isInShortlist = shortlistIds.includes(item.id);
          const jointScore = jointScores ? jointScores[item.id] : undefined;

          return (
            <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
              <MovieCard
                item={item}
                jointScore={jointScore}
                onPlay={onPlay}
                onToggleShortlist={onToggleShortlist}
                isInShortlist={isInShortlist}
                onOpenDetails={onOpenDetails}
                onHoverStateChange={onHoverCard}
                referenceTime={referenceTime}
                rank={isRanked ? index + 1 : undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

