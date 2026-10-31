import React from 'react';
import { LocationInfo, SkyState } from '../types/weather';

interface HeaderProps {
  location: LocationInfo;
  currentSky: SkyState;
  onSelectSky: (sky: SkyState) => void;
  onOpenShowcase: () => void;
  onOpenPacking: () => void;
  onOpenRadar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  currentSky,
  onSelectSky,
  onOpenShowcase,
  onOpenPacking,
  onOpenRadar
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/40 backdrop-blur-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-white/10 transition-colors">
      <div className="h-20 max-w-[1280px] mx-auto px-4 md:px-margin-lg flex items-center justify-between gap-space-lg">
        {/* Brand & Location metadata */}
        <div className="flex items-center gap-space-xl">
          <div className="flex items-center gap-space-sm group cursor-pointer" onClick={onOpenShowcase}>
            <span className="font-headline-md text-headline-md tracking-tight font-medium text-primary">Aerie</span>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-variant/40 text-on-surface-variant font-section-label text-section-label uppercase tracking-widest text-[10px]">
              Atmosphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-tertiary">near_me</span>
            <span className="font-medium text-on-surface">{location.name}, {location.country === 'Japan' ? 'JP' : location.country}</span>
            <span className="text-outline text-body-sm">•</span>
            <span className="font-metric-value text-metric-value text-on-surface-variant tabular-nums">
              {location.stationCoords}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-full bg-surface-container-lowest/30 backdrop-blur-xl border border-white/10">
          <button
            type="button"
            className="px-space-md py-1.5 transition-all bg-surface-variant/60 text-on-surface font-semibold rounded-full text-body-sm shadow-sm"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={onOpenRadar}
            className="px-space-md py-1.5 rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            Radar & Satellite
          </button>
          <button
            type="button"
            onClick={onOpenPacking}
            className="px-space-md py-1.5 rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">luggage</span>
            <span>Trip Packing</span>
          </button>
          <button
            type="button"
            onClick={onOpenShowcase}
            className="px-space-md py-1.5 rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">wb_twilight</span>
            <span>Sky Showcase</span>
          </button>
        </nav>

        {/* Right controls: Sky Selector, Clock & Profile */}
        <div className="flex items-center gap-space-md">
          {/* Quick Sky Theme Cycler */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/15">
            <button
              title="Golden Hour sky"
              onClick={() => onSelectSky('golden-hour')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                currentSky === 'golden-hour' ? 'bg-amber-500 text-white shadow-sm scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">wb_twilight</span>
            </button>
            <button
              title="Clear Noon sky"
              onClick={() => onSelectSky('clear-noon')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                currentSky === 'clear-noon' ? 'bg-sky-500 text-white shadow-sm scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">sunny</span>
            </button>
            <button
              title="Overcast sky"
              onClick={() => onSelectSky('overcast')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                currentSky === 'overcast' ? 'bg-slate-500 text-white shadow-sm scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">cloud</span>
            </button>
            <button
              title="Night sky"
              onClick={() => onSelectSky('night')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                currentSky === 'night' ? 'bg-indigo-600 text-white shadow-sm scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">nights_stay</span>
            </button>
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-variant/30 backdrop-blur-md text-on-surface-variant border border-white/10">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="font-metric-value text-metric-value tabular-nums text-on-surface text-xs md:text-sm">
              18:42 GMT
            </span>
          </div>

          {/* User profile / Station pill */}
          <button
            type="button"
            onClick={onOpenPacking}
            title="Open Trip Packing Mode"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">luggage</span>
          </button>
        </div>
      </div>
    </header>
  );
};

