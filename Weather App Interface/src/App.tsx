import React, { useState } from 'react';
import { LOCATIONS_DB, SEARCH_INDEX } from './services/weatherEngine';
import { SkyState, ActivityLens } from './types/weather';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ActivityLensControl } from './components/ActivityLensControl';
import { SavedPlacesRow } from './components/SavedPlacesRow';
import { HeroCard } from './components/HeroCard';
import { WearBanner } from './components/WearBanner';
import { OptimalWindowCard } from './components/OptimalWindowCard';
import { SkyWatchCard } from './components/SkyWatchCard';
import { StepOutsideCard } from './components/StepOutsideCard';
import { HealthComfortCard } from './components/HealthComfortCard';
import { HourlyTimeline } from './components/HourlyTimeline';
import { MultiDayForecast } from './components/MultiDayForecast';
import { TravelPackModal } from './components/TravelPackModal';
import { RadarModal } from './components/RadarModal';
import { SkyShowcaseModal } from './components/SkyShowcaseModal';

export const App: React.FC = () => {
  const [currentLocationKey, setCurrentLocationKey] = useState<string>('kyoto');
  const [activeLens, setActiveLens] = useState<ActivityLens>('all');
  const [forcedSky, setForcedSky] = useState<SkyState | null>(null);

  // Modals state
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isPackingOpen, setIsPackingOpen] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);

  // Retrieve location data
  const weatherData = LOCATIONS_DB[currentLocationKey] || LOCATIONS_DB.kyoto;

  // Active sky state (location-based or user-overridden)
  const currentSky: SkyState = forcedSky || weatherData.location.skyState;

  // Sky class mapping
  const getSkyClass = (sky: SkyState) => {
    switch (sky) {
      case 'clear-noon':
        return 'sky-clear-noon';
      case 'golden-hour':
        return 'sky-golden-hour';
      case 'overcast':
        return 'sky-overcast';
      case 'night':
        return 'sky-night';
      case 'dawn':
        return 'sky-dawn';
      case 'storm':
        return 'sky-storm';
      default:
        return 'sky-golden-hour';
    }
  };

  const handleSelectLocation = (locKey: string) => {
    setCurrentLocationKey(locKey);
    setForcedSky(null); // Reset forced sky to naturally adapt to the new location's sky
  };

  const handleLocateMe = () => {
    setCurrentLocationKey('kyoto');
    setForcedSky(null);
  };

  const handleAddNewPlace = (name: string, _label: string) => {
    // Find matching location or default
    const found = SEARCH_INDEX.find(item => item.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      setCurrentLocationKey(found.targetLocationKey);
    }
  };

  return (
    <div className={`min-h-screen text-on-surface antialiased atmospheric-canvas ${getSkyClass(currentSky)} flex flex-col justify-between selection:bg-primary/30 selection:text-white`}>
      {/* Dynamic Star Specks for Night Sky */}
      {currentSky === 'night' && (
        <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
          <div className="absolute w-1 h-1 bg-white rounded-full top-12 left-24 animate-pulse"></div>
          <div className="absolute w-1.5 h-1.5 bg-amber-100 rounded-full top-28 right-36 opacity-80"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full top-44 left-1/3 opacity-60"></div>
          <div className="absolute w-1 h-1 bg-sky-200 rounded-full top-64 right-1/4 animate-pulse"></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-96 left-48 opacity-75"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full top-80 right-20 opacity-50"></div>
        </div>
      )}

      {/* Top Header */}
      <Header
        location={weatherData.location}
        currentSky={currentSky}
        onSelectSky={(sky) => setForcedSky(sky)}
        onOpenShowcase={() => setIsShowcaseOpen(true)}
        onOpenPacking={() => setIsPackingOpen(true)}
        onOpenRadar={() => setIsRadarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full pt-24 pb-space-xl max-w-[1280px] mx-auto px-4 md:px-margin-lg relative z-10">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-space-lg">
          {/* Row 1: Search Pill & Activity Lens Segmented Control */}
          <section className="w-full flex flex-col md:flex-row items-center justify-between gap-space-md pt-2">
            <SearchBar
              currentLocationId={currentLocationKey}
              onSelectLocation={handleSelectLocation}
              onLocateMe={handleLocateMe}
            />

            <ActivityLensControl
              activeLens={activeLens}
              onSelectLens={(lens) => setActiveLens(lens)}
            />
          </section>

          {/* Row 2: Saved Places Pills */}
          <SavedPlacesRow
            currentLocationId={currentLocationKey}
            onSelectPlace={handleSelectLocation}
            onAddNewPlace={handleAddNewPlace}
          />

          {/* Row 3: Two-Column Main Grid (488px Left Column & 688px Right Column) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-[488px_1fr] gap-6 items-start">
            {/* ================= LEFT COLUMN ================= */}
            <div className="flex flex-col gap-5 w-full">
              {/* 1. Hero Card */}
              <HeroCard
                data={weatherData}
                activeLens={activeLens}
              />

              {/* 2. What to Wear & Bring Banner */}
              <WearBanner
                data={weatherData}
                activeLens={activeLens}
              />

              {/* 3. Best Window Badge Card */}
              <OptimalWindowCard
                data={weatherData}
                activeLens={activeLens}
              />

              {/* 4. Golden Hour & Sky Watch Card */}
              <SkyWatchCard
                data={weatherData}
              />

              {/* 5. The "Step Outside" Check (vs. Yesterday) */}
              <StepOutsideCard
                data={weatherData}
              />

              {/* 6. Health & Comfort Triggers */}
              <HealthComfortCard
                data={weatherData}
              />
            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="flex flex-col gap-5 w-full">
              {/* 1. Next 24-Hour Timeline */}
              <HourlyTimeline
                hourly={weatherData.hourly}
              />

              {/* 2. 7-Day Forecast */}
              <MultiDayForecast
                weekly={weatherData.weekly}
                weekMinTemp={weatherData.weekMinTemp}
                weekMaxTemp={weatherData.weekMaxTemp}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest/60 backdrop-blur-2xl py-8 mt-12 border-t border-white/10 relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-margin-lg flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant font-body-sm text-body-sm text-xs sm:text-sm">
          <div className="flex items-center gap-space-md">
            <span className="font-headline-md text-headline-md text-primary font-medium tracking-tight text-lg">
              Aerie
            </span>
            <span className="text-outline">|</span>
            <span>Editorial Meteorology & Atmospheric Telemetry</span>
          </div>
          <div className="flex items-center gap-space-lg text-white/60">
            <span className="tabular-nums">Station Ref: {weatherData.current.stationId}</span>
            <span className="text-outline">•</span>
            <span>Human-Centric Weather Experience</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TravelPackModal
        isOpen={isPackingOpen}
        onClose={() => setIsPackingOpen(false)}
        initialLocationId={currentLocationKey}
      />

      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        location={weatherData.location}
      />

      <SkyShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
        onSelectSky={(sky) => setForcedSky(sky)}
      />
    </div>
  );
};

export default App;
