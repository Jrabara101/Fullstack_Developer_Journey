import { WeatherData, TravelChecklistCategory } from '../types/weather';

// Pre-configured rich locations with realistic atmospheric datasets
export const LOCATIONS_DB: Record<string, WeatherData> = {
  kyoto: {
    location: {
      id: 'kyoto',
      name: 'Kyoto',
      country: 'Japan',
      region: 'Kansai',
      lat: 35.0116,
      lng: 135.7681,
      stationCode: 'KY-01',
      stationCoords: '35.0116° N, 135.7681° E',
      timezone: 'JST (UTC+9)',
      skyState: 'golden-hour',
      customLabel: 'Home',
      isSaved: true,
      postalCode: '605-0862'
    },
    current: {
      temp: 21,
      feelsLike: 20,
      highTemp: 22,
      lowTemp: 14,
      humidity: 49,
      dewPoint: 11,
      pressure: 1016.4,
      pressureChange6h: -1.2,
      windSpeed: 9,
      windGust: 16,
      windDirection: 'WSW',
      uvIndex: 4,
      aqi: 32,
      visibility: 14,
      cloudCover: 25,
      lowCloudCover: 10,
      localTimeStr: '16:40 JST',
      stationId: '#KY-01',
      summaryPoetic: 'Golden light now, showers after seven.',
      climateContext: '3° above normal for late October',
      alert: {
        type: 'rain',
        title: 'Rain starts ~7 PM',
        desc: 'Temperature drops 6° by 8 PM as autumnal cold front passes.'
      }
    },
    whatToWear: {
      advice: 'Sunglasses for now, umbrella by seven. Bring a light jacket for the walk home, as it feels 4° cooler in the shade.',
      items: [
        { icon: 'checkroom', name: 'Light jacket' },
        { icon: 'umbrella', name: 'Compact umbrella' },
        { icon: 'wb_sunny', name: 'Sunglasses' }
      ]
    },
    optimalWindow: {
      title: 'Best time outside',
      timeRange: 'Now – 5:40 PM',
      tags: ['Dry', 'Golden light', 'Wind 9 km/h'],
      lensSpecificText: {
        all: 'Now – 5:40 PM',
        commute: 'Clear 5:00–6:30 PM · Rain starts ~7 PM for late returns',
        fitness: 'Best run: Now – 5:40 PM · also Sat 9–11 AM',
        home: 'Optimal laundry drying: Now – 4:30 PM before humidity surges'
      }
    },
    skyWatch: {
      goldenHourRange: '4:30 – 5:12 PM',
      minutesLeft: 42,
      sunsetTime: '5:12 PM',
      dawnTime: '6:14 AM',
      quality: 'vivid',
      cloudDetail: 'vivid (low cloud 10%)',
      stargazingQuality: 'poor',
      stargazingReason: 'poor (incoming rain and overcast after 7 PM)',
      sunPositionRatio: 0.88
    },
    stepOutside: {
      headline: 'Noticeably warmer (+4°) and drier',
      tempYesterday: 17,
      tempToday: 21,
      humidityYesterday: 68,
      humidityToday: 49
    },
    healthTriggers: {
      headacheRisk: 'low',
      headacheNote: 'Barometric pressure stable (-1.2 hPa / 6h). Low migraine trigger index.',
      pollenLevel: 'low',
      pollenTypes: ['Cedar: Low', 'Mugwort: Minimal'],
      drySkinRisk: false,
      drySkinNote: 'Comfortable dew point (11°C). Moisture balance is balanced.'
    },
    weekMinTemp: 9,
    weekMaxTemp: 22,
    hourly: [
      {
        timeStr: 'Now',
        hourNum: 16,
        temp: 21,
        feelsLike: 20,
        condition: 'Golden Twilight',
        icon: 'wb_sunny',
        pop: 0,
        rainIntensity: 'none',
        windSpeed: 9,
        windDirection: 'WSW',
        uvIndex: 4,
        dewPoint: 11,
        humidity: 49,
        aqi: 32,
        badge: { type: 'run', icon: 'sprint', label: 'Optimal run' }
      },
      {
        timeStr: '5 PM',
        hourNum: 17,
        temp: 20,
        feelsLike: 19,
        condition: 'Golden Hour',
        icon: 'wb_twilight',
        pop: 5,
        rainIntensity: 'none',
        windSpeed: 10,
        windDirection: 'W',
        uvIndex: 2,
        dewPoint: 11,
        humidity: 52,
        aqi: 30,
        badge: { type: 'run', icon: 'sprint', label: 'Optimal run' }
      },
      {
        timeStr: '5:12 PM',
        hourNum: 17,
        temp: 18,
        feelsLike: 17,
        condition: 'Sunset',
        icon: 'wb_twilight',
        pop: 10,
        rainIntensity: 'none',
        windSpeed: 11,
        windDirection: 'WNW',
        uvIndex: 0,
        dewPoint: 12,
        humidity: 58,
        aqi: 28,
        isMilestone: true,
        milestoneType: 'sunset',
        milestoneTitle: 'Sunset 5:12 PM',
        badge: { type: 'sunset', icon: 'wb_twilight', label: 'Sunset' }
      },
      {
        timeStr: '6 PM',
        hourNum: 18,
        temp: 16,
        feelsLike: 15,
        condition: 'Overcast Cloud',
        icon: 'cloud',
        pop: 25,
        rainIntensity: 'none',
        windSpeed: 13,
        windDirection: 'NW',
        uvIndex: 0,
        dewPoint: 12,
        humidity: 64,
        aqi: 30
      },
      {
        timeStr: '7 PM',
        hourNum: 19,
        temp: 15,
        feelsLike: 14,
        condition: 'Light Showers',
        icon: 'rainy',
        pop: 75,
        rainIntensity: 'light',
        windSpeed: 17,
        windDirection: 'NNW',
        uvIndex: 0,
        dewPoint: 13,
        humidity: 78,
        aqi: 25,
        badge: { type: 'umbrella', icon: 'umbrella', label: 'Umbrella needed' }
      },
      {
        timeStr: '8 PM',
        hourNum: 20,
        temp: 14,
        feelsLike: 12,
        condition: 'Moderate Rain',
        icon: 'water_drop',
        pop: 85,
        rainIntensity: 'moderate',
        windSpeed: 21,
        windDirection: 'N',
        uvIndex: 0,
        dewPoint: 12,
        humidity: 86,
        aqi: 20,
        badge: { type: 'umbrella', icon: 'umbrella', label: 'Heavy drizzle' }
      },
      {
        timeStr: '9 PM',
        hourNum: 21,
        temp: 14,
        feelsLike: 12,
        condition: 'Light Rain',
        icon: 'water_drop',
        pop: 60,
        rainIntensity: 'light',
        windSpeed: 18,
        windDirection: 'N',
        uvIndex: 0,
        dewPoint: 11,
        humidity: 82,
        aqi: 22
      },
      {
        timeStr: '10 PM',
        hourNum: 22,
        temp: 13,
        feelsLike: 11,
        condition: 'Drizzle',
        icon: 'rainy',
        pop: 35,
        rainIntensity: 'drizzle',
        windSpeed: 15,
        windDirection: 'NNE',
        uvIndex: 0,
        dewPoint: 10,
        humidity: 79,
        aqi: 24
      },
      {
        timeStr: '11 PM',
        hourNum: 23,
        temp: 13,
        feelsLike: 11,
        condition: 'Scattered Clouds',
        icon: 'cloud',
        pop: 15,
        rainIntensity: 'none',
        windSpeed: 12,
        windDirection: 'NE',
        uvIndex: 0,
        dewPoint: 9,
        humidity: 75,
        aqi: 22
      },
      {
        timeStr: '12 AM',
        hourNum: 0,
        temp: 13,
        feelsLike: 11,
        condition: 'Clearing Night',
        icon: 'nights_stay',
        pop: 5,
        rainIntensity: 'none',
        windSpeed: 10,
        windDirection: 'ENE',
        uvIndex: 0,
        dewPoint: 8,
        humidity: 72,
        aqi: 20
      },
      {
        timeStr: '2 AM',
        hourNum: 2,
        temp: 12,
        feelsLike: 10,
        condition: 'Starlit Sky',
        icon: 'nights_stay',
        pop: 0,
        rainIntensity: 'none',
        windSpeed: 9,
        windDirection: 'E',
        uvIndex: 0,
        dewPoint: 8,
        humidity: 70,
        aqi: 18
      },
      {
        timeStr: '6:14 AM',
        hourNum: 6,
        temp: 11,
        feelsLike: 9,
        condition: 'Crisp Sunrise',
        icon: 'wb_sunny',
        pop: 0,
        rainIntensity: 'none',
        windSpeed: 7,
        windDirection: 'E',
        uvIndex: 1,
        dewPoint: 7,
        humidity: 74,
        aqi: 20,
        isMilestone: true,
        milestoneType: 'sunrise',
        milestoneTitle: 'Dawn 6:14 AM'
      },
      {
        timeStr: '8 AM',
        hourNum: 8,
        temp: 14,
        feelsLike: 13,
        condition: 'Clear Morning',
        icon: 'wb_sunny',
        pop: 0,
        rainIntensity: 'none',
        windSpeed: 8,
        windDirection: 'NE',
        uvIndex: 2,
        dewPoint: 8,
        humidity: 62,
        aqi: 25,
        badge: { type: 'run', icon: 'sprint', label: 'Crisp run' }
      },
      {
        timeStr: '11 AM',
        hourNum: 11,
        temp: 17,
        feelsLike: 17,
        condition: 'High Sun',
        icon: 'wb_sunny',
        pop: 0,
        rainIntensity: 'none',
        windSpeed: 10,
        windDirection: 'E',
        uvIndex: 5,
        dewPoint: 9,
        humidity: 54,
        aqi: 28
      }
    ],
    weekly: [
      {
        id: 'day-0',
        dayLabel: 'Today',
        subLabel: 'Oct 30',
        fullDate: 'Thursday, Oct 30',
        humanSummary: 'Warm, then evening showers',
        icon: 'rainy',
        pop: 80,
        highTemp: 22,
        lowTemp: 14,
        uvPeak: { window: 'Peak 11 AM–1 PM', index: 4, level: 'Mod 4' },
        aqi: { value: 32, label: 'Comfortable' },
        windChillImpact: 'Feels 2° colder in evening gusts',
        confidenceScore: 94,
        lifestyleTags: [
          { icon: 'wb_twilight', label: 'Vivid sunset' },
          { icon: 'umbrella', label: 'Rain after 7 PM' },
          { icon: 'sprint', label: 'Late afternoon run' }
        ]
      },
      {
        id: 'day-1',
        dayLabel: 'Sat',
        subLabel: 'Tomorrow',
        fullDate: 'Saturday, Oct 31',
        humanSummary: 'Crisp and breezy autumn day',
        icon: 'air',
        pop: 0,
        highTemp: 17,
        lowTemp: 11,
        uvPeak: { window: 'Peak 11 AM–1 PM', index: 4, level: 'Mod 4' },
        aqi: { value: 32, label: 'Comfortable' },
        windChillImpact: 'Feels 2° colder in the gusts',
        confidenceScore: 82,
        lifestyleTags: [
          { icon: 'local_laundry_service', label: 'Good laundry day' },
          { icon: 'hiking', label: 'Great for a hike' },
          { icon: 'bike_scooter', label: 'Dry bike commute' }
        ]
      },
      {
        id: 'day-2',
        dayLabel: 'Sun',
        subLabel: 'Nov 1',
        fullDate: 'Sunday, Nov 1',
        humanSummary: 'Cold start, sunny afternoon',
        icon: 'sunny',
        pop: 0,
        highTemp: 16,
        lowTemp: 9,
        uvPeak: { window: 'Peak 12 PM–2 PM', index: 5, level: 'Moderate' },
        aqi: { value: 24, label: 'Very Clean' },
        windChillImpact: 'Sharp morning chill, calm winds',
        confidenceScore: 88,
        lifestyleTags: [
          { icon: 'park', label: 'Picnic friendly' },
          { icon: 'wb_sunny', label: 'Clear blue skies' },
          { icon: 'camera_alt', label: 'Ideal photography' }
        ]
      },
      {
        id: 'day-3',
        dayLabel: 'Mon',
        subLabel: 'Nov 2',
        fullDate: 'Monday, Nov 2',
        humanSummary: 'Calm, bright, still conditions',
        icon: 'wb_sunny',
        pop: 10,
        highTemp: 18,
        lowTemp: 10,
        uvPeak: { window: 'Peak 11 AM–1 PM', index: 4, level: 'Moderate' },
        aqi: { value: 35, label: 'Moderate' },
        windChillImpact: 'Negligible wind impact',
        confidenceScore: 78,
        lifestyleTags: [
          { icon: 'directions_walk', label: 'Pleasant walk' },
          { icon: 'bike_scooter', label: 'Optimal cycling' }
        ]
      },
      {
        id: 'day-4',
        dayLabel: 'Tue',
        subLabel: 'Nov 3',
        fullDate: 'Tuesday, Nov 3',
        humanSummary: 'Mild under high clouds',
        icon: 'partly_cloudy_day',
        pop: 15,
        highTemp: 19,
        lowTemp: 12,
        uvPeak: { window: 'Peak 11 AM–2 PM', index: 3, level: 'Low' },
        aqi: { value: 40, label: 'Comfortable' },
        windChillImpact: 'Soft southern breeze',
        confidenceScore: 72,
        lifestyleTags: [
          { icon: 'local_cafe', label: 'Patio coffee weather' },
          { icon: 'yard', label: 'Light garden watering' }
        ]
      },
      {
        id: 'day-5',
        dayLabel: 'Wed',
        subLabel: 'Nov 4',
        fullDate: 'Wednesday, Nov 4',
        humanSummary: 'Soft gray drizzle passing',
        icon: 'rainy',
        pop: 40,
        highTemp: 20,
        lowTemp: 13,
        uvPeak: { window: 'Peak 12 PM', index: 2, level: 'Low' },
        aqi: { value: 20, label: 'Clean' },
        windChillImpact: 'Humid, mild air',
        confidenceScore: 65,
        lifestyleTags: [
          { icon: 'umbrella', label: 'Light raincoat' },
          { icon: 'auto_stories', label: 'Indoor reading day' }
        ]
      },
      {
        id: 'day-6',
        dayLabel: 'Thu',
        subLabel: 'Nov 5',
        fullDate: 'Thursday, Nov 5',
        humanSummary: 'Clearing, gentle breeze returning',
        icon: 'air',
        pop: 10,
        highTemp: 19,
        lowTemp: 12,
        uvPeak: { window: 'Peak 11 AM–1 PM', index: 4, level: 'Moderate' },
        aqi: { value: 28, label: 'Comfortable' },
        windChillImpact: 'Brisk refreshing gusts',
        confidenceScore: 68,
        lifestyleTags: [
          { icon: 'directions_run', label: 'Great running tempo' },
          { icon: 'wb_twilight', label: 'Amber sunset' }
        ]
      }
    ]
  },

  osaka: {
    location: {
      id: 'osaka',
      name: "Osaka",
      country: 'Japan',
      region: 'Kansai',
      lat: 34.6937,
      lng: 135.5023,
      stationCode: 'OS-04',
      stationCoords: '34.6937° N, 135.5023° E',
      timezone: 'JST (UTC+9)',
      skyState: 'golden-hour',
      customLabel: "Parents' House",
      isSaved: true,
      postalCode: '540-0002'
    },
    current: {
      temp: 22,
      feelsLike: 21,
      highTemp: 23,
      lowTemp: 15,
      humidity: 48,
      dewPoint: 11,
      pressure: 1017.0,
      pressureChange6h: -0.8,
      windSpeed: 11,
      windGust: 18,
      windDirection: 'SW',
      uvIndex: 4,
      aqi: 38,
      visibility: 16,
      cloudCover: 20,
      lowCloudCover: 8,
      localTimeStr: '16:40 JST',
      stationId: '#OS-04',
      summaryPoetic: 'Warm amber glow, late evening front.',
      climateContext: '4° above seasonal baseline',
      alert: {
        type: 'rain',
        title: 'Showers around 8 PM',
        desc: 'Scattered bay breezes turning cool overnight.'
      }
    },
    whatToWear: {
      advice: 'Comfortable light shirt with a sweater on hand for the bayfront breeze after sunset.',
      items: [
        { icon: 'checkroom', name: 'Cotton sweater' },
        { icon: 'umbrella', name: 'Foldable umbrella' }
      ]
    },
    optimalWindow: {
      title: 'Best time outside',
      timeRange: 'Now – 6:15 PM',
      tags: ['Dry', 'Gentle bay wind', 'Pleasant 22°'],
      lensSpecificText: {
        all: 'Now – 6:15 PM',
        commute: 'Dry commute through 7:30 PM; umbrella for late evening',
        fitness: 'Best evening run: 5:00 – 6:20 PM along Nakanoshima',
        home: 'Air out rooms before humidity rises at 8 PM'
      }
    },
    skyWatch: {
      goldenHourRange: '4:35 – 5:15 PM',
      minutesLeft: 45,
      sunsetTime: '5:15 PM',
      dawnTime: '6:15 AM',
      quality: 'vivid',
      cloudDetail: 'vivid (low cloud 8%)',
      stargazingQuality: 'fair',
      stargazingReason: 'fair (urban light pollution, late cloud buildup)',
      sunPositionRatio: 0.89
    },
    stepOutside: {
      headline: 'Warmer (+3°) and crisp bay air',
      tempYesterday: 19,
      tempToday: 22,
      humidityYesterday: 62,
      humidityToday: 48
    },
    healthTriggers: {
      headacheRisk: 'low',
      headacheNote: 'Steady barometric trend. Low tension risk.',
      pollenLevel: 'low',
      pollenTypes: ['Ragweed: Low'],
      drySkinRisk: false,
      drySkinNote: 'Ideal air moisture level.'
    },
    weekMinTemp: 10,
    weekMaxTemp: 23,
    hourly: [
      { timeStr: 'Now', hourNum: 16, temp: 22, feelsLike: 21, condition: 'Golden Sunlight', icon: 'wb_sunny', pop: 0, rainIntensity: 'none', windSpeed: 11, windDirection: 'SW', uvIndex: 4, dewPoint: 11, humidity: 48, aqi: 38, badge: { type: 'run', icon: 'sprint', label: 'Great run' } },
      { timeStr: '5 PM', hourNum: 17, temp: 21, feelsLike: 20, condition: 'Golden Twilight', icon: 'wb_twilight', pop: 5, rainIntensity: 'none', windSpeed: 12, windDirection: 'WSW', uvIndex: 2, dewPoint: 11, humidity: 52, aqi: 35 },
      { timeStr: '5:15 PM', hourNum: 17, temp: 19, feelsLike: 18, condition: 'Sunset', icon: 'wb_twilight', pop: 10, rainIntensity: 'none', windSpeed: 12, windDirection: 'W', uvIndex: 0, dewPoint: 12, humidity: 56, aqi: 34, isMilestone: true, milestoneType: 'sunset', milestoneTitle: 'Sunset 5:15 PM' },
      { timeStr: '6 PM', hourNum: 18, temp: 18, feelsLike: 17, condition: 'Clear Dusking', icon: 'cloud', pop: 15, rainIntensity: 'none', windSpeed: 13, windDirection: 'WNW', uvIndex: 0, dewPoint: 12, humidity: 60, aqi: 32 },
      { timeStr: '7 PM', hourNum: 19, temp: 17, feelsLike: 16, condition: 'Cloud Building', icon: 'cloud', pop: 35, rainIntensity: 'none', windSpeed: 14, windDirection: 'NW', uvIndex: 0, dewPoint: 13, humidity: 68, aqi: 30 },
      { timeStr: '8 PM', hourNum: 20, temp: 16, feelsLike: 15, condition: 'Light Rain', icon: 'rainy', pop: 70, rainIntensity: 'light', windSpeed: 18, windDirection: 'NNW', uvIndex: 0, dewPoint: 13, humidity: 80, aqi: 25, badge: { type: 'umbrella', icon: 'umbrella', label: 'Rain begins' } },
      { timeStr: '9 PM', hourNum: 21, temp: 15, feelsLike: 13, condition: 'Moderate Rain', icon: 'water_drop', pop: 80, rainIntensity: 'moderate', windSpeed: 20, windDirection: 'N', uvIndex: 0, dewPoint: 12, humidity: 85, aqi: 22 },
      { timeStr: '11 PM', hourNum: 23, temp: 14, feelsLike: 12, condition: 'Drizzle', icon: 'rainy', pop: 40, rainIntensity: 'drizzle', windSpeed: 15, windDirection: 'NNE', uvIndex: 0, dewPoint: 11, humidity: 80, aqi: 24 }
    ],
    weekly: [
      { id: 'os-0', dayLabel: 'Today', subLabel: 'Oct 30', fullDate: 'Thursday, Oct 30', humanSummary: 'Pleasant afternoon, late rain', icon: 'partly_cloudy_day', pop: 70, highTemp: 23, lowTemp: 15, uvPeak: { window: 'Peak 11 AM–1 PM', index: 4, level: 'Mod' }, aqi: { value: 38, label: 'Comfortable' }, windChillImpact: 'Mild breezes', confidenceScore: 92, lifestyleTags: [{ icon: 'wb_sunny', label: 'Bright city afternoon' }] },
      { id: 'os-1', dayLabel: 'Sat', subLabel: 'Tomorrow', fullDate: 'Saturday, Oct 31', humanSummary: 'Breezy, clear autumn sun', icon: 'air', pop: 0, highTemp: 18, lowTemp: 12, uvPeak: { window: 'Peak 11 AM–1 PM', index: 5, level: 'Moderate' }, aqi: { value: 30, label: 'Clean' }, windChillImpact: 'Noticeable bay breeze', confidenceScore: 86, lifestyleTags: [{ icon: 'bike_scooter', label: 'Riverwalk cycling' }] },
      { id: 'os-2', dayLabel: 'Sun', subLabel: 'Nov 1', fullDate: 'Sunday, Nov 1', humanSummary: 'Bright, crisp, great outdoors', icon: 'sunny', pop: 0, highTemp: 17, lowTemp: 10, uvPeak: { window: 'Peak 12 PM', index: 5, level: 'Moderate' }, aqi: { value: 25, label: 'Clean' }, windChillImpact: 'Calm morning chill', confidenceScore: 90, lifestyleTags: [{ icon: 'park', label: 'Castle park stroll' }] }
    ]
  },

  hakuba: {
    location: {
      id: 'hakuba',
      name: 'Hakuba',
      country: 'Japan',
      region: 'Nagano Alps',
      lat: 36.6983,
      lng: 137.8619,
      stationCode: 'HK-99',
      stationCoords: '36.6983° N, 137.8619° E',
      timezone: 'JST (UTC+9)',
      skyState: 'overcast',
      customLabel: 'Weekend Cabin',
      isSaved: true,
      postalCode: '399-9301'
    },
    current: {
      temp: 9,
      feelsLike: 6,
      highTemp: 11,
      lowTemp: 3,
      humidity: 78,
      dewPoint: 5,
      pressure: 1022.1,
      pressureChange6h: +0.4,
      windSpeed: 14,
      windGust: 26,
      windDirection: 'NNE',
      uvIndex: 2,
      aqi: 12,
      visibility: 8,
      cloudCover: 90,
      lowCloudCover: 65,
      localTimeStr: '16:40 JST',
      stationId: '#HK-99',
      summaryPoetic: 'Gray and still, mountain chill deepening.',
      climateContext: '2° below typical late October norm',
      alert: {
        type: 'freeze',
        title: 'Overnight Alpine Frost',
        desc: 'Valley temperatures drop towards 3°C by early morning.'
      }
    },
    whatToWear: {
      advice: 'Heavy wool layer plus an insulated windbreaker. Valley mist dampening humidity to 78%.',
      items: [
        { icon: 'checkroom', name: 'Insulated windbreaker' },
        { icon: 'ac_unit', name: 'Thermal base layer' },
        { icon: 'hiking', name: 'Sturdy boots' }
      ]
    },
    optimalWindow: {
      title: 'Best time outside',
      timeRange: 'Tomorrow 10:00 AM – 1:00 PM',
      tags: ['Alpine crispness', 'Valley mist clearing', 'Cleanest air (AQI 12)'],
      lensSpecificText: {
        all: 'Tomorrow 10:00 AM – 1:00 PM',
        commute: 'Mountain passes damp; fog in low valleys',
        fitness: 'Crisp trail run: 11 AM tomorrow with warm layers',
        home: 'Bring firelogs inside; frost warning tonight'
      }
    },
    skyWatch: {
      goldenHourRange: '4:15 – 4:52 PM',
      minutesLeft: 12,
      sunsetTime: '4:52 PM',
      dawnTime: '6:10 AM',
      quality: 'muted',
      cloudDetail: 'muted (thick alpine overcast 90%)',
      stargazingQuality: 'poor',
      stargazingReason: 'poor (dense valley cloud deck)',
      sunPositionRatio: 0.94
    },
    stepOutside: {
      headline: 'Chilly drop (-3°) with dense valley mist',
      tempYesterday: 12,
      tempToday: 9,
      humidityYesterday: 65,
      humidityToday: 78
    },
    healthTriggers: {
      headacheRisk: 'low',
      headacheNote: 'High barometric stability in the Alps.',
      pollenLevel: 'low',
      pollenTypes: ['None detected'],
      drySkinRisk: true,
      drySkinNote: 'Cold wind speeds accelerate skin dehydration; apply moisturizer.'
    },
    weekMinTemp: 2,
    weekMaxTemp: 13,
    hourly: [
      { timeStr: 'Now', hourNum: 16, temp: 9, feelsLike: 6, condition: 'Dense Overcast', icon: 'cloud', pop: 15, rainIntensity: 'none', windSpeed: 14, windDirection: 'NNE', uvIndex: 1, dewPoint: 5, humidity: 78, aqi: 12 },
      { timeStr: '5 PM', hourNum: 17, temp: 8, feelsLike: 5, condition: 'Valley Dusk', icon: 'cloud', pop: 20, rainIntensity: 'none', windSpeed: 13, windDirection: 'NE', uvIndex: 0, dewPoint: 5, humidity: 82, aqi: 12 },
      { timeStr: '6 PM', hourNum: 18, temp: 7, feelsLike: 4, condition: 'Alpine Dusk', icon: 'cloud', pop: 20, rainIntensity: 'none', windSpeed: 12, windDirection: 'NE', uvIndex: 0, dewPoint: 4, humidity: 85, aqi: 10 },
      { timeStr: '8 PM', hourNum: 20, temp: 6, feelsLike: 3, condition: 'Cold Mist', icon: 'foggy', pop: 15, rainIntensity: 'none', windSpeed: 10, windDirection: 'E', uvIndex: 0, dewPoint: 4, humidity: 90, aqi: 8 },
      { timeStr: '11 PM', hourNum: 23, temp: 4, feelsLike: 1, condition: 'Frost Forming', icon: 'ac_unit', pop: 5, rainIntensity: 'none', windSpeed: 8, windDirection: 'ESE', uvIndex: 0, dewPoint: 3, humidity: 92, aqi: 8, badge: { type: 'alert', icon: 'ac_unit', label: 'Frost watch' } }
    ],
    weekly: [
      { id: 'hk-0', dayLabel: 'Today', subLabel: 'Oct 30', fullDate: 'Thursday, Oct 30', humanSummary: 'Overcast alpine valley chill', icon: 'cloud', pop: 20, highTemp: 11, lowTemp: 3, uvPeak: { window: 'Peak 11 AM', index: 2, level: 'Low' }, aqi: { value: 12, label: 'Pristine' }, windChillImpact: 'Feels 3° colder in gusts', confidenceScore: 85, lifestyleTags: [{ icon: 'fireplace', label: 'Cabin fireplace' }] },
      { id: 'hk-1', dayLabel: 'Sat', subLabel: 'Tomorrow', fullDate: 'Saturday, Oct 31', humanSummary: 'Crisp sun over peaks', icon: 'wb_sunny', pop: 0, highTemp: 13, lowTemp: 2, uvPeak: { window: 'Peak 12 PM', index: 4, level: 'Moderate' }, aqi: { value: 8, label: 'Pristine' }, windChillImpact: 'Brisk mountain breeze', confidenceScore: 92, lifestyleTags: [{ icon: 'hiking', label: 'Alpine trail hike' }] }
    ]
  },

  manila: {
    location: {
      id: 'manila',
      name: 'Manila',
      country: 'Philippines',
      region: 'NCR',
      lat: 14.5995,
      lng: 120.9842,
      stationCode: 'MNL-01',
      stationCoords: '14.5995° N, 120.9842° E',
      timezone: 'PST (UTC+8)',
      skyState: 'clear-noon',
      customLabel: 'Manila',
      isSaved: true
    },
    current: {
      temp: 31,
      feelsLike: 36,
      highTemp: 33,
      lowTemp: 26,
      humidity: 74,
      dewPoint: 25,
      pressure: 1010.2,
      pressureChange6h: -0.5,
      windSpeed: 12,
      windGust: 20,
      windDirection: 'ENE',
      uvIndex: 8,
      aqi: 54,
      visibility: 12,
      cloudCover: 15,
      lowCloudCover: 5,
      localTimeStr: '15:40 PST',
      stationId: '#MNL-01',
      summaryPoetic: 'Tropical heat, radiant high sun.',
      climateContext: 'Classic tropical dry season warmth',
      alert: {
        type: 'front',
        title: 'High UV Advisory',
        desc: 'UV index peaked at 8; broad-spectrum sunscreen advised.'
      }
    },
    whatToWear: {
      advice: 'Breathable linen or athletic mesh, UV-protective shades, and carry a water flask.',
      items: [
        { icon: 'wb_sunny', name: 'Polarized sunglasses' },
        { icon: 'water_bottle', name: 'Hydration bottle' },
        { icon: 'checkroom', name: 'Lightweight linen' }
      ]
    },
    optimalWindow: {
      title: 'Best time outside',
      timeRange: '5:30 PM – 7:30 PM',
      tags: ['Sun setting', 'Cooler bay breeze', 'Comfortable walking'],
      lensSpecificText: {
        all: '5:30 PM – 7:30 PM',
        commute: 'Heavy traffic expected; air conditioned transit recommended',
        fitness: 'Night workout recommended after 6:30 PM',
        home: 'Keep shades drawn during midday sun'
      }
    },
    skyWatch: {
      goldenHourRange: '5:10 – 5:45 PM',
      minutesLeft: 95,
      sunsetTime: '5:45 PM',
      dawnTime: '5:52 AM',
      quality: 'vivid',
      cloudDetail: 'vivid (scattered cumulus 15%)',
      stargazingQuality: 'fair',
      stargazingReason: 'fair (tropical humidity haze)',
      sunPositionRatio: 0.65
    },
    stepOutside: {
      headline: 'Consistently hot (+1°) and humid',
      tempYesterday: 30,
      tempToday: 31,
      humidityYesterday: 72,
      humidityToday: 74
    },
    healthTriggers: {
      headacheRisk: 'low',
      headacheNote: 'Stable equatorial pressure.',
      pollenLevel: 'low',
      pollenTypes: ['Grass: Low'],
      drySkinRisk: false,
      drySkinNote: 'High ambient humidity keeps skin hydrated.'
    },
    weekMinTemp: 25,
    weekMaxTemp: 33,
    hourly: [
      { timeStr: 'Now', hourNum: 15, temp: 31, feelsLike: 36, condition: 'Radiant Sun', icon: 'wb_sunny', pop: 10, rainIntensity: 'none', windSpeed: 12, windDirection: 'ENE', uvIndex: 8, dewPoint: 25, humidity: 74, aqi: 54 },
      { timeStr: '4 PM', hourNum: 16, temp: 31, feelsLike: 35, condition: 'Bright Sky', icon: 'wb_sunny', pop: 10, rainIntensity: 'none', windSpeed: 12, windDirection: 'E', uvIndex: 5, dewPoint: 25, humidity: 75, aqi: 52 },
      { timeStr: '5 PM', hourNum: 17, temp: 29, feelsLike: 33, condition: 'Golden Sunset', icon: 'wb_twilight', pop: 15, rainIntensity: 'none', windSpeed: 11, windDirection: 'E', uvIndex: 2, dewPoint: 24, humidity: 77, aqi: 50 },
      { timeStr: '5:45 PM', hourNum: 17, temp: 28, feelsLike: 31, condition: 'Sunset', icon: 'wb_twilight', pop: 15, rainIntensity: 'none', windSpeed: 10, windDirection: 'ESE', uvIndex: 0, dewPoint: 24, humidity: 80, aqi: 48, isMilestone: true, milestoneType: 'sunset', milestoneTitle: 'Sunset 5:45 PM' }
    ],
    weekly: [
      { id: 'mnl-0', dayLabel: 'Today', subLabel: 'Oct 30', fullDate: 'Thursday, Oct 30', humanSummary: 'Tropical sun, warm bay winds', icon: 'wb_sunny', pop: 15, highTemp: 33, lowTemp: 26, uvPeak: { window: 'Peak 11 AM–2 PM', index: 8, level: 'Very High' }, aqi: { value: 54, label: 'Moderate' }, windChillImpact: 'Warm humid air', confidenceScore: 90, lifestyleTags: [{ icon: 'beach_access', label: 'Sun protection' }] }
    ]
  },

  reykjavik: {
    location: {
      id: 'reykjavik',
      name: 'Reykjavík',
      country: 'Iceland',
      region: 'Capital Region',
      lat: 64.1466,
      lng: -21.9426,
      stationCode: 'AER-9924-REY',
      stationCoords: '64.1466° N, 21.9426° W',
      timezone: 'GMT (UTC+0)',
      skyState: 'night',
      customLabel: 'Observatory',
      isSaved: false
    },
    current: {
      temp: 4,
      feelsLike: -1,
      highTemp: 6,
      lowTemp: 1,
      humidity: 82,
      dewPoint: 1,
      pressure: 998.5,
      pressureChange6h: -3.8,
      windSpeed: 28,
      windGust: 45,
      windDirection: 'ESE',
      uvIndex: 0,
      aqi: 8,
      visibility: 18,
      cloudCover: 30,
      lowCloudCover: 10,
      localTimeStr: '18:42 GMT',
      stationId: '#AER-9924-REY',
      summaryPoetic: 'Sub-polar dusk, crisp aurora potential.',
      climateContext: 'Seasonal Atlantic low passing south',
      alert: {
        type: 'wind',
        title: 'Brisk Atlantic Gales',
        desc: 'Gusts up to 45 km/h along coastal headlands.'
      }
    },
    whatToWear: {
      advice: 'Full wind-blocking hardshell parka, beanie, and thermal gloves. Strong wind chill.',
      items: [
        { icon: 'checkroom', name: 'Down parka' },
        { icon: 'ac_unit', name: 'Wool beanie & gloves' }
      ]
    },
    optimalWindow: {
      title: 'Best time outside',
      timeRange: '11:00 PM – 2:00 AM (Aurora Window)',
      tags: ['Low clouds 10%', 'Kp index 4.2', 'Deep dark night'],
      lensSpecificText: {
        all: '11:00 PM – 2:00 AM (Aurora Window)',
        commute: 'High coastal crosswinds on Route 41',
        fitness: 'Indoor fitness recommended due to 45 km/h gusts',
        home: 'Secure outdoor fixtures against gales'
      }
    },
    skyWatch: {
      goldenHourRange: '4:10 – 5:02 PM',
      minutesLeft: 0,
      sunsetTime: '5:02 PM',
      dawnTime: '8:48 AM',
      quality: 'soft',
      cloudDetail: 'crisp starlight (low cloud 10%)',
      stargazingQuality: 'excellent',
      stargazingReason: 'excellent (Pristine sub-polar darkness with Aurora Borealis activity)',
      sunPositionRatio: 1.0
    },
    stepOutside: {
      headline: 'Much colder (-4°) with stiff gale gusts',
      tempYesterday: 8,
      tempToday: 4,
      humidityYesterday: 74,
      humidityToday: 82
    },
    healthTriggers: {
      headacheRisk: 'elevated',
      headacheNote: 'Rapid barometric pressure drop (-3.8 hPa / 6h). Migraine sensitivity alert.',
      pollenLevel: 'low',
      pollenTypes: ['None detected'],
      drySkinRisk: true,
      drySkinNote: 'Sub-polar wind accelerates evaporative barrier breakdown.'
    },
    weekMinTemp: 0,
    weekMaxTemp: 7,
    hourly: [
      { timeStr: 'Now', hourNum: 18, temp: 4, feelsLike: -1, condition: 'Obsidian Night', icon: 'nights_stay', pop: 10, rainIntensity: 'none', windSpeed: 28, windDirection: 'ESE', uvIndex: 0, dewPoint: 1, humidity: 82, aqi: 8 },
      { timeStr: '8 PM', hourNum: 20, temp: 3, feelsLike: -2, condition: 'Star Clear', icon: 'nights_stay', pop: 5, rainIntensity: 'none', windSpeed: 27, windDirection: 'ESE', uvIndex: 0, dewPoint: 1, humidity: 80, aqi: 8, badge: { type: 'alert', icon: 'auto_awesome', label: 'Aurora watch' } },
      { timeStr: '11 PM', hourNum: 23, temp: 2, feelsLike: -3, condition: 'Aurora Glow', icon: 'auto_awesome', pop: 0, rainIntensity: 'none', windSpeed: 25, windDirection: 'SE', uvIndex: 0, dewPoint: 0, humidity: 79, aqi: 7, badge: { type: 'alert', icon: 'auto_awesome', label: 'Peak Aurora' } }
    ],
    weekly: [
      { id: 'rey-0', dayLabel: 'Today', subLabel: 'Oct 30', fullDate: 'Thursday, Oct 30', humanSummary: 'Chilly gales, clear aurora skies', icon: 'nights_stay', pop: 10, highTemp: 6, lowTemp: 1, uvPeak: { window: 'Peak 1 PM', index: 1, level: 'Low' }, aqi: { value: 8, label: 'Pristine' }, windChillImpact: 'Feels -3° in open gales', confidenceScore: 84, lifestyleTags: [{ icon: 'auto_awesome', label: 'Stargazing / Aurora' }] }
    ]
  }
};

// Search database items: cities, landmarks, postal codes
export interface SearchItem {
  id: string;
  name: string;
  secondary: string;
  type: 'city' | 'landmark' | 'postal';
  targetLocationKey: string;
  highlightToken?: string;
  badge?: string;
  temp?: number;
  conditionIcon?: string;
}

export const SEARCH_INDEX: SearchItem[] = [
  { id: 's-1', name: 'Kyoto', secondary: 'Kansai, Japan', type: 'city', targetLocationKey: 'kyoto', badge: 'City', temp: 21, conditionIcon: 'wb_sunny' },
  { id: 's-2', name: 'Kiyomizu-dera', secondary: 'Higashiyama, Kyoto', type: 'landmark', targetLocationKey: 'kyoto', badge: 'Landmark', temp: 21, conditionIcon: 'wb_sunny' },
  { id: 's-3', name: 'Kiyosu', secondary: 'Aichi, Japan', type: 'city', targetLocationKey: 'kyoto', badge: 'City', temp: 20, conditionIcon: 'partly_cloudy_day' },
  { id: 's-4', name: '605-0862', secondary: 'Higashiyama, Kyoto', type: 'postal', targetLocationKey: 'kyoto', badge: 'Postal code', temp: 21, conditionIcon: 'wb_sunny' },
  { id: 's-5', name: 'Osaka', secondary: 'Kansai, Japan', type: 'city', targetLocationKey: 'osaka', badge: 'City', temp: 22, conditionIcon: 'wb_twilight' },
  { id: 's-6', name: 'Osaka Castle', secondary: 'Chuo, Osaka', type: 'landmark', targetLocationKey: 'osaka', badge: 'Landmark', temp: 22, conditionIcon: 'wb_twilight' },
  { id: 's-7', name: '540-0002', secondary: 'Osaka Chuo, Japan', type: 'postal', targetLocationKey: 'osaka', badge: 'Postal code', temp: 22, conditionIcon: 'wb_twilight' },
  { id: 's-8', name: 'Hakuba', secondary: 'Nagano Alps, Japan', type: 'city', targetLocationKey: 'hakuba', badge: 'City', temp: 9, conditionIcon: 'cloud' },
  { id: 's-9', name: 'Hakuba Valley', secondary: 'Nagano Alps Ski Basin', type: 'landmark', targetLocationKey: 'hakuba', badge: 'Landmark', temp: 8, conditionIcon: 'ac_unit' },
  { id: 's-10', name: '399-9301', secondary: 'Hakuba, Nagano', type: 'postal', targetLocationKey: 'hakuba', badge: 'Postal code', temp: 9, conditionIcon: 'cloud' },
  { id: 's-11', name: 'Manila', secondary: 'NCR, Philippines', type: 'city', targetLocationKey: 'manila', badge: 'City', temp: 31, conditionIcon: 'wb_sunny' },
  { id: 's-12', name: 'Reykjavík', secondary: 'Capital Region, Iceland', type: 'city', targetLocationKey: 'reykjavik', badge: 'Observatory', temp: 4, conditionIcon: 'nights_stay' },
  { id: 's-13', name: 'Fushimi Inari-taisha', secondary: 'Kyoto, Japan', type: 'landmark', targetLocationKey: 'kyoto', badge: 'Landmark', temp: 21, conditionIcon: 'wb_sunny' }
];

// Contextual Quick Compare: "Where is it sunniest right now?"
export interface QuickCompareItem {
  id: string;
  name: string;
  temp: number;
  condition: string;
  sunHoursLeft: number;
  maxSunHours: number;
  skyState: string;
  rank: number;
  isCurrent: boolean;
}

export function getQuickCompareSunniest(currentLocationId: string): QuickCompareItem[] {
  const items: QuickCompareItem[] = [
    { id: 'manila', name: 'Manila', temp: 31, condition: 'sunny', sunHoursLeft: 7.5, maxSunHours: 8, skyState: 'clear-noon', rank: 1, isCurrent: currentLocationId === 'manila' },
    { id: 'osaka', name: 'Osaka', temp: 22, condition: 'golden hour', sunHoursLeft: 6.2, maxSunHours: 8, skyState: 'golden-hour', rank: 2, isCurrent: currentLocationId === 'osaka' },
    { id: 'kyoto', name: 'Kyoto', temp: 21, condition: 'golden hour', sunHoursLeft: 5.8, maxSunHours: 8, skyState: 'golden-hour', rank: 3, isCurrent: currentLocationId === 'kyoto' },
    { id: 'hakuba', name: 'Hakuba', temp: 9, condition: 'overcast', sunHoursLeft: 2.1, maxSunHours: 8, skyState: 'overcast', rank: 4, isCurrent: currentLocationId === 'hakuba' },
    { id: 'reykjavik', name: 'Reykjavík', temp: 4, condition: 'night starlight', sunHoursLeft: 0, maxSunHours: 8, skyState: 'night', rank: 5, isCurrent: currentLocationId === 'reykjavik' }
  ];
  return items;
}

// Generate Travel Packing checklist dynamically based on destination weather & duration
export function generatePackingChecklist(locationKey: string, daysCount: number = 3): TravelChecklistCategory[] {
  const data = LOCATIONS_DB[locationKey] || LOCATIONS_DB.kyoto;
  const isCold = data.current.temp < 14;
  const isRainy = data.weekly.some(d => d.pop > 40);
  const isSunny = data.weekly.some(d => d.uvPeak.index >= 4);

  return [
    {
      title: 'Outerwear & Layering',
      icon: 'checkroom',
      items: [
        {
          id: 'pack-1',
          name: isCold ? 'Down Parka or Heavy Wool Coat' : 'Light Breathable Jacket / Cardigan',
          reason: `Temperature lows around ${data.current.lowTemp}°C in ${data.location.name}.`,
          checked: true
        },
        ...(isRainy ? [{
          id: 'pack-rain-1',
          name: 'Waterproof Rain Shell or Trench',
          reason: 'Showers and rain fronts forecasted during the week.',
          checked: true
        }] : []),
        {
          id: 'pack-layers',
          name: `${daysCount}x Breathable Base Layers`,
          reason: `Comfortable for fluctuating day-to-night temperatures (${data.current.lowTemp}° to ${data.current.highTemp}°C).`,
          checked: false
        }
      ]
    },
    {
      title: 'Accessories & Protection',
      icon: 'umbrella',
      items: [
        ...(isRainy ? [{
          id: 'pack-umbrella',
          name: 'Windproof Compact Umbrella',
          reason: 'Evening rain gusts forecasted (~7–8 PM).',
          checked: true
        }] : []),
        ...(isSunny ? [{
          id: 'pack-sunglasses',
          name: 'UV400 Polarized Sunglasses',
          reason: 'Golden hour glare and UV index peak.',
          checked: true
        }] : []),
        ...(isCold ? [{
          id: 'pack-warmth',
          name: 'Thermal Beanie & Touchscreen Gloves',
          reason: 'Evening temperatures dip below 10°C.',
          checked: false
        }] : [])
      ]
    },
    {
      title: 'Comfort & Footwear',
      icon: 'hiking',
      items: [
        {
          id: 'pack-shoes',
          name: 'Cushioned Walking / Trail Shoes',
          reason: `Comfortable walking weather (Dew point: ${data.current.dewPoint}°C, AQI: ${data.current.aqi}).`,
          checked: false
        },
        {
          id: 'pack-hydration',
          name: 'Insulated Refillable Flask',
          reason: 'Maintain optimal hydration during temperature shifts.',
          checked: false
        }
      ]
    }
  ];
}
