import React from 'react';
import {
  Wind,
  Compass,
  Sun,
  Shield,
  Activity,
  Droplets,
  Eye,
  CloudFog,
  AlertCircle,
  Thermometer,
} from 'lucide-react';
import { WeatherPayload } from '../types/weather';
import { TemperatureUnit, formatTempExact } from '../utils/weatherFormatters';

interface MetricBentoGridProps {
  weather: WeatherPayload;
  unit: TemperatureUnit;
}

export const MetricBentoGrid: React.FC<MetricBentoGridProps> = ({ weather, unit }) => {
  const { current, biometeorology, hourly } = weather;
  const { airQuality, pollen, solarMetrics, barometricTrend, comfortIndex } = biometeorology;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-8">
      <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-3 px-1">
        Meteorological Bento Matrix & Sensor Instrumentation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: Air Quality & Allergy Index */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Shield className="w-4 h-4 text-weather-emerald" /> Air Quality & Allergens
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${airQuality.color}25`, color: airQuality.color }}
              >
                {airQuality.level}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-3">
              <span className="text-4xl font-light font-display text-white">{airQuality.usAqi}</span>
              <span className="text-xs font-mono text-white/50">US AQI Score</span>
            </div>

            {/* AQI Gradient Track */}
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 relative my-2">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-black shadow-md -ml-1.5 transition-all duration-500"
                style={{ left: `${Math.min(100, (airQuality.usAqi / 200) * 100)}%` }}
              />
            </div>

            {/* Pollutant Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-white/[0.03] p-2.5 rounded-xl my-2 border border-white/5">
              <div>
                <span className="text-white/40 text-[10px] block">PM2.5</span>
                <span className="text-white font-medium">{airQuality.pm25} µg</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] block">PM10</span>
                <span className="text-white font-medium">{airQuality.pm10} µg</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] block">Ozone</span>
                <span className="text-white font-medium">{airQuality.ozone} µg</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-white/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/50">Pollen Risk:</span>
              <span className="font-mono text-weather-gold font-medium">
                Tree: {pollen.treePollen} • Grass: {pollen.grassPollen}
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-tight">{airQuality.healthRecommendations}</p>
          </div>
        </div>

        {/* CARD 2: Wind Vector & Gust Compass */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Wind className="w-4 h-4 text-weather-cyan" /> Wind Vector & Compass
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/80">
                Gust: {Math.round(current.windGustKmh)} km/h
              </span>
            </div>

            <div className="flex items-center justify-around py-3">
              {/* Compass Rosette */}
              <div className="relative w-28 h-28 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center">
                {/* Cardinal markers */}
                <span className="absolute top-1 text-[9px] font-mono text-white/40">N</span>
                <span className="absolute bottom-1 text-[9px] font-mono text-white/40">S</span>
                <span className="absolute left-1.5 text-[9px] font-mono text-white/40">W</span>
                <span className="absolute right-1.5 text-[9px] font-mono text-white/40">E</span>

                {/* Damped magnetic needle from Stitch.md */}
                <div
                  className="compass-needle absolute w-full h-full flex items-center justify-center pointer-events-none"
                  style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
                >
                  <div className="w-1.5 h-16 relative">
                    <div className="w-full h-1/2 bg-weather-cyan rounded-t-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    <div className="w-full h-1/2 bg-white/20 rounded-b-full" />
                  </div>
                </div>

                <div className="w-3 h-3 rounded-full bg-white shadow-md z-10" />
              </div>

              {/* Numerical readout */}
              <div className="text-right">
                <div className="text-3xl font-light font-display text-white">
                  {Math.round(current.windSpeedKmh)}
                  <span className="text-xs font-mono text-white/50 ml-1">km/h</span>
                </div>
                <div className="text-sm font-mono text-weather-cyan font-medium">
                  {current.windDirectionText} ({current.windDirectionDeg}°)
                </div>
                <div className="text-[11px] font-mono text-white/40 mt-1">
                  Beaufort Force {Math.min(12, Math.floor(current.windSpeedKmh / 5))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-white/60">
            Moderate atmospheric airflow. Low structural or bicycling turbulence.
          </div>
        </div>

        {/* CARD 3: UV Index & Solar Trajectory */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Sun className="w-4 h-4 text-weather-gold" /> UV Index & Solar Arc
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-weather-gold/20 text-weather-gold">
                {solarMetrics.uvRisk} Risk
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl font-light font-display text-white">{solarMetrics.uvIndex}</span>
              <span className="text-xs font-mono text-white/50">Max UV Index</span>
            </div>

            {/* Sun Trajectory Arc Representation */}
            <div className="relative h-16 w-full flex items-center justify-center my-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                <path
                  d="M 10 55 Q 100 5 190 55"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
                {/* Solar position point */}
                <circle cx="100" cy="22" r="6" fill="#FBBF24" className="animate-pulse" />
                <line x1="10" y1="56" x2="190" y2="56" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-white/60 px-1">
              <span>🌅 Rise {solarMetrics.sunriseTime}</span>
              <span>🌇 Set {solarMetrics.sunsetTime}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-white/70">
            <div className="text-[11px] text-weather-gold font-medium">
              Burn horizon: ~{solarMetrics.burnTimeMinutes} min unprotected exposure.
            </div>
            <p className="text-[10px] text-white/50">Apply SPF 30+ during midday solar transit.</p>
          </div>
        </div>

        {/* CARD 4: Barometric Pressure & Migraine Sentinel */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Activity className="w-4 h-4 text-weather-cyan" /> Pressure & Migraine Sentinel
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  barometricTrend.migraineRisk === 'High'
                    ? 'bg-weather-crimson/20 text-weather-crimson'
                    : 'bg-weather-emerald/20 text-weather-emerald'
                }`}
              >
                {barometricTrend.migraineRisk} Migraine Risk
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl font-light font-display text-white">
                {current.pressureHpa}
              </span>
              <span className="text-xs font-mono text-white/50">hPa ({barometricTrend.trendDescription})</span>
            </div>

            {/* Micro 12-hour pressure sparkline */}
            <div className="h-14 w-full flex items-end gap-1.5 py-2">
              {hourly.slice(0, 12).map((h, i) => {
                const normalizedHeight = Math.max(15, Math.min(100, (h.pressureHpa - 990) * 2.5));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div
                      style={{ height: `${normalizedHeight}%` }}
                      className="w-full bg-weather-cyan/40 group-hover:bg-weather-cyan rounded-t transition-all"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>Past 6h</span>
              <span>3h Δ: {barometricTrend.delta3hHpa > 0 ? `+${barometricTrend.delta3hHpa}` : barometricTrend.delta3hHpa} hPa</span>
              <span>Next 6h</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-white/70">
            {barometricTrend.healthAdvice}
          </div>
        </div>

        {/* CARD 5: Humidity & Dew Point Comfort */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Droplets className="w-4 h-4 text-weather-cyan" /> Humidity & Dew Point
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-weather-cyan/15 text-weather-cyan">
                {comfortIndex.verdict}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-3">
              <span className="text-4xl font-light font-display text-white">{current.humidity}%</span>
              <span className="text-xs font-mono text-white/50">
                Dew point {formatTempExact(comfortIndex.dewPointC, unit)}
              </span>
            </div>

            {/* Humidity Fill Bar */}
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden my-3">
              <div
                className="bg-weather-cyan h-full rounded-full transition-all duration-700"
                style={{ width: `${current.humidity}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-white/70">
            <p className="text-[11px] text-white/60 leading-relaxed">{comfortIndex.hydrationAdvice}</p>
          </div>
        </div>

        {/* CARD 6: Visibility & Cloud Ceiling */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1.5 text-white/90 font-medium">
                <Eye className="w-4 h-4 text-weather-frost" /> Optical Sight & Cloud Ceiling
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/80">
                Clear Horizon
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-3">
              <span className="text-4xl font-light font-display text-white">{current.visibilityKm}</span>
              <span className="text-xs font-mono text-white/50">km Optical Range</span>
            </div>

            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/5 space-y-1 my-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/50">Cloud Cover:</span>
                <span className="text-white font-medium">{current.cloudCoverPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white/60 h-full rounded-full"
                  style={{ width: `${current.cloudCoverPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-white/60">
            {current.visibilityKm >= 10
              ? 'Unrestricted visual line-of-sight. Perfect for driving, aviation, and scenic overlooks.'
              : 'Mild atmospheric haze or mist present. Exercise caution at high speeds.'}
          </div>
        </div>
      </div>
    </div>
  );
};
