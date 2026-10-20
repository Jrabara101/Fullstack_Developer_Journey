import { GameCatalogItem, GameReview, CriticProfile, QuestList, TasteMatchResult, AntiBrigadeReport, ShelfStatus } from '../types';

const BASE_URL = '/api';

export async function fetchGames(params?: { q?: string; genre?: string; platform?: string; sort?: string }): Promise<{ games: GameCatalogItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.genre) query.set('genre', params.genre);
  if (params?.platform) query.set('platform', params.platform);
  if (params?.sort) query.set('sort', params.sort);

  const res = await fetch(`${BASE_URL}/games?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch games');
  return res.json();
}

export async function fetchGame(id: string): Promise<GameCatalogItem & { antiBrigade: AntiBrigadeReport }> {
  const res = await fetch(`${BASE_URL}/games/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch game ${id}`);
  return res.json();
}

export async function fetchReviews(
  gameId: string,
  params?: {
    status?: string;
    platform?: string;
    minTasteSync?: number;
    includeQuarantined?: boolean;
    sort?: string;
  }
): Promise<{ reviews: GameReview[]; total: number; gameId: string; gameTitle: string }> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') query.set('status', params.status);
  if (params?.platform && params.platform !== 'ALL') query.set('platform', params.platform);
  if (params?.minTasteSync) query.set('minTasteSync', params.minTasteSync.toString());
  if (params?.includeQuarantined) query.set('includeQuarantined', 'true');
  if (params?.sort) query.set('sort', params.sort);

  const res = await fetch(`${BASE_URL}/games/${gameId}/reviews?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function submitReview(gameId: string, reviewData: any): Promise<{ review: GameReview; game: GameCatalogItem }> {
  const res = await fetch(`${BASE_URL}/games/${gameId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function likeReview(reviewId: string): Promise<GameReview> {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to like review');
  return res.json();
}

export async function fetchUsers(): Promise<{ profiles: CriticProfile[] }> {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
}

export async function fetchUser(id: string): Promise<CriticProfile & { topFourGames: GameCatalogItem[]; recentReviews: GameReview[] }> {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return res.json();
}

export async function fetchTasteMatch(targetUserId: string, activeUserId: string): Promise<TasteMatchResult> {
  const res = await fetch(`${BASE_URL}/users/${targetUserId}/taste-match?activeUserId=${activeUserId}`);
  if (!res.ok) throw new Error('Failed to compute taste match');
  return res.json();
}

export async function updateUserShelf(userId: string, gameId: string, status: ShelfStatus): Promise<CriticProfile> {
  const res = await fetch(`${BASE_URL}/users/${userId}/shelf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, status }),
  });
  if (!res.ok) throw new Error('Failed to update shelf');
  return res.json();
}

export async function updateUserTopFour(userId: string, topFourGameIds: [string, string, string, string]): Promise<CriticProfile> {
  const res = await fetch(`${BASE_URL}/users/${userId}/top4`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topFourGameIds }),
  });
  if (!res.ok) throw new Error('Failed to update top 4 games');
  return res.json();
}

export async function fetchLists(): Promise<{ lists: (QuestList & { games: GameCatalogItem[] })[] }> {
  const res = await fetch(`${BASE_URL}/lists`);
  if (!res.ok) throw new Error('Failed to fetch lists');
  return res.json();
}

export async function likeList(listId: string): Promise<QuestList> {
  const res = await fetch(`${BASE_URL}/lists/${listId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to like list');
  return res.json();
}

export async function toggleQuarantine(gameId: string, patchVersion: string): Promise<{ isQuarantined: boolean; report: AntiBrigadeReport }> {
  const res = await fetch(`${BASE_URL}/games/${gameId}/anti-brigade/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patchVersion }),
  });
  if (!res.ok) throw new Error('Failed to toggle quarantine');
  return res.json();
}

export async function searchGlobal(query: string): Promise<{ games: GameCatalogItem[]; critics: CriticProfile[]; lists: QuestList[] }> {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
