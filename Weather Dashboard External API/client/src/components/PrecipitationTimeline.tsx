import React, { useState } from 'react';
import { CloudRain, Droplets, Info } from 'lucide-react';
import { MinutePrecipitation } from '../types/weather';

interface PrecipitationTimelineProps {
  minuteCast: MinutePrecipitation[];
  summary: {
    hasPrecipitation: boolean;
    startInMinutes: number | null;
    stopInMinutes: number | null;
    summaryText: string;
  };
}

export const PrecipitationTimeline: React.FC<PrecipitationTimelineProps> = ({
  minuteCast,
  summary,
}) => {
  const [hoveredMinute, setHoveredMinute] = useState<MinutePrecipitation | null>(null);

  // 60 bars (0 to 60 minutes)
  const maxIntensity = Math.max(1.0, ...minuteCast.map((m) => m.intensity));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-6">
      <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl">
        {/* Card Header & Narrative Nowcast Phrase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-weather-cyan" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              60-Minute Next-Hour Precipitation Nowcast
            </h3>
          </div>

          <div className="text-xs font-mono text-weather-cyan/90 bg-weather-cyan/10 px-3 py-1 rounded-full border border-weather-cyan/20 flex items-center gap-1.5 self-start sm:self-auto">
            <Droplets className="w-3.5 h-3.5" />
            <span>{summary.summaryText}</span>
          </div>
        </div>

        {/* Dynamic Minute Graph */}
        <div className="relative pt-6 pb-2">
          {/* Y-axis intensity threshold lines */}
          <div className="absolute inset-x-0 top-6 bottom-8 pointer-events-none flex flex-col justify-between opacity-15">
            <div className="border-b border-dashed border-white text-[9px] font-mono pl-1 text-white">Heavy</div>
            <div className="border-b border-dashed border-white text-[9px] font-mono pl-1 text-white">Moderate</div>
            <div className="border-b border-dashed border-white text-[9px] font-mono pl-1 text-white">Light</div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-28 flex items-end justify-between gap-[2px] sm:gap-1 px-1">
            {minuteCast.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(6, (item.intensity / maxIntensity) * 95));
              const isRain = item.intensity > 0;

              return (
                <div
                  key={item.minute}
                  onMouseEnter={() => setHoveredMinute(item)}
                  onMouseLeave={() => setHoveredMinute(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Intensity Bar with spring physics style */}
                  <div
                    style={{
                      height: `${isRain ? heightPercent : 6}%`,
                      transitionDelay: `${idx * 8}ms`,
                    }}
                    className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                      isRain
                        ? item.intensity > 3
                          ? 'bg-weather-azure group-hover:bg-white shadow-[0_0_8px_rgba(2,132,199,0.8)]'
                          : 'bg-weather-cyan group-hover:bg-white shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                        : 'bg-white/10 group-hover:bg-white/30'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Minute Axis Labels (0, 15, 30, 45, 60 min) */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/50 pt-2 px-1">
            <span>Now</span>
            <span>15 min</span>
            <span>30 min</span>
            <span>45 min</span>
            <span>60 min</span>
          </div>

          {/* Hover Tooltip Details */}
          {hoveredMinute && (
            <div className="mt-3 p-2 rounded-xl bg-black/60 border border-white/15 flex items-center justify-between text-xs font-mono">
              <span className="text-white/70">Minute +{hoveredMinute.minute}</span>
              <span className="text-weather-cyan font-semibold">
                {hoveredMinute.intensity > 0
                  ? `${hoveredMinute.intensity.toFixed(2)} mm/h (${hoveredMinute.probability}% probability)`
                  : 'No precipitation (0.00 mm/h)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
