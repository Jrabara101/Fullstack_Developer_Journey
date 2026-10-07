import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Compass, Wifi, WifiOff, Car } from 'lucide-react';
import { WeatherLocation } from '../types/weather';
import { TemperatureUnit } from '../utils/weatherFormatters';

interface HeaderProps {
  location: WeatherLocation;
  savedLocations: WeatherLocation[];
  onSelectLocation: (loc: WeatherLocation) => void;
  onOpenCommandPalette: () => void;
  onOpenCommuteModal: () => void;
  onDetectLocation: () => void;
  isDetecting: boolean;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  isOffline: boolean;
  cachedTime?: string | null;
  daylightPhase: string;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  savedLocations,
  onSelectLocation,
  onOpenCommandPalette,
  onOpenCommuteModal,
  onDetectLocation,
  isDetecting,
  unit,
  onToggleUnit,
  isOffline,
  cachedTime,
  daylightPhase,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [location.timezone]);

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 border-b border-white/[0.08] backdrop-blur-2xl bg-black/25">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Active Location Title & Dropdown Switcher */}
        <div className="relative flex items-center gap-2.5">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10]"
            title="Switch saved location"
          >
            <MapPin className="w-4 h-4 text-weather-cyan group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="font-semibold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                {location.name}
                {location.custom_label && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-weather-cyan/20 text-weather-cyan">
                    {location.custom_label}
                  </span>
                )}
              </span>
              <p className="text-[11px] text-white/50 hidden sm:block truncate max-w-[180px]">
                {location.label || location.country}
              </p>
            </div>
            <span className="text-xs text-white/40 ml-1">▾</span>
          </button>

          {/* GPS Auto-detect Button */}
          <button
            onClick={onDetectLocation}
            disabled={isDetecting}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-50"
            title="Detect microclimate at your current GPS location"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin text-weather-cyan' : ''}`} />
          </button>

          {/* Quick Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-72 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 border border-white/10"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 px-3 py-1.5">
                Saved Microclimates
              </div>
              <div className="space-y-1">
                {savedLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      loc.id === location.id
                        ? 'bg-weather-cyan/20 text-weather-cyan font-medium'
                        : 'text-white/80 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1.5">
                        {loc.name}
                        {loc.custom_label && (
                          <span className="text-[9px] text-white/50">({loc.custom_label})</span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40">{loc.country}</div>
                    </div>
                    {loc.id === location.id && <span className="w-1.5 h-1.5 rounded-full bg-weather-cyan" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 mt-2 pt-2 px-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="w-full text-center text-xs py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3 h-3" /> Search Global Locations (Cmd+K)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Live Local Clock & Daylight Phase Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-xs">
          <Compass className="w-3.5 h-3.5 text-weather-gold animate-pulse-subtle" />
          <span className="font-mono text-white/90 font-medium">{currentTime}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70 tracking-tight">{daylightPhase}</span>
        </div>

        {/* Right: Quick Tools & Toggles */}
        <div className="flex items-center gap-2">
          {/* Commute Sentinel Modal Trigger */}
          <button
            onClick={onOpenCommuteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-xs font-medium text-white/85 hover:text-white transition-all"
            title="Inspect commute weather and route friction"
          >
            <Car className="w-3.5 h-3.5 text-weather-amber" />
            <span className="hidden sm:inline">Commute Sentinel</span>
          </button>

          {/* Quick Finder (Cmd+K) */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-xs font-medium text-white/80 hover:text-white transition-all"
            title="Search locations (Cmd+K or Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-weather-cyan" />
            <span className="hidden lg:inline text-white/50">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-white/[0.10] text-white/70 border border-white/[0.10]">
              ⌘K
            </kbd>
          </button>

          {/* Unit Toggle: °C / °F Instant Flip */}
          <button
            onClick={onToggleUnit}
            className="flex items-center justify-center w-10 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] font-mono text-xs font-semibold text-white transition-all"
            title="Toggle between Celsius and Fahrenheit"
          >
            °{unit}
          </button>

          {/* Offline Sync Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono ${
              isOffline
                ? 'bg-weather-amber/15 border-weather-amber/30 text-weather-amber'
                : 'bg-weather-emerald/10 border-weather-emerald/25 text-weather-emerald'
            }`}
            title={isOffline ? `Showing cached forecast from ${cachedTime || 'storage'}` : 'Live atmospheric feeds synced'}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Offline Cached</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Synced</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
