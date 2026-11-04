import React from 'react';
import type { Photograph, TonalSwatch, LightQuality } from '../types';
import { Plus, Check } from 'lucide-react';

interface ContactSheetIndexProps {
  photographs: Photograph[];
  onInspect: (photo: Photograph) => void;
  collectedIds: Set<string>;
  onToggleCollect: (photo: Photograph) => void;
  activeSwatch: TonalSwatch | null;
  activeLight: LightQuality | 'All';
}

export const ContactSheetIndex: React.FC<ContactSheetIndexProps> = ({
  photographs,
  onInspect,
  collectedIds,
  onToggleCollect,
  activeSwatch,
  activeLight,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-10 pb-36">
      {/* Contact Sheet Analog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-10 border-b border-dashed"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-xs border-2 border-dashed border-neutral-400" />
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-neutral-400 block">
              PROOF SHEET ARCHIVE • 35MM & MEDIUM FORMAT EMULSION
            </span>
            <h2 className="font-serif text-2xl font-light tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Index of Exposure Plates
            </h2>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 font-mono text-[11px] text-neutral-400 tracking-wider">
          {photographs.length} FRAMES ARCHIVED • RATING 300 DPI NATIVE
        </div>
      </div>

      {/* 6-Column Analog Contact Sheet Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
        {photographs.map((photo) => {
          // Check if frame matches active filters
          const matchesSwatch = !activeSwatch || photo.tonalSwatch === activeSwatch;
          const matchesLight = activeLight === 'All' || photo.lightQuality === activeLight;
          const isDimmed = !matchesSwatch || !matchesLight;
          const isCollected = collectedIds.has(photo.id);

          return (
            <div
              key={photo.id}
              onClick={() => onInspect(photo)}
              className={`group relative flex flex-col cursor-pointer transition-all duration-300 ${
                isDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'
              }`}
            >
              {/* Analog Film Cell Matting Box */}
              <div
                className="relative aspect-square w-full p-3.5 flex items-center justify-center transition-all duration-300 group-hover:shadow-md border"
                style={{
                  backgroundColor: 'var(--canvas-elevated)',
                  borderColor: isCollected ? 'var(--accent-vermilion)' : 'var(--border-hairline)',
                }}
              >
                {/* Analog Frame Number (Top-Left) */}
                <div className="absolute top-1.5 left-2 font-mono text-[10px] tracking-widest text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                  {photo.filmFrameNumber}
                </div>

                {/* Aspect Ratio Monospace Tag (Top-Right) */}
                <div className="absolute top-1.5 right-2 font-mono text-[9px] tracking-wider text-neutral-400 opacity-60">
                  {photo.aspectRatio}
                </div>

                {/* Uncropped Photograph Centered with object-contain */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain filter grayscale-15 group-hover:grayscale-0 transition-all duration-300 group-hover:scale-[1.02]"
                />

                {/* Dominant Palette Swatch Indicator (Bottom-Right) */}
                <div
                  className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full border border-black/20"
                  style={{ backgroundColor: photo.palette.dominantHex }}
                  title={`Dominant tone: ${photo.tonalSwatch}`}
                />

                {/* Micro Quick Collect on Cell Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollect(photo);
                  }}
                  className="absolute bottom-1.5 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-xs hover:scale-110"
                  style={{ color: isCollected ? 'var(--accent-vermilion)' : 'var(--text-secondary)' }}
                  title={isCollected ? 'In Tray' : '+ Collect'}
                >
                  {isCollected ? <Check size={12} /> : <Plus size={12} />}
                </button>
              </div>

              {/* Minimal Plate Label */}
              <div className="mt-2 text-center">
                <span className="font-serif italic text-xs tracking-tight truncate block px-1" style={{ color: 'var(--text-primary)' }}>
                  {photo.title}
                </span>
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block mt-0.5">
                  {photo.lightQuality.split('&')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
