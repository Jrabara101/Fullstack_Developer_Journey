import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateDailyChallenge, verifyRunSimulation } from './src/server/validator';

// Built-in Vite Dev API plugin for zero-friction local execution
function alchemicalApiPlugin(): Plugin {
  return {
    name: 'alchemical-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/daily-seed') && req.method === 'GET') {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const seedParam = url.searchParams.get('seed') || undefined;
            const data = generateDailyChallenge(seedParam);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            res.statusCode = 500;
            res.end(JSON.stringify({ error: message }));
          }
          return;
        }

        if (req.url.startsWith('/api/verify-run') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = verifyRunSimulation(payload);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              res.statusCode = 500;
              res.end(JSON.stringify({ valid: false, error: message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), alchemicalApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
