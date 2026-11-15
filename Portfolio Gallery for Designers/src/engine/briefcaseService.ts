import type {
  BriefcaseItemState,
  ComputedArtifactMeta,
  ViewingRoomData,
} from '../types/portfolio';
import { getHarmonyLabel } from './paletteEngine';

const STORAGE_KEY = 'atelier_sorensen_briefcase_v1';

const PRESET_VIEWING_ROOMS: Record<string, ViewingRoomData> = {
  '8a4f': {
    token: '8a4f',
    title: 'Q1 Rebrand & Architectural Campaign Inspiration',
    createdAt: '2026-11-12',
    items: [
      { id: 'plate-01', note: 'Reference tactile aluminum & minimal waveform cadence' },
      { id: 'plate-03', note: 'Swiss monograph grid density for print collateral' },
      { id: 'plate-02', note: 'Warm terracotta daylight warmth for hero lookbook' },
    ],
  },
};

export function encodeBriefcaseToken(room: ViewingRoomData): string {
  try {
    const compact = {
      t: room.title,
      i: room.items.map((x) => (x.note ? [x.id, x.note] : [x.id])),
    };
    const json = JSON.stringify(compact);
    const base64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `rm_${base64}`;
  } catch {
    return '8a4f';
  }
}

export function decodeBriefcaseToken(token: string): ViewingRoomData | null {
  if (PRESET_VIEWING_ROOMS[token]) {
    return PRESET_VIEWING_ROOMS[token];
  }
  if (!token.startsWith('rm_')) return null;

  try {
    const raw = token.slice(3).replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw + '='.repeat((4 - (raw.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json) as { t?: string; i?: [string, string?][] };
    if (!Array.isArray(parsed.i)) return null;
    return {
      token,
      title: parsed.t || 'Shared Client Viewing Room',
      createdAt: new Date().toISOString().slice(0, 10),
      items: parsed.i.map(([id, note]) => ({ id, note: note ?? '' })),
    };
  } catch {
    return null;
  }
}

export function loadInitialBriefcase(search: string): {
  title: string;
  items: BriefcaseItemState[];
  loadedFromToken: string | null;
} {
  const params = new URLSearchParams(search);
  const tokenParam = params.get('briefcase')?.trim();
  const roomTitleParam = params.get('room')?.trim();

  if (tokenParam) {
    const decoded = decodeBriefcaseToken(tokenParam);
    if (decoded) {
      return {
        title: roomTitleParam || decoded.title,
        items: decoded.items,
        loadedFromToken: tokenParam,
      };
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { title?: string; items?: BriefcaseItemState[] };
      if (Array.isArray(parsed.items)) {
        return {
          title: parsed.title || 'Selected Briefcase References',
          items: parsed.items,
          loadedFromToken: null,
        };
      }
    }
  } catch {
    // ignore storage quota / privacy errors
  }

  // Subtle starter curations so visitors experience the Briefcase workflow immediately
  return {
    title: 'Curated Studio References',
    items: [
      { id: 'plate-01', note: '' },
      { id: 'plate-02', note: '' },
    ],
    loadedFromToken: null,
  };
}

export function persistBriefcaseLocally(title: string, items: BriefcaseItemState[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, items }));
  } catch {
    // ignore
  }
}

/**
 * Generates an editorial aesthetic summary from pinned artworks.
 */
export function buildAestheticSummary(pinnedMetas: ComputedArtifactMeta[]): string {
  if (pinnedMetas.length === 0) {
    return 'Pin plates across the Exhibition or Contact Sheet to assemble a custom Viewing Room.';
  }

  const disciplineCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();
  const colorCounts = new Map<string, number>();

  for (const m of pinnedMetas) {
    const d = m.artifact.primaryDiscipline;
    disciplineCounts.set(d, (disciplineCounts.get(d) ?? 0) + 1);
    moodCounts.set(m.artifact.mood, (moodCounts.get(m.artifact.mood) ?? 0) + 1);
    colorCounts.set(m.artifact.colorHarmony, (colorCounts.get(m.artifact.colorHarmony) ?? 0) + 1);
  }

  const topDiscipline = [...disciplineCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topColor = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const colorLabel = topColor ? getHarmonyLabel(topColor as any) : 'Balanced Neutrals';
  return `Your selection leans toward ${topMood} craft across ${topDiscipline}, anchored by a ${colorLabel} palette.`;
}

export function buildDesignTokenBundleJson(pinnedMetas: ComputedArtifactMeta[]): string {
  const systems = pinnedMetas
    .filter((m) => Boolean(m.artifact.designManifest))
    .map((m) => ({
      catalogNumber: m.artifact.catalogNumber,
      project: m.artifact.title,
      client: m.artifact.client,
      spacingScale: m.artifact.designManifest!.spacingScale,
      typography: m.artifact.designManifest!.fontFamilies,
      colorTokens: m.artifact.designManifest!.colorTokens,
    }));

  return JSON.stringify(
    {
      exportedBy: 'Atelier Sorensen — Visual Intelligence Engine',
      generatedAt: new Date().toISOString(),
      systems,
    },
    null,
    2
  );
}

