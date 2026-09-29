import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LeaderboardRecord {
  id: string;
  puzzleId: string;
  playerName: string;
  movesUsed: number;
  volumeUsedMl: number;
  volumeEfficiency: number;
  deltaE: number;
  timeElapsedMs: number;
  date: string;
  verified: boolean;
  signature: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed records
const INITIAL_RECORDS: LeaderboardRecord[] = [
  {
    id: 'seed-1',
    puzzleId: 'DAILY-2026-09-27',
    playerName: 'ArchAlchemist',
    movesUsed: 3,
    volumeUsedMl: 14.5,
    volumeEfficiency: 98,
    deltaE: 0.54,
    timeElapsedMs: 38000,
    date: '2026-09-27',
    verified: true,
    signature: 'sig_authoritative_a18f',
  },
  {
    id: 'seed-2',
    puzzleId: 'DAILY-2026-09-27',
    playerName: 'PhotonSeeker',
    movesUsed: 4,
    volumeUsedMl: 16.0,
    volumeEfficiency: 94,
    deltaE: 0.82,
    timeElapsedMs: 45000,
    date: '2026-09-27',
    verified: true,
    signature: 'sig_authoritative_c94d',
  },
  {
    id: 'seed-3',
    puzzleId: 'DAILY-2026-09-27',
    playerName: 'PrismMaster',
    movesUsed: 4,
    volumeUsedMl: 17.5,
    volumeEfficiency: 91,
    deltaE: 1.18,
    timeElapsedMs: 52000,
    date: '2026-09-27',
    verified: true,
    signature: 'sig_authoritative_e22b',
  },
];

class Database {
  private records: LeaderboardRecord[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.records = JSON.parse(raw);
      } else {
        this.records = [...INITIAL_RECORDS];
        this.save();
      }
    } catch {
      this.records = [...INITIAL_RECORDS];
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.records, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // Get high scores for a puzzle, sorted by lowest Delta-E, lowest moves, then shortest time
  public getLeaderboard(puzzleId?: string, limit: number = 20): LeaderboardRecord[] {
    let list = this.records;
    if (puzzleId) {
      list = list.filter((r) => r.puzzleId === puzzleId);
    }
    return list
      .sort((a, b) => {
        if (a.deltaE !== b.deltaE) return a.deltaE - b.deltaE;
        if (a.movesUsed !== b.movesUsed) return a.movesUsed - b.movesUsed;
        return a.timeElapsedMs - b.timeElapsedMs;
      })
      .slice(0, limit);
  }

  // Add validated record with cryptographic signature
  public addRecord(data: Omit<LeaderboardRecord, 'id' | 'signature'>): LeaderboardRecord {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const signInput = `${id}:${data.puzzleId}:${data.deltaE}:${data.movesUsed}`;
    const signature = crypto.createHash('sha256').update(signInput).digest('hex').substring(0, 16);

    const record: LeaderboardRecord = {
      ...data,
      id,
      signature,
    };

    this.records.push(record);
    this.save();
    return record;
  }
}

export const db = new Database();
