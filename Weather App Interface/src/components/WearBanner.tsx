import React from 'react';
import { WeatherData, ActivityLens } from '../types/weather';

interface WearBannerProps {
  data: WeatherData;
  activeLens: ActivityLens;
}

export const WearBanner: React.FC<WearBannerProps> = ({ data, activeLens }) => {
  const { whatToWear, current } = data;

  // Adapt text slightly based on lens if needed
  let adviceText = whatToWear.advice;
  if (activeLens === 'fitness') {
    adviceText = `Breathable running layers recommended. Temp is ${current.temp}°, feeling like ${current.feelsLike}°. Carry a light windbreaker for after your cool-down.`;
  } else if (activeLens === 'commute') {
    adviceText = `Sunglasses for the evening departure, but pack an umbrella for the return after 7 PM as rain begins.`;
  }

  return (
    <article className="rounded-[20px] p-5 bg-white/12 dark:bg-[#0c1323]/50 backdrop-blur-[20px] border border-white/18 shadow-[0_8px_30px_0_rgba(0,0,0,0.2)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-on-surface-variant">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[20px]">checkroom</span>
            <span className="material-symbols-outlined text-[20px]">umbrella</span>
          </div>
          <h2 className="font-section-label text-section-label uppercase tracking-wider text-on-surface font-semibold text-xs">
            What to wear & bring
          </h2>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-white/50 font-medium">
          <span className="material-symbols-outlined text-[14px] text-tertiary">thermostat</span>
          <span>Shade: -4°</span>
        </div>
      </div>

      <p className="font-body-md text-body-md text-white/90 leading-relaxed">
        {adviceText}
      </p>

      {/* Suggested Gear Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
        {whatToWear.items.map((item, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[12px] font-body-sm text-white flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </span>
        ))}
      </div>
    </article>
  );
};

