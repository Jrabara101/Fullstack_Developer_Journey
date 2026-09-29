import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './types.js';
import { RoomManager } from './engine/roomManager.js';
import { verifySessionToken } from './session.js';

const PORT = Number(process.env.PORT) || 3005;

async function bootstrap() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(fastify.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const roomManager = new RoomManager(io);

  // REST API Routes
  fastify.get('/health', async () => {
    return { status: 'healthy', timestamp: Date.now() };
  });

  fastify.get('/api/room/:code', async (request, reply) => {
    const { code } = request.params as { code: string };
    const room = roomManager.getRoomByCode(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }
    return {
      roomId: room.id,
      roomCode: room.code,
      phase: room.phase,
      playerCount: room.players.length,
      currentAnte: room.currentAnte
    };
  });

  // Socket.io Connection Gateway
  io.on('connection', (socket) => {
    let currentPlayerId: string | null = null;
    let currentRoomId: string | null = null;

    socket.on('join_room', ({ roomCode, username, avatarUrl, sessionToken }, callback) => {
      // 1. Check for reconnect using sessionToken
      if (sessionToken) {
        const decoded = verifySessionToken(sessionToken);
        if (decoded) {
          const room = roomManager.getRoom(decoded.roomId);
          if (room) {
            const player = room.players.find(p => p.id === decoded.playerId);
            if (player) {
              player.socketId = socket.id;
              player.connected = true;
              currentPlayerId = player.id;
              currentRoomId = room.id;
              socket.join(room.id);

              if (callback) {
                callback({
                  success: true,
                  roomId: room.id,
                  roomCode: room.code,
                  playerId: player.id,
                  token: player.token
                });
              }

              roomManager.broadcastState(room);
              return;
            }
          }
        }
      }

      // 2. Join existing room by code, or create new room
      if (roomCode) {
        const room = roomManager.getRoomByCode(roomCode);
        if (!room) {
          if (callback) callback({ success: false, error: 'Invalid room code' });
          socket.emit('error_message', 'Room not found with code ' + roomCode);
          return;
        }

        if (room.phase !== 'LOBBY') {
          if (callback) callback({ success: false, error: 'Match already in progress' });
          socket.emit('error_message', 'Match already in progress');
          return;
        }

        if (room.players.length >= 6) {
          if (callback) callback({ success: false, error: 'Room is full (max 6 players)' });
          socket.emit('error_message', 'Room is full');
          return;
        }

        const player = roomManager.joinRoom(room, username, avatarUrl);
        player.socketId = socket.id;
        currentPlayerId = player.id;
        currentRoomId = room.id;
        socket.join(room.id);

        if (callback) {
          callback({
            success: true,
            roomId: room.id,
            roomCode: room.code,
            playerId: player.id,
            token: player.token
          });
        }

        roomManager.broadcastState(room);
      } else {
        // Create new room as Host
        const { room, host } = roomManager.createRoom(username, avatarUrl);
        host.socketId = socket.id;
        currentPlayerId = host.id;
        currentRoomId = room.id;
        socket.join(room.id);

        if (callback) {
          callback({
            success: true,
            roomId: room.id,
            roomCode: room.code,
            playerId: host.id,
            token: host.token
          });
        }

        roomManager.broadcastState(room);
      }
    });

    socket.on('start_game', () => {
      if (!currentRoomId || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomId);
      if (!room) return;
      const player = room.players.find(p => p.id === currentPlayerId);
      if (!player || !player.isHost) {
        socket.emit('error_message', 'Only room host can start the match');
        return;
      }
      if (room.players.length < 2) {
        socket.emit('error_message', 'At least 2 players (or add a Bot) required to start');
        return;
      }
      roomManager.startGame(currentRoomId);
    });

    socket.on('play_card', ({ cardId, declaredColor, isBluff, meldCardIds }) => {
      if (!currentRoomId || !currentPlayerId) return;
      const res = roomManager.playCard(currentRoomId, currentPlayerId, cardId, declaredColor, isBluff, meldCardIds);
      if (!res.success && res.error) {
        socket.emit('error_message', res.error);
      }
    });

    socket.on('draw_card', () => {
      if (!currentRoomId || !currentPlayerId) return;
      const res = roomManager.drawCard(currentRoomId, currentPlayerId);
      if (!res.success && res.error) {
        socket.emit('error_message', res.error);
      }
    });

    socket.on('bet_ante', ({ amount }) => {
      if (!currentRoomId || !currentPlayerId) return;
      const res = roomManager.betAnte(currentRoomId, currentPlayerId, amount);
      if (!res.success && res.error) {
        socket.emit('error_message', res.error);
      }
    });

    socket.on('call_bluff', () => {
      if (!currentRoomId || !currentPlayerId) return;
      const res = roomManager.callBluff(currentRoomId, currentPlayerId);
      if (!res.success && res.error) {
        socket.emit('error_message', res.error);
      }
    });

    socket.on('concede_bluff', () => {
      if (!currentRoomId) return;
      roomManager.concedeBluff(currentRoomId);
    });

    socket.on('pass_turn', () => {
      if (!currentRoomId || !currentPlayerId) return;
      const res = roomManager.passTurn(currentRoomId, currentPlayerId);
      if (!res.success && res.error) {
        socket.emit('error_message', res.error);
      }
    });

    socket.on('next_round', () => {
      if (!currentRoomId || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomId);
      if (!room) return;
      roomManager.nextRound(currentRoomId);
    });

    socket.on('add_bot', () => {
      if (!currentRoomId) return;
      roomManager.addBot(currentRoomId);
    });

    socket.on('send_emote', ({ emote }) => {
      if (!currentRoomId || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomId);
      if (!room) return;
      const player = room.players.find(p => p.id === currentPlayerId);
      if (!player) return;

      io.to(currentRoomId).emit('emote_broadcast', {
        senderId: player.id,
        senderName: player.username,
        emote
      });
    });

    socket.on('disconnect', () => {
      roomManager.handleDisconnect(socket.id);
    });
  });

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🎮 [Card Arena] Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
