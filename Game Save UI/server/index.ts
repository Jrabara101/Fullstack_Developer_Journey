import Fastify from 'fastify';
import cors from '@fastify/cors';
import { saveRoutes } from './routes.js';

const fastify = Fastify({
  logger: true,
  bodyLimit: 5 * 1024 * 1024 // 5MB limit
});

await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

await fastify.register(saveRoutes);

const PORT = 3001;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Fastify Vault Engine] Online at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
