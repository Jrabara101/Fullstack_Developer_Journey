import express from 'express';
import cors from 'cors';
import { db } from './db/database';
import { computeTasteMatch } from './algorithms/tasteMatch';
import { analyzeAntiBrigading } from './algorithms/antiBrigading';
import { ShelfStatus } from '../src/types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// GAMES CATALOG ENDPOINTS
// ==========================================

// GET /api/games (with search, genre, sort)
app.get('/api/games', (req, res) => {
  let games = db.getGames();
  const search = (req.query.q as string || '').toLowerCase().trim();
  const genre = req.query.genre as string;
  const platform = req.query.platform as string;
  const sort = req.query.sort as string || 'rating';

  if (search) {
    games = games.filter(
      (g) =>
        g.title.toLowerCase().includes(search) ||
        g.developer.toLowerCase().includes(search) ||
        g.genres.some((gen) => gen.toLowerCase().includes(search))
    );
  }

  if (genre && genre !== 'ALL') {
    games = games.filter((g) => g.genres.includes(genre));
  }

  if (platform && platform !== 'ALL') {
    games = games.filter((g) => g.platforms.includes(platform as any));
  }

  if (sort === 'rating') {
    games.sort((a, b) => b.metrics.averageRating - a.metrics.averageRating);
  } else if (sort === 'reviews') {
    games.sort((a, b) => b.metrics.totalReviews - a.metrics.totalReviews);
  } else if (sort === 'year') {
    games.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sort === 'title') {
    games.sort((a, b) => a.title.localeCompare(b.title));
  }

  res.json({ games, total: games.length });
});

// GET /api/games/:id
app.get('/api/games/:id', (req, res) => {
  const game = db.getGameById(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const antiBrigade = analyzeAntiBrigading(game.id);
  res.json({
    ...game,
    antiBrigade,
  });
});

// ==========================================
// REVIEWS & ANTI-BRIGADING ENDPOINTS
// ==========================================

// GET /api/games/:id/reviews (with rich filtering)
app.get('/api/games/:id/reviews', (req, res) => {
  const gameId = req.params.id;
  const game = db.getGameById(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const includeQuarantined = req.query.includeQuarantined === 'true';
  let reviews = db.getReviewsForGame(gameId, includeQuarantined);

  // Filter by completion status
  const status = req.query.status as ShelfStatus;
  if (status && status !== ('ALL' as any)) {
    reviews = reviews.filter((r) => r.completionStatus === status);
  }

  // Filter by platform
  const platform = req.query.platform as string;
  if (platform && platform !== 'ALL') {
    reviews = reviews.filter((r) => r.platformPlayed === platform);
  }

  // Filter by minimum taste match
  const minTasteSync = parseInt(req.query.minTasteSync as string, 10);
  if (!isNaN(minTasteSync) && minTasteSync > 0) {
    reviews = reviews.filter((r) => (r.author.tasteMatchPercent || 80) >= minTasteSync);
  }

  // Sort reviews: Top reviews first, then newest
  const sort = req.query.sort as string || 'helpful';
  if (sort === 'helpful') {
    reviews.sort((a, b) => b.likedCount - a.likedCount || b.starRating - a.starRating);
  } else if (sort === 'newest') {
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'highest') {
    reviews.sort((a, b) => b.starRating - a.starRating);
  } else if (sort === 'lowest') {
    reviews.sort((a, b) => a.starRating - b.starRating);
  }

  res.json({
    reviews,
    total: reviews.length,
    gameId,
    gameTitle: game.title,
  });
});

// POST /api/games/:id/reviews
app.post('/api/games/:id/reviews', (req, res) => {
  const gameId = req.params.id;
  const game = db.getGameById(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const {
    author,
    starRating,
    isMasterpiece,
    pillars,
    completionStatus,
    playtimeHours,
    platformPlayed,
    patchVersion,
    bodyMarkdown,
  } = req.body;

  if (typeof starRating !== 'number' || starRating < 0.5 || starRating > 5.0) {
    return res.status(400).json({ error: 'starRating must be between 0.5 and 5.0' });
  }

  if (!pillars || !pillars.gameplay || !pillars.narrative) {
    return res.status(400).json({ error: 'All 5 pillars are required' });
  }

  const newReview = db.addReview({
    gameId,
    author: author || {
      id: 'user-valkyrie',
      username: 'Elena "Valkyrie" Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      criticTier: 'TOP_CRITIC',
      tasteMatchPercent: 96,
    },
    starRating,
    isMasterpiece: !!isMasterpiece,
    pillars,
    completionStatus: completionStatus || 'BEATEN',
    playtimeHours: Number(playtimeHours) || 10,
    platformPlayed: platformPlayed || 'PC',
    patchVersion: patchVersion || 'v1.0',
    bodyMarkdown: bodyMarkdown || 'A thoughtful critique of this title.',
  });

  const updatedGame = db.getGameById(gameId);
  res.status(201).json({ review: newReview, game: updatedGame });
});

// POST /api/reviews/:id/like
app.post('/api/reviews/:id/like', (req, res) => {
  const updated = db.likeReview(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json(updated);
});

// GET /api/games/:id/anti-brigade
app.get('/api/games/:id/anti-brigade', (req, res) => {
  const report = analyzeAntiBrigading(req.params.id);
  res.json(report);
});

// POST /api/games/:id/anti-brigade/toggle
app.post('/api/games/:id/anti-brigade/toggle', (req, res) => {
  const { patchVersion } = req.body;
  if (!patchVersion) {
    return res.status(400).json({ error: 'patchVersion is required' });
  }
  const isQuarantined = db.toggleQuarantine(req.params.id, patchVersion);
  const report = analyzeAntiBrigading(req.params.id);
  res.json({ isQuarantined, report });
});

// ==========================================
// CRITIC PROFILES & TASTE-MATCHING ENDPOINTS
// ==========================================

// GET /api/users
app.get('/api/users', (req, res) => {
  const profiles = db.getProfiles();
  res.json({ profiles });
});

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Critic profile not found' });
  }

  // Populate top 4 games with full catalog details
  const topFourGames = profile.topFourGameIds
    .map((gid) => db.getGameById(gid))
    .filter(Boolean);

  // Compute user reviews
  const userReviews = db.getAllReviews().filter((r) => r.author.id === profile.id);

  res.json({
    ...profile,
    topFourGames,
    recentReviews: userReviews.slice(0, 8),
  });
});

// GET /api/users/:id/taste-match
app.get('/api/users/:id/taste-match', (req, res) => {
  const targetUserId = req.params.id;
  const activeUserId = (req.query.activeUserId as string) || 'user-valkyrie';

  const match = computeTasteMatch(activeUserId, targetUserId);
  res.json(match);
});

// POST /api/users/:id/shelf
app.post('/api/users/:id/shelf', (req, res) => {
  const { gameId, status } = req.body;
  if (!gameId || !status) {
    return res.status(400).json({ error: 'gameId and status are required' });
  }
  const updated = db.updateProfileShelf(req.params.id, gameId, status as ShelfStatus);
  if (!updated) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  res.json(updated);
});

// POST /api/users/:id/top4
app.post('/api/users/:id/top4', (req, res) => {
  const { topFourGameIds } = req.body;
  if (!Array.isArray(topFourGameIds) || topFourGameIds.length !== 4) {
    return res.status(400).json({ error: 'topFourGameIds must be an array of 4 game IDs' });
  }
  const updated = db.updateTopFour(req.params.id, topFourGameIds as [string, string, string, string]);
  if (!updated) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  res.json(updated);
});

// ==========================================
// QUEST LISTS & COLLECTIONS
// ==========================================

// GET /api/lists
app.get('/api/lists', (req, res) => {
  const lists = db.getLists().map((list) => {
    const fullGames = list.gameIds.map((id) => db.getGameById(id)).filter(Boolean);
    return {
      ...list,
      games: fullGames,
    };
  });
  res.json({ lists });
});

// GET /api/lists/:id
app.get('/api/lists/:id', (req, res) => {
  const list = db.getListById(req.params.id);
  if (!list) {
    return res.status(404).json({ error: 'List not found' });
  }
  const fullGames = list.gameIds.map((id) => db.getGameById(id)).filter(Boolean);
  res.json({
    ...list,
    games: fullGames,
  });
});

// POST /api/lists/:id/like
app.post('/api/lists/:id/like', (req, res) => {
  const updated = db.likeList(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'List not found' });
  }
  res.json(updated);
});

// ==========================================
// GLOBAL COMMAND SEARCH (Cmd+K)
// ==========================================
app.get('/api/search', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    return res.json({ games: [], critics: [], lists: [] });
  }

  const matchingGames = db.getGames().filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.developer.toLowerCase().includes(q) ||
      g.genres.some((gen) => gen.toLowerCase().includes(q))
  ).slice(0, 6);

  const matchingCritics = db.getProfiles().filter(
    (p) =>
      p.username.toLowerCase().includes(q) ||
      p.bio.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchingLists = db.getLists().filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
  ).slice(0, 4);

  res.json({
    games: matchingGames,
    critics: matchingCritics,
    lists: matchingLists,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Backend Server] CRITIC.VAULT API running on http://localhost:${PORT}`);
});
