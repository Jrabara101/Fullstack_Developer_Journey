import React, { useState, useEffect } from 'react';
import type { LightQuality, TonalSwatch } from '../types';
import { TONAL_PALETTE_DOTS, EXHIBITION_SERIES } from '../data/exhibitionData';
import { X } from 'lucide-react';

interface CurationBarProps {
  selectedLight: LightQuality | 'All';
  onSelectLight: (light: LightQuality | 'All') => void;
  selectedSwatch: TonalSwatch | null;
  onSelectSwatch: (swatch: TonalSwatch | null) => void;
  selectedSeries: string;
  onSelectSeries: (seriesId: string) => void;
  totalFilteredCount: number;
}

export const CurationBar: React.FC<CurationBarProps> = ({
  selectedLight,
  onSelectLight,
  selectedSwatch,
  onSelectSwatch,
  selectedSeries,
  onSelectSeries,
  totalFilteredCount,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide when scrolling down, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 180) {
        if (currentScrollY > lastScrollY + 10) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY - 8) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const lightOptions: Array<{ label: string; value: LightQuality | 'All' }> = [
    { label: 'All Light', value: 'All' },
    { label: 'Golden Hour', value: 'Golden Hour' },
    { label: 'Blue Hour & Nocturne', value: 'Blue Hour & Nocturne' },
    { label: 'Soft Overcast', value: 'Soft Overcast' },
    { label: 'Midday Shadows', value: 'Harsh Midday Shadows' },
  ];

  const hasActiveFilter = selectedLight !== 'All' || selectedSwatch !== null || selectedSeries !== 'all';

  const clearAllFilters = () => {
    onSelectLight('All');
    onSelectSwatch(null);
    onSelectSeries('all');
  };

  return (
    <aside aria-label="Curatorial filters"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--surface-glass)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        {/* Series Selector Pill */}
        <div className="flex items-center gap-1.5 border-r pr-3" style={{ borderColor: 'var(--border-hairline)' }}>
          <select
            value={selectedSeries}
            onChange={(e) => onSelectSeries(e.target.value)}
            className="text-[11px] font-mono tracking-wider uppercase bg-transparent cursor-pointer focus:outline-hidden py-1"
            style={{ color: 'var(--text-primary)' }}
            title="Filter by Exhibition Series"
          >
            {EXHIBITION_SERIES.map((s) => (
              <option key={s.id} value={s.id} className="bg-neutral-900 text-neutral-100">
                {s.title} ({s.count})
              </option>
            ))}
          </select>
        </div>

        {/* Light Quality Filters */}
        <div className="hidden sm:flex items-center gap-1">
          {lightOptions.map((opt) => {
            const isSelected = selectedLight === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSelectLight(opt.value)}
                className={`relative px-2.5 py-1 text-[11px] font-sans font-medium transition-all rounded-full ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {opt.label}
                {isSelected && opt.value !== 'All' && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#D93829]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-4 w-[1px] opacity-20" style={{ backgroundColor: 'var(--text-primary)' }} />

        {/* Perceptual Color Swatch Palette Filters */}
        <div className="flex items-center gap-2" title="Filter by dominant color palette">
          {TONAL_PALETTE_DOTS.map((swatch) => {
            const isSelected = selectedSwatch === swatch.name;
            return (
              <button
                key={swatch.name}
                onClick={() => onSelectSwatch(isSelected ? null : swatch.name)}
                className="group relative flex items-center justify-center p-0.5 focus:outline-hidden transition-transform hover:scale-125"
                title={`${swatch.name}: ${swatch.desc}`}
                aria-label={`Filter by ${swatch.name}`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs transition-all block"
                  style={{
                    backgroundColor: swatch.color,
                    boxShadow: isSelected ? '0 0 0 2px var(--text-primary)' : 'none',
                  }}
                />
                {isSelected && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D93829]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filter Clear / Count Indicator */}
        {hasActiveFilter && (
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: 'var(--border-hairline)' }}>
            <span className="text-[10px] font-mono text-neutral-400">
              {totalFilteredCount} frames
            </span>
            <button
              onClick={clearAllFilters}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Reset all filters"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
