import React, { useState } from 'react';
import { HourlyDataPoint } from '../types/weather';

interface HourlyTimelineProps {
  hourly: HourlyDataPoint[];
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly }) => {
  const [viewMode, setViewMode] = useState<'summary' | 'precipitation' | 'wind_uv'>('summary');

  // Compute curve coordinates dynamically from temperature
  const temps = hourly.map(h => h.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  // Track width per item: normal is 68px, milestone is 92px
  let currentX = 34; // center of first card
  const points: Array<{ x: number; y: number; temp: number; color: string }> = [];

  hourly.forEach((item) => {
    const cardWidth = item.isMilestone ? 92 : 68;
    // Map temperature to Y: higher temp is lower Y (top)
    // Canvas height is 220px, usable Y range is 120px to 210px
    const normalizedY = 210 - ((item.temp - minTemp) / tempRange) * 80;
    
    let dotColor = '#FFB787';
    if (item.pop > 40) dotColor = '#7BD0FF';
    else if (item.isMilestone) dotColor = '#FBBF24';

    points.push({
      x: currentX,
      y: Math.round(normalizedY),
      temp: item.temp,
      color: dotColor
    });

    currentX += cardWidth + 8; // width + gap
  });

  const totalWidth = Math.max(760, currentX);

  // Generate cubic Bezier SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  const areaD = pathD ? `${pathD} L ${points[points.length - 1].x} 230 L ${points[0].x} 230 Z` : '';

  // Helper for rain intensity blocks
  const renderRainIntensity = (item: HourlyDataPoint) => {
    if (item.rainIntensity === 'none') return <div className="h-6"></div>;

    const bars = item.rainIntensity === 'drizzle' ? 1 : item.rainIntensity === 'light' ? 2 : item.rainIntensity === 'moderate' ? 3 : 4;
    const label = item.rainIntensity === 'drizzle' ? 'driz' : item.rainIntensity === 'light' ? 'light' : item.rainIntensity === 'moderate' ? 'mod' : 'hvy';

    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex gap-0.5 items-end h-3">
          <span className={`w-1 rounded-full ${bars >= 1 ? 'h-2 bg-[#38BDF8]' : 'h-1 bg-white/20'}`}></span>
          <span className={`w-1 rounded-full ${bars >= 2 ? 'h-3 bg-[#38BDF8]' : 'h-1 bg-white/20'}`}></span>
          <span className={`w-1 rounded-full ${bars >= 3 ? 'h-3.5 bg-[#38BDF8]' : 'h-1 bg-white/20'}`}></span>
          <span className={`w-1 rounded-full ${bars >= 4 ? 'h-4 bg-[#38BDF8]' : 'h-1 bg-white/20'}`}></span>
        </div>
        <span className="text-[9px] text-[#38BDF8] uppercase font-semibold tabular-nums">
          {label}
        </span>
      </div>
    );
  };

  return (
    <article className="rounded-[24px] p-6 bg-white/12 dark:bg-[#0c1323]/55 backdrop-blur-[20px] border border-white/20 shadow-[0_12px_36px_0_rgba(0,0,0,0.25)] flex flex-col gap-5">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
          <h2 className="font-section-label text-section-label uppercase tracking-wider text-on-surface font-semibold text-xs">
            Next 24 Hours
          </h2>
        </div>

        {/* View switcher pills */}
        <div className="h-8 p-0.5 rounded-full bg-white/10 border border-white/15 flex items-center self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className={`h-full px-3 rounded-full font-body-sm text-body-sm transition-all ${
              viewMode === 'summary' ? 'bg-white/25 text-white font-medium shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => setViewMode('precipitation')}
            className={`h-full px-3 rounded-full font-body-sm text-body-sm transition-all ${
              viewMode === 'precipitation' ? 'bg-white/25 text-white font-medium shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Precipitation
          </button>
          <button
            type="button"
            onClick={() => setViewMode('wind_uv')}
            className={`h-full px-3 rounded-full font-body-sm text-body-sm transition-all ${
              viewMode === 'wind_uv' ? 'bg-white/25 text-white font-medium shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Wind & UV
          </button>
        </div>
      </div>

      {/* Timeline Track Container */}
      <div className="relative w-full overflow-x-auto pb-4 scrollbar-none [mask-image:linear-gradient(to_right,white_90%,transparent)]">
        <div className="relative h-[270px]" style={{ width: `${totalWidth}px` }}>
          {/* Continuous Bezier Temperature Curve SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${totalWidth} 270`}
            fill="none"
          >
            <defs>
              <linearGradient id="tempArea" x1="0" x2="0" y1="120" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFB787" stopOpacity="0.28"></stop>
                <stop offset="100%" stopColor="#0c1323" stopOpacity="0"></stop>
              </linearGradient>
            </defs>

            {/* Gradient area fill beneath curve */}
            {areaD && <path d={areaD} fill="url(#tempArea)" />}

            {/* Glowing stroke curve */}
            {pathD && (
              <path
                d={pathD}
                stroke="#FFB787"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,183,135,0.5)]"
              />
            )}

            {/* Data point dots */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={i === 0 ? 4.5 : 3.5}
                fill={pt.color}
                stroke={i === 0 ? "#ffffff" : "transparent"}
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {/* Cards Flex Container aligned with SVG coordinates */}
          <div className="absolute inset-0 flex items-start gap-2">
            {hourly.map((item, idx) => {
              const isFirst = idx === 0;
              const isMilestone = item.isMilestone;
              const cardWidth = isMilestone ? 'w-[92px]' : 'w-16';

              if (isMilestone) {
                return (
                  <div
                    key={idx}
                    className={`${cardWidth} h-full p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 flex flex-col items-center justify-between shrink-0 shadow-sm`}
                  >
                    <span className="font-body-sm text-body-sm font-semibold text-tertiary">
                      {item.timeStr}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400/25 text-tertiary text-[10px] font-bold uppercase tracking-wider">
                      {item.milestoneType}
                    </span>
                    <span className="material-symbols-outlined text-[24px] text-tertiary animate-pulse">
                      {item.icon}
                    </span>
                    <div className="h-6"></div>
                    <span className="font-metric-value text-metric-value text-tertiary font-semibold tabular-nums">
                      {item.temp}°
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`${cardWidth} h-full p-2 rounded-2xl flex flex-col items-center justify-between shrink-0 transition-all ${
                    isFirst
                      ? 'bg-white/20 dark:bg-surface-container-high/80 backdrop-blur-2xl border border-white/30 shadow-lg'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Time label */}
                  <span className={`font-day-label text-[13px] ${isFirst ? 'font-bold text-white' : 'text-on-surface-variant font-medium'}`}>
                    {item.timeStr}
                  </span>

                  {/* Quick-Glance Badge (Running shoe, umbrella, or spacer) */}
                  <div className="h-6 flex items-center justify-center">
                    {item.badge ? (
                      <span
                        title={item.badge.label}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.badge.type === 'run'
                            ? 'bg-[#34D399]/20 text-[#34D399]'
                            : item.badge.type === 'umbrella'
                            ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                            : 'bg-amber-400/20 text-tertiary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {item.badge.icon}
                        </span>
                      </span>
                    ) : (
                      <div className="w-6 h-6"></div>
                    )}
                  </div>

                  {/* Weather Icon */}
                  <span className={`material-symbols-outlined text-[24px] ${
                    item.pop > 40 ? 'text-secondary' : isFirst ? 'text-tertiary' : 'text-on-surface-variant'
                  }`}>
                    {item.icon}
                  </span>

                  {/* Mode-specific middle indicator */}
                  {viewMode === 'precipitation' ? (
                    renderRainIntensity(item)
                  ) : viewMode === 'wind_uv' ? (
                    <div className="flex flex-col items-center gap-0.5 text-[10px] text-white/70">
                      <span>{item.windSpeed}km/h</span>
                      <span className="text-tertiary font-semibold">UV {item.uvIndex}</span>
                    </div>
                  ) : (
                    renderRainIntensity(item)
                  )}

                  {/* Temperature readout */}
                  <span className={`font-metric-value text-metric-value tabular-nums ${isFirst ? 'font-bold text-white' : 'text-white/90'}`}>
                    {item.temp}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
};

