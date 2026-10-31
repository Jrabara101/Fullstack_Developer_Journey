export type SkyState = 'golden-hour' | 'clear-noon' | 'overcast' | 'night' | 'dawn' | 'storm';

export type ActivityLens = 'all' | 'commute' | 'fitness' | 'home';

export type RainIntensity = 'none' | 'drizzle' | 'light' | 'moderate' | 'heavy';

export interface LocationInfo {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  stationCode: string;
  stationCoords: string;
  timezone: string;
  skyState: SkyState;
  customLabel?: string;
  isSaved?: boolean;
  postalCode?: string;
  isLandmark?: boolean;
}

export interface HourlyDataPoint {
  timeStr: string;         // 'Now', '5 PM', '5:12 PM', '12 AM'
  hourNum: number;         // 0-23
  temp: number;            // °C
  feelsLike: number;       // °C
  condition: string;       // e.g. 'Sunny', 'Golden Twilight', 'Showers'
  icon: string;            // material symbol name
  pop: number;             // Precipitation probability 0-100%
  rainIntensity: RainIntensity; // 'none', 'drizzle', 'light', 'moderate', 'heavy'
  windSpeed: number;       // km/h
  windDirection: string;   // 'W', 'NW', etc.
  uvIndex: number;         // 0-11+
  dewPoint: number;        // °C
  humidity: number;        // %
  aqi: number;             // Air quality index
  isMilestone?: boolean;   // Sunrise / Sunset milestone card
  milestoneType?: 'sunrise' | 'sunset' | 'golden-hour' | 'dawn';
  milestoneTitle?: string;
  badge?: {
    type: 'run' | 'umbrella' | 'sunglasses' | 'alert' | 'sunset';
    label?: string;
    icon: string;
  };
}

export interface DayForecast {
  id: string;
  dayLabel: string;        // 'Today', 'Sat', 'Sun', 'Mon'
  subLabel?: string;       // 'Tomorrow'
  fullDate: string;        // 'Oct 31'
  humanSummary: string;    // 'Crisp morning, breezy afternoon'
  icon: string;
  pop: number;             // 0-100%
  highTemp: number;
  lowTemp: number;
  uvPeak: {
    window: string;        // 'Peak 11 AM–1 PM'
    index: number;         // 4
    level: string;         // 'Mod 4'
  };
  aqi: {
    value: number;         // 32
    label: string;         // 'Comfortable'
  };
  windChillImpact: string; // 'Feels 2° colder in the gusts'
  confidenceScore: number; // 82%
  lifestyleTags: Array<{
    icon: string;
    label: string;
    highlightColor?: string;
  }>;
}

export interface WeatherData {
  location: LocationInfo;
  current: {
    temp: number;
    feelsLike: number;
    highTemp: number;
    lowTemp: number;
    humidity: number;
    dewPoint: number;
    pressure: number;      // hPa
    pressureChange6h: number; // e.g. -2.4 hPa
    windSpeed: number;     // km/h
    windGust: number;      // km/h
    windDirection: string;
    uvIndex: number;
    aqi: number;
    visibility: number;    // km
    cloudCover: number;    // %
    lowCloudCover: number; // %
    localTimeStr: string;  // '18:42 GMT'
    stationId: string;     // '#KY-01'
    summaryPoetic: string; // 'Golden light now, showers after seven.'
    climateContext: string;// '3° above normal for late October'
    alert?: {
      type: 'rain' | 'front' | 'wind' | 'freeze';
      title: string;
      desc: string;
    };
  };
  whatToWear: {
    advice: string;
    items: Array<{ icon: string; name: string }>;
  };
  optimalWindow: {
    title: string;
    timeRange: string;
    tags: string[];
    lensSpecificText: Record<ActivityLens, string>;
  };
  skyWatch: {
    goldenHourRange: string;
    minutesLeft: number;
    sunsetTime: string;
    dawnTime: string;
    quality: 'vivid' | 'soft' | 'muted';
    cloudDetail: string;
    stargazingQuality: 'excellent' | 'good' | 'fair' | 'poor';
    stargazingReason: string;
    sunPositionRatio: number; // 0 to 1 along daytime arc
  };
  stepOutside: {
    headline: string;      // 'Noticeably warmer (+4°) and drier'
    tempYesterday: number;
    tempToday: number;
    humidityYesterday: number;
    humidityToday: number;
  };
  healthTriggers: {
    headacheRisk: 'low' | 'moderate' | 'elevated';
    headacheNote: string;
    pollenLevel: 'low' | 'moderate' | 'high';
    pollenTypes: string[];
    drySkinRisk: boolean;
    drySkinNote: string;
  };
  hourly: HourlyDataPoint[];
  weekly: DayForecast[];
  weekMinTemp: number;
  weekMaxTemp: number;
}

export interface SavedPlaceSummary {
  id: string;
  name: string;
  customLabel: string;
  temp: number;
  conditionIcon: string;
  conditionText: string;
  skyState: SkyState;
  sunHoursLeft: number;
  isActive: boolean;
}

export interface TravelChecklistCategory {
  title: string;
  icon: string;
  items: Array<{
    id: string;
    name: string;
    reason: string;
    checked: boolean;
  }>;
}

