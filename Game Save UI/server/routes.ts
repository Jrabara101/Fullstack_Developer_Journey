import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import { validateAndSanitizeSavePayload, computeSha256 } from './validation.js';

export async function saveRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/api/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // GET /api/saves - List cloud-persisted slots for the active session
  fastify.get('/api/saves', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const rows = db.prepare(`
        SELECT slot_id, slot_index, save_type, title, created_at, updated_at, 
               checksum, is_locked, version, thumbnail_url, summary_json, 
               vector_clock, payload_size_bytes
        FROM cloud_saves
        ORDER BY updated_at DESC
      `).all() as any[];

      const slots = rows.map(row => ({
        slotId: row.slot_id,
        slotIndex: row.slot_index,
        saveType: row.save_type,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        checksum: row.checksum,
        isLocked: Boolean(row.is_locked),
        version: row.version,
        thumbnailUrl: row.thumbnail_url,
        summary: JSON.parse(row.summary_json),
        vectorClock: row.vector_clock,
        sizeBytes: row.payload_size_bytes,
      }));

      return reply.send({ success: true, count: slots.length, slots });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/saves/:slotId - Retrieve full game save payload
  fastify.get('/api/saves/:slotId', async (req: FastifyRequest<{ Params: { slotId: string } }>, reply: FastifyReply) => {
    try {
      const { slotId } = req.params;
      const row = db.prepare(`SELECT * FROM cloud_saves WHERE slot_id = ?`).get(slotId) as any;

      if (!row) {
        return reply.status(404).send({ success: false, error: 'Save slot not found in cloud vault.' });
      }

      const payload = {
        metadata: {
          slotId: row.slot_id,
          slotIndex: row.slot_index,
          saveType: row.save_type,
          title: row.title,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          checksum: row.checksum,
          isLocked: Boolean(row.is_locked),
          version: row.version,
          thumbnailUrl: row.thumbnail_url,
          summary: JSON.parse(row.summary_json),
          vectorClock: row.vector_clock,
        },
        worldState: JSON.parse(row.world_state_json),
        inventory: JSON.parse(row.inventory_json),
        questJournal: JSON.parse(row.quest_journal_json),
      };

      return reply.send({ success: true, save: payload });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/saves/:slotId - Upsert save payload
  fastify.post('/api/saves/:slotId', async (req: FastifyRequest<{ Params: { slotId: string }; Body: any }>, reply: FastifyReply) => {
    try {
      const { slotId } = req.params;
      const rawBody = JSON.stringify(req.body);
      const byteLength = Buffer.byteLength(rawBody, 'utf8');

      // Anti-tamper & validation
      const validation = validateAndSanitizeSavePayload(req.body, byteLength);
      if (!validation.valid) {
        return reply.status(400).send({ success: false, error: validation.error });
      }

      const { metadata, worldState, inventory, questJournal } = req.body;
      const sanitizedSummary = validation.sanitizedSummary;

      // Recompute canonical SHA-256
      const calculatedChecksum = computeSha256({
        worldState: worldState || {},
        inventory: inventory || {},
        questJournal: questJournal || {}
      });

      // Get existing vector clock
      const existing = db.prepare(`SELECT vector_clock, is_locked FROM cloud_saves WHERE slot_id = ?`).get(slotId) as any;
      if (existing && existing.is_locked && !metadata.forceOverwrite && !metadata.isLocked) {
        return reply.status(423).send({ success: false, error: 'Locked Milestone File: Overwrite is prohibited unless unlocked.' });
      }

      const nextVectorClock = (existing ? existing.vector_clock : 0) + 1;
      const updatedAt = new Date().toISOString();
      const createdAt = existing ? metadata.createdAt || updatedAt : updatedAt;

      const stmt = db.prepare(`
        INSERT INTO cloud_saves (
          slot_id, slot_index, save_type, title, created_at, updated_at,
          checksum, is_locked, version, thumbnail_url, summary_json,
          world_state_json, inventory_json, quest_journal_json,
          vector_clock, payload_size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slot_id) DO UPDATE SET
          slot_index = excluded.slot_index,
          save_type = excluded.save_type,
          title = excluded.title,
          updated_at = excluded.updated_at,
          checksum = excluded.checksum,
          is_locked = excluded.is_locked,
          version = excluded.version,
          thumbnail_url = excluded.thumbnail_url,
          summary_json = excluded.summary_json,
          world_state_json = excluded.world_state_json,
          inventory_json = excluded.inventory_json,
          quest_journal_json = excluded.quest_journal_json,
          vector_clock = excluded.vector_clock,
          payload_size_bytes = excluded.payload_size_bytes
      `);

      stmt.run(
        slotId,
        metadata.slotIndex ?? 0,
        metadata.saveType || 'manual',
        metadata.title || `Checkpoint ${slotId}`,
        createdAt,
        updatedAt,
        calculatedChecksum,
        metadata.isLocked ? 1 : 0,
        metadata.version || '1.0.0',
        metadata.thumbnailUrl || '',
        JSON.stringify(sanitizedSummary),
        JSON.stringify(worldState || {}),
        JSON.stringify(inventory || {}),
        JSON.stringify(questJournal || {}),
        nextVectorClock,
        byteLength
      );

      return reply.send({
        success: true,
        message: 'Save checkpoint securely committed to cloud archive ledger.',
        slotId,
        vectorClock: nextVectorClock,
        updatedAt,
        checksum: calculatedChecksum
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // DELETE /api/saves/:slotId - Remove cloud backup slot
  fastify.delete('/api/saves/:slotId', async (req: FastifyRequest<{ Params: { slotId: string } }>, reply: FastifyReply) => {
    try {
      const { slotId } = req.params;
      const existing = db.prepare(`SELECT is_locked FROM cloud_saves WHERE slot_id = ?`).get(slotId) as any;

      if (!existing) {
        return reply.status(404).send({ success: false, error: 'Slot not found.' });
      }

      if (existing.is_locked) {
        return reply.status(423).send({ success: false, error: 'Slot is marked as a Protected Milestone. Unlock before purging.' });
      }

      db.prepare(`DELETE FROM cloud_saves WHERE slot_id = ?`).run(slotId);
      return reply.send({ success: true, message: `Slot ${slotId} purged from cloud vault.` });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/saves/sync - Delta sync reconciler & conflict detector
  fastify.post('/api/saves/sync', async (req: FastifyRequest<{ Body: { localSlots: Record<string, any> } }>, reply: FastifyReply) => {
    try {
      const localSlots = req.body?.localSlots || {};
      const cloudRows = db.prepare(`SELECT * FROM cloud_saves`).all() as any[];

      const conflicts: any[] = [];
      const needsUpload: string[] = [];
      const needsDownload: any[] = [];
      const inSync: string[] = [];

      const cloudMap = new Map<string, any>();
      for (const row of cloudRows) {
        cloudMap.set(row.slot_id, row);
      }

      // Compare local against cloud
      for (const [slotId, localMeta] of Object.entries(localSlots)) {
        const cloudSlot = cloudMap.get(slotId);

        if (!cloudSlot) {
          // Local exists, cloud doesn't -> client needs to push
          needsUpload.push(slotId);
          continue;
        }

        const localTime = new Date(localMeta.updatedAt).getTime();
        const cloudTime = new Date(cloudSlot.updated_at).getTime();
        const localChecksum = localMeta.checksum;
        const cloudChecksum = cloudSlot.checksum;

        if (localChecksum === cloudChecksum) {
          inSync.push(slotId);
          continue;
        }

        // Check if conflict or clean advance
        const localClock = localMeta.vectorClock || 0;
        const cloudClock = cloudSlot.vector_clock || 1;

        if (localClock === cloudClock && Math.abs(localTime - cloudTime) > 1000) {
          // Divergent branching detected!
          const fullCloudSave = {
            metadata: {
              slotId: cloudSlot.slot_id,
              slotIndex: cloudSlot.slot_index,
              saveType: cloudSlot.save_type,
              title: cloudSlot.title,
              createdAt: cloudSlot.created_at,
              updatedAt: cloudSlot.updated_at,
              checksum: cloudSlot.checksum,
              isLocked: Boolean(cloudSlot.is_locked),
              version: cloudSlot.version,
              thumbnailUrl: cloudSlot.thumbnail_url,
              summary: JSON.parse(cloudSlot.summary_json),
              vectorClock: cloudSlot.vector_clock,
            },
            worldState: JSON.parse(cloudSlot.world_state_json),
            inventory: JSON.parse(cloudSlot.inventory_json),
            questJournal: JSON.parse(cloudSlot.quest_journal_json),
          };

          conflicts.push({
            slotId,
            reason: 'Vector Clock Divergence: Local and remote timelines diverged with different states.',
            cloudSave: fullCloudSave,
            localSave: localMeta
          });
        } else if (localTime > cloudTime) {
          needsUpload.push(slotId);
        } else {
          needsDownload.push({
            slotId,
            updatedAt: cloudSlot.updated_at,
            checksum: cloudSlot.checksum
          });
        }
      }

      // Find cloud saves missing locally
      for (const [slotId, cloudSlot] of cloudMap.entries()) {
        if (!localSlots[slotId]) {
          needsDownload.push({
            slotId,
            updatedAt: cloudSlot.updated_at,
            checksum: cloudSlot.checksum
          });
        }
      }

      return reply.send({
        success: true,
        hasConflicts: conflicts.length > 0,
        conflicts,
        actions: {
          needsUpload,
          needsDownload,
          inSync
        }
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
