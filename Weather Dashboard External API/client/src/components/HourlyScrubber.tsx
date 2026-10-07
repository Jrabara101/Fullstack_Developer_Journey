import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Clock,
} from 'lucide-react';
import { HourlyForecast } from '../types/weather';
import { TemperatureUnit, formatTemp } from '../utils/weatherFormatters';

interface HourlyScrubberProps {
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
  scrubIndex: number | null;
  onScrubChange: (index: number | null) => void;
}

export const HourlyScrubber: React.FC<HourlyScrubberProps> = ({
  hourly,
  unit,
  scrubIndex,
  onScrubChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayHours = hourly.slice(0, 24);

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 mx-auto' };
    switch (iconName) {
      case 'sun':
        return <Sun {...props} className="w-5 h-5 text-weather-gold mx-auto" />;
      case 'moon':
        return <Moon {...props} className="w-5 h-5 text-weather-frost mx-auto" />;
      case 'cloud-sun':
        return <CloudSun {...props} className="w-5 h-5 text-amber-200 mx-auto" />;
      case 'cloud-moon':
        return <CloudMoon {...props} className="w-5 h-5 text-indigo-200 mx-auto" />;
      case 'cloud-rain':
        return <CloudRain {...props} className="w-5 h-5 text-weather-cyan mx-auto" />;
      case 'cloud-snow':
        return <CloudSnow {...props} className="w-5 h-5 text-weather-frost mx-auto" />;
      case 'cloud-lightning':
        return <CloudLightning {...props} className="w-5 h-5 text-weather-amber mx-auto" />;
      default:
        return <Cloud {...props} className="w-5 h-5 text-white/70 mx-auto" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-6">
      <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl overflow-hidden">
        {/* Header with Title and Scrub Reset */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-weather-cyan" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              24-Hour Diurnal Forecast & Atmospheric Scrub Track
            </h3>
          </div>

          {scrubIndex !== null && (
            <button
              onClick={() => onScrubChange(null)}
              className="text-xs font-mono text-weather-cyan hover:underline px-2 py-0.5 rounded bg-weather-cyan/10"
            >
              Reset to Current Time
            </button>
          )}
        </div>

        {/* 24-Hour Scrub Slider Bar */}
        <div className="mb-5 px-2">
          <div className="flex justify-between text-[11px] font-mono text-white/50 mb-1.5">
            <span>Now ({displayHours[0]?.hourDisplay})</span>
            <span>+12 Hours</span>
            <span>+24 Hours ({displayHours[23]?.hourDisplay})</span>
          </div>
          <input
            type="range"
            min={0}
            max={displayHours.length - 1}
            value={scrubIndex !== null ? scrubIndex : 0}
            onChange={(e) => onScrubChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg bg-white/15 cursor-pointer accent-weather-cyan transition-all"
            aria-label="24-hour diurnal timeline scrub track"
          />
        </div>

        {/* Horizontal Hourly Columns */}
        <div
          ref={containerRef}
          className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/20 select-none"
        >
          {displayHours.map((hour, idx) => {
            const isSelected = scrubIndex === idx;

            return (
              <div
                key={hour.time}
                onClick={() => onScrubChange(idx)}
                className={`flex-shrink-0 flex flex-col items-center justify-between w-20 py-3 px-2 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-weather-cyan/20 border-weather-cyan shadow-lg shadow-weather-cyan/20 scale-105'
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08]'
                }`}
              >
                {/* Hour */}
                <span className={`text-xs font-mono ${isSelected ? 'text-weather-cyan font-bold' : 'text-white/70'}`}>
                  {hour.hourDisplay}
                </span>

                {/* Condition Icon */}
                <div className="my-2.5">{renderIcon(hour.icon)}</div>

                {/* Temperature */}
                <span className="font-semibold text-sm text-white font-mono">
                  {formatTemp(hour.tempC, unit)}
                </span>

                {/* Precipitation Probability Bar */}
                <div className="w-full mt-2.5 pt-2 border-t border-white/10 flex flex-col items-center">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-weather-cyan h-full rounded-full transition-all duration-300"
                      style={{ width: `${hour.precipitationProb}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-weather-cyan/90 mt-1">
                    {hour.precipitationProb > 0 ? `${hour.precipitationProb}%` : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
