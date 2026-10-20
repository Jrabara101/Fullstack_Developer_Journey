# AETHERIS | Atmospheric Intelligence & Hyper-Local Weather Platform

An atmospheric decision-support platform designed to synthesize the cinematic visual fidelity of Apple Weather with the granular, data-rich precision of Dark Sky and Windy. Built using **React**, **Vite**, **Tailwind CSS v3**, and a resilient **Node.js/Express + TypeScript** backend architecture with distributed caching and SQLite persistence.

---

## 🌟 Key Features & Ergonomics

### 1. Contextual Life Ergonomics ("Weather for Living")
* **Actionable Window Finder (Activity Planner):** Evaluates outdoor recreational activities (Running, Cycling, Dog Walking, Patio Dining, Gardening) with optimal time slots and biological comfort scores (0–100%) factoring precipitation, thermal index, and air quality.
* **Intelligent Apparel & Gear Advisor:** Analyzes "feels like" temperature, wind chill, humidity, and direct UV index to prescribe base layers, outer shells, and adaptive gear (e.g., UV400 sunglasses, storm umbrellas).
* **Biometeorological & Health Index:** Real-time monitoring for weather-sensitive individuals:
  * **Barometric Pressure & Migraine Sentinel:** Tracks 3-hour delta ($\Delta \text{hPa}/3\text{h}$) to trigger proactive migraine and sinus pressure alerts on rapid drops.
  * **Air Quality & Allergen Matrix:** US AQI, PM2.5, PM10, Ozone, and Pollen counts (Tree, Grass, Weed).
  * **UV Burn Horizon:** Safe sun exposure countdown without SPF protection.

### 2. Temporal Ergonomics & Precision Nowcasting
* **60-Minute Next-Hour Precipitation Nowcast:** High-resolution minute-by-minute timeline displaying millimetric rainfall volume with sequential spring physics animations and hover scrubbing.
* **24-Hour Diurnal Scrub Track:** Interactive horizontal scrubber that dynamically morphs daylight, golden hour, twilight, and lunar canvas visuals while updating hero metrics in real time.
* **Dynamic Weekend Outlook Card:** Friday-to-Sunday weather planner that answers *"What will the weather be like this weekend?"* with the weekend outdoor verdict.

### 3. Multi-Location Spatial Hub & Journey Forecasts
* **Commute & Route Weather Sentinel:** Dual-point point-to-point forecast module comparing departure and destination conditions (e.g. Brooklyn to Midtown Manhattan) with travel friction scores and buffer cushions.
* **Global Command Drawer (`Cmd+K` / `Ctrl+K`):** Global quick-switcher with fuzzy geocoding search, saved favorites matrix, and instant keyboard navigation.
* **Microclimate Auto-Detection:** Browser geolocation with reverse geocoding fallback.

### 4. Severe Weather & Preparedness Shield
* **Tiered Emergency Alerts:** Advisories, watches, and warnings with expandable official safety checklists.
* **Offline Emergency Snapshot:** Automatic local caching of the latest 48-hour forecast and radar data in IndexedDB/localStorage.
* **Historical Deviation Benchmark:** Inline context comparing current conditions against 30-year seasonal normals.

---

## 🏗️ Architecture & Tech Stack

```
├── client/                     # React 18 + Vite + Tailwind CSS v3
│   ├── src/
│   │   ├── components/         # Stitch.md Glassmorphic Design System
│   │   │   ├── Header.tsx
│   │   │   ├── SkyCanvas.tsx   # GPU Particle & Diurnal Gradient Canvas
│   │   │   ├── WeatherHero.tsx # Oversized Numerals, Unit Flip
│   │   │   ├── HourlyScrubber.tsx
│   │   │   ├── PrecipitationTimeline.tsx
│   │   │   ├── MetricBentoGrid.tsx
│   │   │   ├── ActivityPlanner.tsx
│   │   │   ├── ApparelAdvisor.tsx
│   │   │   ├── WeekendOutlook.tsx
│   │   │   ├── RadarView.tsx   # Interactive Doppler Radar Sweep
│   │   │   ├── CommuteModal.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   └── SevereAlertsBanner.tsx
│   │   ├── hooks/              # useWeather (TanStack Query), useGeolocation
│   │   └── utils/              # skyGradient, weatherFormatters
└── server/                     # Node.js + Express + TypeScript
    ├── src/
    │   ├── services/
    │   │   ├── weatherService.ts   # Open-Meteo Aggregator & Fallback
    │   │   ├── geocodingService.ts # Global Search & Reverse Geocode
    │   │   ├── cacheService.ts     # 1.1km Grid Rounding (lat:lon to 2 dec)
    │   │   ├── commuteService.ts   # Dual-point route comparator
    │   │   ├── dbService.ts        # File-backed persistence (SQLite schema)
    │   │   └── alertWorker.ts      # Scheduled Cron Alert Scanner
    │   └── routes/                 # /api/weather, /api/locations, /api/commute, /api/alerts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run in Development
Runs both backend API gateway (port 3002) and Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```
