import { Router, Request, Response } from 'express';
import { weatherService } from '../services/weatherService.js';
import { geocodingService } from '../services/geocodingService.js';
import { WeatherLocation } from '../types.js';

export const weatherRouter = Router();

weatherRouter.get('/', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 40.7128;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : -74.006;
    let name = (req.query.name as string) || '';

    let location: WeatherLocation;

    if (!name || name.trim().length === 0) {
      location = await geocodingService.reverseGeocode(lat, lon);
    } else {
      location = {
        id: `loc-${lat.toFixed(2)}-${lon.toFixed(2)}`,
        name,
        label: (req.query.label as string) || name,
        lat,
        lon,
        country: (req.query.country as string) || '',
        timezone: (req.query.timezone as string) || 'UTC',
        is_favorite: false,
      };
    }

    const payload = await weatherService.getWeather(location);
    res.json(payload);
  } catch (err: any) {
    console.error('Weather route error:', err);
    res.status(500).json({ error: 'Failed to retrieve atmospheric intelligence', message: err.message });
  }
});
