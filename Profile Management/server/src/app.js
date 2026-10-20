import express from 'express';
import cors from 'cors';
import profileRouter from './routes/profile.js';
import mediaRouter from './routes/media.js';
import socialRouter from './routes/social.js';
import exportRouter from './routes/export.js';
import accountRouter from './routes/account.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Generous json body parsing for base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/profile', profileRouter);
app.use('/api/media', mediaRouter);
app.use('/api/media', socialRouter);
app.use('/api/account', exportRouter);
app.use('/api/account', accountRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Profile Identity & Account Atelier API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Profile Identity Backend API running at http://localhost:${PORT}`);
  console.log(`Database store initialized with full persistence & audit log`);
  console.log(`=======================================================`);
});
