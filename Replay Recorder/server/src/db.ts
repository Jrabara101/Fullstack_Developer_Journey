import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import LZString from 'lz-string';
import {
  ReplayMetadata,
  ReplayPayload,
  VerificationReport,
  KeyframeSnapshot,
  PlayerInputPacket,
  INPUT_BITS
} from './types.js';
import { computeReplayChecksum, verifyReplay } from './verifier.js';

const dbPath = path.resolve(process.cwd(), 'replays.db');
export const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS replays (
    id TEXT PRIMARY KEY,
    game_title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    map_seed TEXT,
    recorded_at TEXT NOT NULL,
    total_ticks INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    tick_rate INTEGER NOT NULL,
    checksum TEXT NOT NULL,
    markers_json TEXT NOT NULL,
    payload_compressed TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0,
    verification_report_json TEXT,
    created_at TEXT NOT NULL
  );
`);

export interface StoredReplayRow {
  id: string;
  game_title: string;
  author_name: string;
  map_seed: string;
  recorded_at: string;
  total_ticks: number;
  duration_ms: number;
  tick_rate: number;
  checksum: string;
  markers_json: string;
  payload_compressed: string;
  is_verified: number;
  verification_report_json: string | null;
  created_at: string;
}

export function getAllReplays(): (ReplayMetadata & { isVerified: boolean; verificationScore?: number })[] {
  const stmt = db.prepare(`
    SELECT id, game_title, author_name, map_seed, recorded_at, total_ticks, duration_ms, tick_rate, checksum, markers_json, is_verified, verification_report_json
    FROM replays
    ORDER BY created_at DESC
  `);
  const rows = stmt.all() as any[];

  return rows.map(r => {
    let report: VerificationReport | null = null;
    if (r.verification_report_json) {
      try {
        report = JSON.parse(r.verification_report_json);
      } catch {}
    }
    return {
      replayId: r.id,
      gameTitle: r.game_title,
      authorName: r.author_name,
      mapSeed: r.map_seed,
      recordedAt: r.recorded_at,
      totalTicks: r.total_ticks,
      durationMs: r.duration_ms,
      tickRate: r.tick_rate,
      checksum: r.checksum,
      markers: JSON.parse(r.markers_json || '[]'),
      isVerified: Boolean(r.is_verified),
      verificationScore: report?.score
    };
  });
}

export function getReplayById(id: string): { metadata: ReplayMetadata; payload: ReplayPayload; verificationReport?: VerificationReport } | null {
  const stmt = db.prepare('SELECT * FROM replays WHERE id = ?');
  const row = stmt.get(id) as StoredReplayRow | undefined;
  if (!row) return null;

  let payload: ReplayPayload = { keyframes: [], inputs: [] };
  try {
    const jsonStr = LZString.decompressFromUTF16(row.payload_compressed) || LZString.decompress(row.payload_compressed) || row.payload_compressed;
    payload = JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to parse replay payload:', err);
  }

  const metadata: ReplayMetadata = {
    replayId: row.id,
    gameTitle: row.game_title,
    authorName: row.author_name,
    mapSeed: row.map_seed,
    recordedAt: row.recorded_at,
    totalTicks: row.total_ticks,
    durationMs: row.duration_ms,
    tickRate: row.tick_rate,
    checksum: row.checksum,
    markers: JSON.parse(row.markers_json || '[]')
  };

  let verificationReport: VerificationReport | undefined = undefined;
  if (row.verification_report_json) {
    try {
      verificationReport = JSON.parse(row.verification_report_json);
    } catch {}
  }

  return { metadata, payload, verificationReport };
}

export function saveReplay(
  metadata: ReplayMetadata,
  payloadCompressed: string,
  verificationReport?: VerificationReport
): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO replays (
      id, game_title, author_name, map_seed, recorded_at, total_ticks,
      duration_ms, tick_rate, checksum, markers_json, payload_compressed,
      is_verified, verification_report_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    metadata.replayId,
    metadata.gameTitle,
    metadata.authorName,
    metadata.mapSeed || 'default-seed',
    metadata.recordedAt,
    metadata.totalTicks,
    metadata.durationMs,
    metadata.tickRate || 60,
    metadata.checksum,
    JSON.stringify(metadata.markers || []),
    payloadCompressed,
    verificationReport?.isValid ? 1 : 0,
    verificationReport ? JSON.stringify(verificationReport) : null,
    new Date().toISOString()
  );
}

export function updateReplayVerification(id: string, report: VerificationReport): void {
  const stmt = db.prepare(`
    UPDATE replays
    SET is_verified = ?, verification_report_json = ?
    WHERE id = ?
  `);
  stmt.run(report.isValid ? 1 : 0, JSON.stringify(report), id);
}

export function deleteReplay(id: string): boolean {
  const stmt = db.prepare('DELETE FROM replays WHERE id = ?');
  stmt.run(id);
  return true;
}

// ----------------------------------------------------
// Deterministic Synthetic Replay Generator for Seeds
// ----------------------------------------------------
function generateSyntheticReplay(options: {
  id: string;
  title: string;
  author: string;
  totalTicks: number;
  curve: (tick: number) => { x: number; y: number; keys: number };
  tamper?: boolean;
}): { metadata: ReplayMetadata; payload: ReplayPayload; report: VerificationReport } {
  const tickRate = 60;
  const dt = 1 / tickRate;
  const dtMs = 1000 / tickRate;
  const inputs: PlayerInputPacket[] = [];
  const keyframes: KeyframeSnapshot[] = [];

  let px = 200;
  let py = 400;
  let vx = 0;
  let vy = 0;

  for (let t = 0; t <= options.totalTicks; t++) {
    const cur = options.curve(t);
    const keys = cur.keys;

    // Simulate canonical physics
    let ax = 0;
    let ay = 0;
    if (keys & INPUT_BITS.UP) ay -= 1;
    if (keys & INPUT_BITS.DOWN) ay += 1;
    if (keys & INPUT_BITS.LEFT) ax -= 1;
    if (keys & INPUT_BITS.RIGHT) ax += 1;

    const len = Math.sqrt(ax * ax + ay * ay);
    if (len > 0) {
      ax /= len;
      ay /= len;
    }

    const isBoosting = (keys & INPUT_BITS.BOOST) !== 0;
    const accel = 1200 * (isBoosting ? 1.4 : 1.0);
    const maxSpd = isBoosting ? 780 : 420;

    vx += ax * accel * dt;
    vy += ay * accel * dt;
    vx *= 0.94;
    vy *= 0.94;

    const spd = Math.sqrt(vx * vx + vy * vy);
    if (spd > maxSpd) {
      vx = (vx / spd) * maxSpd;
      vy = (vy / spd) * maxSpd;
    }

    px += vx * dt;
    py += vy * dt;

    // Tampering test injection at tick 240
    if (options.tamper && t === 240) {
      px += 500; // Unphysical teleport!
    }

    inputs.push({
      tick: t,
      dt,
      keys,
      cursor: { x: px + 100, y: py }
    });

    if (t % 60 === 0 || t === options.totalTicks) {
      keyframes.push({
        tick: t,
        timestampMs: Math.round(t * dtMs),
        entities: [
          {
            id: 'player_drone',
            type: 'player',
            pos: { x: Math.round(px * 10) / 10, y: Math.round(py * 10) / 10 },
            velocity: { x: Math.round(vx * 10) / 10, y: Math.round(vy * 10) / 10 },
            stateFlags: isBoosting ? 1 : 0
          },
          {
            id: 'hazard_orb_1',
            type: 'hazard',
            pos: { x: 600 + Math.sin(t * 0.05) * 150, y: 350 + Math.cos(t * 0.05) * 120 },
            velocity: { x: 0, y: 0 },
            stateFlags: 0
          }
        ]
      });
    }
  }

  const payload: ReplayPayload = { keyframes, inputs };
  const checksum = computeReplayChecksum(payload);

  const markers = [
    {
      id: 'm1',
      tick: Math.floor(options.totalTicks * 0.25),
      timestampMs: Math.floor(options.totalTicks * 0.25 * dtMs),
      category: 'checkpoint' as const,
      label: 'Sector Gate A Passed'
    },
    {
      id: 'm2',
      tick: Math.floor(options.totalTicks * 0.55),
      timestampMs: Math.floor(options.totalTicks * 0.55 * dtMs),
      category: 'kill' as const,
      label: 'Sentry Drone Neutralized'
    },
    {
      id: 'm3',
      tick: Math.floor(options.totalTicks * 0.8),
      timestampMs: Math.floor(options.totalTicks * 0.8 * dtMs),
      category: 'ability' as const,
      label: 'Sonic Dash Triggered'
    },
    {
      id: 'm4',
      tick: options.totalTicks - 10,
      timestampMs: Math.floor((options.totalTicks - 10) * dtMs),
      category: 'milestone' as const,
      label: 'Clutch Finish Line Reached'
    }
  ];

  const metadata: ReplayMetadata = {
    replayId: options.id,
    gameTitle: options.title,
    authorName: options.author,
    mapSeed: 'arena-neo-77',
    recordedAt: new Date(Date.now() - 3600000).toISOString(),
    totalTicks: options.totalTicks,
    durationMs: Math.round(options.totalTicks * dtMs),
    tickRate,
    checksum,
    markers
  };

  const report = verifyReplay(metadata, payload);

  return { metadata, payload, report };
}

// Seed Database if empty
export function initializeSeedData(): void {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM replays');
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    console.log('[SQLite] Empty database detected. Seeding high-fidelity match archives...');

    // Seed 1: Verified Clutch Match
    const seed1 = generateSyntheticReplay({
      id: 'clutch-grand-finals-01',
      title: 'Neon Overdrive: Grand Finals Clutch',
      author: 'Valkyrie_99',
      totalTicks: 540,
      curve: (t) => {
        let keys = 0;
        if (t < 150) keys = INPUT_BITS.RIGHT | (t % 20 < 10 ? INPUT_BITS.UP : INPUT_BITS.DOWN);
        else if (t < 320) keys = INPUT_BITS.RIGHT | INPUT_BITS.DOWN | INPUT_BITS.BOOST;
        else if (t < 450) keys = INPUT_BITS.UP | INPUT_BITS.RIGHT | INPUT_BITS.ABILITY;
        else keys = INPUT_BITS.RIGHT | INPUT_BITS.BOOST;
        return { x: 0, y: 0, keys };
      }
    });
    saveReplay(seed1.metadata, LZString.compressToUTF16(JSON.stringify(seed1.payload)), seed1.report);

    // Seed 2: Ghost Baseline Run (Speedrun)
    const seed2 = generateSyntheticReplay({
      id: 'ghost-speedrun-sector9',
      title: 'Sector-7 Hyper-Glide: Speedrun Record',
      author: 'GhostRunner_X',
      totalTicks: 480,
      curve: (t) => {
        let keys = INPUT_BITS.RIGHT | INPUT_BITS.BOOST;
        if (t % 60 < 30) keys |= INPUT_BITS.UP;
        else keys |= INPUT_BITS.DOWN;
        return { x: 0, y: 0, keys };
      }
    });
    saveReplay(seed2.metadata, LZString.compressToUTF16(JSON.stringify(seed2.payload)), seed2.report);

    // Seed 3: Tampered Replay Sample (Desync & Speedhack test)
    const seed3 = generateSyntheticReplay({
      id: 'tampered-anomaly-test',
      title: 'Desync Anomaly & Speedhack Spike',
      author: 'Sus_Pilot_404',
      totalTicks: 420,
      curve: (t) => {
        return { x: 0, y: 0, keys: INPUT_BITS.RIGHT };
      },
      tamper: true
    });
    // For tampered run, leave the report with failures so anti-tamper flags light up!
    saveReplay(seed3.metadata, LZString.compressToUTF16(JSON.stringify(seed3.payload)), seed3.report);

    console.log('[SQLite] Seeded 3 replays successfully.');
  }
}
