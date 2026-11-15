import React from 'react';
import type { StudioLightingMode, ViewPostureMode } from '../types/portfolio';

interface MastheadProps {
  viewMode: ViewPostureMode;
  onChangeViewMode: (mode: ViewPostureMode) => void;
  lightingMode: StudioLightingMode;
  onCycleLighting: () => void;
  briefcaseCount: number;
  onOpenBriefcase: () => void;
  onOpenScopeMatchmaker: () => void;
  totalArtifacts: number;
  scrolled: boolean;
}

const LIGHTING_LABELS: Record<StudioLightingMode, { name: string; dotColor: string; ringColor: string }> = {
  cotton: {
    name: 'Archival Cotton',
    dotColor: '#F6F4F0',
    ringColor: '#C8BFA8',
  },
  white: {
    name: 'Gallery White',
    dotColor: '#FFFFFF',
    ringColor: '#D1D1CE',
  },
  darkroom: {
    name: 'Darkroom Obsidian',
    dotColor: '#141619',
    ringColor: '#5C5A55',
  },
};

export const Masthead: React.FC<MastheadProps> = ({
  viewMode,
  onChangeViewMode,
  lightingMode,
  onCycleLighting,
  briefcaseCount,
  onOpenBriefcase,
  onOpenScopeMatchmaker,
  totalArtifacts,
  scrolled,
}) => {
  const lightingInfo = LIGHTING_LABELS[lightingMode];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-whisper border-b border-[var(--border-hairline)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="exhibition-grid-container h-[72px] flex items-center justify-between gap-4">
        {/* Left Zone: Studio Monogram + Live Availability Pill */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => onChangeViewMode('exhibition')}
            className="text-left group focus:outline-none"
            title="Return to Curated Exhibition"
          >
            <div className="font-mono-catalog text-[11px] sm:text-[12px] tracking-[0.08em] uppercase text-[var(--text-primary)] font-medium truncate">
              ATELIER SØRENSEN <span className="text-[var(--text-muted)] hidden md:inline">— DESIGN &amp; VISUAL DIRECTION</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenScopeMatchmaker}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-hairline)] hover:border-[var(--border-hairline-strong)] transition-colors bg-[var(--canvas-elevated)]/60 cursor-pointer"
            title="Open 3-Click Scope Matchmaker"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-emerald)] pulse-availability shrink-0" />
            <span className="font-mono-catalog text-[11px] tracking-[0.04em] text-[var(--text-secondary)]">
              Booking Nov/Dec Commissions &amp; Sprints
            </span>
          </button>
        </div>

        {/* Center Zone: 3-Mode View Switcher */}
        <nav
          aria-label="Portfolio view posture"
          className="flex items-center gap-1 p-1 rounded-full border border-[var(--border-hairline)] bg-[var(--canvas-elevated)]/75 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => onChangeViewMode('exhibition')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium tracking-[0.02em] transition-all cursor-pointer ${
              viewMode === 'exhibition'
                ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Exhibition
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('index')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium tracking-[0.02em] transition-all cursor-pointer ${
              viewMode === 'index'
                ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Index <span className="hidden sm:inline font-mono-catalog text-[11px] opacity-75">({totalArtifacts})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('reel')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium tracking-[0.02em] transition-all cursor-pointer ${
              viewMode === 'reel'
                ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            60s Reel
          </button>
        </nav>

        {/* Right Zone: Studio Lighting Swatch + Client Briefcase Trigger */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <button
            type="button"
            onClick={onOpenScopeMatchmaker}
            className="lg:hidden inline-flex items-center justify-center w-7 h-7 rounded-full border border-[var(--border-hairline)]"
            aria-label="Booking availability and scope matchmaker"
            title="Booking Nov/Dec Commissions & Sprints"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-emerald)] pulse-availability" />
          </button>

          <button
            type="button"
            onClick={onCycleLighting}
            className="inline-flex items-center gap-2 group cursor-pointer focus:outline-none"
            title={`Studio Lighting: ${lightingInfo.name} (Click to switch)`}
            aria-label={`Studio lighting mode: ${lightingInfo.name}. Click to cycle.`}
          >
            <span
              className="w-[18px] h-[18px] rounded-full border transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: lightingInfo.dotColor,
                borderColor: lightingInfo.ringColor,
              }}
            />
            <span className="hidden xl:inline font-mono-catalog text-[11px] tracking-[0.06em] uppercase text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              {lightingInfo.name}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenBriefcase}
            className="inline-flex items-center gap-2 font-mono-catalog text-[12px] tracking-[0.06em] uppercase text-[var(--text-primary)] hover:opacity-75 transition-opacity cursor-pointer py-1.5"
          >
            {briefcaseCount > 0 && (
              <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-vermilion)]" />
            )}
            <span>
              Briefcase [{String(briefcaseCount).padStart(2, '0')}]
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

