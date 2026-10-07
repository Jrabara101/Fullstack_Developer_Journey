import { Router, Request, Response } from 'express';
import { alertWorker } from '../services/alertWorker.js';

export const alertsRouter = Router();

alertsRouter.get('/', (req: Request, res: Response) => {
  const alerts = alertWorker.getActiveAlerts();
  res.json(alerts);
});

alertsRouter.post('/trigger-scan', async (req: Request, res: Response) => {
  const alerts = await alertWorker.scanAll();
  res.json({ scanned: true, alerts });
});
