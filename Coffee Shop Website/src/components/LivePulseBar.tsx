import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { TURNTABLE_TRACKS } from '../data/mockData';
import { Disc3, Flame, Sparkles, Sun, Sunset, Moon, Coffee as CoffeeIcon } from 'lucide-react';
import type { TimeOfDayPhase } from '../types';

export const LivePulseBar: React.FC = () => {
  const { 
    timeOfDay, 
    setTimeOfDay, 
    currentTrackIndex, 
    isPlayingVinyl, 
    toggleVinyl, 
    nextVinylTrack,
    pastryItems,
    pastryBakeMinutes,
    setIsCorkboardOpen,
    communityCups
  } = useCoffeeShop();

  const currentTrack = TURNTABLE_TRACKS[currentTrackIndex];
  const freshPastry = pastryItems[0];
  const freshMinutes = pastryBakeMinutes[freshPastry.id] || freshPastry.bakedMinutesAgo;
  const unclaimedCupsCount = communityCups.filter(c => !c.isClaimed).length;

  const timePhases: { id: TimeOfDayPhase; label: string; time: string; icon: React.ReactNode }[] = [
    { id: 'morning', label: 'Morning Ritual', time: '8:00 AM', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'midday', label: 'Midday Focus', time: '1:00 PM', icon: <Sparkles className="w-3.5 h-3.5 text-terracotta" /> },
    { id: 'golden-hour', label: 'Golden Hour', time: '4:30 PM', icon: <Sunset className="w-3.5 h-3.5 text-amber-honey" /> },
    { id: 'evening-lounge', label: 'Vinyl Lounge', time: '6:30 PM', icon: <Moon className="w-3.5 h-3.5 text-berry-origin" /> },
  ];

  return (
    <div className="bg-surface-roast text-canvas-oat border-b border-white/10 text-xs py-2 px-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: 3 Neighborhood Pulse Signals */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 justify-center lg:justify-start">
          
          {/* Signal 1: Live Seating Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Cozy & Unhurried</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80">Window & Oak Table seats open right now</span>
          </div>

          {/* Signal 2: Fresh from the Oven */}
          <div className="hidden sm:flex items-center gap-1.5 text-amber-200/90 font-mono">
            <Flame className="w-3.5 h-3.5 text-terracotta shrink-0 animate-pulse" />
            <span>
              <span className="text-white font-sans">{freshPastry.name}</span> pulled {freshMinutes}m ago ({freshPastry.stockRemaining} left)
            </span>
          </div>

          {/* Signal 3: Spinning on House Turntable */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 transition-colors">
            <button 
              onClick={toggleVinyl}
              title={isPlayingVinyl ? "Pause Vinyl" : "Play Vinyl"}
              className="flex items-center gap-1.5 focus:outline-none"
            >
              <Disc3 className={`w-3.5 h-3.5 text-amber-300 ${isPlayingVinyl ? 'animate-spin-slow' : 'opacity-60'}`} />
              <span className="text-white/70">Turntable:</span>
              <span className="text-white font-medium">{currentTrack.title} — {currentTrack.artist}</span>
              <span className="font-mono text-[10px] text-white/50">({currentTrack.rpm})</span>
            </button>
            <button 
              onClick={nextVinylTrack}
              title="Skip to next record"
              className="text-white/40 hover:text-white text-[11px] font-mono ml-1"
            >
              [Next ↺]
            </button>
          </div>

        </div>

        {/* Right: Time-of-Day Atmosphere Shift Simulation + Community Cup Nudge */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Pay-it-forward board pill */}
          <button 
            onClick={() => setIsCorkboardOpen(true)}
            className="flex items-center gap-1.5 text-xs text-amber-300/90 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/20 transition-all"
            title="Open Neighborhood Corkboard"
          >
            <CoffeeIcon className="w-3.5 h-3.5" />
            <span>Pay-It-Forward: <strong>{unclaimedCupsCount}</strong> Cups on Board</span>
          </button>

          {/* Time of Day Simulation Bar */}
          <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-white/10">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider px-2 hidden sm:inline">
              Atmosphere:
            </span>
            {timePhases.map((phase) => {
              const isActive = timeOfDay === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setTimeOfDay(phase.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all ${
                    isActive 
                      ? 'bg-terracotta text-white font-semibold shadow-sm' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Switch atmosphere to ${phase.label} (${phase.time})`}
                >
                  {phase.icon}
                  <span className="hidden xl:inline">{phase.label}</span>
                  <span className="font-mono text-[10px] opacity-80">{phase.time}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
