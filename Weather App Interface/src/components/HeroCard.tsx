import React from 'react';
import { WeatherData, ActivityLens } from '../types/weather';

interface HeroCardProps {
  data: WeatherData;
  activeLens: ActivityLens;
}

export const HeroCard: React.FC<HeroCardProps> = ({ data, activeLens }) => {
  const { location, current } = data;

  // Lens-dependent alert rendering
  const renderLensAlert = () => {
    if (activeLens === 'fitness') {
      return (
        <div className="w-full rounded-xl p-3 bg-[#34D399]/15 border-l-[3px] border-l-[#34D399] border border-[#34D399]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#34D399]">water_drop</span>
            <span className="font-body-sm text-body-sm text-white font-medium">
              Dew point {current.dewPoint}° · {current.dewPoint < 15 ? 'crisp, not muggy' : 'humid'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#34D399]">eco</span>
            <span className="font-body-sm text-body-sm text-white font-medium">
              Air quality {current.aqi} · {current.aqi <= 50 ? 'comfortable' : 'moderate'}
            </span>
          </div>
        </div>
      );
    }

    if (activeLens === 'commute') {
      return (
        <div className="w-full rounded-xl p-3 bg-amber-500/15 border-l-[3px] border-l-tertiary border border-amber-500/20 flex items-start gap-2.5 backdrop-blur-md">
          <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0">directions_car</span>
          <div className="flex flex-col text-body-sm font-body-sm text-on-surface">
            <span className="font-medium text-white">5–7 PM Evening Commute: Dry initial window</span>
            <span className="text-on-surface-variant text-[12px]">
              Road visibility {current.visibility} km · Rain front arriving ~7 PM with gusts up to {current.windGust} km/h.
            </span>
          </div>
        </div>
      );
    }

    if (activeLens === 'home') {
      return (
        <div className="w-full rounded-xl p-3 bg-sky-500/15 border-l-[3px] border-l-secondary border border-sky-500/20 flex items-start gap-2.5 backdrop-blur-md">
          <span className="material-symbols-outlined text-[20px] text-secondary shrink-0">local_laundry_service</span>
          <div className="flex flex-col text-body-sm font-body-sm text-on-surface">
            <span className="font-medium text-white">Line-dry clothes before 4:30 PM</span>
            <span className="text-on-surface-variant text-[12px]">
              Rain tonight ({data.weekly[0]?.pop || 80}%) will thoroughly soak garden plants—skip manual watering.
            </span>
          </div>
        </div>
      );
    }

    // Default 'all' mode alert
    if (current.alert) {
      return (
        <div className="w-full rounded-xl p-3 bg-error-container/20 border-l-[3px] border-l-[#F87171] border border-error/20 flex items-start gap-2.5 backdrop-blur-md">
          <span className="material-symbols-outlined text-[20px] text-error shrink-0">rainy</span>
          <div className="flex flex-col text-body-sm font-body-sm text-on-surface">
            <span className="font-medium text-white">{current.alert.title}</span>
            <span className="text-on-surface-variant text-[12px]">{current.alert.desc}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <article className="rounded-[24px] p-7 bg-white/12 dark:bg-[#0c1323]/55 backdrop-blur-[20px] border border-white/20 shadow-[0_12px_36px_0_rgba(0,0,0,0.25)] flex flex-col gap-5 relative overflow-hidden">
      {/* Ambient internal refraction flare */}
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-tertiary/20 blur-3xl pointer-events-none"></div>

      {/* Section Label & Station Badge */}
      <div className="flex items-center justify-between">
        <span className="font-section-label text-section-label uppercase tracking-[0.08em] text-on-surface-variant/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          {location.name} · Now {current.localTimeStr}
        </span>
        <span className="text-[12px] font-metric-value px-2 py-0.5 rounded-full bg-white/10 text-on-surface-variant border border-white/10">
          Live station {current.stationId}
        </span>
      </div>

      {/* Hero Temp Display */}
      <div className="flex items-baseline gap-5">
        <span className="font-headline-hero text-headline-hero font-light tracking-[-0.04em] text-white leading-none tabular">
          {current.temp}°
        </span>
        <div className="flex flex-col gap-0.5 text-on-surface-variant">
          <span className="font-metric-value text-metric-value font-medium text-white/90 tabular">
            Feels {current.feelsLike}°
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant/90 tabular">
            H {current.highTemp}° · L {current.lowTemp}°
          </span>
        </div>
      </div>

      {/* Editorial Human Summary */}
      <p className="font-human-summary text-human-summary font-medium text-white leading-snug">
        {current.summaryPoetic}
      </p>

      {/* Climate-Relative Context Tag */}
      <div className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary-fixed font-body-sm text-body-sm font-medium shadow-sm">
        <span className="material-symbols-outlined text-[16px] text-tertiary">wb_twilight</span>
        <span>{current.climateContext}</span>
      </div>

      {/* Contextual Alert / Lens Banner */}
      {renderLensAlert()}
    </article>
  );
};

