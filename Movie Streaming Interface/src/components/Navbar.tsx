import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Search, 
  Users, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ChevronDown, 
  Check,
  Calendar,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { HOUSEHOLD_PROFILES } from '../data/mockData';
import { TIME_SIMULATION_PRESETS } from '../services/timeSwimlaneOrchestrator';

interface NavbarProps {
  activeProfileIds: string[];
  onToggleProfile: (profileId: string) => void;
  shortlistCount: number;
  onOpenShortlist: () => void;
  onOpenPickForUs: () => void;
  currentTimeBadge: string;
  simulatedHour: number;
  onSelectTimeSimulation: (hour: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfileIds,
  onToggleProfile,
  shortlistCount,
  onOpenShortlist,
  onOpenPickForUs,
  currentTimeBadge,
  simulatedHour,
  onSelectTimeSimulation,
  searchQuery,
  onSearchChange,
  activeTab,
  onSelectTab
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showBlenderTooltip, setShowBlenderTooltip] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCoWatching = activeProfileIds.length > 1;
  const activeProfiles = HOUSEHOLD_PROFILES.filter(p => activeProfileIds.includes(p.id));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-2xl'
          : 'bg-gradient-to-b from-[#0B0C0E]/90 via-[#0B0C0E]/40 to-transparent'
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 h-[68px] flex items-center justify-between gap-4">
        {/* Left Zone: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => onSelectTab('Home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E50914] to-[#B81D24] flex items-center justify-center shadow-lg shadow-[#E50914]/25 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-xl tracking-wider text-white flex items-center gap-1.5">
                VELVET
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
              </span>
              <span className="text-[10px] tracking-widest text-[#F8FAFC]/50 uppercase font-semibold">Cinema</span>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {['Home', 'Series', 'Movies', 'New & Popular'].map(tab => (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'text-white font-semibold bg-white/10 shadow-sm'
                    : 'text-[#F8FAFC]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}

            {/* Tonight's Shortlist Link */}
            <button
              onClick={onOpenShortlist}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#F8FAFC]/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 relative group"
            >
              <Bookmark className="w-4 h-4 text-[#FBBF24] group-hover:scale-110 transition-transform" />
              <span>Tonight's Shortlist</span>
              {shortlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#E50914] text-[11px] font-bold text-white shadow-sm font-mono-numbers">
                  {shortlistCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Zone: Search, Household Blender, Time Orchestrator */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Trigger */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-[#181A20] border border-white/20 rounded-full px-3 py-1.5 shadow-lg w-52 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-white/50 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Titles, vibes, or actors..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-white/40"
                />
                <button 
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="text-white/50 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                title="Search (⌘K)"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Time-of-Day Orchestrator Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#F8FAFC]/80 hover:text-white flex items-center gap-1.5 transition-all"
              title="Time-of-day swimlane orchestrator"
            >
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="hidden lg:inline">{currentTimeBadge}</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {showTimeDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#181A20] border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
                    Time-of-Day Orchestrator
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Simulate how swimlanes adapt across daily human routines
                  </div>
                </div>

                <div className="space-y-1">
                  {TIME_SIMULATION_PRESETS.map((preset) => {
                    const isSelected = preset.hour === simulatedHour;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          onSelectTimeSimulation(preset.hour);
                          setShowTimeDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white">{preset.label}</div>
                          <div className="text-[10px] text-white/50">{preset.description}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#34D399]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* "Who's Watching Together?" Household Taste Blender */}
          <div className="relative">
            <div
              className={`flex items-center -space-x-2.5 p-1 rounded-full border transition-all cursor-pointer ${
                isCoWatching
                  ? 'border-[#34D399]/60 bg-[#34D399]/10 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
              onClick={() => setShowBlenderTooltip(!showBlenderTooltip)}
              title="Click to blend household tastes"
            >
              {HOUSEHOLD_PROFILES.map((profile) => {
                const isSelected = activeProfileIds.includes(profile.id);
                return (
                  <div
                    key={profile.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleProfile(profile.id);
                    }}
                    className={`relative w-8 h-8 rounded-full overflow-hidden transition-all transform hover:scale-110 hover:z-20 border-2 ${
                      isSelected
                        ? 'border-[#34D399] ring-2 ring-[#34D399]/40 z-10'
                        : 'border-transparent opacity-40 hover:opacity-80'
                    }`}
                    title={`${profile.name} (${isSelected ? 'Active' : 'Click to add to Co-Watch'})`}
                  >
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#34D399] ring-1 ring-[#0B0C0E]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Blender Info Popover */}
            {showBlenderTooltip && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#181A20] border border-white/15 p-3.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Users className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Household Taste Blender</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399]">
                    {isCoWatching ? `${activeProfiles.length} Watching Together` : 'Solo Profile'}
                  </span>
                </div>

                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  {isCoWatching
                    ? `Currently blending ${activeProfiles.map(p => p.name).join(' + ')}. Rows now filter out watched items and calculate a joint compromise score!`
                    : `Click multiple avatars to enable Co-Watching mode and blend your household’s tastes together.`}
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Toggle profiles to test</span>
                  <button
                    onClick={() => {
                      // Toggle all or solo Alex
                      if (activeProfileIds.length === HOUSEHOLD_PROFILES.length) {
                        onToggleProfile('sam'); // unblend
                      } else {
                        // Activate all
                        HOUSEHOLD_PROFILES.forEach(p => {
                          if (!activeProfileIds.includes(p.id)) onToggleProfile(p.id);
                        });
                      }
                    }}
                    className="text-[#34D399] font-medium hover:underline"
                  >
                    {activeProfileIds.length > 1 ? 'Reset to Single' : 'Blend All Profiles'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick "Pick For Us" Showdown Trigger */}
          <button
            onClick={onOpenPickForUs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#B81D24] text-white text-xs font-bold shadow-lg shadow-[#E50914]/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pick For Us</span>
          </button>
        </div>
      </div>
    </header>
  );
};

