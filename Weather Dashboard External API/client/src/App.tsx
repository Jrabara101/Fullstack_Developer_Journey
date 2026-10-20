import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { WeatherLocation } from './types/weather';
import { TemperatureUnit } from './utils/weatherFormatters';
import { getSkyGradient } from './utils/skyGradient';

import { SkyCanvas } from './components/SkyCanvas';
import { Header } from './components/Header';
import { SevereAlertsBanner } from './components/SevereAlertsBanner';
import { WeatherHero } from './components/WeatherHero';
import { HourlyScrubber } from './components/HourlyScrubber';
import { PrecipitationTimeline } from './components/PrecipitationTimeline';
import { MetricBentoGrid } from './components/MetricBentoGrid';
import { ActivityPlanner } from './components/ActivityPlanner';
import { ApparelAdvisor } from './components/ApparelAdvisor';
import { WeekendOutlook } from './components/WeekendOutlook';
import { RadarView } from './components/RadarView';
import { CommuteModal } from './components/CommuteModal';
import { CommandPalette } from './components/CommandPalette';
import { Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const { activeLocation, setActiveLocation, detectLocation, isDetecting } = useGeolocation();
  const { data: weather, isLoading, error, refetch, isOffline, cachedSnapshotTime } = useWeather(activeLocation);

  const [savedLocations, setSavedLocations] = useState<WeatherLocation[]>([]);
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCommuteModalOpen, setIsCommuteModalOpen] = useState(false);

  // Fetch saved favorites
  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data: WeatherLocation[]) => setSavedLocations(data))
      .catch(console.error);
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate diurnal sky gradient based on live time or scrubbed hour
  const currentHour = useMemo(() => {
    if (scrubIndex !== null && weather?.hourly[scrubIndex]) {
      return new Date(weather.hourly[scrubIndex].time).getHours();
    }
    return new Date().getHours();
  }, [scrubIndex, weather]);

  const conditionCode = useMemo(() => {
    if (scrubIndex !== null && weather?.hourly[scrubIndex]) {
      return weather.hourly[scrubIndex].conditionCode;
    }
    return weather?.current.conditionCode || 1;
  }, [scrubIndex, weather]);

  const sky = useMemo(() => {
    return getSkyGradient(currentHour, conditionCode);
  }, [currentHour, conditionCode]);

  const handleAddLocation = async (loc: WeatherLocation) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedLocations((prev) => [...prev, saved]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrubbedHourData = useMemo(() => {
    if (scrubIndex === null || !weather?.hourly[scrubIndex]) return null;
    const h = weather.hourly[scrubIndex];
    return {
      tempC: h.tempC,
      feelsLikeC: h.feelsLikeC,
      conditionText: h.conditionText,
      icon: h.icon,
      hourDisplay: h.hourDisplay,
    };
  }, [scrubIndex, weather]);

  return (
    <div className="relative min-h-screen text-[#F8FAFC] flex flex-col justify-between selection:bg-weather-cyan/30">
      {/* Dynamic Environmental Sky Canvas Backdrop */}
      <SkyCanvas
        gradient={sky.gradient}
        hasPrecipitation={weather?.minuteSummary.hasPrecipitation || false}
        precipitationType={weather?.current.conditionCode && weather.current.conditionCode >= 71 && weather.current.conditionCode <= 86 ? 'snow' : 'rain'}
        intensity={weather?.minuteCast[0]?.intensity || 0}
      />

      {/* Main Top Header */}
      <Header
        location={activeLocation}
        savedLocations={savedLocations}
        onSelectLocation={(loc) => {
          setActiveLocation(loc);
          setScrubIndex(null);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCommuteModal={() => setIsCommuteModalOpen(true)}
        onDetectLocation={detectLocation}
        isDetecting={isDetecting}
        unit={unit}
        onToggleUnit={() => setUnit((prev) => (prev === 'C' ? 'F' : 'C'))}
        isOffline={isOffline}
        cachedTime={cachedSnapshotTime}
        daylightPhase={sky.phaseName}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading && !weather ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-2 border-weather-cyan border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-white/70 animate-pulse">
              Synthesizing hyper-local atmospheric feeds...
            </p>
          </div>
        ) : error && !weather ? (
          <div className="max-w-md mx-auto my-20 p-6 glass-panel rounded-3xl text-center border-weather-crimson/30">
            <AlertCircle className="w-8 h-8 text-weather-crimson mx-auto mb-2" />
            <h3 className="font-bold text-white mb-1">Atmospheric Telemetry Unavailable</h3>
            <p className="text-xs text-white/60 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-weather-cyan text-black font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect Feeds
            </button>
          </div>
        ) : weather ? (
          <>
            {/* Severe Weather Alerts (Docked Top Banner) */}
            <SevereAlertsBanner alerts={weather.alerts} />

            {/* Weather Hero Banner */}
            <WeatherHero
              weather={weather}
              unit={unit}
              scrubbedHourData={scrubbedHourData}
            />

            {/* 24-Hour Diurnal Scrubber */}
            <HourlyScrubber
              hourly={weather.hourly}
              unit={unit}
              scrubIndex={scrubIndex}
              onScrubChange={setScrubIndex}
            />

            {/* 60-Minute Precipitation Timeline */}
            <PrecipitationTimeline
              minuteCast={weather.minuteCast}
              summary={weather.minuteSummary}
            />

            {/* Meteorological Bento Grid (6 Sensory Cards) */}
            <MetricBentoGrid weather={weather} unit={unit} />

            {/* Actionable Window Finder (Activity Planner) */}
            <ActivityPlanner activities={weather.activities} />

            {/* Intelligent Apparel Advisor */}
            <ApparelAdvisor apparel={weather.apparel} />

            {/* Dynamic Weekend Outlook Card */}
            <WeekendOutlook
              weekendData={weather.weekendOutlook}
              daily={weather.daily}
              unit={unit}
            />

            {/* Atmospheric Radar & Echo Doppler Map */}
            <RadarView location={activeLocation} />
          </>
        ) : null}
      </main>

      {/* Commute Sentinel Modal */}
      <CommuteModal
        isOpen={isCommuteModalOpen}
        onClose={() => setIsCommuteModalOpen(false)}
        unit={unit}
      />

      {/* Global Saved Locations Command Drawer (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        savedLocations={savedLocations}
        onSelectLocation={(loc) => {
          setActiveLocation(loc);
          setScrubIndex(null);
        }}
        onAddLocation={handleAddLocation}
        activeLocationId={activeLocation.id}
        unit={unit}
      />

      {/* Footer & Telemetry Attribution */}
      <footer className="w-full border-t border-white/10 backdrop-blur-xl bg-black/40 py-6 px-4 sm:px-8 text-center text-xs font-mono text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-weather-emerald animate-pulse" />
            <span className="text-white/80 font-semibold tracking-wider">AETHERIS PLATFORM</span>
            <span>• Atmospheric Decision Support & Hyper-Local Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Sub-30ms Distributed Grid Caching (~1.1km)</span>
            <span>•</span>
            <span>IndexedDB/localStorage Offline Snapshot</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
