import React from 'react';
import { WeatherData } from '../types/weather';

interface StepOutsideCardProps {
  data: WeatherData;
}

export const StepOutsideCard: React.FC<StepOutsideCardProps> = ({ data }) => {
  const { stepOutside } = data;
  const isWarmer = stepOutside.tempToday >= stepOutside.tempYesterday;

  return (
    <article className="rounded-[20px] p-5 bg-white/12 dark:bg-[#0c1323]/50 backdrop-blur-[20px] border border-white/18 shadow-[0_8px_30px_0_rgba(0,0,0,0.2)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-section-label text-section-label uppercase tracking-wider text-on-surface-variant text-xs font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-tertiary">history</span>
          The "Step Outside" Check · vs. Yesterday
        </span>
        <span className="material-symbols-outlined text-[18px] text-tertiary">
          {isWarmer ? 'trending_up' : 'trending_down'}
        </span>
      </div>

      <div className="font-body-md text-body-md font-semibold text-white">
        {stepOutside.headline}
      </div>

      <div className="flex flex-col gap-3 pt-1">
        {/* Temperature comparison bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Temperature (Peak)</span>
            <span className="text-white font-metric-value tabular-nums">
              Yesterday {stepOutside.tempYesterday}°{' '}
              <span className="text-primary font-bold">
                → Today {stepOutside.tempToday}°
              </span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 relative overflow-hidden">
            {/* Yesterday bar (base) */}
            <div
              className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
              style={{ width: `${Math.min(100, (stepOutside.tempYesterday / 35) * 100)}%` }}
            ></div>
            {/* Today bar (accent) */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-tertiary rounded-full opacity-90 transition-all duration-500"
              style={{ width: `${Math.min(100, (stepOutside.tempToday / 35) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Humidity comparison bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Relative Humidity</span>
            <span className="text-white font-metric-value tabular-nums">
              Yesterday {stepOutside.humidityYesterday}%{' '}
              <span className="text-secondary font-bold">
                → Today {stepOutside.humidityToday}%
              </span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
              style={{ width: `${stepOutside.humidityYesterday}%` }}
            ></div>
            <div
              className="absolute left-0 top-0 h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${stepOutside.humidityToday}%` }}
            ></div>
          </div>
        </div>
      </div>
    </article>
  );
};

