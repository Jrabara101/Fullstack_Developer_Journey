export interface WeatherLocation {
  id: string;
  user_id?: string;
  name: string;
  label?: string;
  lat: number;
  lon: number;
  country: string;
  admin1?: string;
  timezone: string;
  is_favorite: boolean;
  custom_label?: string;
}

export interface MinutePrecipitation {
  minute: number; // 0 - 60
  intensity: number; // mm/h (0 to 10+)
  probability: number; // 0 - 100%
  type: 'none' | 'rain' | 'snow' | 'sleet';
}

export interface HourlyForecast {
  time: string; // ISO string
  hourDisplay: string; // "14:00" or "2 PM"
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  conditionCode: number;
  conditionText: string;
  icon: string;
  precipitationProb: number;
  rainMm: number;
  snowCm: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windDirectionText: string;
  windGustKmh: number;
  humidity: number;
  dewPointC: number;
  pressureHpa: number;
  uvIndex: number;
  isDaylight: boolean;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Monday", etc.
  conditionCode: number;
  conditionText: string;
  tempMaxC: number;
  tempMaxF: number;
  tempMinC: number;
  tempMinF: number;
  precipitationProb: number;
  precipitationTotalMm: number;
  sunrise: string;
  sunset: string;
  uvMax: number;
  windMaxKmh: number;
  summary: string;
}

export interface BiometeorologicalData {
  barometricTrend: {
    currentHpa: number;
    delta3hHpa: number;
    trendDescription: 'Steady' | 'Rising' | 'Dropping' | 'Rapid Drop' | 'Rapid Rise';
    migraineRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    sinusRisk: 'Low' | 'Moderate' | 'High';
    healthAdvice: string;
  };
  airQuality: {
    usAqi: number;
    level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    color: string;
    pm25: number;
    pm10: number;
    ozone: number;
    no2: number;
    co: number;
    primaryPollutant: string;
    healthRecommendations: string;
  };
  pollen: {
    treePollen: 'Low' | 'Moderate' | 'High' | 'Very High';
    grassPollen: 'Low' | 'Moderate' | 'High' | 'Very High';
    weedPollen: 'Low' | 'Moderate' | 'High' | 'Very High';
    overallAllergyRisk: 'Minimal' | 'Moderate' | 'Elevated' | 'Severe';
  };
  solarMetrics: {
    uvIndex: number;
    uvRisk: 'Low' | 'Moderate' | 'Very High' | 'Extreme';
    burnTimeMinutes: number;
    sunElevationDeg: number;
    sunriseTime: string;
    sunsetTime: string;
    goldenHourDawn: string;
    goldenHourDusk: string;
    solarNoon: string;
  };
  comfortIndex: {
    humidity: number;
    dewPointC: number;
    verdict: 'Crisp & Dry' | 'Optimal Comfort' | 'Slightly Humid' | 'Muggy' | 'Oppressive';
    hydrationAdvice: string;
  };
}

export interface ActivityWindow {
  activity: 'running' | 'cycling' | 'dog_walking' | 'outdoor_dining' | 'gardening';
  title: string;
  icon: string;
  score: number; // 0 - 100
  verdict: 'Optimal' | 'Favorable' | 'Challenging' | 'Hazardous';
  bestTimeWindow: string; // e.g. "07:00 - 09:30"
  statusSummary: string;
  warnings?: string[];
}

export interface ApparelAdvice {
  baseLayer: string;
  outerLayer: string;
  accessories: string[];
  summarySentence: string;
  thermalFeeling: 'Freezing' | 'Cold' | 'Crisp' | 'Mild' | 'Warm' | 'Hot' | 'Sweltering';
}

export interface WeatherAlert {
  id: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  category: 'wind' | 'rain' | 'storm' | 'heat' | 'cold' | 'air_quality' | 'pressure';
  headline: string;
  description: string;
  agency: string;
  effective: string;
  expires: string;
  safetyChecklist: string[];
}

export interface HistoricalBenchmark {
  historicalMeanC: number;
  historicalMeanF: number;
  currentVsNormalDeltaC: number;
  currentVsNormalDeltaF: number;
  anomalyText: string;
  seasonPhase: string;
}

export interface WeatherPayload {
  location: WeatherLocation;
  fetchedAt: string;
  current: {
    tempC: number;
    tempF: number;
    feelsLikeC: number;
    feelsLikeF: number;
    conditionCode: number;
    conditionText: string;
    icon: string;
    highC: number;
    highF: number;
    lowC: number;
    lowF: number;
    humidity: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    windDirectionText: string;
    windGustKmh: number;
    pressureHpa: number;
    uvIndex: number;
    visibilityKm: number;
    cloudCoverPercent: number;
    narrativePhrase: string;
  };
  minuteCast: MinutePrecipitation[];
  minuteSummary: {
    hasPrecipitation: boolean;
    startInMinutes: number | null;
    stopInMinutes: number | null;
    summaryText: string;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  biometeorology: BiometeorologicalData;
  activities: ActivityWindow[];
  apparel: ApparelAdvice;
  alerts: WeatherAlert[];
  historicalBenchmark: HistoricalBenchmark;
  weekendOutlook?: {
    friday: DailyForecast;
    saturday: DailyForecast;
    sunday: DailyForecast;
    weekendVerdict: string;
    bestOutdoorDay: string;
  };
}

export interface CommuteRoute {
  id: string;
  user_id?: string;
  name: string;
  originName: string;
  originLat: number;
  originLon: number;
  destName: string;
  destLat: number;
  destLon: number;
  departureTime: string;
  alertEnabled: boolean;
}

export interface CommuteForecastResult {
  route: CommuteRoute;
  departureTime: string;
  originWeather: {
    tempC: number;
    conditionText: string;
    rainProb: number;
    roadCondition: 'Dry' | 'Damp' | 'Wet' | 'Hazardous';
  };
  destWeather: {
    tempC: number;
    conditionText: string;
    rainProb: number;
    roadCondition: 'Dry' | 'Damp' | 'Wet' | 'Hazardous';
  };
  frictionScore: 'Low Impact' | 'Moderate Delay Risk' | 'Severe Weather Friction';
  recommendedCushionMinutes: number;
  advisoryText: string;
}
