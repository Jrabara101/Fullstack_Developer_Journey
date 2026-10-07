import { dbService } from './dbService.js';
import { weatherService } from './weatherService.js';
import { WeatherAlert } from '../types.js';

class AlertWorker {
  private activeAlerts: Map<string, WeatherAlert[]> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;

  public start() {
    // Run initial scan after 10s
    setTimeout(() => this.scanAll(), 10000);
    // Recurring scan every 15 minutes
    this.intervalTimer = setInterval(() => this.scanAll(), 15 * 60 * 1000);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public async scanAll(): Promise<WeatherAlert[]> {
    const locations = dbService.getLocations().filter((l) => l.is_favorite);
    const allAlerts: WeatherAlert[] = [];

    for (const loc of locations) {
      try {
        const weather = await weatherService.getWeather(loc);
        if (weather.alerts && weather.alerts.length > 0) {
          this.activeAlerts.set(loc.id, weather.alerts);
          allAlerts.push(...weather.alerts);
        } else {
          this.activeAlerts.delete(loc.id);
        }
      } catch (err) {
        console.warn(`Alert worker scan error for ${loc.name}:`, err);
      }
    }

    return allAlerts;
  }

  public getActiveAlerts(): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    this.activeAlerts.forEach((list) => alerts.push(...list));
    return alerts;
  }
}

export const alertWorker = new AlertWorker();
