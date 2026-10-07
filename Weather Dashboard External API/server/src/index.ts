import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { weatherRouter } from './routes/weather.js';
import { locationsRouter } from './routes/locations.js';
import { commuteRouter } from './routes/commute.js';
import { alertsRouter } from './routes/alerts.js';
import { alertWorker } from './services/alertWorker.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Gateway routes
app.use('/api/weather', weatherRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/commute', commuteRouter);
app.use('/api/alerts', alertsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Atmospheric Weather Intelligence Gateway',
  });
});

const server = app.listen(config.port, () => {
  console.log(`[AETHERIS API] Server running on http://localhost:${config.port}`);
  alertWorker.start();
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  alertWorker.stop();
  server.close();
});
