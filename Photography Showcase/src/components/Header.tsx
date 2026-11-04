import React from 'react';
import type { ViewMode, GalleryTheme } from '../types';
import { Eye, Grid, Film, Sparkles, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: GalleryTheme;
  onThemeCycle: () => void;
  collectorCount: number;
  onOpenTray: () => void;
  activeSeriesTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  theme,
  onThemeCycle,
  collectorCount,
  onOpenTray,
  activeSeriesTitle,
}) => {
  const getThemeLabel = (t: GalleryTheme) => {
    switch (t) {
      case 'cotton': return 'Archival Cotton';
      case 'white': return 'Museum White';
      case 'darkroom': return 'Darkroom Obsidian';
    }
  };

  const getThemeIndicatorBg = (t: GalleryTheme) => {
    switch (t) {
      case 'cotton': return 'bg-[#F6F4F0] border-neutral-400';
      case 'white': return 'bg-[#FCFCFA] border-neutral-300';
      case 'darkroom': return 'bg-[#0E0E0E] border-neutral-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] px-6 md:px-16 flex items-center justify-between border-b transition-colors duration-400 backdrop-blur-md bg-opacity-80"
      style={{
        backgroundColor: 'var(--surface-glass)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      {/* Left: Photographer & Series */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-xl md:text-2xl tracking-tight font-light" style={{ color: 'var(--text-primary)' }}>
            KAIROS
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-40 hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            ARCHIVE
          </span>
        </div>
        <div className="h-4 w-[1px] opacity-20 hidden md:block" style={{ backgroundColor: 'var(--text-primary)' }} />
        <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 truncate max-w-[200px] lg:max-w-xs hidden md:inline">
          {activeSeriesTitle}
        </span>
      </div>

      {/* Center: View Pacing Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-full border"
        style={{
          borderColor: 'var(--border-hairline)',
          backgroundColor: 'var(--canvas-elevated)',
        }}
      >
        <button
          onClick={() => onViewModeChange('exhibition')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-sans font-medium transition-all ${
            viewMode === 'exhibition'
              ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-semibold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Exhibition Flow: Museum paced scroll with generous whitespace"
        >
          <Eye size={13} className="opacity-70" />
          <span className="hidden sm:inline">Exhibition</span>
        </button>

        <button
          onClick={() => onViewModeChange('contact-sheet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-sans font-medium transition-all ${
            viewMode === 'contact-sheet'
              ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-semibold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Contact Sheet Index: High-density analog film strip grid"
        >
          <Grid size={13} className="opacity-70" />
          <span className="hidden sm:inline">Contact Sheet</span>
        </button>

        <button
          onClick={() => onViewModeChange('cinema')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-sans font-medium transition-all ${
            viewMode === 'cinema'
              ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-semibold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Cinema Slideshow: Distraction-free full-screen slideshow"
        >
          <Film size={13} className="opacity-70" />
          <span className="hidden sm:inline">Cinema</span>
        </button>
      </div>

      {/* Right: Lighting Switcher & Collector's Tray */}
      <div className="flex items-center gap-4">
        {/* Gallery Lighting Environment Swatch Button */}
        <button
          onClick={onThemeCycle}
          className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--canvas-elevated)',
          }}
          title={`Gallery Lighting: ${getThemeLabel(theme)} (Click to switch)`}
          aria-label="Cycle gallery lighting"
        >
          <div className={`w-3.5 h-3.5 rounded-full border shadow-xs transition-transform group-hover:scale-110 ${getThemeIndicatorBg(theme)}`} />
          <span className="text-[11px] font-mono tracking-tight hidden lg:inline" style={{ color: 'var(--text-secondary)' }}>
            {theme === 'cotton' ? 'Cotton' : theme === 'white' ? 'White' : 'Obsidian'}
          </span>
          {theme === 'darkroom' ? (
            <Moon size={11} className="text-amber-300 opacity-80" />
          ) : (
            <Sun size={11} className="text-neutral-500 opacity-60" />
          )}
        </button>

        {/* Collector's Tray Trigger */}
        <button
          onClick={onOpenTray}
          className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 hover:border-neutral-400 group"
          style={{
            borderColor: collectorCount > 0 ? 'var(--accent-vermilion)' : 'var(--border-hairline)',
            backgroundColor: 'var(--canvas-elevated)',
          }}
          title="Collector's Tray & Inquiry Dock"
        >
          <Sparkles size={13} className={collectorCount > 0 ? 'text-[#D93829]' : 'text-neutral-400'} />
          <span className="text-[12px] font-mono font-medium tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Tray <span className="opacity-60">[{collectorCount.toString().padStart(2, '0')}]</span>
          </span>
          {collectorCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
