import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import type { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { VisibilityService } from './services/visibility.ts';
import { RealtimeHub } from './websocket.ts';
import { type StorageProvider, LocalDiskStorage } from './storage.ts';
import { registerFeedRoutes } from './routes/feedRoutes.ts';
import { registerStoryRoutes } from './routes/storyRoutes.ts';
import { registerProfileRoutes } from './routes/profileRoutes.ts';
import { registerMessengerRoutes } from './routes/messengerRoutes.ts';

const EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
};

export interface BuildServerOptions {
  db: DatabaseSync;
  storage?: StorageProvider;
  uploadsDir?: string;
  logger?: boolean;
}

export async function buildApp(options: BuildServerOptions): Promise<{
  app: FastifyInstance;
  hub: RealtimeHub;
  visibility: VisibilityService;
}> {
  const { db } = options;
  const uploadsDir = options.uploadsDir ?? path.resolve(process.cwd(), 'uploads');
  const storage = options.storage ?? new LocalDiskStorage(uploadsDir);

  const app = Fastify({
    logger: options.logger ?? false,
    bodyLimit: 15 * 1024 * 1024,
  });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  const hub = new RealtimeHub(db);
  const visibility = new VisibilityService(db, hub);

  app.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Media Upload (local disk / S3-compatible hook)
  app.post('/api/media/upload', async (req, reply) => {
    const body = req.body as {
      dataUrl?: string;
      filename?: string;
      mimeType?: string;
    };
    if (!body?.dataUrl) {
      return reply.code(400).send({ error: 'dataUrl is required' });
    }
    const uploaded = await storage.saveBase64Object({
      dataUrlOrBase64: body.dataUrl,
      filename: body.filename,
      mimeType: body.mimeType,
    });
    return reply.code(201).send(uploaded);
  });

  // Safe uploaded asset delivery
  app.get('/uploads/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const safeName = path.basename(filename);
    const fullPath = path.join(uploadsDir, safeName);
    if (!fs.existsSync(fullPath)) {
      return reply.code(404).send({ error: 'File not found' });
    }
    const ext = path.extname(safeName).toLowerCase();
    reply.type(EXT_TO_MIME[ext] || 'application/octet-stream');
    return fs.createReadStream(fullPath);
  });

  // WebSocket Endpoint (presence:global + chat:{conversationId})
  app.get('/ws', { websocket: true }, (socket, req) => {
    const q = req.query as Record<string, string | undefined>;
    const userId = q?.userId?.trim() || 'user-alex';
    hub.register(socket, userId);
  });

  registerFeedRoutes(app, db, visibility, hub);
  registerStoryRoutes(app, db, visibility, hub);
  registerProfileRoutes(app, db, visibility, hub);
  registerMessengerRoutes(app, db, visibility, hub);

  return { app, hub, visibility };
}

