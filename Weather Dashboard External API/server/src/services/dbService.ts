import fs from 'fs';
import path from 'path';
import { WeatherLocation, CommuteRoute } from '../types.js';

interface DatabaseSchema {
  locations: WeatherLocation[];
  commute_routes: CommuteRoute[];
  weather_cache: Record<string, { payload: any; expires_at: string }>;
}

const DEFAULT_LOCATIONS: WeatherLocation[] = [
  {
    id: 'loc-ny',
    name: 'Lower Manhattan',
    label: 'New York, USA',
    lat: 40.7128,
    lon: -74.006,
    country: 'United States',
    admin1: 'New York',
    timezone: 'America/New_York',
    is_favorite: true,
    custom_label: 'Downtown Office',
  },
  {
    id: 'loc-sf',
    name: 'Mission District',
    label: 'San Francisco, USA',
    lat: 37.7599,
    lon: -122.4148,
    country: 'United States',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
    is_favorite: true,
    custom_label: 'Home',
  },
  {
    id: 'loc-ldn',
    name: 'City of London',
    label: 'London, UK',
    lat: 51.5074,
    lon: -0.1278,
    country: 'United Kingdom',
    admin1: 'England',
    timezone: 'Europe/London',
    is_favorite: true,
    custom_label: 'HQ Europe',
  },
  {
    id: 'loc-tokyo',
    name: 'Shibuya',
    label: 'Tokyo, Japan',
    lat: 35.658,
    lon: 139.7016,
    country: 'Japan',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
    is_favorite: true,
    custom_label: 'Studio',
  },
];

const DEFAULT_COMMUTE_ROUTES: CommuteRoute[] = [
  {
    id: 'route-1',
    name: 'Morning Downtown Commute',
    originName: 'Brooklyn Heights',
    originLat: 40.6958,
    originLon: -73.9936,
    destName: 'Midtown Manhattan',
    destLat: 40.7589,
    destLon: -73.9851,
    departureTime: '08:30',
    alertEnabled: true,
  },
  {
    id: 'route-2',
    name: 'Evening Return Route',
    originName: 'Midtown Manhattan',
    originLat: 40.7589,
    originLon: -73.9851,
    destName: 'Brooklyn Heights',
    destLat: 40.6958,
    destLon: -73.9936,
    departureTime: '17:45',
    alertEnabled: true,
  },
];

class DatabaseService {
  private dataDir = path.resolve(process.cwd(), 'data');
  private dbPath = path.resolve(this.dataDir, 'store.json');
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const content = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Failed to read db file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      locations: DEFAULT_LOCATIONS,
      commute_routes: DEFAULT_COMMUTE_ROUTES,
      weather_cache: {},
    };
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema = this.data) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(this.dbPath, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Locations Operations
  public getLocations(): WeatherLocation[] {
    return this.data.locations;
  }

  public getLocationById(id: string): WeatherLocation | undefined {
    return this.data.locations.find((l) => l.id === id);
  }

  public addLocation(location: WeatherLocation): WeatherLocation {
    const exists = this.data.locations.find(
      (l) => l.id === location.id || (Math.abs(l.lat - location.lat) < 0.05 && Math.abs(l.lon - location.lon) < 0.05)
    );
    if (!exists) {
      this.data.locations.push(location);
      this.persist();
      return location;
    }
    return exists;
  }

  public updateLocation(id: string, updates: Partial<WeatherLocation>): WeatherLocation | null {
    const index = this.data.locations.findIndex((l) => l.id === id);
    if (index === -1) return null;
    this.data.locations[index] = { ...this.data.locations[index], ...updates };
    this.persist();
    return this.data.locations[index];
  }

  public deleteLocation(id: string): boolean {
    const initialLen = this.data.locations.length;
    this.data.locations = this.data.locations.filter((l) => l.id !== id);
    if (this.data.locations.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Commute Routes Operations
  public getCommuteRoutes(): CommuteRoute[] {
    return this.data.commute_routes;
  }

  public addCommuteRoute(route: CommuteRoute): CommuteRoute {
    this.data.commute_routes.push(route);
    this.persist();
    return route;
  }

  public deleteCommuteRoute(id: string): boolean {
    const initialLen = this.data.commute_routes.length;
    this.data.commute_routes = this.data.commute_routes.filter((r) => r.id !== id);
    if (this.data.commute_routes.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Persistent Cache Fallback
  public getPersistentCache(cacheKey: string): any | null {
    const record = this.data.weather_cache[cacheKey];
    if (!record) return null;
    if (new Date(record.expires_at).getTime() < Date.now()) {
      delete this.data.weather_cache[cacheKey];
      return null;
    }
    return record.payload;
  }

  public setPersistentCache(cacheKey: string, payload: any, ttlSeconds: number) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    this.data.weather_cache[cacheKey] = { payload, expires_at: expiresAt };
    this.persist();
  }
}

export const dbService = new DatabaseService();
