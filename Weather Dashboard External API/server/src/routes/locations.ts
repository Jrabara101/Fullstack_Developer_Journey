import { Router, Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { geocodingService } from '../services/geocodingService.js';
import { WeatherLocation } from '../types.js';

export const locationsRouter = Router();

// GET all saved locations
locationsRouter.get('/', (req: Request, res: Response) => {
  res.json(dbService.getLocations());
});

// Search locations via geocoding
locationsRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }
  const results = await geocodingService.searchLocations(query);
  res.json(results);
});

// Reverse geocode
locationsRouter.get('/reverse', async (req: Request, res: Response) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 0;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : 0;
  const location = await geocodingService.reverseGeocode(lat, lon);
  res.json(location);
});

// POST add location
locationsRouter.post('/', (req: Request, res: Response) => {
  const loc: WeatherLocation = req.body;
  if (!loc || !loc.name || loc.lat === undefined || loc.lon === undefined) {
    return res.status(400).json({ error: 'Invalid location payload' });
  }
  const saved = dbService.addLocation({
    ...loc,
    id: loc.id || `loc-${Date.now()}`,
    is_favorite: true,
  });
  res.status(201).json(saved);
});

// PATCH update location
locationsRouter.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = dbService.updateLocation(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json(updated);
});

// DELETE location
locationsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = dbService.deleteLocation(id);
  res.json({ success });
});
