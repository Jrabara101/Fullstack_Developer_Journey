import React, { useState, useEffect, useRef } from 'react';
import { SEARCH_INDEX, SearchItem, getQuickCompareSunniest, QuickCompareItem } from '../services/weatherEngine';

interface SearchBarProps {
  currentLocationId: string;
  onSelectLocation: (locationKey: string) => void;
  onLocateMe: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentLocationId,
  onSelectLocation,
  onLocateMe
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickCompare, setShowQuickCompare] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const filteredResults: SearchItem[] = query.trim() === ''
    ? SEARCH_INDEX.slice(0, 4)
    : SEARCH_INDEX.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.secondary.toLowerCase().includes(query.toLowerCase())
      );

  const quickCompareList: QuickCompareItem[] = getQuickCompareSunniest(currentLocationId);

  const handleSelect = (key: string) => {
    onSelectLocation(key);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[560px]">
      {/* Search Pill */}
      <div
        className={`relative w-full h-12 rounded-full bg-white/10 dark:bg-surface-container-low/50 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.22)] flex items-center px-4 gap-3 border border-white/20 transition-all duration-200 ${
          isOpen ? 'bg-white/20 shadow-[0_0_0_2px_rgba(255,183,135,0.5),0_12px_40px_rgba(0,0,0,0.4)]' : 'hover:bg-white/15'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-primary shrink-0">search</span>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search a city, zip, or landmark..."
          className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 tracking-normal"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onLocateMe();
              setIsOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-on-surface text-[12px] font-section-label transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">near_me</span>
            <span className="hidden sm:inline">Locate me</span>
          </button>
          <kbd className="px-2 py-0.5 rounded-md bg-surface-container-highest/60 text-on-surface-variant text-[11px] font-metric-value tracking-wider uppercase font-medium">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] w-full rounded-[20px] bg-[#191f30]/95 backdrop-blur-2xl border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-5 flex flex-col text-on-surface text-left animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Section: Suggestions */}
          <div className="text-[11px] font-semibold tracking-wider text-white/60 uppercase mb-2 flex items-center justify-between">
            <span>{query ? 'Results' : 'Suggestions'}</span>
            <span className="text-[10px] text-white/40">Cities · Landmarks · Zip codes</span>
          </div>

          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            {filteredResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-white/60">
                No matching locations found for "{query}". Try "Kyoto", "Hakuba", or "605-0862".
              </div>
            ) : (
              filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.targetLocationKey)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">
                      {item.type === 'landmark' ? 'temple_buddhist' : item.type === 'postal' ? 'markunread_mailbox' : 'location_city'}
                    </span>
                    <div className="flex items-center gap-1.5 font-body-md text-body-md text-white font-medium">
                      <span className="font-semibold text-white group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-white/60 font-normal">· {item.secondary}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.temp && (
                      <span className="text-[13px] font-metric-value text-white/80 tabular-nums">
                        {item.temp}°
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'landmark'
                        ? 'bg-amber-500/20 text-tertiary'
                        : item.type === 'postal'
                        ? 'bg-white/10 text-white/70'
                        : 'bg-sky-500/20 text-secondary'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section: Pinned Places */}
          <div className="border-t border-white/15 my-3"></div>
          <div className="text-[11px] font-semibold tracking-wider text-white/60 uppercase mb-2">
            Pinned Places
          </div>

          <div className="flex flex-col gap-1">
            <div
              onClick={() => handleSelect('kyoto')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-tertiary">home</span>
                <span className="font-body-md text-body-md text-white">Home · Kyoto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-tertiary">wb_sunny</span>
                <span className="font-metric-value text-metric-value font-semibold text-white">21°</span>
              </div>
            </div>

            <div
              onClick={() => handleSelect('osaka')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary">holiday_village</span>
                <span className="font-body-md text-body-md text-white">Parents' House · Osaka</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-secondary">partly_cloudy_day</span>
                <span className="font-metric-value text-metric-value font-semibold text-white">22°</span>
              </div>
            </div>

            <div
              onClick={() => handleSelect('hakuba')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary">cabin</span>
                <span className="font-body-md text-body-md text-white">Weekend Cabin · Hakuba</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-secondary">cloud</span>
                <span className="font-metric-value text-metric-value font-semibold text-white">9°</span>
              </div>
            </div>
          </div>

          {/* Section: Contextual Quick Compare */}
          <div className="border-t border-white/15 my-3"></div>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">compare_arrows</span>
              <span className="text-body-sm font-body-sm font-medium text-white">
                Contextual Quick Compare
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickCompare(!showQuickCompare)}
              className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors shadow-sm ${
                showQuickCompare ? 'bg-[#34D399] justify-end' : 'bg-white/20 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          {showQuickCompare && (
            <div className="mt-2.5 p-3 rounded-xl bg-surface-container-lowest/60 border border-white/10 flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="text-[13px] font-medium text-white/90 flex items-center justify-between">
                <span>Where is it sunniest right now?</span>
                <span className="text-[11px] text-white/50">Sun hours left</span>
              </div>

              <div className="flex flex-col gap-2">
                {quickCompareList.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelect(place.id)}
                    className="flex items-center justify-between text-[12px] p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <span>{place.rank}. {place.name}</span>
                      <span className="text-tertiary font-bold tabular">{place.temp}°</span>
                      <span className="text-white/60 text-[11px]">{place.condition}</span>
                      {place.isCurrent && (
                        <span className="px-1.5 py-0.2 bg-white/20 rounded text-[9px] uppercase font-bold text-primary">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-36 sm:w-44">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
                          style={{ width: `${(place.sunHoursLeft / place.maxSunHours) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white/80 font-metric-value tabular-nums w-10 text-right">
                        {place.sunHoursLeft > 0 ? `${place.sunHoursLeft}h` : '0h'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

