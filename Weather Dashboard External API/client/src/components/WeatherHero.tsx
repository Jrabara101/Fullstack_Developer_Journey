import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Shirt,
  Footprints,
} from 'lucide-react';
import { WeatherPayload } from '../types/weather';
import { TemperatureUnit, formatTemp } from '../utils/weatherFormatters';

interface WeatherHeroProps {
  weather: WeatherPayload;
  unit: TemperatureUnit;
  scrubbedHourData?: {
    tempC: number;
    feelsLikeC: number;
    conditionText: string;
    icon: string;
    hourDisplay: string;
  } | null;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ weather, unit, scrubbedHourData }) => {
  const current = weather.current;
  const activeTempC = scrubbedHourData ? scrubbedHourData.tempC : current.tempC;
  const activeFeelsC = scrubbedHourData ? scrubbedHourData.feelsLikeC : current.feelsLikeC;
  const activeCondition = scrubbedHourData ? scrubbedHourData.conditionText : current.conditionText;
  const activeIcon = scrubbedHourData ? scrubbedHourData.icon : current.icon;

  // Icon renderer with atmospheric glow
  const renderWeatherGlyph = (iconName: string) => {
    const props = { className: 'w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_24px_rgba(56,189,248,0.45)]' };
    switch (iconName) {
      case 'sun':
        return <Sun {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-weather-gold drop-shadow-[0_0_24px_rgba(251,191,36,0.6)] animate-pulse-subtle" />;
      case 'moon':
        return <Moon {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-weather-frost drop-shadow-[0_0_24px_rgba(224,242,254,0.5)]" />;
      case 'cloud-sun':
        return <CloudSun {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-amber-200" />;
      case 'cloud-moon':
        return <CloudMoon {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-200" />;
      case 'cloud-rain':
      case 'cloud-rain-heavy':
        return <CloudRain {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-weather-cyan animate-bounce" />;
      case 'cloud-snow':
      case 'snowflake':
        return <CloudSnow {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-weather-frost" />;
      case 'cloud-lightning':
      case 'cloud-lightning-rain':
        return <CloudLightning {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 animate-pulse" />;
      default:
        return <Cloud {...props} className="w-16 h-16 sm:w-20 sm:h-20 text-white/80" />;
    }
  };

  const topActivity = weather.activities[0];
  const apparelSummary = weather.apparel.summarySentence;
  const benchmark = weather.historicalBenchmark;

  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 text-center flex flex-col items-center justify-center">
      {/* Scrub indicator notice if user is dragging diurnal timeline */}
      {scrubbedHourData && (
        <div className="mb-3 px-3 py-1 rounded-full bg-weather-cyan/20 border border-weather-cyan/40 text-weather-cyan text-xs font-mono font-medium animate-pulse flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Previewing {scrubbedHourData.hourDisplay}
        </div>
      )}

      {/* Main Condition Glyph with Ambient Glow */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute inset-0 bg-weather-cyan/10 blur-3xl rounded-full scale-150" />
        {renderWeatherGlyph(activeIcon)}
      </div>

      {/* Hero Temperature Numeral: 64px to 96px, Light, tracking -0.04em */}
      <div className="flex items-baseline justify-center gap-1 my-1">
        <span className="hero-temperature text-7xl sm:text-9xl text-white select-none">
          {formatTemp(activeTempC, unit)}
        </span>
      </div>

      {/* Narrative Condition Label & High / Low Range */}
      <div className="space-y-1.5 max-w-xl">
        <h2 className="text-xl sm:text-2xl font-medium text-white/95 tracking-tight">
          {activeCondition}
        </h2>

        <div className="flex items-center justify-center gap-3 text-sm font-mono text-white/70">
          <span>Feels like {formatTemp(activeFeelsC, unit)}</span>
          <span className="text-white/30">•</span>
          <span className="text-weather-cyan">H: {formatTemp(current.highC, unit)}</span>
          <span className="text-white/40">L: {formatTemp(current.lowC, unit)}</span>
        </div>

        <p className="text-xs sm:text-sm text-white/60 font-sans leading-relaxed pt-1">
          {current.narrativePhrase}
        </p>
      </div>

      {/* Contextual Actionable Life Chip (Apparel & Activity) */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 text-xs sm:text-sm text-white/90 border border-white/10 shadow-lg">
          <Footprints className="w-4 h-4 text-weather-cyan shrink-0" />
          <span className="font-medium text-white/95">
            {topActivity.title}: {topActivity.verdict}
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-white/70 text-xs hidden sm:inline">{topActivity.bestTimeWindow}</span>
        </div>

        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 text-xs sm:text-sm text-white/90 border border-white/10 shadow-lg">
          <Shirt className="w-4 h-4 text-weather-gold shrink-0" />
          <span className="text-white/80 text-xs">{apparelSummary}</span>
        </div>
      </div>

      {/* Inline Historical Seasonal Deviation Benchmark */}
      {benchmark && (
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/60">
          {benchmark.currentVsNormalDeltaC >= 0 ? (
            <TrendingUp className="w-3 h-3 text-weather-amber" />
          ) : (
            <TrendingDown className="w-3 h-3 text-weather-cyan" />
          )}
          <span>{benchmark.anomalyText}</span>
        </div>
      )}
    </section>
  );
};
