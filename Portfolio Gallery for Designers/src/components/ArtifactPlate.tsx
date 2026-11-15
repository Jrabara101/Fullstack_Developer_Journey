import React, { useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Layers } from 'lucide-react';
import type { ComputedArtifactMeta } from '../types/portfolio';
import { XRayLayerOverlay } from './XRayLayerOverlay';

interface ArtifactPlateProps {
  meta: ComputedArtifactMeta;
  totalCatalogCount: number;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onInspect: (id: string) => void;
  priorityPersonaMatch?: boolean;
}

export const ArtifactPlate: React.FC<ArtifactPlateProps> = ({
  meta,
  totalCatalogCount,
  isPinned,
  onTogglePin,
  onInspect,
  priorityPersonaMatch = false,
}) => {
  const { artifact } = meta;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [holdingXRay, setHoldingXRay] = useState(false);

  const isPhoto = artifact.kind === 'photography';

  return (
    <article className="exhibition-plate-card group exhibition-flip-enter">
      {/* Uncropped Native Aspect-Ratio Artwork Container */}
      <div
        className={`relative w-full overflow-hidden cursor-pointer select-none transition-shadow duration-500 ${
          isPhoto
            ? 'rounded-none'
            : 'rounded-[12px] border border-[var(--border-hairline)]'
        }`}
        style={{
          aspectRatio: `${artifact.nativeWidth} / ${artifact.nativeHeight}`,
          backgroundColor: artifact.dominantHexes[0],
        }}
        onClick={() => onInspect(artifact.id)}
      >
        {/* Crisp Uncropped Artwork (Never zoom-cropped on hover!) */}
        <img
          src={artifact.imageUrl}
          alt={`${artifact.title} — ${artifact.subtitle}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain block transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Live Interactive Quick-X-Ray Layer when holding the hover micro-pill */}
        {holdingXRay && (
          <div className="absolute inset-0 z-10 animate-fadeIn">
            <XRayLayerOverlay artifact={artifact} showFullLabels={true} />
          </div>
        )}

        {/* Subtle Top-Right X-Ray Micro-Pill (Hover Only — Never permanently obscures art) */}
        <div
          className="
            absolute top-3.5 right-3.5 z-20
            opacity-0 group-hover:opacity-100 focus-within:opacity-100
            transition-opacity duration-300
          "
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onMouseDown={() => setHoldingXRay(true)}
            onMouseUp={() => setHoldingXRay(false)}
            onMouseLeave={() => setHoldingXRay(false)}
            onTouchStart={() => setHoldingXRay(true)}
            onTouchEnd={() => setHoldingXRay(false)}
            className="px-3 py-1.5 rounded-full glass-darkroom border border-white/15 text-white/95 font-mono-catalog text-[10px] tracking-[0.06em] uppercase inline-flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-sm"
            title="Press and hold to X-Ray wireframe / ungraded RAW"
          >
            <Layers className="w-3 h-3" />
            <span>{holdingXRay ? 'X-Ray Active' : 'Hold to X-Ray Process'}</span>
          </button>
        </div>
      </div>

      {/* Below-Frame Museum Label Block (Never overlaid on artwork) */}
      <div className="mt-[14px] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        {/* Left: Catalog Numeral + Serif Title + Discipline Badge */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-mono-catalog text-[11px] tracking-[0.08em] uppercase text-[var(--text-muted)]">
              {artifact.catalogNumber} / {String(totalCatalogCount).padStart(2, '0')}
            </span>
            <h2
              onClick={() => onInspect(artifact.id)}
              className="font-serif-display text-[22px] sm:text-[26px] leading-[1.15] text-[var(--text-primary)] cursor-pointer hover:opacity-75 transition-opacity"
            >
              {artifact.title}
            </h2>
            {priorityPersonaMatch && (
              <span className="font-mono-catalog text-[10px] uppercase tracking-[0.07em] px-2 py-0.5 rounded-full border border-[var(--border-hairline-strong)] text-[var(--text-secondary)]">
                Curated Match
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-[var(--text-secondary)]">
              {artifact.disciplines.join(' • ')}
            </span>
            <span className="text-[var(--text-muted)] text-[11px]">•</span>
            <span className="font-mono-catalog text-[11px] tracking-[0.06em] uppercase text-[var(--text-muted)]">
              {artifact.aspectRatioLabel}
            </span>
          </div>
        </div>

        {/* Right: Year & Client + Quiet Micro-Actions (Fade in smoothly on hover) */}
        <div className="flex items-center gap-4 shrink-0 sm:opacity-55 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-300">
          <span className="font-mono-catalog text-[11px] tracking-[0.06em] uppercase text-[var(--text-muted)]">
            {artifact.year} • {artifact.location}
          </span>

          <button
            type="button"
            onClick={() => onTogglePin(artifact.id)}
            className={`font-mono-catalog text-[11px] tracking-[0.05em] uppercase inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPinned
                ? 'text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isPinned ? 'Remove from Client Briefcase' : 'Collect to Client Briefcase'}
          >
            {isPinned ? (
              <>
                <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-vermilion)]" />
                <Check className="w-3 h-3" />
                <span>Briefcase</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3" />
                <span>+ Briefcase</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onInspect(artifact.id)}
            className="font-mono-catalog text-[11px] tracking-[0.05em] uppercase text-[var(--text-primary)] hover:text-[var(--accent-vermilion)] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect Case</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

