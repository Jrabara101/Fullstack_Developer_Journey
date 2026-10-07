import { WeatherLocation } from '../types.js';
import { cacheService } from './cacheService.js';

export class GeocodingService {
  /**
   * Search locations by keyword using Open-Meteo Geocoding API
   */
  public async searchLocations(query: string): Promise<WeatherLocation[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = `geo:search:${query.toLowerCase().trim()}`;
    const cached = await cacheService.get<WeatherLocation[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=8&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Geocoding HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      const locations: WeatherLocation[] = data.results.map((r: any) => ({
        id: `loc-${r.id}`,
        name: r.name,
        label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
        lat: Number(r.latitude.toFixed(4)),
        lon: Number(r.longitude.toFixed(4)),
        country: r.country || '',
        admin1: r.admin1 || '',
        timezone: r.timezone || 'UTC',
        is_favorite: false,
      }));

      // Cache for 24 hours
      await cacheService.set(cacheKey, locations, 86400);
      return locations;
    } catch (err) {
      console.error('Error fetching geocoding results:', err);
      return [];
    }
  }

  /**
   * Reverse geocode latitude/longitude coordinates to neighborhood/city name
   */
  public async reverseGeocode(lat: number, lon: number): Promise<WeatherLocation> {
    const cacheKey = cacheService.getCoordKey(lat, lon, 'geo:reverse');
    const cached = await cacheService.get<WeatherLocation>(cacheKey);
    if (cached) return cached;

    try {
      // BigDataCloud client-side free reverse geocoding API or Open-Meteo elevation/timezone
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const name = data.locality || data.city || data.principalSubdivision || 'Detected Microclimate';
        const location: WeatherLocation = {
          id: `loc-${lat.toFixed(2)}-${lon.toFixed(2)}`,
          name: name,
          label: [name, data.principalSubdivision, data.countryName].filter(Boolean).join(', '),
          lat: Number(lat.toFixed(4)),
          lon: Number(lon.toFixed(4)),
          country: data.countryName || 'Global',
          admin1: data.principalSubdivision || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          is_favorite: false,
        };
        await cacheService.set(cacheKey, location, 86400);
        return location;
      }
    } catch (err) {
      console.warn('Reverse geocode fallback:', err);
    }

    // Default fallback
    return {
      id: `loc-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      name: `Microclimate (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      label: `Coordinates ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      country: '',
      timezone: 'UTC',
      is_favorite: false,
    };
  }
}

export const geocodingService = new GeocodingService();
