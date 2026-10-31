import React, { useState } from 'react';
import { DayForecast } from '../types/weather';

interface MultiDayForecastProps {
  weekly: DayForecast[];
  weekMinTemp: number;
  weekMaxTemp: number;
}

export const MultiDayForecast: React.FC<MultiDayForecastProps> = ({
  weekly,
  weekMinTemp,
  weekMaxTemp
}) => {
  // Allow toggling expanded state for any day (default Saturday expanded as in the design)
  const [expandedDayId, setExpandedDayId] = useState<string | null>('day-1');

  const tempSpan = weekMaxTemp - weekMinTemp || 1;

  const toggleDay = (id: string) => {
    setExpandedDayId(prev => (prev === id ? null : id));
  };

  return (
    <article className="rounded-[24px] p-6 bg-white/12 dark:bg-[#0c1323]/55 backdrop-blur-[20px] border border-white/20 shadow-[0_12px_36px_0_rgba(0,0,0,0.25)] flex flex-col gap-4">
      {/* Forecast Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-tertiary">calendar_view_week</span>
          <h2 className="font-section-label text-section-label uppercase tracking-wider text-on-surface font-semibold text-xs">
            7-Day Forecast
          </h2>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Week range <strong className="text-white font-metric-value tabular-nums">{weekMinTemp}°–{weekMaxTemp}°</strong>
        </span>
      </div>

      {/* Forecast Rows List */}
      <div className="flex flex-col gap-2 w-full">
        {weekly.map((day) => {
          const isExpanded = expandedDayId === day.id;

          // Compute relative range bar offsets
          const leftPercent = Math.max(0, Math.min(100, ((day.lowTemp - weekMinTemp) / tempSpan) * 100));
          const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((day.highTemp - day.lowTemp) / tempSpan) * 100));

          return (
            <div
              key={day.id}
              className={`rounded-xl transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-white/20 dark:bg-surface-container-high/70 border border-white/30 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {/* Main Summary Row */}
              <div
                onClick={() => toggleDay(day.id)}
                className="h-[60px] px-4 flex items-center justify-between cursor-pointer select-none"
              >
                {/* Zone 1 (35%): Day label + Human summary */}
                <div className="w-[35%] flex flex-col pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-day-label text-day-label font-semibold text-white">
                      {day.dayLabel}
                    </span>
                    {day.subLabel && (
                      <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-medium text-white uppercase tracking-wider">
                        {day.subLabel}
                      </span>
                    )}
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate text-xs sm:text-sm">
                    {day.humanSummary}
                  </span>
                </div>

                {/* Zone 2 (15%): Weather icon + rain% */}
                <div className="w-[15%] flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[22px] ${day.pop > 30 ? 'text-secondary' : 'text-tertiary'}`}>
                    {day.icon}
                  </span>
                  <span className={`text-[12px] font-metric-value tabular-nums ${day.pop > 30 ? 'text-[#38BDF8] font-semibold' : 'text-on-surface-variant/60'}`}>
                    {day.pop}%
                  </span>
                </div>

                {/* Zone 3 (40%): Visual temperature range bar relative to week */}
                <div className="w-[40%] flex items-center gap-2 sm:gap-3">
                  <span className="font-metric-value text-metric-value text-on-surface-variant w-7 text-right tabular-nums text-xs sm:text-sm">
                    {day.lowTemp}°
                  </span>
                  
                  <div className="flex-1 h-2 rounded-full bg-white/10 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#FFB787] shadow-sm transition-all duration-300"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                    ></div>
                  </div>

                  <span className="font-metric-value text-metric-value text-white font-semibold w-7 tabular-nums text-xs sm:text-sm">
                    {day.highTemp}°
                  </span>
                </div>

                {/* Zone 4 (10%): Chevron */}
                <div className="w-[10%] flex justify-end">
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-white' : 'text-on-surface-variant/60'
                  }`}>
                    expand_more
                  </span>
                </div>
              </div>

              {/* Expandable Sub-Panel Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/15 flex flex-col gap-3.5 bg-black/15 animate-in slide-in-from-top-1 duration-200">
                  {/* 4 Diagnostic Tiles (2x2 grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Tile 1: UV Peak */}
                    <div className="p-3 rounded-lg bg-white/10 dark:bg-surface-container/60 border border-white/10 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-tertiary">wb_sunny</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
                          UV Index
                        </span>
                        <span className="text-body-sm font-body-sm text-white font-medium">
                          {day.uvPeak.window} · <strong className="text-tertiary font-bold">{day.uvPeak.level}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Tile 2: Air Quality */}
                    <div className="p-3 rounded-lg bg-white/10 dark:bg-surface-container/60 border border-white/10 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-[#34D399]">eco</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
                          Air Quality
                        </span>
                        <span className="text-body-sm font-body-sm text-white font-medium">
                          {day.aqi.label} · <strong className="text-[#34D399] font-bold">AQI {day.aqi.value}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Tile 3: Wind Chill */}
                    <div className="p-3 rounded-lg bg-white/10 dark:bg-surface-container/60 border border-white/10 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-secondary">air</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
                          Wind & Gusts
                        </span>
                        <span className="text-body-sm font-body-sm text-white font-medium">
                          {day.windChillImpact}
                        </span>
                      </div>
                    </div>

                    {/* Tile 4: Weekend Confidence with Circular SVG Gauge */}
                    <div className="p-3 rounded-lg bg-white/10 dark:bg-surface-container/60 border border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
                          Forecast Model
                        </span>
                        <span className="text-body-sm font-body-sm text-white font-medium">
                          Confidence score {day.confidenceScore}%
                        </span>
                      </div>
                      
                      {/* Circular Gauge Ring */}
                      <div className="relative w-10 h-10 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white/15"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          ></path>
                          <path
                            className="text-[#34D399]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${day.confidenceScore}, 100`}
                            strokeLinecap="round"
                            strokeWidth="3.5"
                          ></path>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white tabular-nums">
                          {day.confidenceScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Routine Tags Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {day.lifestyleTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[12px] font-body-sm text-white flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#34D399]">
                          {tag.icon}
                        </span>
                        <span>{tag.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
};

