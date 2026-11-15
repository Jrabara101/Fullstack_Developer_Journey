import React, { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowUpRight, Bookmark, Check, Grid, List } from 'lucide-react';
import type { ComputedArtifactMeta } from '../types/portfolio';

interface ContactSheetViewProps {
  allMetas: ComputedArtifactMeta[];
  matchingIds: Set<string>;
  hasActiveFilters: boolean;
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  onInspect: (id: string) => void;
}

type ContactSubView = 'grid' | 'table';
type SortKey = 'catalog' | 'year' | 'client' | 'discipline' | 'deliverables';

export const ContactSheetView: React.FC<ContactSheetViewProps> = ({
  allMetas,
  matchingIds,
  hasActiveFilters,
  pinnedIds,
  onTogglePin,
  onInspect,
}) => {
  const [subView, setSubView] = useState<ContactSubView>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('catalog');
  const [sortAsc, setSortAsc] = useState(true);
  const [hideDimmed, setHideDimmed] = useState(false);

  const sortedMetas = useMemo(() => {
    const base = hideDimmed && hasActiveFilters
      ? allMetas.filter((m) => matchingIds.has(m.artifact.id))
      : [...allMetas];

    return base.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'year':
          cmp = a.artifact.year - b.artifact.year;
          break;
        case 'client':
          cmp = a.artifact.client.localeCompare(b.artifact.client);
          break;
        case 'discipline':
          cmp = a.artifact.primaryDiscipline.localeCompare(b.artifact.primaryDiscipline);
          break;
        case 'deliverables':
          cmp = (a.artifact.deliverables[0] || '').localeCompare(
            b.artifact.deliverables[0] || ''
          );
          break;
        case 'catalog':
        default:
          cmp = a.artifact.catalogNumber.localeCompare(b.artifact.catalogNumber);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [allMetas, hideDimmed, hasActiveFilters, matchingIds, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key !== 'year');
    }
  };

  return (
    <main className="exhibition-grid-container pt-10 pb-28 exhibition-flip-enter">
      {/* Header & Sub-View Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--border-hairline)]">
        <div>
          <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            COMPLETE ARCHIVE // CONTACT SHEET &amp; INDEX ({allMetas.length} PLATES)
          </span>
          <h1 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.08] text-[var(--text-primary)] mt-2">
            Archival Contact Sheet
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1.5">
            Rapid full-body scanning without cropping. Active discipline &amp; palette filters highlight matching plates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setHideDimmed((v) => !v)}
              className="px-3 py-1.5 rounded-full border border-[var(--border-hairline)] font-mono-catalog text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {hideDimmed ? 'Show Dimmed Context' : `Matches Only (${matchingIds.size})`}
            </button>
          )}

          <div className="inline-flex p-1 rounded-full border border-[var(--border-hairline)] bg-[var(--canvas-elevated)]">
            <button
              type="button"
              onClick={() => setSubView('grid')}
              className={`px-3 py-1 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                subView === 'grid'
                  ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Contact Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('table')}
              className={`px-3 py-1 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                subView === 'table'
                  ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Swiss Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-View 1: Analog Contact Grid (Square Matting Boxes, Uncropped object-contain) */}
      {subView === 'grid' ? (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {sortedMetas.map((meta) => {
            const { artifact } = meta;
            const isMatch = !hasActiveFilters || matchingIds.has(artifact.id);
            const isPinned = pinnedIds.has(artifact.id);

            return (
              <div
                key={artifact.id}
                className={`group transition-opacity duration-300 ${
                  isMatch ? 'opacity-100' : 'opacity-35 hover:opacity-80'
                }`}
              >
                {/* 1:1 Matting Well with strict object-contain uncropped miniature */}
                <div
                  onClick={() => onInspect(artifact.id)}
                  className="relative aspect-square p-4 bg-[var(--canvas-elevated)] border border-[var(--border-hairline)] hover:border-[var(--border-hairline-strong)] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <img
                    src={artifact.imageUrl}
                    alt={artifact.title}
                    loading="lazy"
                    className={`max-w-full max-h-full object-contain block ${
                      artifact.kind === 'design' ? 'rounded-[4px]' : 'rounded-none'
                    }`}
                  />

                  {/* Subtle corner pin trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(artifact.id);
                    }}
                    title={isPinned ? 'Remove from Briefcase' : 'Pin to Briefcase'}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isPinned
                        ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] border-transparent opacity-100'
                        : 'bg-[var(--canvas-bg)]/90 text-[var(--text-secondary)] border-[var(--border-hairline)] opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isPinned ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                  </button>
                </div>

                {/* Film Rebate Frame Metadata */}
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono-catalog text-[11px] tracking-[0.06em] text-[var(--text-muted)]">
                    {artifact.contactFrameCode}
                  </span>
                  <span className="font-mono-catalog text-[10px] tracking-[0.06em] uppercase text-[var(--text-muted)]">
                    {artifact.aspectRatioLabel}
                  </span>
                </div>
                <div
                  onClick={() => onInspect(artifact.id)}
                  className="text-[13px] font-medium text-[var(--text-primary)] truncate cursor-pointer hover:underline"
                >
                  {artifact.title}
                </div>
                <div className="font-mono-catalog text-[10px] text-[var(--text-secondary)] truncate">
                  {artifact.client} • {artifact.year}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Sub-View 2: Swiss Archival Table (Sortable by Year, Client, Discipline, Deliverables) */
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-hairline-strong)] font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <th className="py-3.5 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort('catalog')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span>Cat #</span>
                    <ArrowDownUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 pr-4">Plate</th>
                <th className="py-3.5 pr-4">Project Title</th>
                <th className="py-3.5 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort('client')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span>Client</span>
                    <ArrowDownUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort('discipline')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span>Discipline</span>
                    <ArrowDownUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort('deliverables')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span>Deliverables / Print Specs</span>
                    <ArrowDownUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort('year')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span>Year</span>
                    <ArrowDownUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMetas.map((meta) => {
                const { artifact, maxPrint300Dpi } = meta;
                const isMatch = !hasActiveFilters || matchingIds.has(artifact.id);
                const isPinned = pinnedIds.has(artifact.id);

                return (
                  <tr
                    key={artifact.id}
                    onClick={() => onInspect(artifact.id)}
                    className={`border-b border-[var(--border-hairline)] hover:bg-[var(--canvas-elevated)]/65 transition-all cursor-pointer ${
                      isMatch ? 'opacity-100' : 'opacity-35 hover:opacity-85'
                    }`}
                  >
                    <td className="py-4 pr-4 font-mono-catalog text-[12px] text-[var(--text-muted)]">
                      {artifact.catalogNumber}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="w-14 h-12 bg-[var(--canvas-elevated)] border border-[var(--border-hairline)] flex items-center justify-center p-1">
                        <img
                          src={artifact.imageUrl}
                          alt={artifact.title}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-serif-display text-[20px] leading-tight text-[var(--text-primary)]">
                        {artifact.title}
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                        {artifact.subtitle}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[13px] text-[var(--text-primary)]">
                      <div>{artifact.client}</div>
                      <div className="font-mono-catalog text-[10px] text-[var(--text-muted)] uppercase">
                        {artifact.location}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[13px] text-[var(--text-secondary)]">
                      {artifact.primaryDiscipline}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        {artifact.deliverables.join(' • ')}
                      </div>
                      <div className="font-mono-catalog text-[10px] text-[var(--text-muted)] mt-0.5 uppercase">
                        {maxPrint300Dpi
                          ? `Max Print @ 300 DPI: ${maxPrint300Dpi.formattedIn}`
                          : `Design Tokens • ${artifact.aspectRatioLabel}`}
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-mono-catalog text-[12px] text-[var(--text-muted)]">
                      {artifact.year}
                    </td>
                    <td
                      className="py-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onTogglePin(artifact.id)}
                          className="font-mono-catalog text-[11px] uppercase tracking-[0.05em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isPinned && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]" />
                          )}
                          <span>{isPinned ? 'Pinned' : '+ Pin'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onInspect(artifact.id)}
                          className="font-mono-catalog text-[11px] uppercase tracking-[0.05em] text-[var(--text-primary)] hover:text-[var(--accent-vermilion)] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

