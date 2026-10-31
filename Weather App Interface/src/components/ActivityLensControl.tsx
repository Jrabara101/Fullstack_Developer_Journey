import React from 'react';
import { ActivityLens } from '../types/weather';

interface ActivityLensControlProps {
  activeLens: ActivityLens;
  onSelectLens: (lens: ActivityLens) => void;
}

export const ActivityLensControl: React.FC<ActivityLensControlProps> = ({
  activeLens,
  onSelectLens
}) => {
  const lenses: Array<{ key: ActivityLens; label: string; icon: string; tooltip: string }> = [
    { key: 'all', label: 'All', icon: 'dashboard', tooltip: 'Balanced editorial view' },
    { key: 'commute', label: 'Commute', icon: 'commute', tooltip: 'Focus on 7-9 AM & 5-7 PM road visibility & rain' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness_center', tooltip: 'Focus on UV index, dew point (muggy vs crisp), air quality' },
    { key: 'home', label: 'Home', icon: 'home', tooltip: 'Focus on laundry drying windows, plant watering, weather alerts' }
  ];

  return (
    <div
      className="h-10 p-1 rounded-full bg-white/10 dark:bg-surface-container-low/50 backdrop-blur-xl border border-white/15 flex items-center gap-1 shadow-md shrink-0 select-none"
      title="Filter interface highlights for specific lifestyle routines"
    >
      {lenses.map((lens) => {
        const isActive = activeLens === lens.key;
        return (
          <button
            key={lens.key}
            type="button"
            onClick={() => onSelectLens(lens.key)}
            title={lens.tooltip}
            className={`h-full px-3 sm:px-4 rounded-full font-body-sm text-body-sm transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-white/25 text-on-surface font-semibold shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-primary' : 'text-white/60'}`}>
              {lens.icon}
            </span>
            <span>{lens.label}</span>
          </button>
        );
      })}
    </div>
  );
};

