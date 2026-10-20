import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Star, Crown } from 'lucide-react';

interface HalfStarScrubberProps {
  value: number; // 0.5 to 5.0 in 0.5 steps
  onChange: (val: number) => void;
  isMasterpiece?: boolean;
  onMasterpieceToggle?: (val: boolean) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showMasterpieceToggle?: boolean;
}

export const HalfStarScrubber: React.FC<HalfStarScrubberProps> = ({
  value,
  onChange,
  isMasterpiece = false,
  onMasterpieceToggle,
  readOnly = false,
  size = 'md',
  showMasterpieceToggle = true,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayRating = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: { star: 'w-4 h-4', text: 'text-xs', padding: 'p-1' },
    md: { star: 'w-6 h-6', text: 'text-sm font-mono font-bold', padding: 'p-1.5' },
    lg: { star: 'w-8 h-8', text: 'text-lg font-mono font-extrabold', padding: 'p-2' },
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    // 10 steps from 0.5 to 5.0
    const rawStep = Math.ceil(percentage * 10);
    const calculatedRating = Math.max(0.5, Math.min(5.0, rawStep * 0.5));
    setHoverValue(calculatedRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const rawStep = Math.ceil(percentage * 10);
    const calculatedRating = Math.max(0.5, Math.min(5.0, rawStep * 0.5));
    onChange(calculatedRating);
  };

  const handleCrownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !onMasterpieceToggle) return;
    const nextState = !isMasterpiece;
    onMasterpieceToggle(nextState);

    if (nextState) {
      // Trigger upward rose-gold / amber particle burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F43F5E', '#F59E0B', '#FBBF24', '#FDA4AF'],
        ticks: 200,
        gravity: 1.2,
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* 5-Star Track */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`flex items-center gap-1 select-none ${
          readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
        } transition-transform duration-150`}
        title={readOnly ? `${value} Stars` : 'Scrub or click to rate (0.5 - 5.0)'}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillRatio = Math.max(0, Math.min(1, displayRating - (starIndex - 1)));
          const isFull = fillRatio >= 1.0;
          const isHalf = fillRatio >= 0.5 && fillRatio < 1.0;

          return (
            <div key={starIndex} className="relative transition-transform duration-150 hover:scale-110">
              {/* Background empty star */}
              <Star
                className={`${sizeClasses.star} text-slate-700/60 transition-colors duration-150`}
                strokeWidth={1.5}
              />

              {/* Half or Full overlay */}
              {(isFull || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-150"
                  style={{ width: isFull ? '100%' : '50%' }}
                >
                  <Star className={`${sizeClasses.star} fill-amber-400 text-amber-400`} strokeWidth={1.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric Score Tag */}
      <div
        className={`px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 ${sizeClasses.text} tracking-wider shadow-inner`}
      >
        {displayRating.toFixed(1)} <span className="text-amber-500/70">★</span>
      </div>

      {/* Optional Masterpiece Crown Button */}
      {showMasterpieceToggle && onMasterpieceToggle && (
        <button
          type="button"
          onClick={handleCrownClick}
          disabled={readOnly}
          className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 border ${
            isMasterpiece
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)] scale-105'
              : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-rose-500/40 hover:text-rose-400'
          }`}
          title="Masterpiece Crown: Anoint as an All-Time Essential Masterwork"
        >
          <Crown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isMasterpiece ? 'fill-rose-500 text-rose-400 animate-bounce' : 'group-hover:scale-110'
            }`}
          />
          <span>{isMasterpiece ? 'MASTERPIECE' : 'CROWN'}</span>
        </button>
      )}
    </div>
  );
};
