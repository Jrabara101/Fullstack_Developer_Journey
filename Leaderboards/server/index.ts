import fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { TournamentEngine } from './tournamentEngine';
import { WsMessage, CaptainReport, MatchStatus } from '../src/types/tournament';

const app = fastify({
  logger: true
});

const engine = new TournamentEngine();

// Register plugins
app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

app.register(websocket);

// Connected WebSocket clients
const connectedSockets = new Set<any>();

function broadcast(type: WsMessage['type'], meta?: any) {
  const payload: WsMessage = {
    type,
    data: engine.getState(),
    meta
  };
  const json = JSON.stringify(payload);

  for (const socket of connectedSockets) {
    if (socket.readyState === 1 /* OPEN */) {
      try {
        socket.send(json);
      } catch (err) {
        app.log.error(err, 'Failed to send WS message');
      }
    }
  }
}

// REST Endpoints
app.get('/api/tournament', async () => {
  return engine.getState();
});

app.get('/api/matches', async () => {
  return engine.getState().bracketNodes;
});

app.get('/api/matches/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const match = engine.getMatch(id);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  return match;
});

app.get('/api/teams', async () => {
  return engine.getState().teams;
});

app.post('/api/matches/:id/score', async (req, reply) => {
  const { id } = req.params as { id: string };
  const body = req.body as { teamSlot: 1 | 2; points?: number };

  try {
    const result = engine.incrementLiveScore(id, body.teamSlot, body.points || 1);
    broadcast('SCORE_UPDATED', { matchId: id, teamSlot: body.teamSlot });
    return result;
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/matches/:id/report', async (req, reply) => {
  const { id } = req.params as { id: string };
  const report = req.body as CaptainReport;

  try {
    const result = engine.submitCaptainReport(id, report);
    if (result.conflict) {
      broadcast('DISPUTE_RAISED', { matchId: id, reason: result.match.disputeReason });
    } else if (result.match.status === 'COMPLETED') {
      broadcast('WINNER_ADVANCED', { matchId: id, winnerId: result.match.winnerId });
    } else {
      broadcast('CAPTAIN_REPORTED', { matchId: id, captainId: report.captainId });
    }
    return result;
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/matches/:id/resolve-dispute', async (req, reply) => {
  const { id } = req.params as { id: string };
  const body = req.body as { winnerId: string; score1: number; score2: number; adminNotes?: string };

  try {
    const result = engine.resolveDispute(id, body.winnerId, body.score1, body.score2, body.adminNotes);
    broadcast('WINNER_ADVANCED', { matchId: id, winnerId: body.winnerId, resolved: true });
    return result;
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/matches/:id/status', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { status } = req.body as { status: MatchStatus };

  try {
    const result = engine.setMatchStatus(id, status);
    broadcast('MATCH_STATUS_CHANGED', { matchId: id, status });
    return result;
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/tournament/simulate-next', async () => {
  const res = engine.simulateNextTick();
  broadcast('TOURNAMENT_UPDATED', { simulationEvent: res.event });
  return res;
});

app.post('/api/tournament/reset', async () => {
  const state = engine.reset();
  broadcast('TOURNAMENT_UPDATED', { action: 'RESET' });
  return state;
});

// WebSocket Handler
app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection /* SocketStream */, req) => {
    const socket = connection.socket;
    connectedSockets.add(socket);
    app.log.info('New WebSocket client connected. Active: ' + connectedSockets.size);

    // Send initial snapshot
    const initMsg: WsMessage = {
      type: 'INIT',
      data: engine.getState()
    };
    socket.send(JSON.stringify(initMsg));

    socket.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.action === 'SCORE_INCREMENT') {
          engine.incrementLiveScore(parsed.matchId, parsed.teamSlot, parsed.points || 1);
          broadcast('SCORE_UPDATED', { matchId: parsed.matchId, teamSlot: parsed.teamSlot });
        } else if (parsed.action === 'CAPTAIN_REPORT') {
          const res = engine.submitCaptainReport(parsed.matchId, parsed.report);
          if (res.conflict) broadcast('DISPUTE_RAISED', { matchId: parsed.matchId });
          else if (res.match.status === 'COMPLETED') broadcast('WINNER_ADVANCED', { matchId: parsed.matchId });
          else broadcast('CAPTAIN_REPORTED', { matchId: parsed.matchId });
        } else if (parsed.action === 'SIMULATE') {
          const res = engine.simulateNextTick();
          broadcast('TOURNAMENT_UPDATED', { simulationEvent: res.event });
        } else if (parsed.action === 'RESET') {
          engine.reset();
          broadcast('TOURNAMENT_UPDATED', { action: 'RESET' });
        }
      } catch (err) {
        app.log.error(err, 'Failed to process WS incoming message');
      }
    });

    socket.on('close', () => {
      connectedSockets.delete(socket);
      app.log.info('WebSocket client disconnected. Active: ' + connectedSockets.size);
    });
  });
});

const start = async () => {
  try {
    const port = 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n======================================================`);
    console.log(`🏆 CYBER-COLOSSEUM TOURNAMENT SERVER READY`);
    console.log(`📡 Fastify HTTP & WebSocket listening on port ${port}`);
    console.log(`⚡ Endpoints: /api/tournament, /api/matches, /ws`);
    console.log(`======================================================\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
