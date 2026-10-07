import { CommuteRoute, CommuteForecastResult } from '../types.js';
import { weatherService } from './weatherService.js';
import { dbService } from './dbService.js';

export class CommuteService {
  public async inspectRouteWeather(route: CommuteRoute, customTime?: string): Promise<CommuteForecastResult> {
    const departureTime = customTime || route.departureTime;

    // Fetch origin and destination weather
    const [originPayload, destPayload] = await Promise.all([
      weatherService.getWeather({
        id: `origin-${route.id}`,
        name: route.originName,
        lat: route.originLat,
        lon: route.originLon,
        country: '',
        timezone: 'UTC',
        is_favorite: false,
      }),
      weatherService.getWeather({
        id: `dest-${route.id}`,
        name: route.destName,
        lat: route.destLat,
        lon: route.destLon,
        country: '',
        timezone: 'UTC',
        is_favorite: false,
      }),
    ]);

    // Check weather around the departure time in hourly forecast
    const originHourly = originPayload.hourly[0];
    const destHourly = destPayload.hourly[1] || destPayload.hourly[0];

    // Determine road conditions
    const getRoadCondition = (rainProb: number, rainMm: number, tempC: number): 'Dry' | 'Damp' | 'Wet' | 'Hazardous' => {
      if (tempC <= 0 && (rainProb > 30 || rainMm > 0)) return 'Hazardous'; // Ice/black ice
      if (rainMm > 2.0 || rainProb > 70) return 'Wet';
      if (rainMm > 0.1 || rainProb > 35) return 'Damp';
      return 'Dry';
    };

    const originRoad = getRoadCondition(originHourly.precipitationProb, originHourly.rainMm, originHourly.tempC);
    const destRoad = getRoadCondition(destHourly.precipitationProb, destHourly.rainMm, destHourly.tempC);

    // Calculate Friction Score
    let frictionScore: CommuteForecastResult['frictionScore'] = 'Low Impact';
    let recommendedCushion = 0;
    let advisoryText = 'Normal traffic pacing. Standard clear road traction.';

    if (destRoad === 'Hazardous' || originRoad === 'Hazardous' || destHourly.windGustKmh > 60) {
      frictionScore = 'Severe Weather Friction';
      recommendedCushion = 25;
      advisoryText = 'Hazardous road friction (ice risk or intense rainfall). Expect significant delays. Add 25m buffer.';
    } else if (destRoad === 'Wet' || originRoad === 'Wet') {
      frictionScore = 'Moderate Delay Risk';
      recommendedCushion = 12;
      advisoryText = 'Wet pavement expected at destination with reduced visibility. Add 10-15m cushion.';
    } else if (destRoad === 'Damp' || originRoad === 'Damp') {
      frictionScore = 'Low Impact';
      recommendedCushion = 5;
      advisoryText = 'Scattered damp patches. Low overall impact; allow an extra 5 minutes.';
    }

    return {
      route,
      departureTime,
      originWeather: {
        tempC: originHourly.tempC,
        conditionText: originHourly.conditionText,
        rainProb: originHourly.precipitationProb,
        roadCondition: originRoad,
      },
      destWeather: {
        tempC: destHourly.tempC,
        conditionText: destHourly.conditionText,
        rainProb: destHourly.precipitationProb,
        roadCondition: destRoad,
      },
      frictionScore,
      recommendedCushionMinutes: recommendedCushion,
      advisoryText,
    };
  }

  public getSavedRoutes(): CommuteRoute[] {
    return dbService.getCommuteRoutes();
  }

  public saveRoute(route: CommuteRoute): CommuteRoute {
    return dbService.addCommuteRoute(route);
  }

  public deleteRoute(id: string): boolean {
    return dbService.deleteCommuteRoute(id);
  }
}

export const commuteService = new CommuteService();
