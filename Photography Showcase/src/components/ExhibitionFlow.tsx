import React, { useState } from 'react';
import type { Photograph } from '../types';
import { VisualIntelligenceEngine } from '../services/visualIntelligence';
import { Maximize2, Plus, Check } from 'lucide-react';

interface ExhibitionFlowProps {
  photographs: Photograph[];
  onInspect: (photo: Photograph) => void;
  collectedIds: Set<string>;
  onToggleCollect: (photo: Photograph) => void;
}

export const ExhibitionFlow: React.FC<ExhibitionFlowProps> = ({
  photographs,
  onInspect,
  collectedIds,
  onToggleCollect,
}) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoaded = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const pacingInfo = VisualIntelligenceEngine.calculateEssayPacing(photographs);

  // Group photos into editorial rhythm segments (Hero, Offset Pair, Diptych Pair)
  const renderExhibitionRows = () => {
    const rows: React.ReactNode[] = [];
    let i = 0;

    while (i < photographs.length) {
      const current = photographs[i];
      const next = photographs[i + 1];

      // Check if current and next form a locked diptych pair
      if (
        next &&
        current.seriesPairId &&
        current.seriesPairId === next.seriesPairId
      ) {
        // Pattern C: Locked Diptych Pairing
        const { percentA, percentB } = VisualIntelligenceEngine.calculateDiptychWidths(
          current.aspectRatioNumeric,
          next.aspectRatioNumeric
        );

        rows.push(
          <section key={`diptych-${current.id}-${next.id}`} aria-label="Diptych presentation" className="w-full mb-32 md:mb-44">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-40" style={{ color: 'var(--text-secondary)' }}>
                COUPLET — DIPTYCH PAIRING
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-40" style={{ color: 'var(--text-secondary)' }}>
                DUAL CANVAS HARMONY
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Left Diptych Frame */}
              <div
                className="group relative flex flex-col cursor-pointer"
                style={{ width: `${percentA}%` }}
                onClick={() => onInspect(current)}
              >
                <div
                  className="relative w-full overflow-hidden transition-all duration-500 group-hover:brightness-[1.02]"
                  style={{
                    aspectRatio: `${current.aspectRatioNumeric}`,
                    backgroundColor: current.palette.ambientMattingHex,
                  }}
                >
                  <img
                    src={current.url}
                    alt={current.title}
                    loading="lazy"
                    onLoad={() => handleImageLoaded(current.id)}
                    className={`w-full h-full object-contain transition-opacity duration-700 ${
                      loadedImages[current.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Below-Frame Museum Label */}
                <div className="mt-3.5 flex items-start justify-between text-xs px-1">
                  <div>
                    <span className="font-mono text-[11px] tracking-wider text-neutral-400 block">
                      FIG. {current.catalogNumber}
                    </span>
                    <h3 className="font-serif italic text-base mt-0.5 tracking-normal" style={{ color: 'var(--text-primary)' }}>
                      {current.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] font-sans text-neutral-400 hidden lg:inline">
                      {current.humanizedLightContext.split('•')[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollect(current);
                      }}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors"
                      style={{ color: collectedIds.has(current.id) ? 'var(--accent-vermilion)' : 'var(--text-muted)' }}
                      title={collectedIds.has(current.id) ? 'In Collector’s Tray' : 'Add to Collector’s Tray'}
                    >
                      {collectedIds.has(current.id) ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => onInspect(current)}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors text-neutral-400"
                      title="Inspect frame in loupe lightbox"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Diptych Frame */}
              <div
                className="group relative flex flex-col cursor-pointer"
                style={{ width: `${percentB}%` }}
                onClick={() => onInspect(next)}
              >
                <div
                  className="relative w-full overflow-hidden transition-all duration-500 group-hover:brightness-[1.02]"
                  style={{
                    aspectRatio: `${next.aspectRatioNumeric}`,
                    backgroundColor: next.palette.ambientMattingHex,
                  }}
                >
                  <img
                    src={next.url}
                    alt={next.title}
                    loading="lazy"
                    onLoad={() => handleImageLoaded(next.id)}
                    className={`w-full h-full object-contain transition-opacity duration-700 ${
                      loadedImages[next.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Below-Frame Museum Label */}
                <div className="mt-3.5 flex items-start justify-between text-xs px-1">
                  <div>
                    <span className="font-mono text-[11px] tracking-wider text-neutral-400 block">
                      FIG. {next.catalogNumber}
                    </span>
                    <h3 className="font-serif italic text-base mt-0.5 tracking-normal" style={{ color: 'var(--text-primary)' }}>
                      {next.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] font-sans text-neutral-400 hidden lg:inline">
                      {next.humanizedLightContext.split('•')[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollect(next);
                      }}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors"
                      style={{ color: collectedIds.has(next.id) ? 'var(--accent-vermilion)' : 'var(--text-muted)' }}
                      title={collectedIds.has(next.id) ? 'In Collector’s Tray' : 'Add to Collector’s Tray'}
                    >
                      {collectedIds.has(next.id) ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => onInspect(next)}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors text-neutral-400"
                      title="Inspect frame in loupe lightbox"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

        i += 2;
        continue;
      }

      // Check if we can form an Asymmetric Offset Pair (Pattern B)
      const rowIndex = rows.length;
      if (next && rowIndex % 3 === 1) {
        // Pattern B: Asymmetric Offset Pair (Cols 1-6 aligned top, Cols 8-12 offset margin-top 96px)
        rows.push(
          <section key={`offset-${current.id}-${next.id}`} aria-label="Asymmetric photographic pairing" className="w-full mb-36 md:mb-52">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Asymmetric Plate */}
              <div
                className="md:col-span-6 group cursor-pointer flex flex-col"
                onClick={() => onInspect(current)}
              >
                <div
                  className="relative w-full overflow-hidden transition-all duration-500 group-hover:brightness-[1.02]"
                  style={{
                    aspectRatio: `${current.aspectRatioNumeric}`,
                    backgroundColor: current.palette.ambientMattingHex,
                  }}
                >
                  <img
                    src={current.url}
                    alt={current.title}
                    loading="lazy"
                    onLoad={() => handleImageLoaded(current.id)}
                    className={`w-full h-full object-contain transition-opacity duration-700 ${
                      loadedImages[current.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Below Frame Label */}
                <div className="mt-3.5 flex items-start justify-between px-1">
                  <div>
                    <span className="font-mono text-[11px] tracking-wider text-neutral-400 block">
                      FIG. {current.catalogNumber}
                    </span>
                    <h3 className="font-serif italic text-lg tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {current.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] font-sans text-neutral-400 hidden xl:inline">
                      {current.lightQuality}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollect(current);
                      }}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors"
                      style={{ color: collectedIds.has(current.id) ? 'var(--accent-vermilion)' : 'var(--text-muted)' }}
                      title="Add to Collector’s Tray"
                    >
                      {collectedIds.has(current.id) ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => onInspect(current)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                      title="Inspect in loupe"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Asymmetric Plate with generous negative-space offset */}
              <div
                className="md:col-start-8 md:col-span-5 md:mt-24 group cursor-pointer flex flex-col"
                onClick={() => onInspect(next)}
              >
                <div
                  className="relative w-full overflow-hidden transition-all duration-500 group-hover:brightness-[1.02]"
                  style={{
                    aspectRatio: `${next.aspectRatioNumeric}`,
                    backgroundColor: next.palette.ambientMattingHex,
                  }}
                >
                  <img
                    src={next.url}
                    alt={next.title}
                    loading="lazy"
                    onLoad={() => handleImageLoaded(next.id)}
                    className={`w-full h-full object-contain transition-opacity duration-700 ${
                      loadedImages[next.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Below Frame Label */}
                <div className="mt-3.5 flex items-start justify-between px-1">
                  <div>
                    <span className="font-mono text-[11px] tracking-wider text-neutral-400 block">
                      FIG. {next.catalogNumber}
                    </span>
                    <h3 className="font-serif italic text-lg tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {next.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] font-sans text-neutral-400 hidden xl:inline">
                      {next.lightQuality}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollect(next);
                      }}
                      className="p-1 rounded-sm hover:text-neutral-900 transition-colors"
                      style={{ color: collectedIds.has(next.id) ? 'var(--accent-vermilion)' : 'var(--text-muted)' }}
                      title="Add to Collector’s Tray"
                    >
                      {collectedIds.has(next.id) ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => onInspect(next)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                      title="Inspect in loupe"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

        i += 2;
        continue;
      }

      // Pattern A: Solo Hero Plate (Centered 8-10 column span)
      rows.push(
        <section key={`hero-${current.id}`} aria-label="Solo hero plate" className="w-full mb-32 md:mb-48 flex justify-center">
          <div
            className="w-full md:w-10/12 lg:w-9/12 group cursor-pointer flex flex-col"
            onClick={() => onInspect(current)}
          >
            <div
              className="relative w-full overflow-hidden transition-all duration-500 group-hover:brightness-[1.02]"
              style={{
                aspectRatio: `${current.aspectRatioNumeric}`,
                backgroundColor: current.palette.ambientMattingHex,
              }}
            >
              <img
                src={current.url}
                alt={current.title}
                loading="lazy"
                onLoad={() => handleImageLoaded(current.id)}
                className={`w-full h-full object-contain transition-opacity duration-700 ${
                  loadedImages[current.id] ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Below-Frame Museum Label */}
            <div className="mt-4 flex items-start justify-between px-1">
              <div>
                <span className="font-mono text-[11px] tracking-wider text-neutral-400 block">
                  PLATE {current.catalogNumber} / {photographs.length.toString().padStart(2, '0')}
                </span>
                <h3 className="font-serif italic text-xl md:text-2xl tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {current.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[12px] font-sans text-neutral-400 hidden sm:inline">
                  {current.humanizedLightContext}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollect(current);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium rounded-full border transition-colors hover:border-neutral-500"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    color: collectedIds.has(current.id) ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
                  }}
                  title={collectedIds.has(current.id) ? 'In Tray' : '+ Collect'}
                >
                  {collectedIds.has(current.id) ? <Check size={11} /> : <Plus size={11} />}
                  <span>{collectedIds.has(current.id) ? 'Collected' : 'Collect'}</span>
                </button>
                <button
                  onClick={() => onInspect(current)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium rounded-full border transition-colors hover:border-neutral-500 text-neutral-400"
                  style={{ borderColor: 'var(--border-hairline)' }}
                  title="Inspect plate in lightbox"
                >
                  <Maximize2 size={11} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      );

      i += 1;
    }

    return rows;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-12 pb-36">
      {/* Editorial Header & Pacing Ribbon */}
      <header className="mb-20 md:mb-32 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-mono tracking-widest uppercase opacity-50 block mb-3" style={{ color: 'var(--text-secondary)' }}>
          {pacingInfo.label}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight leading-tight mb-5" style={{ color: 'var(--text-primary)' }}>
          The Geometry of Solitude
        </h1>
        <p className="font-serif italic text-lg md:text-xl leading-relaxed text-neutral-500 font-normal">
          “Light does not merely illuminate what already exists; it creates a temporary sanctuary for things that would otherwise vanish unremembered.”
        </p>
      </header>

      {/* Main Exhibition Sequence */}
      <div>{renderExhibitionRows()}</div>
    </div>
  );
};
