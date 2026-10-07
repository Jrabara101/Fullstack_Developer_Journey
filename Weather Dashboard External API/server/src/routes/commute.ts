import { Router, Request, Response } from 'express';
import { commuteService } from '../services/commuteService.js';
import { CommuteRoute } from '../types.js';

export const commuteRouter = Router();

// GET all commute routes
commuteRouter.get('/', (req: Request, res: Response) => {
  res.json(commuteService.getSavedRoutes());
});

// POST save commute route
commuteRouter.post('/', (req: Request, res: Response) => {
  const route: CommuteRoute = req.body;
  if (!route.originName || !route.destName) {
    return res.status(400).json({ error: 'Origin and Destination are required' });
  }
  const created = commuteService.saveRoute({
    ...route,
    id: route.id || `route-${Date.now()}`,
    alertEnabled: route.alertEnabled ?? true,
  });
  res.status(201).json(created);
});

// DELETE commute route
commuteRouter.delete('/:id', (req: Request, res: Response) => {
  const success = commuteService.deleteRoute(req.params.id);
  res.json({ success });
});

// POST inspect route weather (Origin vs Destination comparison & friction score)
commuteRouter.post('/inspect', async (req: Request, res: Response) => {
  try {
    const { route, departureTime } = req.body;
    if (!route || route.originLat === undefined || route.destLat === undefined) {
      return res.status(400).json({ error: 'Valid route coordinates are required' });
    }
    const result = await commuteService.inspectRouteWeather(route, departureTime);
    res.json(result);
  } catch (err: any) {
    console.error('Commute inspection error:', err);
    res.status(500).json({ error: 'Failed to inspect route weather', message: err.message });
  }
});
