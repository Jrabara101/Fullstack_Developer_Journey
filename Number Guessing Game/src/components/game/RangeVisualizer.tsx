import { useRef } from 'react';
import { ArrowRight, ArrowLeft, Activity } from 'lucide-react';

interface RangeVisualizerProps {
  currentMinBound: number;
  currentMaxBound: number;
  rangeMin?: number;
  rangeMax?: number;
  currentGuess: number;
  onSelectValue?: (val: number) => void;
}

export function RangeVisualizer({
  currentMinBound,
  currentMaxBound,
  rangeMin = 1,
  rangeMax = 100,
  currentGuess,
  onSelectValue,
}: RangeVisualizerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const totalSpan = rangeMax - rangeMin + 1;

  // Percentage calculations
  const lowerDeadWidth = Math.max(0, ((currentMinBound - rangeMin) / totalSpan) * 100);
  const activeWidth = Math.max(
    1,
    ((currentMaxBound - currentMinBound + 1) / totalSpan) * 100
  );
  const activeLeft = lowerDeadWidth;
  const needlePosition = Math.max(
    0,
    Math.min(100, ((currentGuess - rangeMin) / totalSpan) * 100)
  );
  const spreadCount = currentMaxBound - currentMinBound + 1;

  // Click on the gauge to scrub directly
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !onSelectValue) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const rawVal = Math.round(rangeMin + pct * (rangeMax - rangeMin));
    onSelectValue(rawVal);
  };

  return (
    <div className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/40 shadow-sm flex flex-col gap-4">
      {/* Upper Data Readings */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
            Domain Codespace
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-on-surface">
            {rangeMin} <span className="text-outline-variant font-normal">—</span> {rangeMax}
          </span>
        </div>

        {/* Central Calibrated Bracket Display */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
            Calibrated Bracket
          </span>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-lowest rounded-full border border-outline-variant/40 shadow-inner">
            <span className="font-mono text-base sm:text-lg text-primary font-bold">
              {String(currentMinBound).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs text-on-surface-variant tracking-widest">···</span>
            <span className="font-mono text-base sm:text-lg text-secondary font-bold">
              {String(currentMaxBound).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
            Uncertainty Spread
          </span>
          <span className="font-mono text-base sm:text-lg text-tertiary font-bold tracking-tight">
            {spreadCount} PTS
          </span>
        </div>
      </div>

      {/* Dynamic Range Squeeze Gauge Bar */}
      <div className="relative w-full pt-5 pb-2">
        {/* Numerical Reference Ticks */}
        <div className="absolute top-0 left-0 right-0 flex justify-between font-mono text-[10px] text-outline-variant select-none pointer-events-none px-1">
          <span>001</span>
          <span>025</span>
          <span>050</span>
          <span>075</span>
          <span>100</span>
        </div>

        {/* Gauge Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative w-full h-8 bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden flex items-center shadow-inner cursor-crosshair group"
        >
          {/* Muted Lower Dead Zone */}
          <div
            className="h-full bg-error-container/20 border-r border-error/30 transition-all duration-300"
            style={{ width: `${lowerDeadWidth}%` }}
            title={`Invalid Range (Too Low: 1 - ${currentMinBound - 1})`}
          />

          {/* Active Illuminated Squeeze Window */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-primary-container/30 via-primary/20 to-secondary/30 border-y border-primary/50 shadow-[0_0_20px_rgba(56,189,248,0.25)] flex items-center justify-between px-1 transition-all duration-300"
            style={{
              left: `${activeLeft}%`,
              width: `${activeWidth}%`,
            }}
          >
            {/* Left bound pin */}
            <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
            {/* Right bound pin */}
            <div className="w-1 h-5 bg-secondary rounded-full shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
          </div>

          {/* Needle Indicator for Current Tumbler Guess */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#ffffff] z-10 transition-all duration-150 pointer-events-none -ml-0.5 flex flex-col items-center justify-between"
            style={{ left: `${needlePosition}%` }}
          >
            <div className="w-2.5 h-1 bg-white rounded-t-sm" />
            <div className="w-2.5 h-1 bg-white rounded-b-sm" />
          </div>
        </div>

        {/* Caliper Badges Underneath */}
        <div className="flex justify-between items-center mt-2.5 px-1 font-mono text-xs">
          <div className="flex items-center gap-1 text-primary font-bold">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>
              MIN VERIFIED: <span>{currentMinBound}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
            <Activity className="w-3.5 h-3.5 text-tertiary animate-pulse" />
            <span>Possibility Space: {Math.round((spreadCount / totalSpan) * 100)}%</span>
          </div>

          <div className="flex items-center gap-1 text-secondary font-bold">
            <span>
              MAX CEILING: <span>{currentMaxBound}</span>
            </span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
