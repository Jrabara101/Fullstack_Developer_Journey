// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Server Entry Point
// Express REST API + Socket.io Real-Time Game Engine
// ═══════════════════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/types.js';
import { GameSession } from './game-engine.js';
import { getDailyWord, getRandomWord, validateWord } from './dictionary.js';

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// ─── REST API Routes ─────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ONLINE', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Daily cipher metadata (never sends the word to client)
app.get('/api/daily', (_req, res) => {
  const daily = getDailyWord();
  res.json({
    date: new Date().toISOString().slice(0, 10),
    seed: daily.seed,
    wordLength: daily.word.length,
    category: daily.category,
    difficulty: daily.difficulty,
  });
});

// Random word metadata
app.get('/api/word/random', (req, res) => {
  const difficulty = (req.query.difficulty as string)?.toUpperCase() || 'MEDIUM';
  const valid = ['EASY', 'MEDIUM', 'HARD', 'OBSCURE'];
  if (!valid.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  const word = getRandomWord(difficulty as any);
  res.json({
    wordLength: word.word.length,
    category: word.category,
    difficulty: word.difficulty,
  });
});

// Validate if word exists in dictionary
app.post('/api/word/validate', (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word required' });
  }
  res.json({ valid: validateWord(word), word: word.toUpperCase() });
});

// ─── Socket.io Real-Time Game Server ─────────────────────────────────────────

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  },
});

// Session store: socketId -> GameSession
const sessions = new Map<string, GameSession>();

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Create new game
  socket.on('game:new', (opts) => {
    const session = new GameSession(opts);
    sessions.set(socket.id, session);
    socket.emit('game:state', session.getState());
    console.log(`🎮 New game [${session.sessionId}] — Theme: ${opts.theme}, Difficulty: ${opts.difficulty}${opts.daily ? ' (DAILY)' : ''}`);
  });

  // Process guess
  socket.on('game:guess', (letter) => {
    const session = sessions.get(socket.id);
    if (!session) {
      socket.emit('game:error', 'No active game session');
      return;
    }

    try {
      const result = session.guess(letter);
      socket.emit('game:guess-result', result);

      if (result.status === 'WON' || result.status === 'LOST') {
        socket.emit('game:over', session.getGameOverPayload());
      }
    } catch (err: any) {
      socket.emit('game:error', err.message);
    }
  });

  // Use hint
  socket.on('game:hint', () => {
    const session = sessions.get(socket.id);
    if (!session) {
      socket.emit('game:error', 'No active game session');
      return;
    }

    try {
      const hint = session.useHint();
      socket.emit('game:hint', hint);
      socket.emit('game:state', session.getState());
    } catch (err: any) {
      socket.emit('game:error', err.message);
    }
  });

  // Reset game
  socket.on('game:reset', () => {
    sessions.delete(socket.id);
    console.log(`🔄 Session reset for ${socket.id}`);
  });

  socket.on('disconnect', () => {
    sessions.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🔐 THE CIPHER GALLOWS — Server Online         ║
  ║   PORT: ${PORT}                                    ║
  ║   REST: http://localhost:${PORT}/api               ║
  ║   WS:   ws://localhost:${PORT}                     ║
  ╚══════════════════════════════════════════════════╝
  `);
});
