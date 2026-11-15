import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ColorHarmonyId, Discipline, VisualMood } from '../types/portfolio';
import { COLOR_HARMONIES } from '../engine/paletteEngine';

interface CurationBarProps {
  selectedDiscipline: Discipline | 'All Work';
  onSelectDiscipline: (discipline: Discipline | 'All Work') => void;
  selectedColor: ColorHarmonyId | null;
  onSelectColor: (color: ColorHarmonyId | null) => void;
  selectedMood: VisualMood | null;
  onSelectMood: (mood: VisualMood | null) => void;
  visibleCount: number;
  totalCount: number;
  hiddenByScroll: boolean;
  onResetFilters: () => void;
}

const DISCIPLINES: (Discipline | 'All Work')[] = [
  'All Work',
  'Brand & Typography',
  'Digital Product / UI',
  'Editorial Photography',
  'Motion & 3D',
];

const MOODS: VisualMood[] = [
  'Minimal & Architectural',
  'Golden Hour & Analog',
  'High-Contrast Nocturne',
  'Playful & Kinetic',
];

export const CurationBar: React.FC<CurationBarProps> = ({
  selectedDiscipline,
  onSelectDiscipline,
  selectedColor,
  onSelectColor,
  selectedMood,
  onSelectMood,
  visibleCount,
  totalCount,
  hiddenByScroll,
  onResetFilters,
}) => {
  const [expandedMoods, setExpandedMoods] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);

  const hasActiveFilter =
    selectedDiscipline !== 'All Work' || selectedColor !== null || selectedMood !== null;

  const isCollapsed = hiddenByScroll && !pinnedOpen && !expandedMoods;

  return (
    <div
      className={`sticky top-[80px] z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
        isCollapsed ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      onMouseEnter={() => setPinnedOpen(true)}
      onMouseLeave={() => setPinnedOpen(false)}
    >
      <div className="exhibition-grid-container flex justify-center">
        <div className="pointer-events-auto max-w-full rounded-full glass-whisper border border-[var(--border-hairline)] px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
          {/* Craft & Medium Lenses */}
          <div className="flex items-center flex-wrap justify-center gap-1">
            {DISCIPLINES.map((discipline) => {
              const active = selectedDiscipline === discipline;
              return (
                <button
                  key={discipline}
                  type="button"
                  onClick={() => onSelectDiscipline(discipline)}
                  className={`px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-medium tracking-[0.02em] transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-elevated)]/65'
                  }`}
                >
                  {active && discipline !== 'All Work' && (
                    <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent-vermilion)]" />
                  )}
                  <span>{discipline}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden md:inline-block w-[1px] h-4 bg-[var(--border-hairline-strong)] mx-1" />

          {/* Perceptual Color Swatch Filter (5 minimal color dots) */}
          <div className="flex items-center gap-2 px-1.5" role="group" aria-label="Filter by perceptual palette">
            <span className="hidden xl:inline font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Tone
            </span>
            {COLOR_HARMONIES.map((swatch) => {
              const active = selectedColor === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => onSelectColor(active ? null : swatch.id)}
                  title={`${swatch.label} — ${swatch.description}`}
                  aria-label={`Filter by ${swatch.label}`}
                  aria-pressed={active}
                  className={`relative w-[16px] h-[16px] rounded-full transition-transform duration-200 cursor-pointer focus:outline-none ${
                    active ? 'scale-115 ring-2 ring-offset-2 ring-[var(--text-primary)] ring-offset-[var(--canvas-bg)]' : 'hover:scale-110 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>

          <span className="hidden md:inline-block w-[1px] h-4 bg-[var(--border-hairline-strong)] mx-1" />

          {/* Lighting & Mood Toggle + Expandable Row */}
          <button
            type="button"
            onClick={() => setExpandedMoods((v) => !v)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium tracking-[0.02em] transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              selectedMood || expandedMoods
                ? 'bg-[var(--canvas-elevated)] text-[var(--text-primary)] border border-[var(--border-hairline-strong)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{selectedMood ?? 'Mood & Light'}</span>
            {selectedMood && (
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent-vermilion)]" />
            )}
          </button>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-full font-mono-catalog text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--accent-vermilion)] transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Clear active filters"
            >
              <X className="w-3 h-3" />
              <span>
                {visibleCount}/{totalCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mood Strip */}
      {expandedMoods && (
        <div className="exhibition-grid-container flex justify-center mt-2">
          <div className="pointer-events-auto rounded-full glass-whisper border border-[var(--border-hairline)] px-3 py-1.5 flex flex-wrap items-center justify-center gap-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
            <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] px-2">
              Lighting &amp; Mood
            </span>
            {MOODS.map((mood) => {
              const active = selectedMood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => onSelectMood(active ? null : mood)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-elevated)]/70'
                  }`}
                >
                  {active && (
                    <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent-vermilion)]" />
                  )}
                  <span>{mood}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

