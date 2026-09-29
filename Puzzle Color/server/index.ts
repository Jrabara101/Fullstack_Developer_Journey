import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { recomputeActionLog, calculateDeltaE2000 } from './colorimetry';
import { db } from './db';
import { getDailyPuzzle, CURATED_PUZZLES } from './puzzles';
import { duelRelay } from './duelRelay';

const fastify = Fastify({
  logger: true,
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

async function main() {
  // Register CORS
  await fastify.register(cors, {
    origin: true,
  });

  // Catch-all 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: 'Route not found', path: request.url });
  });

  // Register WebSockets
  await fastify.register(websocket);

  // Health check
  fastify.get('/api/health', async () => {
    return { status: 'ok', service: 'ChromaLab Spectrophotometry Engine', timestamp: Date.now() };
  });

  // Daily Puzzle Endpoint
  fastify.get('/api/puzzles/daily', async (request) => {
    const query = request.query as { date?: string };
    const today = new Date().toISOString().split('T')[0];
    const dateStr = query.date || today;
    return getDailyPuzzle(dateStr);
  });

  // Specific Puzzle Endpoint
  fastify.get('/api/puzzles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (id.startsWith('DAILY-')) {
      const dateStr = id.replace('DAILY-', '');
      return getDailyPuzzle(dateStr);
    }
    const puzzle = CURATED_PUZZLES[id];
    if (!puzzle) {
      return reply.status(404).send({ error: 'Puzzle not found' });
    }
    return puzzle;
  });

  // Authoritative Spectrophotometric Verification Endpoint
  fastify.post('/api/puzzles/verify', async (request, reply) => {
    const body = request.body as {
      puzzleId: string;
      playerName?: string;
      timeElapsedMs: number;
      operations: {
        tool: string;
        reagentId: string;
        volumeMl: number;
        timestamp: number;
      }[];
    };

    if (!body || !body.puzzleId || !Array.isArray(body.operations)) {
      return reply.status(400).send({ error: 'Invalid payload: operations and puzzleId required' });
    }

    // Retrieve target puzzle
    let targetColor;
    let toleranceThreshold = 2.0;
    let isSubtractive = true;

    if (body.puzzleId.startsWith('DAILY-')) {
      const dateStr = body.puzzleId.replace('DAILY-', '');
      const puzzle = getDailyPuzzle(dateStr);
      targetColor = puzzle.targetColor;
      toleranceThreshold = puzzle.toleranceThreshold;
      isSubtractive = puzzle.mode === 'SUBTRACTIVE_CMYK';
    } else if (CURATED_PUZZLES[body.puzzleId]) {
      const puzzle = CURATED_PUZZLES[body.puzzleId];
      targetColor = puzzle.targetColor;
      toleranceThreshold = puzzle.toleranceThreshold;
      isSubtractive = puzzle.mode === 'SUBTRACTIVE_CMYK';
    } else {
      // Default fallback
      const puzzle = getDailyPuzzle(new Date().toISOString().split('T')[0]);
      targetColor = puzzle.targetColor;
      toleranceThreshold = puzzle.toleranceThreshold;
    }

    // Replay operations through authoritative Kubelka-Munk or Additive physics
    const { finalColor, totalVolumeMl } = recomputeActionLog(body.operations, isSubtractive);
    const calculatedDeltaE = calculateDeltaE2000(finalColor.lab, targetColor.lab);

    const verified = calculatedDeltaE <= toleranceThreshold;
    const movesUsed = body.operations.filter((op) => op.tool !== 'flush').length;
    const matchPercentage = Math.max(0, Math.min(100, Math.round((1 - calculatedDeltaE / 20) * 1000) / 10));

    let record = null;
    if (verified) {
      // Record to persistent leaderboard
      record = db.addRecord({
        puzzleId: body.puzzleId,
        playerName: body.playerName || 'Alchemist',
        movesUsed,
        volumeUsedMl: totalVolumeMl,
        volumeEfficiency: Math.max(50, Math.round(100 - (totalVolumeMl / 50) * 20)),
        deltaE: calculatedDeltaE,
        timeElapsedMs: body.timeElapsedMs || 30000,
        date: new Date().toISOString().split('T')[0],
        verified: true,
      });
    }

    const shareString = `🧪 ChromaLab [${body.puzzleId}]\n🎯 Precision: ${matchPercentage}% (ΔE ${calculatedDeltaE.toFixed(2)})\n⚖️ Moves: ${movesUsed} • Vol: ${totalVolumeMl.toFixed(1)}ml\n🛡️ Server Certified ✓`;

    return {
      verified,
      puzzleId: body.puzzleId,
      calculatedColor: finalColor,
      targetColor,
      calculatedDeltaE,
      toleranceThreshold,
      matchPercentage,
      movesUsed,
      volumeUsedMl: totalVolumeMl,
      record,
      shareString,
      message: verified
        ? 'Authoritative CIELAB Verification Certified'
        : `Tolerance not achieved. Calculated ΔE ${calculatedDeltaE} exceeds threshold ${toleranceThreshold}`,
    };
  });

  // Leaderboard Endpoint
  fastify.get('/api/leaderboard', async (request) => {
    const query = request.query as { puzzleId?: string; limit?: string };
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    return db.getLeaderboard(query.puzzleId, limit);
  });

  // Duel WebSocket Route
  fastify.get('/ws', { websocket: true }, (connection: any) => {
    const ws = connection.socket || connection;
    duelRelay.handleConnection(ws);
  });

  // Start Fastify server
  const PORT = Number(process.env.PORT) || 3011;
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🧪 ChromaLab Server listening at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
