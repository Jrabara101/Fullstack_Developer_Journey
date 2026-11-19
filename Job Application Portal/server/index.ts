import express from 'express';
import cors from 'cors';
import jobsRouter from './routes/jobs.ts';
import resumeRouter from './routes/resume.ts';
import applicationsRouter from './routes/applications.ts';
import draftsRouter from './routes/drafts.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Atelier Job Application Portal & Candidate Experience API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/drafts', draftsRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✓ Atelier Backend Server listening on http://localhost:${PORT}`);
});
