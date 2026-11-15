import React from 'react';
import type { ComputedArtifactMeta, ExhibitionRow, PersonaContext } from '../types/portfolio';
import { PERSONA_PRESETS } from '../engine/personaResolver';
import { ArtifactPlate } from './ArtifactPlate';

interface ExhibitionCanvasProps {
  rows: ExhibitionRow[];
  totalCatalogCount: number;
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  onInspect: (id: string) => void;
  persona: PersonaContext;
  onSelectPersonaPreset: (queryString: string) => void;
  onResetFilters: () => void;
}

export const ExhibitionCanvas: React.FC<ExhibitionCanvasProps> = ({
  rows,
  totalCatalogCount,
  pinnedIds,
  onTogglePin,
  onInspect,
  persona,
  onSelectPersonaPreset,
  onResetFilters,
}) => {
  const isPersonaMatch = (meta: ComputedArtifactMeta): boolean => {
    if (!persona.active) return false;
    return (
      persona.priorityDisciplines.includes(meta.artifact.primaryDiscipline) ||
      meta.artifact.personaTags.some((t) => persona.priorityTags.includes(t))
    );
  };

  return (
    <main className="exhibition-grid-container pt-10 sm:pt-16 pb-28">
      {/* Editorial Exhibition Intro & Tailored Persona Banner */}
      <section className="mb-16 sm:mb-24 border-b border-[var(--border-hairline)] pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                {persona.active
                  ? `TAILORED PORTFOLIO MODE // ?${persona.tokenKey}=${persona.tokenValue}`
                  : 'EXHIBITION CATALOG // VOL. IV — ZURICH • COPENHAGEN • KYOTO'}
              </span>
              {persona.active && (
                <span className="inline-flex items-center gap-1.5 font-mono-catalog text-[10px] uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[var(--canvas-elevated)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]" />
                  Dynamic Sequence Active
                </span>
              )}
            </div>

            <h1 className="exhibition-hero-title text-[var(--text-primary)]">
              {persona.greetingTitle}
            </h1>

            <p className="case-study-lead text-[var(--text-secondary)] mt-5">
              {persona.greetingSubtitle}
            </p>
          </div>

          {/* Right Column: Subtle Tailored Mode Switcher */}
          <div className="lg:col-span-4 flex flex-col lg:items-end gap-2.5">
            <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Tailored Portfolio Links
            </span>
            <div className="flex flex-wrap lg:justify-end gap-1.5">
              {PERSONA_PRESETS.map((preset) => {
                const isSelected =
                  (!persona.active && preset.id === 'default') ||
                  (persona.active &&
                    persona.tokenKey === preset.context.tokenKey &&
                    persona.tokenValue === preset.context.tokenValue);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPersonaPreset(preset.queryString)}
                    className={`px-2.5 py-1 rounded-full font-mono-catalog text-[11px] tracking-[0.04em] transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] border-transparent'
                        : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hairline-strong)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Empty Filter State */}
      {rows.length === 0 ? (
        <div className="py-24 text-center border border-[var(--border-hairline)] rounded-[14px] bg-[var(--canvas-elevated)]/45">
          <p className="font-serif-display text-[32px] text-[var(--text-primary)]">
            No plates match this exact tonal &amp; discipline intersection.
          </p>
          <p className="text-[15px] text-[var(--text-secondary)] mt-2">
            Reset one filter lens to restore the gallery rhythm.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-6 px-5 py-2.5 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] font-mono-catalog text-[12px] uppercase tracking-[0.06em] cursor-pointer hover:opacity-90 transition-opacity"
          >
            Reset Exhibition Filters
          </button>
        </div>
      ) : (
        <div className="exhibition-gallery-dimming flex flex-col gap-[72px] lg:gap-[136px]">
          {rows.map((row) => {
            if (row.pattern === 'full-stage') {
              const item = row.items[0];
              return (
                <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-10 lg:col-start-2">
                    <ArtifactPlate
                      meta={item}
                      totalCatalogCount={totalCatalogCount}
                      isPinned={pinnedIds.has(item.artifact.id)}
                      onTogglePin={onTogglePin}
                      onInspect={onInspect}
                      priorityPersonaMatch={isPersonaMatch(item)}
                    />
                  </div>
                </div>
              );
            }

            if (row.pattern === 'asymmetric-pair' && row.items.length === 2) {
              const [left, right] = row.items;
              return (
                <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                  <div className="lg:col-span-6 lg:col-start-1">
                    <ArtifactPlate
                      meta={left}
                      totalCatalogCount={totalCatalogCount}
                      isPinned={pinnedIds.has(left.artifact.id)}
                      onTogglePin={onTogglePin}
                      onInspect={onInspect}
                      priorityPersonaMatch={isPersonaMatch(left)}
                    />
                  </div>
                  <div className="lg:col-span-5 lg:col-start-8 lg:mt-[96px]">
                    <ArtifactPlate
                      meta={right}
                      totalCatalogCount={totalCatalogCount}
                      isPinned={pinnedIds.has(right.artifact.id)}
                      onTogglePin={onTogglePin}
                      onInspect={onInspect}
                      priorityPersonaMatch={isPersonaMatch(right)}
                    />
                  </div>
                </div>
              );
            }

            // Pattern C: Cross-Medium Diptych (Equal-height side-by-side without cropping!)
            if (row.pattern === 'cross-medium-diptych' && row.items.length === 2) {
              const [first, second] = row.items;
              return (
                <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-10 lg:col-start-2">
                    {row.caption && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                        <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {row.caption}
                        </span>
                      </div>
                    )}
                    {/* Matched visual height row on md+ via flex proportional to native aspect ratio */}
                    <div className="flex flex-col md:flex-row gap-10 md:gap-[16px] items-start">
                      <div
                        className="w-full"
                        style={{ flex: `${first.computedAspectRatio} 1 0%` }}
                      >
                        <ArtifactPlate
                          meta={first}
                          totalCatalogCount={totalCatalogCount}
                          isPinned={pinnedIds.has(first.artifact.id)}
                          onTogglePin={onTogglePin}
                          onInspect={onInspect}
                          priorityPersonaMatch={isPersonaMatch(first)}
                        />
                      </div>
                      <div
                        className="w-full"
                        style={{ flex: `${second.computedAspectRatio} 1 0%` }}
                      >
                        <ArtifactPlate
                          meta={second}
                          totalCatalogCount={totalCatalogCount}
                          isPinned={pinnedIds.has(second.artifact.id)}
                          onTogglePin={onTogglePin}
                          onInspect={onInspect}
                          priorityPersonaMatch={isPersonaMatch(second)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Fallback single render
            return (
              <div key={row.id}>
                <ArtifactPlate
                  meta={row.items[0]}
                  totalCatalogCount={totalCatalogCount}
                  isPinned={pinnedIds.has(row.items[0].artifact.id)}
                  onTogglePin={onTogglePin}
                  onInspect={onInspect}
                  priorityPersonaMatch={isPersonaMatch(row.items[0])}
                />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

