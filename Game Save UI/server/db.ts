import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'saves.db');

export const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS cloud_saves (
    slot_id TEXT PRIMARY KEY,
    slot_index INTEGER NOT NULL,
    save_type TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    checksum TEXT NOT NULL,
    is_locked INTEGER NOT NULL DEFAULT 0,
    version TEXT NOT NULL,
    thumbnail_url TEXT,
    summary_json TEXT NOT NULL,
    world_state_json TEXT NOT NULL,
    inventory_json TEXT NOT NULL,
    quest_journal_json TEXT NOT NULL,
    vector_clock INTEGER NOT NULL DEFAULT 1,
    payload_size_bytes INTEGER NOT NULL DEFAULT 0
  );
`);

console.log('[SQLite] Cloud saves database initialized at', dbPath);
