import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'virtual_pet.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    mood TEXT NOT NULL,
    hunger REAL NOT NULL,
    hygiene REAL NOT NULL,
    happiness REAL NOT NULL,
    energy REAL NOT NULL,
    age_days REAL NOT NULL,
    experience INTEGER NOT NULL,
    waste_count INTEGER NOT NULL,
    is_sleeping INTEGER NOT NULL,
    sugar_intake REAL NOT NULL,
    protein_intake REAL NOT NULL,
    hygiene_care_avg REAL NOT NULL,
    play_discipline_ratio REAL NOT NULL,
    born_at TEXT NOT NULL,
    last_tick_at TEXT NOT NULL,
    lineage_json TEXT NOT NULL,
    care_actions_total INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inventory (
    pet_id TEXT NOT NULL,
    food_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (pet_id, food_id)
  );

  CREATE TABLE IF NOT EXISTS seed_vault (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    donor_pet_name TEXT NOT NULL,
    donor_species TEXT NOT NULL,
    rarity TEXT NOT NULL,
    traits_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS care_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL
  );
`);

console.log('[SQLite] Database initialized at', DB_PATH);
