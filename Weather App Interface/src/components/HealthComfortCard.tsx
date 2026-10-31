import React from 'react';
import { WeatherData } from '../types/weather';

interface HealthComfortCardProps {
  data: WeatherData;
}

export const HealthComfortCard: React.FC<HealthComfortCardProps> = ({ data }) => {
  const { healthTriggers, current } = data;

  return (
    <article className="rounded-[20px] p-5 bg-white/12 dark:bg-[#0c1323]/50 backdrop-blur-[20px] border border-white/18 shadow-[0_8px_30px_0_rgba(0,0,0,0.2)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-section-label text-section-label uppercase tracking-wider text-on-surface-variant text-xs font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#34D399]">health_and_safety</span>
          Health & Comfort Triggers
        </span>
        <span className="text-[11px] font-metric-value text-white/50 tabular-nums">
          Barometer: {current.pressure} hPa ({current.pressureChange6h > 0 ? `+${current.pressureChange6h}` : current.pressureChange6h} / 6h)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Trigger 1: Headache / Migraine Barometer */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
              Migraine Risk
            </span>
            <span className={`w-2 h-2 rounded-full ${
              healthTriggers.headacheRisk === 'low' ? 'bg-[#34D399]' : healthTriggers.headacheRisk === 'moderate' ? 'bg-amber-400' : 'bg-[#F87171]'
            }`}></span>
          </div>
          <div className="text-white font-medium text-sm capitalize">
            {healthTriggers.headacheRisk} Trigger Risk
          </div>
          <span className="text-white/60 text-[11px] leading-tight">
            {healthTriggers.headacheNote}
          </span>
        </div>

        {/* Trigger 2: Pollen Levels */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
              Allergy Pollen
            </span>
            <span className={`w-2 h-2 rounded-full ${
              healthTriggers.pollenLevel === 'low' ? 'bg-[#34D399]' : 'bg-amber-400'
            }`}></span>
          </div>
          <div className="text-white font-medium text-sm capitalize">
            {healthTriggers.pollenLevel} Level
          </div>
          <span className="text-white/60 text-[11px] leading-tight">
            {healthTriggers.pollenTypes.join(', ')}
          </span>
        </div>

        {/* Trigger 3: Dry Skin / Hydration */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-section-label uppercase tracking-wider text-on-surface-variant">
              Skin Hydration
            </span>
            <span className={`w-2 h-2 rounded-full ${
              !healthTriggers.drySkinRisk ? 'bg-[#34D399]' : 'bg-amber-400'
            }`}></span>
          </div>
          <div className="text-white font-medium text-sm">
            {healthTriggers.drySkinRisk ? 'Dry Skin Alert' : 'Moisture Balanced'}
          </div>
          <span className="text-white/60 text-[11px] leading-tight">
            {healthTriggers.drySkinNote}
          </span>
        </div>
      </div>
    </article>
  );
};

