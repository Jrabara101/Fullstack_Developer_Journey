import React from 'react';
import { 
  Clock, 
  Sparkles, 
  Smile, 
  Coffee, 
  Brain, 
  Flame, 
  Tv, 
  RotateCcw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { TimeBucket, MoodCategory } from '../types';

interface AntiFatigueRibbonProps {
  selectedTime: TimeBucket | 'all';
  onSelectTime: (time: TimeBucket | 'all') => void;
  selectedMood: MoodCategory | 'all';
  onSelectMood: (mood: MoodCategory | 'all') => void;
  onOpenPickForUs: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalMatchesCount: number;
}

export const AntiFatigueRibbon: React.FC<AntiFatigueRibbonProps> = ({
  selectedTime,
  onSelectTime,
  selectedMood,
  onSelectMood,
  onOpenPickForUs,
  hasActiveFilters,
  onClearFilters,
  totalMatchesCount
}) => {
  const timeOptions: { key: TimeBucket | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Times', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'under30', label: 'Under 30m', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'under90', label: 'Under 90m', icon: <Clock className="w-3.5 h-3.5 text-[#FBBF24]" /> },
    { key: 'fullNight', label: 'Full Movie Night', icon: <Tv className="w-3.5 h-3.5" /> }
  ];

  const moodOptions: { key: MoodCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Moods', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'laugh', label: 'Need a Laugh', icon: <Smile className="w-3.5 h-3.5 text-[#FBBF24]" /> },
    { key: 'cozy', label: 'Cozy & Comforting', icon: <Coffee className="w-3.5 h-3.5 text-[#FB923C]" /> },
    { key: 'mind-bending', label: 'Mind-Bending', icon: <Brain className="w-3.5 h-3.5 text-[#A855F7]" /> },
    { key: 'adrenaline', label: 'Adrenaline Rush', icon: <Flame className="w-3.5 h-3.5 text-[#EF4444]" /> },
    { key: 'background', label: 'Background Friendly', icon: <Tv className="w-3.5 h-3.5 text-[#34D399]" /> }
  ];

  return (
    <div className="sticky top-[68px] z-30 glass-ribbon transition-all duration-300">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left Section: Time & Mood Filter Groups */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Label Helper */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-white/40 font-medium mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Anti-Decision Filter:</span>
          </div>

          {/* Time Available Filter Group */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-full border border-white/5">
            {timeOptions.map((opt) => {
              const isActive = selectedTime === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectTime(opt.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'glass-pill-active text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-white/10" />

          {/* Mood Filter Group */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-full border border-white/5">
            {moodOptions.map((opt) => {
              const isActive = selectedMood === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectMood(opt.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'glass-pill-active text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white/80 hover:text-white border border-white/10 transition-all whitespace-nowrap"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3 text-[#E50914]" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Section: "Pick For Us" Showdown Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {hasActiveFilters && (
            <span className="hidden md:inline text-xs text-[#34D399] font-medium">
              {totalMatchesCount} matches
            </span>
          )}

          <button
            onClick={onOpenPickForUs}
            className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E50914]/90 to-[#991B1B] hover:from-[#E50914] hover:to-[#B81D24] border border-[#E50914]/40 text-white text-xs font-bold shadow-lg shadow-[#E50914]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] group-hover:rotate-12 transition-transform" />
            <span>Pick For Us</span>
            <span className="hidden sm:inline text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-normal">
              3-Card Showdown
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

