// ----------------------------------------------------
// Standalone Server-Authoritative Validation Microservice
// ----------------------------------------------------

import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateDailyChallenge, verifyRunSimulation } from '../src/server/validator';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

/**
 * GET /api/daily-seed
 * Returns the UTC-based puzzle seed and initial board layout
 */
app.get('/api/daily-seed', (req: Request, res: Response) => {
  try {
    const customSeed = req.query.seed as string | undefined;
    const challengeData = generateDailyChallenge(customSeed);
    res.json(challengeData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to generate daily seed', details: message });
  }
});

/**
 * POST /api/verify-run
 * Accepts timestamped actions array and replays the game deterministically
 */
app.post('/api/verify-run', (req: Request, res: Response) => {
  try {
    const { seed, actions, claimedScore, claimedTier } = req.body;
    if (!seed || !Array.isArray(actions)) {
      res.status(400).json({
        valid: false,
        error: 'Invalid request payload. Expected "seed" and "actions" array.',
      });
      return;
    }

    const verification = verifyRunSimulation({
      seed,
      actions,
      claimedScore,
      claimedTier,
    });

    res.json(verification);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({
      valid: false,
      error: 'Simulation failed',
      details: message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Alchemical Crucible Validator] running on http://localhost:${PORT}`);
});
