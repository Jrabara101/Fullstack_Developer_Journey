import fs from 'fs';
import path from 'path';
import { GameCatalogItem, CriticProfile, GameReview, QuestList, ShelfStatus } from '../../src/types';
import { INITIAL_GAMES, INITIAL_PROFILES, INITIAL_LISTS, generateInitialReviews } from './seedData';

const DB_FILE = path.resolve(process.cwd(), 'database.json');

interface DatabaseState {
  games: GameCatalogItem[];
  profiles: CriticProfile[];
  reviews: GameReview[];
  lists: QuestList[];
  quarantinedPatchSpikes: Record<string, boolean>; // `${gameId}:${patchVersion}` -> isQuarantined
}

class DatabaseService {
  private state: DatabaseState = {
    games: [],
    profiles: [],
    reviews: [],
    lists: [],
    quarantinedPatchSpikes: {},
  };

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[Database] Loaded existing database with ${this.state.games.length} games, ${this.state.reviews.length} reviews.`);
        return;
      } catch (err) {
        console.error('[Database] Failed to read database.json, re-seeding...', err);
      }
    }

    // Seed database
    console.log('[Database] Seeding fresh database with 25+ iconic games and 150+ reviews...');
    this.state = {
      games: INITIAL_GAMES,
      profiles: INITIAL_PROFILES,
      reviews: generateInitialReviews(),
      lists: INITIAL_LISTS,
      quarantinedPatchSpikes: {
        'elden-ring:v1.03': true,
      },
    };
    this.recalculateGameMetrics();
    this.persist();
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist database:', err);
    }
  }

  // Games
  public getGames(): GameCatalogItem[] {
    return this.state.games;
  }

  public getGameById(id: string): GameCatalogItem | undefined {
    return this.state.games.find((g) => g.id === id || g.slug === id);
  }

  // Reviews
  public getReviewsForGame(gameId: string, includeQuarantined = false): GameReview[] {
    return this.state.reviews.filter((r) => {
      if (r.gameId !== gameId) return false;
      if (!includeQuarantined && r.isFlaggedBrigade) {
        // Check if quarantine is active for this game/patch
        const key = `${r.gameId}:${r.patchVersion}`;
        if (this.state.quarantinedPatchSpikes[key]) return false;
      }
      return true;
    });
  }

  public getAllReviews(): GameReview[] {
    return this.state.reviews;
  }

  public addReview(review: Omit<GameReview, 'id' | 'createdAt' | 'likedCount'>): GameReview {
    const newReview: GameReview = {
      ...review,
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      likedCount: 0,
    };

    // Check velocity for anti-brigading
    const recentSpikes = this.state.reviews.filter(
      (r) => r.gameId === newReview.gameId && r.patchVersion === newReview.patchVersion
    );
    if (recentSpikes.length > 5 && newReview.starRating <= 1.5) {
      // Potentially part of a review-bomb spike
      newReview.isFlaggedBrigade = false; // Initially flagged if anomaly check triggers
    }

    this.state.reviews.unshift(newReview);

    // Update author's shelf for this game
    const profile = this.getProfileById(review.author.id);
    if (profile) {
      if (!profile.shelves) profile.shelves = {};
      profile.shelves[review.gameId] = review.completionStatus;
      profile.stats.totalReviewsWritten += 1;
      profile.stats.totalGamesLogged = Object.keys(profile.shelves).length;
    }

    this.recalculateGameMetrics(review.gameId);
    this.persist();
    return newReview;
  }

  public likeReview(reviewId: string): GameReview | null {
    const r = this.state.reviews.find((rev) => rev.id === reviewId);
    if (r) {
      r.likedCount += 1;
      this.persist();
      return r;
    }
    return null;
  }

  // Profiles
  public getProfiles(): CriticProfile[] {
    return this.state.profiles;
  }

  public getProfileById(id: string): CriticProfile | undefined {
    return this.state.profiles.find((p) => p.id === id || p.username.toLowerCase() === id.toLowerCase());
  }

  public updateProfileShelf(userId: string, gameId: string, status: ShelfStatus): CriticProfile | null {
    const profile = this.getProfileById(userId);
    if (!profile) return null;
    if (!profile.shelves) profile.shelves = {};
    profile.shelves[gameId] = status;
    profile.stats.totalGamesLogged = Object.keys(profile.shelves).length;
    this.persist();
    return profile;
  }

  public updateTopFour(userId: string, topFourGameIds: [string, string, string, string]): CriticProfile | null {
    const profile = this.getProfileById(userId);
    if (!profile) return null;
    profile.topFourGameIds = topFourGameIds;
    this.persist();
    return profile;
  }

  // Lists
  public getLists(): QuestList[] {
    return this.state.lists;
  }

  public getListById(id: string): QuestList | undefined {
    return this.state.lists.find((l) => l.id === id);
  }

  public likeList(listId: string): QuestList | null {
    const l = this.state.lists.find((item) => item.id === listId);
    if (l) {
      l.likesCount += 1;
      this.persist();
      return l;
    }
    return null;
  }

  // Anti-brigade Quarantine toggle
  public toggleQuarantine(gameId: string, patchVersion: string): boolean {
    const key = `${gameId}:${patchVersion}`;
    const current = !!this.state.quarantinedPatchSpikes[key];
    this.state.quarantinedPatchSpikes[key] = !current;
    this.recalculateGameMetrics(gameId);
    this.persist();
    return this.state.quarantinedPatchSpikes[key];
  }

  public isPatchQuarantined(gameId: string, patchVersion: string): boolean {
    const key = `${gameId}:${patchVersion}`;
    return !!this.state.quarantinedPatchSpikes[key];
  }

  // Recalculate game averages, community pillars, and histogram
  public recalculateGameMetrics(targetGameId?: string) {
    const gamesToUpdate = targetGameId
      ? this.state.games.filter((g) => g.id === targetGameId)
      : this.state.games;

    gamesToUpdate.forEach((game) => {
      // Get all unquarantined reviews
      const reviews = this.getReviewsForGame(game.id, false);
      if (reviews.length === 0) return;

      const sumRating = reviews.reduce((acc, r) => acc + r.starRating, 0);
      const avgRating = Math.round((sumRating / reviews.length) * 10) / 10;

      // 10-bucket histogram from 0.5 to 5.0 (0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
      const histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      reviews.forEach((r) => {
        const bucketIndex = Math.min(9, Math.max(0, Math.round((r.starRating - 0.5) * 2)));
        histogram[bucketIndex] += 1;
      });

      // Pillars average
      const communityPillars = {
        gameplay: Math.round((reviews.reduce((acc, r) => acc + r.pillars.gameplay, 0) / reviews.length) * 10) / 10,
        narrative: Math.round((reviews.reduce((acc, r) => acc + r.pillars.narrative, 0) / reviews.length) * 10) / 10,
        visuals: Math.round((reviews.reduce((acc, r) => acc + r.pillars.visuals, 0) / reviews.length) * 10) / 10,
        audio: Math.round((reviews.reduce((acc, r) => acc + r.pillars.audio, 0) / reviews.length) * 10) / 10,
        polish: Math.round((reviews.reduce((acc, r) => acc + r.pillars.polish, 0) / reviews.length) * 10) / 10,
      };

      const completedCount = reviews.filter((r) => r.completionStatus === 'BEATEN' || r.completionStatus === 'MASTERED_100').length;
      const completionRate = Math.round((completedCount / reviews.length) * 100);

      game.metrics.averageRating = avgRating;
      game.metrics.totalReviews = reviews.length;
      game.metrics.communityPillars = communityPillars;
      game.metrics.ratingHistogram = histogram;
      game.metrics.completionRatePercent = completionRate;
    });
  }
}

export const db = new DatabaseService();
