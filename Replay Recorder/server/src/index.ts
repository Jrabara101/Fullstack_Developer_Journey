import Fastify from 'fastify';
import cors from '@fastify/cors';
import { replayRoutes } from './routes.js';
import { initializeSeedData } from './db.js';

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register API Routes
await fastify.register(replayRoutes, { prefix: '/api' });

// Seed initial replays if database is newly initialized
initializeSeedData();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`[Replay Recorder Backend] Listening on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
