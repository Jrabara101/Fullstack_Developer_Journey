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
    delta3hHpa: number; // Change in last 3 hours
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
    burnTimeMinutes: number; // Safe sun exposure minutes without sunscreen
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
  statusSummary: string; // "Ideal temperature, low wind, 0% rain"
  warnings?: string[];
}

export interface ApparelAdvice {
  baseLayer: string; // e.g. "Breathable cotton or merino wool"
  outerLayer: string; // e.g. "Light water-resistant windbreaker after 18:00"
  accessories: string[]; // e.g. ["UV Sunglasses", "Compact Umbrella"]
  summarySentence: string; // "Comfortable in a tee during noon; layer up with a light jacket by dusk."
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
  anomalyText: string; // e.g. "3.8°C warmer than typical early October averages"
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
  minuteCast: MinutePrecipitation[]; // 60 minutes
  minuteSummary: {
    hasPrecipitation: boolean;
    startInMinutes: number | null;
    stopInMinutes: number | null;
    summaryText: string; // e.g. "Rain starting in 18 minutes, stopping in 42 minutes"
  };
  hourly: HourlyForecast[]; // Next 48 hours
  daily: DailyForecast[]; // 7 to 10 days
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
  departureTime: string; // "08:30"
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
