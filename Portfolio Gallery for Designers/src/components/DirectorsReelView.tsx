import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  Pause,
  Play,
  X,
} from 'lucide-react';
import type { ComputedArtifactMeta } from '../types/portfolio';

interface DirectorsReelViewProps {
  highlights: ComputedArtifactMeta[];
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  onInspect: (id: string) => void;
  onExit: () => void;
}

const SLIDE_DURATION_MS = 6000; // 10 highlights * 6s = 60-Second Director's Reel

export const DirectorsReelView: React.FC<DirectorsReelViewProps> = ({
  highlights,
  pinnedIds,
  onTogglePin,
  onInspect,
  onExit,
}) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPct, setProgressPct] = useState(0);

  const current = highlights[index] ?? highlights[0];

  useEffect(() => {
    setProgressPct(0);
    if (!isPlaying || highlights.length === 0) return;

    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgressPct(pct);
      if (elapsed >= SLIDE_DURATION_MS) {
        setIndex((prev) => (prev + 1) % highlights.length);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [index, isPlaying, highlights.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((prev) => (prev + 1) % highlights.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      } else if ((e.key === 'Enter' || e.key.toLowerCase() === 'i') && current) {
        e.preventDefault();
        onInspect(current.artifact.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [highlights.length, onExit, onInspect, current]);

  if (!current) return null;

  const { artifact } = current;
  const isPinned = pinnedIds.has(artifact.id);
  const totalSecondsRemaining = Math.max(
    0,
    Math.ceil(((highlights.length - index - progressPct / 100) * SLIDE_DURATION_MS) / 1000)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between text-[#F4F4F2] select-none transition-colors duration-700"
      style={{ backgroundColor: current.ambientMattingHex || '#0D0E10' }}
    >
      {/* Top 10-Segment Reel Progress Rail & Header */}
      <div className="px-5 sm:px-14 pt-5 pb-3">
        <div className="grid grid-cols-10 gap-1.5 mb-4">
          {highlights.map((item, i) => {
            const fill = i < index ? 100 : i === index ? progressPct : 0;
            return (
              <button
                key={item.artifact.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Jump to highlight ${i + 1}: ${item.artifact.title}`}
                className="h-[2px] bg-white/15 overflow-hidden cursor-pointer relative group"
              >
                <div
                  className="h-full bg-white transition-[width] duration-75"
                  style={{ width: `${fill}%` }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-white/75">
              60-SECOND DIRECTOR&apos;S REEL // HIGHLIGHT {String(index + 1).padStart(2, '0')} OF{' '}
              {String(highlights.length).padStart(2, '0')}
            </span>
            <span className="hidden sm:inline font-mono-catalog text-[11px] text-white/45">
              • ~{totalSecondsRemaining}s remaining
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 font-mono-catalog text-[11px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 font-mono-catalog text-[11px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center Stage: Uncropped Native Aspect Ratio Plate */}
      <div className="relative flex-1 flex items-center justify-center px-6 sm:px-20 py-4 min-h-0">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + highlights.length) % highlights.length)}
          aria-label="Previous highlight"
          className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 items-center justify-center cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div
          key={artifact.id}
          onClick={() => onInspect(artifact.id)}
          className="max-h-full max-w-full flex items-center justify-center cursor-pointer exhibition-flip-enter"
        >
          <img
            src={artifact.imageUrl}
            alt={artifact.title}
            className={`max-h-[68vh] max-w-full w-auto h-auto object-contain block shadow-2xl ${
              artifact.kind === 'design'
                ? 'rounded-[12px] border border-white/12'
                : 'rounded-none'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % highlights.length)}
          aria-label="Next highlight"
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 items-center justify-center cursor-pointer transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Editorial Caption & Quick Controls */}
      <div className="px-5 sm:px-14 pb-6 pt-3 border-t border-white/10 glass-darkroom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-white/55">
                PLATE {artifact.catalogNumber} • {artifact.primaryDiscipline} • {artifact.year}
              </span>
              <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/40">
                KEYS: ← / → STEP • SPACE PAUSE • ENTER INSPECT
              </span>
            </div>
            <h2 className="font-serif-display text-[28px] sm:text-[34px] leading-tight text-white mt-1">
              {artifact.title}
            </h2>
            <p className="text-[14px] text-white/75 mt-1 max-w-[68ch]">
              {artifact.story.snapshot.outcome}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePin(artifact.id)}
              className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 font-mono-catalog text-[11px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isPinned ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]" />
                  <Check className="w-3.5 h-3.5" />
                  <span>In Briefcase</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>+ Collect</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onInspect(artifact.id)}
              className="px-4 py-2 rounded-full bg-[#F4F4F2] text-[#0D0E10] hover:opacity-90 font-mono-catalog text-[11px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Inspect Process &amp; X-Ray</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

