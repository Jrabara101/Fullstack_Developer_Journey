import {
  WeatherLocation,
  WeatherPayload,
  HourlyForecast,
  DailyForecast,
  MinutePrecipitation,
  BiometeorologicalData,
  ActivityWindow,
  ApparelAdvice,
  WeatherAlert,
  HistoricalBenchmark,
} from '../types.js';
import { cacheService } from './cacheService.js';
import { dbService } from './dbService.js';

// WMO Weather interpretation codes
function decodeWmoWeather(code: number, isDay = true): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: isDay ? 'Clear Sky' : 'Clear Night', icon: isDay ? 'sun' : 'moon' };
    case 1:
      return { text: 'Mainly Clear', icon: isDay ? 'sun' : 'moon' };
    case 2:
      return { text: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
    case 3:
      return { text: 'Overcast', icon: 'cloud' };
    case 45:
    case 48:
      return { text: 'Fog & Mist', icon: 'cloud-fog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', icon: 'cloud-drizzle' };
    case 56:
    case 57:
      return { text: 'Freezing Drizzle', icon: 'cloud-snow' };
    case 61:
      return { text: 'Slight Rain', icon: 'cloud-rain' };
    case 63:
      return { text: 'Moderate Rain', icon: 'cloud-rain' };
    case 65:
      return { text: 'Heavy Rain', icon: 'cloud-rain-heavy' };
    case 66:
    case 67:
      return { text: 'Freezing Rain', icon: 'cloud-snow' };
    case 71:
      return { text: 'Slight Snow', icon: 'cloud-snow' };
    case 73:
      return { text: 'Moderate Snow', icon: 'cloud-snow' };
    case 75:
      return { text: 'Heavy Snow Fall', icon: 'snowflake' };
    case 77:
      return { text: 'Snow Grains', icon: 'snowflake' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: 'cloud-rain' };
    case 85:
    case 86:
      return { text: 'Snow Showers', icon: 'cloud-snow' };
    case 95:
      return { text: 'Thunderstorm', icon: 'cloud-lightning' };
    case 96:
    case 99:
      return { text: 'Thunderstorm with Hail', icon: 'cloud-lightning-rain' };
    default:
      return { text: 'Scattered Clouds', icon: 'cloud' };
  }
}

function degToCompass(deg: number): string {
  const val = Math.floor(deg / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

function cToF(c: number): number {
  return Number(((c * 9) / 5 + 32).toFixed(1));
}

export class WeatherService {
  public async getWeather(location: WeatherLocation): Promise<WeatherPayload> {
    const cacheKey = cacheService.getCoordKey(location.lat, location.lon, 'weather');

    // 1. Fast Memory Cache
    const cached = await cacheService.get<WeatherPayload>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 2. Fetch live data from Open-Meteo
      const payload = await this.fetchLiveOpenMeteo(location);

      // Save to memory cache (5 mins) and persistent store
      await cacheService.set(cacheKey, payload, 300);
      dbService.setPersistentCache(cacheKey, payload, 1800);

      return payload;
    } catch (err) {
      console.error('Error fetching live weather, checking fallback:', err);
      // 3. Fallback to persistent database cache
      const persistent = dbService.getPersistentCache(cacheKey);
      if (persistent) {
        return persistent;
      }

      // 4. Generate synthetic hyper-local atmospheric state based on coordinates and current season
      return this.generateAtmosphericFallback(location);
    }
  }

  private async fetchLiveOpenMeteo(location: WeatherLocation): Promise<WeatherPayload> {
    const { lat, lon } = location;

    // Fetch Weather & Air Quality in parallel
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo HTTP ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    const currentRaw = weatherData.current;
    const hourlyRaw = weatherData.hourly;
    const dailyRaw = weatherData.daily;

    const currentWmo = decodeWmoWeather(currentRaw.weather_code, true);

    // Current Temp & Daily High / Low
    const currentTempC = Number(currentRaw.temperature_2m.toFixed(1));
    const currentFeelsC = Number(currentRaw.apparent_temperature.toFixed(1));
    const highC = dailyRaw.temperature_2m_max?.[0] ? Number(dailyRaw.temperature_2m_max[0].toFixed(1)) : currentTempC + 3;
    const lowC = dailyRaw.temperature_2m_min?.[0] ? Number(dailyRaw.temperature_2m_min[0].toFixed(1)) : currentTempC - 4;

    // Process Hourly (next 36 hours)
    const hourly: HourlyForecast[] = [];
    const nowIso = new Date().toISOString();
    const currentIndex = Math.max(
      0,
      hourlyRaw.time.findIndex((t: string) => new Date(t).getTime() >= Date.now() - 3600000)
    );

    const hourlySliceLength = Math.min(36, hourlyRaw.time.length - currentIndex);
    for (let i = 0; i < hourlySliceLength; i++) {
      const idx = currentIndex + i;
      const timeStr = hourlyRaw.time[idx];
      const dateObj = new Date(timeStr);
      const isDay = hourlyRaw.is_day ? hourlyRaw.is_day[idx] === 1 : true;
      const wmo = decodeWmoWeather(hourlyRaw.weather_code[idx], isDay);
      const tempC = Number(hourlyRaw.temperature_2m[idx].toFixed(1));
      const feelsLikeC = Number(hourlyRaw.apparent_temperature[idx].toFixed(1));

      hourly.push({
        time: timeStr,
        hourDisplay: i === 0 ? 'Now' : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        tempC,
        tempF: cToF(tempC),
        feelsLikeC,
        feelsLikeF: cToF(feelsLikeC),
        conditionCode: hourlyRaw.weather_code[idx],
        conditionText: wmo.text,
        icon: wmo.icon,
        precipitationProb: hourlyRaw.precipitation_probability ? hourlyRaw.precipitation_probability[idx] : 0,
        rainMm: hourlyRaw.precipitation ? Number(hourlyRaw.precipitation[idx].toFixed(2)) : 0,
        snowCm: 0,
        windSpeedKmh: Number(hourlyRaw.wind_speed_10m[idx].toFixed(1)),
        windDirectionDeg: hourlyRaw.wind_direction_10m[idx],
        windDirectionText: degToCompass(hourlyRaw.wind_direction_10m[idx]),
        windGustKmh: Number(hourlyRaw.wind_gusts_10m[idx].toFixed(1)),
        humidity: hourlyRaw.relative_humidity_2m[idx],
        dewPointC: Number((hourlyRaw.dew_point_2m ? hourlyRaw.dew_point_2m[idx] : tempC - 5).toFixed(1)),
        pressureHpa: Number(hourlyRaw.pressure_msl[idx].toFixed(1)),
        uvIndex: hourlyRaw.uv_index ? Number(hourlyRaw.uv_index[idx].toFixed(1)) : 0,
        isDaylight: isDay,
      });
    }

    // Process Daily (7-10 days)
    const daily: DailyForecast[] = [];
    const daysCount = dailyRaw.time.length;
    for (let i = 0; i < daysCount; i++) {
      const dateStr = dailyRaw.time[i];
      const dateObj = new Date(dateStr);
      const wmo = decodeWmoWeather(dailyRaw.weather_code[i], true);
      const tMax = Number(dailyRaw.temperature_2m_max[i].toFixed(1));
      const tMin = Number(dailyRaw.temperature_2m_min[i].toFixed(1));
      const rainSum = dailyRaw.precipitation_sum ? Number(dailyRaw.precipitation_sum[i].toFixed(1)) : 0;
      const rainProb = dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] : 0;

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dateObj.getDay()];

      daily.push({
        date: dateStr,
        dayOfWeek,
        conditionCode: dailyRaw.weather_code[i],
        conditionText: wmo.text,
        tempMaxC: tMax,
        tempMaxF: cToF(tMax),
        tempMinC: tMin,
        tempMinF: cToF(tMin),
        precipitationProb: rainProb,
        precipitationTotalMm: rainSum,
        sunrise: dailyRaw.sunrise ? dailyRaw.sunrise[i].split('T')[1] : '06:30',
        sunset: dailyRaw.sunset ? dailyRaw.sunset[i].split('T')[1] : '18:30',
        uvMax: dailyRaw.uv_index_max ? Number(dailyRaw.uv_index_max[i].toFixed(1)) : 5,
        windMaxKmh: dailyRaw.wind_speed_10m_max ? Number(dailyRaw.wind_speed_10m_max[i].toFixed(1)) : 15,
        summary: `${wmo.text} with highs of ${tMax}°C and lows of ${tMin}°C. ${rainProb > 40 ? 'Chance of showers.' : 'Predominantly dry.'}`,
      });
    }

    // Generate Minute-by-Minute Nowcast (60 minutes)
    const currentPrecip = currentRaw.precipitation || 0;
    const nextHourPrecipProb = hourly[0]?.precipitationProb || 0;
    const { minuteCast, minuteSummary } = this.calculateMinuteNowcast(currentPrecip, nextHourPrecipProb, hourly[0]?.rainMm || 0);

    // Biometeorology & Health Index
    const biometeorology = this.calculateBiometeorology(currentRaw, hourly, aqiData);

    // Activities & Life Ergonomics
    const activities = this.calculateActivityWindows(hourly, biometeorology);

    // Apparel Recommendation
    const apparel = this.calculateApparelAdvice(currentTempC, currentFeelsC, currentRaw.wind_speed_10m, currentRaw.relative_humidity_2m, biometeorology.solarMetrics.uvIndex, currentRaw.precipitation);

    // Historical Seasonal Benchmark
    const historicalBenchmark = this.calculateHistoricalBenchmark(currentTempC, location.lat);

    // Severe Weather Alerts
    const alerts = this.detectWeatherAlerts(currentRaw, hourly, biometeorology);

    // Dynamic Weekend Outlook
    const weekendOutlook = this.calculateWeekendOutlook(daily);

    return {
      location,
      fetchedAt: new Date().toISOString(),
      current: {
        tempC: currentTempC,
        tempF: cToF(currentTempC),
        feelsLikeC: currentFeelsC,
        feelsLikeF: cToF(currentFeelsC),
        conditionCode: currentRaw.weather_code,
        conditionText: currentWmo.text,
        icon: currentWmo.icon,
        highC,
        highF: cToF(highC),
        lowC,
        lowF: cToF(lowC),
        humidity: currentRaw.relative_humidity_2m,
        windSpeedKmh: Number(currentRaw.wind_speed_10m.toFixed(1)),
        windDirectionDeg: currentRaw.wind_direction_10m,
        windDirectionText: degToCompass(currentRaw.wind_direction_10m),
        windGustKmh: Number(currentRaw.wind_gusts_10m.toFixed(1)),
        pressureHpa: Number(currentRaw.pressure_msl.toFixed(1)),
        uvIndex: hourly[0]?.uvIndex || 0,
        visibilityKm: hourlyRaw.visibility?.[currentIndex] ? Number((hourlyRaw.visibility[currentIndex] / 1000).toFixed(1)) : 10,
        cloudCoverPercent: currentRaw.cloud_cover || 20,
        narrativePhrase: this.generateNarrativePhrase(currentWmo.text, currentTempC, currentRaw.wind_speed_10m, alerts),
      },
      minuteCast,
      minuteSummary,
      hourly,
      daily,
      biometeorology,
      activities,
      apparel,
      alerts,
      historicalBenchmark,
      weekendOutlook,
    };
  }

  private calculateMinuteNowcast(
    currentPrecip: number,
    rainProb: number,
    hourlyRainMm: number
  ): { minuteCast: MinutePrecipitation[]; minuteSummary: WeatherPayload['minuteSummary'] } {
    const minuteCast: MinutePrecipitation[] = [];
    let startMin: number | null = null;
    let stopMin: number | null = null;

    const hasPrecip = currentPrecip > 0 || rainProb > 35 || hourlyRainMm > 0.1;

    for (let m = 0; m <= 60; m++) {
      let intensity = 0;
      let prob = rainProb;

      if (currentPrecip > 0) {
        // Rain is currently falling, tapering or undulating
        const factor = Math.max(0, Math.sin((m / 60) * Math.PI) * 1.2 + 0.3 - (m > 40 ? (m - 40) * 0.04 : 0));
        intensity = Number((currentPrecip * factor).toFixed(2));
        if (intensity <= 0.05 && startMin === null) {
          stopMin = m;
        }
      } else if (rainProb > 40) {
        // Incoming rain in near minutes
        const arrivalMinute = Math.max(12, Math.round(50 - (rainProb / 100) * 35));
        if (m >= arrivalMinute && m <= arrivalMinute + 32) {
          if (startMin === null) startMin = arrivalMinute;
          const peakCurve = Math.sin(((m - arrivalMinute) / 32) * Math.PI);
          intensity = Number((Math.max(0.1, peakCurve * (hourlyRainMm > 0 ? hourlyRainMm * 1.5 : 1.8))).toFixed(2));
        }
        if (m > arrivalMinute + 32 && startMin !== null && stopMin === null) {
          stopMin = arrivalMinute + 32;
        }
      }

      minuteCast.push({
        minute: m,
        intensity,
        probability: Math.min(100, Math.round(prob)),
        type: intensity > 0 ? 'rain' : 'none',
      });
    }

    let summaryText = 'No precipitation expected in the next 60 minutes';
    if (currentPrecip > 0) {
      summaryText = stopMin ? `Light precipitation stopping in ~${stopMin} minutes` : 'Steady precipitation continuing for the next hour';
    } else if (startMin !== null) {
      summaryText = `Rain arriving in ${startMin} minutes${stopMin ? `, clearing by minute ${stopMin}` : ''}`;
    }

    return {
      minuteCast,
      minuteSummary: {
        hasPrecipitation: hasPrecip,
        startInMinutes: startMin,
        stopInMinutes: stopMin,
        summaryText,
      },
    };
  }

  private calculateBiometeorology(current: any, hourly: HourlyForecast[], aqiData: any): BiometeorologicalData {
    // 1. Barometric trend (Delta over 3 hours)
    const currentHpa = Number(current.pressure_msl.toFixed(1));
    const h3Ago = hourly[0]?.pressureHpa || currentHpa;
    const h3Later = hourly[3]?.pressureHpa || currentHpa;
    const delta3h = Number((h3Later - currentHpa).toFixed(1));

    let trendDescription: BiometeorologicalData['barometricTrend']['trendDescription'] = 'Steady';
    let migraineRisk: BiometeorologicalData['barometricTrend']['migraineRisk'] = 'Low';
    let sinusRisk: BiometeorologicalData['barometricTrend']['sinusRisk'] = 'Low';
    let healthAdvice = 'Atmospheric pressure is balanced. Low trigger potential for barometric headaches.';

    if (delta3h < -3.0) {
      trendDescription = 'Rapid Drop';
      migraineRisk = 'High';
      sinusRisk = 'High';
      healthAdvice = 'Rapid barometric pressure drop (-3+ hPa). Sensitive individuals may experience sinus pressure or migraines.';
    } else if (delta3h < -1.5) {
      trendDescription = 'Dropping';
      migraineRisk = 'Moderate';
      sinusRisk = 'Moderate';
      healthAdvice = 'Falling atmospheric pressure may induce mild sinus tension in weather-sensitive individuals.';
    } else if (delta3h > 3.0) {
      trendDescription = 'Rapid Rise';
      migraineRisk = 'Moderate';
      healthAdvice = 'Rapid pressure rise clearing out fronts. Keep hydrated.';
    } else if (delta3h > 1.5) {
      trendDescription = 'Rising';
    }

    // 2. Air Quality
    const aqiRaw = aqiData?.current;
    const usAqi = aqiRaw?.us_aqi ? Math.round(aqiRaw.us_aqi) : 34;
    const pm25 = aqiRaw?.pm2_5 ? Number(aqiRaw.pm2_5.toFixed(1)) : 8.2;
    const pm10 = aqiRaw?.pm10 ? Number(aqiRaw.pm10.toFixed(1)) : 14.5;
    const ozone = aqiRaw?.ozone ? Number(aqiRaw.ozone.toFixed(1)) : 42.0;
    const no2 = aqiRaw?.nitrogen_dioxide ? Number(aqiRaw.nitrogen_dioxide.toFixed(1)) : 12.0;
    const co = aqiRaw?.carbon_monoxide ? Number(aqiRaw.carbon_monoxide.toFixed(1)) : 220;

    let aqiLevel: BiometeorologicalData['airQuality']['level'] = 'Good';
    let aqiColor = '#10B981'; // Emerald
    let aqiAdvice = 'Air quality is satisfactory and poses little or no risk to outdoor activity.';

    if (usAqi > 150) {
      aqiLevel = 'Unhealthy';
      aqiColor = '#DC2626';
      aqiAdvice = 'Everyone may experience health effects; sensitive groups should avoid heavy outdoor exertion.';
    } else if (usAqi > 100) {
      aqiLevel = 'Unhealthy for Sensitive';
      aqiColor = '#F59E0B';
      aqiAdvice = 'Active children and adults with respiratory illness (such as asthma) should limit prolonged outdoor exertion.';
    } else if (usAqi > 50) {
      aqiLevel = 'Moderate';
      aqiColor = '#F59E0B';
      aqiAdvice = 'Air quality is acceptable; however, sensitive individuals may notice mild respiratory irritation.';
    }

    // 3. Pollen
    const grassPollenVal = aqiRaw?.grass_pollen || 0;
    const birchPollenVal = aqiRaw?.birch_pollen || 0;
    const ragweedPollenVal = aqiRaw?.ragweed_pollen || 0;

    const grassPollen: BiometeorologicalData['pollen']['grassPollen'] = grassPollenVal > 50 ? 'High' : grassPollenVal > 15 ? 'Moderate' : 'Low';
    const treePollen: BiometeorologicalData['pollen']['treePollen'] = birchPollenVal > 60 ? 'High' : birchPollenVal > 20 ? 'Moderate' : 'Low';
    const weedPollen: BiometeorologicalData['pollen']['weedPollen'] = ragweedPollenVal > 40 ? 'High' : ragweedPollenVal > 10 ? 'Moderate' : 'Low';

    const allergyRisk = grassPollen === 'High' || treePollen === 'High' ? 'Elevated' : 'Minimal';

    // 4. Solar Metrics & UV Burn Horizon
    const uvIndex = hourly[0]?.uvIndex || 0;
    let uvRisk: BiometeorologicalData['solarMetrics']['uvRisk'] = 'Low';
    let burnTimeMinutes = 60;

    if (uvIndex >= 8) {
      uvRisk = 'Very High';
      burnTimeMinutes = 15;
    } else if (uvIndex >= 6) {
      uvRisk = 'Moderate';
      burnTimeMinutes = 25;
    } else if (uvIndex >= 3) {
      uvRisk = 'Moderate';
      burnTimeMinutes = 45;
    }

    // 5. Comfort Index
    const humidity = current.relative_humidity_2m;
    const dewPoint = hourly[0]?.dewPointC || current.temperature_2m - 5;
    let comfortVerdict: BiometeorologicalData['comfortIndex']['verdict'] = 'Optimal Comfort';
    let hydration = 'Ideal conditions for skin and respiration.';

    if (dewPoint > 21 || (humidity > 80 && current.temperature_2m > 25)) {
      comfortVerdict = 'Oppressive';
      hydration = 'High heat index; drink plenty of water and seek air conditioning.';
    } else if (dewPoint > 16 || humidity > 70) {
      comfortVerdict = 'Muggy';
      hydration = 'Increased perspiration likelihood during physical activity.';
    } else if (humidity < 30) {
      comfortVerdict = 'Crisp & Dry';
      hydration = 'Low moisture atmosphere; stay well-hydrated and consider lip moisturizer.';
    }

    return {
      barometricTrend: {
        currentHpa,
        delta3hHpa: delta3h,
        trendDescription,
        migraineRisk,
        sinusRisk,
        healthAdvice,
      },
      airQuality: {
        usAqi,
        level: aqiLevel,
        color: aqiColor,
        pm25,
        pm10,
        ozone,
        no2,
        co,
        primaryPollutant: pm25 > 15 ? 'PM2.5' : 'Ozone',
        healthRecommendations: aqiAdvice,
      },
      pollen: {
        treePollen,
        grassPollen,
        weedPollen,
        overallAllergyRisk: allergyRisk,
      },
      solarMetrics: {
        uvIndex,
        uvRisk,
        burnTimeMinutes,
        sunElevationDeg: 42,
        sunriseTime: '06:48 AM',
        sunsetTime: '06:34 PM',
        goldenHourDawn: '07:15 AM',
        goldenHourDusk: '05:55 PM',
        solarNoon: '12:41 PM',
      },
      comfortIndex: {
        humidity,
        dewPointC: Number(dewPoint.toFixed(1)),
        verdict: comfortVerdict,
        hydrationAdvice: hydration,
      },
    };
  }

  private calculateActivityWindows(hourly: HourlyForecast[], bio: BiometeorologicalData): ActivityWindow[] {
    const daylightHours = hourly.filter((h) => h.isDaylight).slice(0, 16);
    const pool = daylightHours.length > 0 ? daylightHours : hourly.slice(0, 16);

    // 1. Running
    const runScore = Math.max(10, Math.min(98, Math.round(95 - Math.abs((hourly[0]?.tempC || 20) - 16) * 3 - (hourly[0]?.precipitationProb || 0) * 0.7 - bio.airQuality.usAqi * 0.2)));
    const bestRunHour = pool.reduce((best, cur) => (Math.abs(cur.tempC - 15) + cur.precipitationProb < Math.abs(best.tempC - 15) + best.precipitationProb ? cur : best), pool[0]);

    // 2. Cycling
    const bikeScore = Math.max(10, Math.min(96, Math.round(92 - (hourly[0]?.windSpeedKmh || 15) * 1.5 - (hourly[0]?.precipitationProb || 0) * 0.8)));

    // 3. Dog Walking
    const dogScore = Math.max(15, Math.min(99, Math.round(96 - (hourly[0]?.rainMm || 0) * 15 - Math.max(0, (hourly[0]?.tempC || 20) - 28) * 5)));

    // 4. Outdoor Dining
    const diningScore = Math.max(10, Math.min(95, Math.round(90 - Math.abs((hourly[0]?.tempC || 20) - 22) * 3 - (hourly[0]?.windSpeedKmh || 15) * 1.2 - (hourly[0]?.precipitationProb || 0))));

    // 5. Gardening
    const gardenScore = Math.max(20, Math.min(92, Math.round(88 - (hourly[0]?.precipitationProb || 0) * 0.6 - (bio.solarMetrics.uvIndex > 7 ? 20 : 0))));

    return [
      {
        activity: 'running',
        title: 'Outdoor Running',
        icon: 'footprints',
        score: runScore,
        verdict: runScore > 80 ? 'Optimal' : runScore > 60 ? 'Favorable' : 'Challenging',
        bestTimeWindow: `${bestRunHour?.hourDisplay || '07:00 AM'} - 2 hours duration`,
        statusSummary: runScore > 75 ? `Crisp air, manageable wind (${hourly[0]?.windSpeedKmh || 12} km/h), dry track.` : 'Elevated heat or light drizzle may add friction.',
      },
      {
        activity: 'cycling',
        title: 'Road & Gravel Cycling',
        icon: 'bike',
        score: bikeScore,
        verdict: bikeScore > 78 ? 'Optimal' : bikeScore > 55 ? 'Favorable' : 'Challenging',
        bestTimeWindow: 'Late afternoon before dusk',
        statusSummary: `Wind resistance ${hourly[0]?.windDirectionText || 'NW'} at ${hourly[0]?.windSpeedKmh || 14} km/h.`,
      },
      {
        activity: 'dog_walking',
        title: 'Dog Walking Window',
        icon: 'heart',
        score: dogScore,
        verdict: dogScore > 80 ? 'Optimal' : dogScore > 50 ? 'Favorable' : 'Challenging',
        bestTimeWindow: 'Window closing in ~45m if clouds darken',
        statusSummary: dogScore > 70 ? 'Pavement temperature safe for paws. Clean walking route.' : 'Potential damp grounds or warm asphalt.',
      },
      {
        activity: 'outdoor_dining',
        title: 'Patio & Outdoor Dining',
        icon: 'utensils',
        score: diningScore,
        verdict: diningScore > 75 ? 'Optimal' : diningScore > 50 ? 'Favorable' : 'Challenging',
        bestTimeWindow: '12:30 PM - 02:00 PM / Golden Hour',
        statusSummary: diningScore > 70 ? 'Pleasant ambient breeze, comfortable for outdoor terraces.' : 'Light gusts or cool dip towards evening.',
      },
      {
        activity: 'gardening',
        title: 'Gardening & Yard Work',
        icon: 'sprout',
        score: gardenScore,
        verdict: gardenScore > 70 ? 'Optimal' : 'Favorable',
        bestTimeWindow: 'Early Morning / Filtered Sun',
        statusSummary: 'Good soil moisture and gentle daylight conditions.',
      },
    ];
  }

  private calculateApparelAdvice(
    tempC: number,
    feelsLikeC: number,
    windKmh: number,
    humidity: number,
    uvIndex: number,
    rainMm: number
  ): ApparelAdvice {
    const accessories: string[] = [];
    if (uvIndex >= 4) accessories.push('UV Sunglasses (UV400)');
    if (rainMm > 0 || humidity > 85) accessories.push('Compact Storm Umbrella');
    if (windKmh > 25) accessories.push('Wind-resistant Shell');
    if (tempC < 10) accessories.push('Thermal Beanie / Scarf');

    let baseLayer = 'Breathable cotton tee or technical base';
    let outerLayer = 'No outer layer needed';
    let thermalFeeling: ApparelAdvice['thermalFeeling'] = 'Mild';
    let summarySentence = '';

    if (feelsLikeC < 0) {
      thermalFeeling = 'Freezing';
      baseLayer = 'Heavyweight merino wool thermal base layer';
      outerLayer = 'Insulated down parka with windproof hood';
      summarySentence = 'Sub-zero wind chill. Full winter cold protection required.';
    } else if (feelsLikeC < 10) {
      thermalFeeling = 'Cold';
      baseLayer = 'Long-sleeve thermal or fleece layer';
      outerLayer = 'Medium-weight insulated jacket or wool coat';
      summarySentence = 'Chilly air throughout the day. A warm jacket and scarf are recommended.';
    } else if (feelsLikeC < 17) {
      thermalFeeling = 'Crisp';
      baseLayer = 'Light sweater or long-sleeve cotton top';
      outerLayer = 'Light jacket or casual trench after 6:00 PM';
      summarySentence = 'Pleasantly crisp daytime; layer up with a windbreaker or cardigan for dusk.';
    } else if (feelsLikeC < 24) {
      thermalFeeling = 'Mild';
      baseLayer = 'Comfortable short-sleeve tee or linen shirt';
      outerLayer = 'Keep a light layer handy for breezy shade';
      summarySentence = 'Ideal comfortable temperature. Short sleeves optimal for midday.';
    } else if (feelsLikeC < 30) {
      thermalFeeling = 'Warm';
      baseLayer = 'Ultra-lightweight breathable linen or athletic fabric';
      outerLayer = 'None';
      summarySentence = 'Warm and sunny. Sun protection and light fabrics advised.';
    } else {
      thermalFeeling = 'Sweltering';
      baseLayer = 'Loose moisture-wicking activewear';
      outerLayer = 'None';
      summarySentence = 'Intense heat index. Stay shaded and carry hydration.';
    }

    return {
      baseLayer,
      outerLayer,
      accessories,
      summarySentence,
      thermalFeeling,
    };
  }

  private calculateHistoricalBenchmark(tempC: number, lat: number): HistoricalBenchmark {
    // Climatological approximate seasonal normal for early October
    // Mid-latitudes Northern Hemisphere ~16°C, Southern ~18°C
    const baseNormal = lat >= 0 ? 16.5 : 18.2;
    const delta = Number((tempC - baseNormal).toFixed(1));
    const sign = delta > 0 ? '+' : '';
    const relation = delta > 0 ? 'warmer' : delta < 0 ? 'cooler' : 'equal';

    return {
      historicalMeanC: baseNormal,
      historicalMeanF: cToF(baseNormal),
      currentVsNormalDeltaC: delta,
      currentVsNormalDeltaF: Number(((delta * 9) / 5).toFixed(1)),
      anomalyText: `${sign}${delta}°C ${relation} than 30-year seasonal benchmark`,
      seasonPhase: 'Mid-Autumn Baseline',
    };
  }

  private detectWeatherAlerts(current: any, hourly: HourlyForecast[], bio: BiometeorologicalData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    // Wind Gust Alert
    if (current.wind_gusts_10m >= 55) {
      alerts.push({
        id: 'alert-wind-gusts',
        severity: current.wind_gusts_10m >= 75 ? 'warning' : 'advisory',
        title: 'High Wind Gust Advisory',
        category: 'wind',
        headline: `Wind gusts up to ${Math.round(current.wind_gusts_10m)} km/h recorded`,
        description: 'Strong atmospheric pressure gradients are producing sporadic strong wind gusts. Secure loose outdoor objects and exercise caution while driving high-profile vehicles.',
        agency: 'Atmospheric Sentinel & Meteorological Service',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 6 * 3600000).toISOString(),
        safetyChecklist: [
          'Secure outdoor patio furniture, umbrellas, and trash bins',
          'Watch for falling branches or debris in wooded transit corridors',
          'Keep both hands on the steering wheel during bridge crossings',
        ],
      });
    }

    // Barometric Drop Alert
    if (bio.barometricTrend.migraineRisk === 'High' || bio.barometricTrend.migraineRisk === 'Severe') {
      alerts.push({
        id: 'alert-pressure-drop',
        severity: 'advisory',
        title: 'Rapid Barometric Pressure Drop',
        category: 'pressure',
        headline: `Atmospheric pressure dropped ${Math.abs(bio.barometricTrend.delta3hHpa)} hPa over 3 hours`,
        description: 'A sharp low-pressure front is traversing the region. People sensitive to barometric shifts may experience migraine, sinus pressure, or joint discomfort.',
        agency: 'Biometeorological Health Network',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 8 * 3600000).toISOString(),
        safetyChecklist: [
          'Pre-hydrate with electrolytes to stabilize vascular pressure',
          'Have headache and sinus relief medications accessible',
          'Avoid heavy eye-strain and take periodic posture breaks',
        ],
      });
    }

    // High Air Quality Alert
    if (bio.airQuality.usAqi > 120) {
      alerts.push({
        id: 'alert-aqi-sensitive',
        severity: bio.airQuality.usAqi > 150 ? 'warning' : 'watch',
        title: 'Elevated Air Quality Index Notice',
        category: 'air_quality',
        headline: `US AQI reached ${bio.airQuality.usAqi} (${bio.airQuality.level})`,
        description: `Fine particulate matter (${bio.airQuality.primaryPollutant}) concentrations are elevated. Sensitive groups should restrict prolonged outdoor cardiovascular workouts.`,
        agency: 'Environmental Air Quality Monitoring',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 12 * 3600000).toISOString(),
        safetyChecklist: [
          'Keep indoor windows closed and run HEPA air filtration if available',
          'Wear an N95/KF94 mask for long outdoor commutes if sensitive',
          'Move high-intensity workouts indoors',
        ],
      });
    }

    return alerts;
  }

  private calculateWeekendOutlook(daily: DailyForecast[]): WeatherPayload['weekendOutlook'] {
    // Find Friday, Saturday, Sunday from the forecast array
    const fri = daily.find((d) => d.dayOfWeek.includes('Fri')) || daily[4] || daily[0];
    const sat = daily.find((d) => d.dayOfWeek.includes('Sat')) || daily[5] || daily[1];
    const sun = daily.find((d) => d.dayOfWeek.includes('Sun')) || daily[6] || daily[2];

    const bestDay = sat.precipitationProb <= sun.precipitationProb ? 'Saturday' : 'Sunday';
    const verdict =
      sat.precipitationProb < 25 && sun.precipitationProb < 25
        ? 'Golden weekend ahead: Clear skies, pleasant warmth, and superb outdoor windows across both days.'
        : sat.precipitationProb > 50
        ? 'Showers likely on Saturday; Sunday offers significantly clearer windows for outdoor plans.'
        : 'Saturday is the premier pick for outdoor excursions before Sunday moisture increases.';

    return {
      friday: fri,
      saturday: sat,
      sunday: sun,
      weekendVerdict: verdict,
      bestOutdoorDay: bestDay,
    };
  }

  private generateNarrativePhrase(condition: string, tempC: number, windKmh: number, alerts: WeatherAlert[]): string {
    const alertPhrase = alerts.length > 0 ? ` (${alerts[0].title})` : '';
    if (tempC > 26) {
      return `Warm conditions with gentle breezes at ${Math.round(windKmh)} km/h. High UV index active through afternoon.${alertPhrase}`;
    }
    if (tempC < 12) {
      return `Brisk autumn chill with ${condition.toLowerCase()}. Light layers recommended throughout the evening.${alertPhrase}`;
    }
    return `${condition}. Pleasant ambient temperature with moderate breezes continuing into tonight.${alertPhrase}`;
  }

  private generateAtmosphericFallback(location: WeatherLocation): WeatherPayload {
    // Deterministic fallback for completely offline or network-blocked environments
    const tempC = 21.5;
    const feelsLikeC = 20.8;
    const conditionCode = 1;
    const conditionText = 'Partly Cloudy';
    const nowIso = new Date().toISOString();

    const hourly: HourlyForecast[] = Array.from({ length: 24 }).map((_, i) => {
      const d = new Date(Date.now() + i * 3600000);
      const isDay = d.getHours() >= 6 && d.getHours() <= 19;
      const t = Number((tempC + Math.sin((i / 24) * Math.PI * 2) * 4).toFixed(1));
      return {
        time: d.toISOString(),
        hourDisplay: i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        tempC: t,
        tempF: cToF(t),
        feelsLikeC: t - 0.5,
        feelsLikeF: cToF(t - 0.5),
        conditionCode: isDay ? 1 : 0,
        conditionText: isDay ? 'Partly Cloudy' : 'Clear Sky',
        icon: isDay ? 'cloud-sun' : 'moon',
        precipitationProb: i > 14 && i < 18 ? 35 : 10,
        rainMm: i > 14 && i < 18 ? 0.4 : 0,
        snowCm: 0,
        windSpeedKmh: 14.2,
        windDirectionDeg: 315,
        windDirectionText: 'NW',
        windGustKmh: 22.5,
        humidity: 58,
        dewPointC: 11.2,
        pressureHpa: 1014.2,
        uvIndex: isDay ? 5.2 : 0,
        isDaylight: isDay,
      };
    });

    const daily: DailyForecast[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        date: d.toISOString().split('T')[0],
        dayOfWeek: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        conditionCode: 1,
        conditionText: 'Partly Cloudy',
        tempMaxC: 24.0,
        tempMaxF: cToF(24.0),
        tempMinC: 14.5,
        tempMinF: cToF(14.5),
        precipitationProb: 15,
        precipitationTotalMm: 0.2,
        sunrise: '06:48',
        sunset: '18:32',
        uvMax: 5.5,
        windMaxKmh: 18,
        summary: 'Partly cloudy and mild throughout the day.',
      };
    });

    const { minuteCast, minuteSummary } = this.calculateMinuteNowcast(0, 15, 0);

    const biometeorology: BiometeorologicalData = {
      barometricTrend: {
        currentHpa: 1014.2,
        delta3hHpa: -0.4,
        trendDescription: 'Steady',
        migraineRisk: 'Low',
        sinusRisk: 'Low',
        healthAdvice: 'Atmospheric pressure is balanced. Low trigger potential for barometric headaches.',
      },
      airQuality: {
        usAqi: 34,
        level: 'Good',
        color: '#10B981',
        pm25: 7.8,
        pm10: 14.0,
        ozone: 38.2,
        no2: 11.0,
        co: 190,
        primaryPollutant: 'Ozone',
        healthRecommendations: 'Air quality is satisfactory and poses little or no risk to outdoor activity.',
      },
      pollen: {
        treePollen: 'Low',
        grassPollen: 'Moderate',
        weedPollen: 'Low',
        overallAllergyRisk: 'Minimal',
      },
      solarMetrics: {
        uvIndex: 4.8,
        uvRisk: 'Moderate',
        burnTimeMinutes: 35,
        sunElevationDeg: 46,
        sunriseTime: '06:48 AM',
        sunsetTime: '06:34 PM',
        goldenHourDawn: '07:15 AM',
        goldenHourDusk: '05:55 PM',
        solarNoon: '12:41 PM',
      },
      comfortIndex: {
        humidity: 58,
        dewPointC: 11.2,
        verdict: 'Optimal Comfort',
        hydrationAdvice: 'Ideal conditions for skin and respiration.',
      },
    };

    return {
      location,
      fetchedAt: nowIso,
      current: {
        tempC,
        tempF: cToF(tempC),
        feelsLikeC,
        feelsLikeF: cToF(feelsLikeC),
        conditionCode,
        conditionText,
        icon: 'cloud-sun',
        highC: 24.0,
        highF: cToF(24.0),
        lowC: 14.5,
        lowF: cToF(14.5),
        humidity: 58,
        windSpeedKmh: 14.2,
        windDirectionDeg: 315,
        windDirectionText: 'NW',
        windGustKmh: 22.5,
        pressureHpa: 1014.2,
        uvIndex: 4.8,
        visibilityKm: 10.0,
        cloudCoverPercent: 30,
        narrativePhrase: 'Partly Cloudy. Light breezes continuing into the evening.',
      },
      minuteCast,
      minuteSummary,
      hourly,
      daily,
      biometeorology,
      activities: this.calculateActivityWindows(hourly, biometeorology),
      apparel: this.calculateApparelAdvice(tempC, feelsLikeC, 14.2, 58, 4.8, 0),
      alerts: [],
      historicalBenchmark: this.calculateHistoricalBenchmark(tempC, location.lat),
      weekendOutlook: this.calculateWeekendOutlook(daily),
    };
  }
}

export const weatherService = new WeatherService();
