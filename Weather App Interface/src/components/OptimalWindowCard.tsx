import React from 'react';
import { WeatherData, ActivityLens } from '../types/weather';

interface OptimalWindowCardProps {
  data: WeatherData;
  activeLens: ActivityLens;
}

export const OptimalWindowCard: React.FC<OptimalWindowCardProps> = ({ data, activeLens }) => {
  const { optimalWindow } = data;

  const displayHeadline = optimalWindow.lensSpecificText[activeLens] || optimalWindow.timeRange;

  return (
    <article className="rounded-[20px] p-5 bg-white/12 dark:bg-[#0c1323]/50 backdrop-blur-[20px] border-l-4 border-l-[#34D399] border border-white/18 shadow-[0_8px_30px_0_rgba(0,0,0,0.2)] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#34D399]">
            {activeLens === 'fitness' ? 'sprint' : activeLens === 'commute' ? 'commute' : activeLens === 'home' ? 'yard' : 'directions_walk'}
          </span>
          <span className="font-section-label text-section-label uppercase tracking-widest text-[#34D399] font-bold text-xs">
            {activeLens === 'fitness' ? 'Best workout window' : activeLens === 'commute' ? 'Commuter window' : activeLens === 'home' ? 'Household window' : 'Best time outside'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] text-[11px] font-semibold tracking-wider">
          OPTIMAL
        </span>
      </div>

      <div className="font-headline-md text-headline-md font-semibold text-[#34D399] leading-snug">
        {displayHeadline}
      </div>

      <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-wrap items-center gap-2 pt-0.5">
        {optimalWindow.tags.map((tag, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-outline text-xs">•</span>}
            <span className="text-white/80">{tag}</span>
          </React.Fragment>
        ))}
      </div>
    </article>
  );
};

