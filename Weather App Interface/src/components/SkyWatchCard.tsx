import React from 'react';
import { WeatherData } from '../types/weather';

interface SkyWatchCardProps {
  data: WeatherData;
}

export const SkyWatchCard: React.FC<SkyWatchCardProps> = ({ data }) => {
  const { skyWatch, location } = data;
  const isNight = location.skyState === 'night';

  return (
    <article className="rounded-[20px] p-5 bg-white/12 dark:bg-[#0c1323]/50 backdrop-blur-[20px] border border-white/18 shadow-[0_8px_30px_0_rgba(0,0,0,0.2)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-tertiary">
            {isNight ? 'nights_stay' : 'wb_twilight'}
          </span>
          <h2 className="font-section-label text-section-label uppercase tracking-wider text-on-surface font-semibold text-xs">
            {isNight ? 'Night Sky & Aurora Watch' : 'Sky Watch'}
          </h2>
        </div>
        <span className="text-body-sm font-body-sm text-tertiary font-medium">
          {isNight ? 'Peak darkness' : `${skyWatch.minutesLeft} mins left`}
        </span>
      </div>

      <div className="font-day-label text-day-label text-white font-medium -mt-1">
        {isNight ? 'Starlight & Lunar Observation' : `Golden hour ${skyWatch.goldenHourRange}`}
      </div>

      {/* Sun-Arc Mini Chart SVG Visualization */}
      <div className="w-full relative py-2">
        <svg className="w-full h-24 overflow-visible" fill="none" viewBox="0 0 440 90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arcGlow" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0"></stop>
            </linearGradient>
            <linearGradient id="horizonGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)"></stop>
              <stop offset="50%" stopColor="rgba(251,191,36,0.5)"></stop>
              <stop offset="100%" stopColor="rgba(255,255,255,0.08)"></stop>
            </linearGradient>
          </defs>

          {/* Horizon Base Line */}
          <line stroke="url(#horizonGrad)" strokeDasharray="3 3" strokeWidth="1.5" x1="10" x2="430" y1="70" y2="70"></line>
          <text fill="rgba(220, 226, 249, 0.5)" fontFamily="Inter" fontSize="11" x="14" y="85">
            Dawn {skyWatch.dawnTime}
          </text>
          <text fill="rgba(220, 226, 249, 0.5)" fontFamily="Inter" fontSize="11" x="350" y="85">
            Sunset {skyWatch.sunsetTime}
          </text>

          {/* Full Projected Arc */}
          <path d="M 20 70 Q 220 -20 420 70" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"></path>
          <path d="M 20 70 Q 220 -20 420 70 L 420 70 L 20 70 Z" fill="url(#arcGlow)"></path>

          {/* Active Traveled Sun Arc */}
          <path
            d="M 20 70 Q 185 -10 375 60"
            fill="none"
            stroke={isNight ? "#7BD0FF" : "#FBBF24"}
            strokeWidth="2.5"
          ></path>

          {/* Sun / Moon Position Indicator */}
          <circle cx="375" cy="60" fill={isNight ? "#7BD0FF" : "#FBBF24"} fillOpacity="0.3" r="10" className="animate-ping"></circle>
          <circle cx="375" cy="60" fill={isNight ? "#7BD0FF" : "#FBBF24"} r="5"></circle>
          <circle cx="375" cy="60" fill="#FFFFFF" r="1.5"></circle>
        </svg>
      </div>

      {/* Key Atmospheric Observations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body-sm font-body-sm pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            skyWatch.quality === 'vivid' ? 'bg-emerald-400' : skyWatch.quality === 'soft' ? 'bg-amber-400' : 'bg-slate-400'
          }`}></span>
          <span className="text-on-surface-variant">
            Sky Quality: <strong className="text-white font-medium">{skyWatch.cloudDetail}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            skyWatch.stargazingQuality === 'excellent' ? 'bg-emerald-400' : skyWatch.stargazingQuality === 'good' ? 'bg-sky-400' : 'bg-amber-500'
          }`}></span>
          <span className="text-on-surface-variant">
            Stargazing: <strong className="text-white font-medium">{skyWatch.stargazingReason}</strong>
          </span>
        </div>
      </div>
    </article>
  );
};
