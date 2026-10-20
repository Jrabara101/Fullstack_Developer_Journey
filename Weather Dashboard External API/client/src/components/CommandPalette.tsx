import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plus, Star, X, Clock, Compass } from 'lucide-react';
import { WeatherLocation } from '../types/weather';
import { TemperatureUnit } from '../utils/weatherFormatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  savedLocations: WeatherLocation[];
  onSelectLocation: (loc: WeatherLocation) => void;
  onAddLocation: (loc: WeatherLocation) => void;
  activeLocationId?: string;
  unit: TemperatureUnit;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  savedLocations,
  onSelectLocation,
  onAddLocation,
  activeLocationId,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: WeatherLocation[] = await res.json();
          setSearchResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation: Up, Down, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const activeList = searchResults.length > 0 ? searchResults : savedLocations;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % activeList.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeList[selectedIndex]) {
          const chosen = activeList[selectedIndex];
          onSelectLocation(chosen);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, savedLocations, selectedIndex, onSelectLocation, onClose]);

  if (!isOpen) return null;

  const displayList = searchResults.length > 0 ? searchResults : savedLocations;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-2xl glass-panel-elevated rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-weather-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search global cities, neighborhoods, coordinates..."
            className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base focus:outline-none font-sans"
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-weather-cyan border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 px-3 py-1">
            {searchResults.length > 0 ? 'Search Results' : 'Favorites Matrix & Saved Microclimates'}
          </div>

          {displayList.map((loc, idx) => {
            const isSelected = selectedIndex === idx;
            const isSaved = savedLocations.some((s) => s.name === loc.name && s.country === loc.country);
            const isActiveCurrent = loc.id === activeLocationId;

            return (
              <div
                key={loc.id || idx}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-150 border ${
                  isSelected
                    ? 'bg-white/[0.12] border-weather-cyan/40 shadow-md scale-[1.01]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-weather-cyan/20 text-weather-cyan' : 'bg-white/5 text-white/60'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      {loc.name}
                      {loc.custom_label && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-weather-cyan/20 text-weather-cyan">
                          {loc.custom_label}
                        </span>
                      )}
                      {isActiveCurrent && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-weather-emerald/20 text-weather-emerald">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{loc.label || loc.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] font-mono text-white/40 hidden sm:block">
                    <span>{loc.timezone}</span>
                  </div>

                  {!isSaved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddLocation(loc);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-weather-cyan hover:text-black text-white/70 transition-colors"
                      title="Save to favorites matrix"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {isSaved && <Star className="w-4 h-4 text-weather-gold fill-weather-gold/20" />}
                </div>
              </div>
            );
          })}

          {displayList.length === 0 && !isSearching && (
            <div className="py-8 text-center text-xs text-white/40 font-mono">
              No matching atmospheric microclimates found. Try another city name.
            </div>
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50 px-5">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select Stage</span>
            <span>Esc Dismiss</span>
          </div>
          <span>Aetheris Global Index</span>
        </div>
      </div>
    </div>
  );
};
