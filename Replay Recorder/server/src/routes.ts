import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import LZString from 'lz-string';
import {
  getAllReplays,
  getReplayById,
  saveReplay,
  updateReplayVerification,
  deleteReplay
} from './db.js';
import { verifyReplay, computeReplayChecksum } from './verifier.js';
import { ReplayMetadata, ReplayPayload } from './types.js';

interface UploadReplayBody {
  metadata: ReplayMetadata;
  compressedPayload?: string;
  payload?: ReplayPayload;
}

export async function replayRoutes(fastify: FastifyInstance) {
  // GET /api/health
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // GET /api/replays - list all replays
  fastify.get('/replays', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const replays = getAllReplays();
      return replays;
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to fetch replays', details: err.message });
    }
  });

  // GET /api/replays/:id - get single replay with full payload
  fastify.get('/replays/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const replay = getReplayById(id);
      if (!replay) {
        return reply.status(404).send({ error: 'Replay not found' });
      }
      return replay;
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to fetch replay', details: err.message });
    }
  });

  // POST /api/replays - upload compressed replay manifest and metadata
  fastify.post('/replays', async (request: FastifyRequest<{ Body: UploadReplayBody }>, reply: FastifyReply) => {
    try {
      const { metadata, compressedPayload, payload } = request.body;

      if (!metadata || (!compressedPayload && !payload)) {
        return reply.status(400).send({ error: 'Missing metadata or replay payload' });
      }

      let decompressedPayload: ReplayPayload;
      let finalCompressed = compressedPayload || '';

      if (payload) {
        decompressedPayload = payload;
        if (!finalCompressed) {
          finalCompressed = LZString.compressToUTF16(JSON.stringify(payload));
        }
      } else {
        const jsonStr = LZString.decompressFromUTF16(compressedPayload!) || LZString.decompress(compressedPayload!) || compressedPayload!;
        decompressedPayload = JSON.parse(jsonStr);
      }

      // Compute or verify SHA-256 hash
      const computedHash = computeReplayChecksum(decompressedPayload);
      if (!metadata.checksum) {
        metadata.checksum = computedHash;
      }

      // Execute headless verifier
      const verificationReport = verifyReplay(metadata, decompressedPayload);

      // Save to SQLite
      saveReplay(metadata, finalCompressed, verificationReport);

      return reply.status(201).send({
        success: true,
        replayId: metadata.replayId,
        metadata,
        verification: verificationReport
      });
    } catch (err: any) {
      request.log.error(err);
      reply.status(500).send({ error: 'Failed to store replay', details: err.message });
    }
  });

  // POST /api/replays/:id/verify - deterministic headless verification
  fastify.post('/replays/:id/verify', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const replay = getReplayById(id);
      if (!replay) {
        return reply.status(404).send({ error: 'Replay not found' });
      }

      const report = verifyReplay(replay.metadata, replay.payload);
      updateReplayVerification(id, report);

      return {
        replayId: id,
        report
      };
    } catch (err: any) {
      reply.status(500).send({ error: 'Verification failed', details: err.message });
    }
  });

  // POST /api/replays/verify-raw - headless verification on arbitrary payload
  fastify.post('/replays/verify-raw', async (request: FastifyRequest<{ Body: { metadata: ReplayMetadata; payload: ReplayPayload } }>, reply: FastifyReply) => {
    try {
      const { metadata, payload } = request.body;
      if (!metadata || !payload) {
        return reply.status(400).send({ error: 'Invalid input for raw verification' });
      }

      const report = verifyReplay(metadata, payload);
      return { report };
    } catch (err: any) {
      reply.status(500).send({ error: 'Verification failed', details: err.message });
    }
  });

  // DELETE /api/replays/:id
  fastify.delete('/replays/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      deleteReplay(id);
      return { success: true, deletedId: id };
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to delete replay', details: err.message });
    }
  });

  // GET /api/replays/:id/export-video
  fastify.get('/replays/:id/export-video', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const replay = getReplayById(id);
    if (!replay) {
      return reply.status(404).send({ error: 'Replay not found' });
    }

    return {
      replayId: id,
      title: replay.metadata.gameTitle,
      exportMethod: 'client-side-canvas-webm',
      totalTicks: replay.metadata.totalTicks,
      fps: replay.metadata.tickRate,
      durationSec: (replay.metadata.durationMs / 1000).toFixed(2),
      instructions: 'Use client-side Canvas MediaRecorder to record WebM streams directly from deterministic tick playback.'
    };
  });
}
