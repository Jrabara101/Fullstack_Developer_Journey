import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { generateDailyArenaData } from './prng.js';
import { verifyCombatTelemetry, VerificationPayload } from './verifier.js';
import { db, insertArenaRun, getLeaderboard, ArenaRunRecord } from './db.js';
import crypto from 'node:crypto';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

await fastify.register(websocket);

// Seed initial champions if database is empty
const initialCount = (db.prepare('SELECT COUNT(*) as count FROM arena_runs').get() as { count: number }).count;
if (initialCount === 0) {
  const daily = generateDailyArenaData();
  const seedChampions: ArenaRunRecord[] = [
    {
      id: 'champ-1',
      callsign: 'Aethelgard_The_Iron',
      seed: daily.seed,
      fighter_class: 'WARRIOR',
      waves_cleared: 5,
      wave_reached: 5,
      clear_time_ms: 194000,
      total_parries: 19,
      posture_breaks: 8,
      damage_dealt: 14200,
      damage_taken: 840,
      score: 19850,
      verified: 1,
      scorecard_emoji: '⚔️ 🛡️ 💀 [VICTORY // 3m 14s // 19 Parries // 19850 Pts]',
      created_at: Date.now() - 3600000 * 2
    },
    {
      id: 'champ-2',
      callsign: 'Kaelen_Frostweaver',
      seed: daily.seed,
      fighter_class: 'BATTLE_MAGE',
      waves_cleared: 5,
      wave_reached: 5,
      clear_time_ms: 228000,
      total_parries: 14,
      posture_breaks: 6,
      damage_dealt: 15800,
      damage_taken: 1120,
      score: 18420,
      verified: 1,
      scorecard_emoji: '⚔️ 🛡️ 💀 [VICTORY // 3m 48s // 14 Parries // 18420 Pts]',
      created_at: Date.now() - 3600000 * 5
    },
    {
      id: 'champ-3',
      callsign: 'Shadow_Vesper',
      seed: daily.seed,
      fighter_class: 'ROGUE',
      waves_cleared: 4,
      wave_reached: 5,
      clear_time_ms: 165000,
      total_parries: 16,
      posture_breaks: 5,
      damage_dealt: 11200,
      damage_taken: 710,
      score: 14890,
      verified: 1,
      scorecard_emoji: '⚔️ 🛡️ 💀 [Wave 4 Cleared // 2m 45s // 16 Parries // 14890 Pts]',
      created_at: Date.now() - 3600000 * 8
    }
  ];

  for (const c of seedChampions) {
    insertArenaRun(c);
  }
}

// 1. Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', server: 'Colosseum Runic Ledger', timestamp: Date.now() };
});

// 2. Daily Seed Director
fastify.get('/api/arena/daily', async (request) => {
  const query = request.query as { seed?: string };
  const dailyData = generateDailyArenaData(query.seed);
  return dailyData;
});

// 3. Combat Telemetry Verification & Run Submission
fastify.post('/api/arena/verify', async (request, reply) => {
  const body = request.body as VerificationPayload;

  if (!body || !body.seed || !body.telemetry) {
    return reply.status(400).send({
      success: false,
      error: 'Missing required payload parameters (seed, telemetry).'
    });
  }

  const result = verifyCombatTelemetry(body);

  if (!result.verified) {
    return reply.status(422).send({
      success: false,
      verified: false,
      reason: result.reason,
      score: 0
    });
  }

  // Insert into SQLite database
  const runId = `run_${crypto.randomUUID().slice(0, 8)}`;
  const record: ArenaRunRecord = {
    id: runId,
    callsign: body.callsign || 'Anonymous_Gladiator',
    seed: body.seed,
    fighter_class: body.fighterClass || 'WARRIOR',
    waves_cleared: body.wavesCleared,
    wave_reached: body.waveReached,
    clear_time_ms: body.durationMs,
    total_parries: body.totalParries,
    posture_breaks: body.postureBreaks,
    damage_dealt: result.stats.totalDamageDealt,
    damage_taken: result.stats.totalDamageTaken,
    score: result.score,
    verified: 1,
    scorecard_emoji: result.scorecardEmoji,
    created_at: Date.now()
  };

  insertArenaRun(record);

  // Determine current rank
  const leaderboard = getLeaderboard(body.seed, 100);
  const rank = leaderboard.findIndex(r => r.id === runId) + 1;

  return {
    success: true,
    verified: true,
    runId,
    rank: rank > 0 ? rank : 1,
    score: result.score,
    scorecardEmoji: result.scorecardEmoji,
    stats: result.stats,
    message: 'Combat telemetry verified and recorded in the Runic Ledger.'
  };
});

// 4. Global Arena Leaderboard
fastify.get('/api/arena/leaderboard', async (request) => {
  const query = request.query as { seed?: string; limit?: string };
  const limit = query.limit ? parseInt(query.limit, 10) : 50;
  const records = getLeaderboard(query.seed, limit);
  return {
    seed: query.seed || 'ALL',
    count: records.length,
    leaderboard: records
  };
});

// 5. WebSocket Spectator Relay
const spectatorRooms = new Map<string, Set<any>>();

fastify.get('/ws/spectate', { websocket: true }, (socket, req) => {
  let currentRoom: string | null = null;

  socket.on('message', (message: Buffer | string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'JOIN_ROOM') {
        const roomId = data.roomId || 'global_arena';
        currentRoom = roomId;
        if (!spectatorRooms.has(roomId)) {
          spectatorRooms.set(roomId, new Set());
        }
        spectatorRooms.get(roomId)!.add(socket);
        socket.send(JSON.stringify({ type: 'ROOM_JOINED', roomId, spectators: spectatorRooms.get(roomId)!.size }));
      } else if (data.type === 'COMBAT_EVENT' && currentRoom) {
        // Relay to all peers in same room
        const room = spectatorRooms.get(currentRoom);
        if (room) {
          const payload = JSON.stringify(data);
          for (const peer of room) {
            if (peer !== socket && peer.readyState === 1) {
              peer.send(payload);
            }
          }
        }
      }
    } catch (err) {
      // Ignore malformed message
    }
  });

  socket.on('close', () => {
    if (currentRoom && spectatorRooms.has(currentRoom)) {
      spectatorRooms.get(currentRoom)!.delete(socket);
      if (spectatorRooms.get(currentRoom)!.size === 0) {
        spectatorRooms.delete(currentRoom);
      }
    }
  });
});

const PORT = 3001;
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`⚔️ Colosseum Backend listening on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
