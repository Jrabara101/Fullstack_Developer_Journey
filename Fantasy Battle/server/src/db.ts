import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'colosseum_ledger.sqlite');
export const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS arena_runs (
    id TEXT PRIMARY KEY,
    callsign TEXT NOT NULL,
    seed TEXT NOT NULL,
    fighter_class TEXT NOT NULL,
    waves_cleared INTEGER NOT NULL,
    wave_reached INTEGER NOT NULL,
    clear_time_ms INTEGER NOT NULL,
    total_parries INTEGER NOT NULL,
    posture_breaks INTEGER NOT NULL,
    damage_dealt INTEGER NOT NULL,
    damage_taken INTEGER NOT NULL,
    score INTEGER NOT NULL,
    verified INTEGER NOT NULL DEFAULT 1,
    scorecard_emoji TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_arena_runs_seed_score ON arena_runs (seed, score DESC);
`);

export interface ArenaRunRecord {
  id: string;
  callsign: string;
  seed: string;
  fighter_class: string;
  waves_cleared: number;
  wave_reached: number;
  clear_time_ms: number;
  total_parries: number;
  posture_breaks: number;
  damage_dealt: number;
  damage_taken: number;
  score: number;
  verified: number;
  scorecard_emoji: string;
  created_at: number;
}

export function insertArenaRun(run: ArenaRunRecord) {
  const stmt = db.prepare(`
    INSERT INTO arena_runs (
      id, callsign, seed, fighter_class, waves_cleared, wave_reached,
      clear_time_ms, total_parries, posture_breaks, damage_dealt,
      damage_taken, score, verified, scorecard_emoji, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    run.id,
    run.callsign,
    run.seed,
    run.fighter_class,
    run.waves_cleared,
    run.wave_reached,
    run.clear_time_ms,
    run.total_parries,
    run.posture_breaks,
    run.damage_dealt,
    run.damage_taken,
    run.score,
    run.verified,
    run.scorecard_emoji,
    run.created_at
  );
}

export function getLeaderboard(seed?: string, limit = 50): ArenaRunRecord[] {
  if (seed) {
    const stmt = db.prepare(`
      SELECT * FROM arena_runs
      WHERE seed = ?
      ORDER BY score DESC, clear_time_ms ASC
      LIMIT ?
    `);
    return stmt.all(seed, limit) as unknown as ArenaRunRecord[];
  }

  const stmt = db.prepare(`
    SELECT * FROM arena_runs
    ORDER BY score DESC, clear_time_ms ASC
    LIMIT ?
  `);
  return stmt.all(limit) as unknown as ArenaRunRecord[];
}
