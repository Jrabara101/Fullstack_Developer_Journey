import React, { useState, useEffect } from 'react';

interface PriceHistogramSliderProps {
  histogram: { minCents: number; maxCents: number; count: number }[];
  priceRangeCents: [number, number];
  onChange: (range: [number, number]) => void;
  minDomainCents?: number;
  maxDomainCents?: number;
}

export const PriceHistogramSlider: React.FC<PriceHistogramSliderProps> = ({
  histogram,
  priceRangeCents,
  onChange,
  minDomainCents = 5000,
  maxDomainCents = 450000,
}) => {
  const [minVal, setMinVal] = useState(priceRangeCents[0]);
  const [maxVal, setMaxVal] = useState(priceRangeCents[1]);
  const [hoveredBucket, setHoveredBucket] = useState<{ minCents: number; maxCents: number; count: number } | null>(null);

  useEffect(() => {
    setMinVal(priceRangeCents[0]);
    setMaxVal(priceRangeCents[1]);
  }, [priceRangeCents]);

  const maxCount = Math.max(...histogram.map(b => b.count), 1);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value) * 100, maxVal - 1000);
    const clamped = Math.max(minDomainCents, val);
    setMinVal(clamped);
    onChange([clamped, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value) * 100, minVal + 1000);
    const clamped = Math.min(maxDomainCents, val);
    setMaxVal(clamped);
    onChange([minVal, clamped]);
  };

  const handleSliderMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 1000);
    setMinVal(val);
    onChange([val, maxVal]);
  };

  const handleSliderMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 1000);
    setMaxVal(val);
    onChange([minVal, val]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-slate-400 font-medium">PRICE DISTRIBUTION</span>
        {hoveredBucket && (
          <span className="font-mono text-[11px] text-cyan-400 animate-fade-in bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
            ${Math.round(hoveredBucket.minCents / 100)} - ${Math.round(hoveredBucket.maxCents / 100)}: <strong className="text-white">{hoveredBucket.count}</strong>
          </span>
        )}
      </div>

      {/* 24-Bar SVG Density Histogram */}
      <div className="relative h-16 w-full pt-2">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${histogram.length * 10} 60`}
        >
          {histogram.map((bucket, i) => {
            const barHeight = Math.max(4, Math.round((bucket.count / maxCount) * 54));
            const y = 58 - barHeight;
            const inRange = bucket.maxCents >= minVal && bucket.minCents <= maxVal;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredBucket(bucket)}
                onMouseLeave={() => setHoveredBucket(null)}
                className="cursor-pointer transition-all duration-150"
              >
                <rect
                  x={i * 10 + 1.2}
                  y={y}
                  width="7.6"
                  height={barHeight}
                  rx="1.5"
                  fill={inRange ? '#6366F1' : '#1E2638'}
                  className={`transition-all duration-200 ${
                    inRange ? 'opacity-90 hover:opacity-100 hover:fill-cyan-400' : 'opacity-25 hover:opacity-40'
                  }`}
                />
                {inRange && bucket.count > 0 && (
                  <circle
                    cx={i * 10 + 5}
                    cy={y}
                    r="1.2"
                    fill="#818CF8"
                    className="opacity-80"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Baseline Divider */}
        <div className="w-full h-[1px] bg-[#1E2638] mt-0.5" />
      </div>

      {/* Dual Range Sliders Container */}
      <div className="relative h-5 flex items-center">
        {/* Slider Track Background */}
        <div className="absolute w-full h-1.5 bg-[#171D2B] rounded-full overflow-hidden border border-[#1E2638]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-75"
            style={{
              left: `${((minVal - minDomainCents) / (maxDomainCents - minDomainCents)) * 100}%`,
              width: `${((maxVal - minVal) / (maxDomainCents - minDomainCents)) * 100}%`,
              position: 'absolute',
            }}
          />
        </div>

        {/* Min Thumb Slider */}
        <input
          type="range"
          min={minDomainCents}
          max={maxDomainCents}
          step={1000}
          value={minVal}
          onChange={handleSliderMin}
          aria-label="Minimum price in cents"
          className="absolute w-full pointer-events-none appearance-none bg-transparent h-5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(99,102,241,0.5)] [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing"
        />

        {/* Max Thumb Slider */}
        <input
          type="range"
          min={minDomainCents}
          max={maxDomainCents}
          step={1000}
          value={maxVal}
          onChange={handleSliderMax}
          aria-label="Maximum price in cents"
          className="absolute w-full pointer-events-none appearance-none bg-transparent h-5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)] [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing"
        />
      </div>

      {/* Monospaced Min/Max Inputs */}
      <div className="flex items-center justify-between gap-2 pt-1 font-mono text-xs">
        <div className="flex items-center gap-1.5 bg-[#080A0F] border border-[#1E2638] rounded px-2 py-1 focus-within:border-indigo-500 transition-colors">
          <span className="text-slate-500">$</span>
          <input
            type="number"
            min={Math.round(minDomainCents / 100)}
            max={Math.round(maxVal / 100) - 10}
            value={Math.round(minVal / 100)}
            onChange={handleMinChange}
            aria-label="Minimum price in dollars"
            className="w-16 bg-transparent text-white outline-none font-mono text-xs"
          />
        </div>
        <span className="text-slate-600 font-mono">—</span>
        <div className="flex items-center gap-1.5 bg-[#080A0F] border border-[#1E2638] rounded px-2 py-1 focus-within:border-cyan-500 transition-colors">
          <span className="text-slate-500">$</span>
          <input
            type="number"
            min={Math.round(minVal / 100) + 10}
            max={Math.round(maxDomainCents / 100)}
            value={Math.round(maxVal / 100)}
            onChange={handleMaxChange}
            aria-label="Maximum price in dollars"
            className="w-16 bg-transparent text-white outline-none font-mono text-xs text-right"
          />
        </div>
      </div>
    </div>
  );
};
