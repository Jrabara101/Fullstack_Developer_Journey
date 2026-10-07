export type SaveType = 'manual' | 'auto' | 'quicksave' | 'milestone';

export interface PlayerProgressSummary {
  characterName: string;
  level: number;
  currentChapter: string;
  currentLocation: string;
  playtimeSeconds: number;
  completionPercentage: number;
  hp: number;
  maxHp: number;
  gold: number;
}

export interface SaveMetadata {
  slotId: string;
  slotIndex: number;
  saveType: SaveType;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  checksum: string;  // SHA-256
  isLocked: boolean; // Prevents accidental overwrite/deletion
  version: string;   // e.g. "1.2.0"
  thumbnailUrl: string; // Compressed Base64 image
  summary: PlayerProgressSummary;
  // Vector clock / monotonic counter for sync delta reconciliation
  vectorClock?: number;
  isCorrupted?: boolean;
}

export interface GameSavePayload {
  metadata: SaveMetadata;
  worldState: Record<string, unknown>;
  inventory: Record<string, unknown>;
  questJournal: Record<string, unknown>;
}

export interface SaveSystemState {
  slots: Record<string, SaveMetadata>;
  activeSlotId: string | null;
  storageUsageBytes: number;
  maxStorageQuotaBytes: number;
  cloudSyncStatus: 'synced' | 'pending' | 'offline' | 'conflict';
  isAutoSaveEnabled: boolean;
  autoSaveIntervalMinutes: number;
}

export type SaveMachineStatus =
  | 'IDLE'
  | 'SAVING'
  | 'LOADING'
  | 'SYNCING'
  | 'CONFLICT_DETECTED'
  | 'CORRUPTED';

export interface SyncConflictPayload {
  slotId: string;
  localSave: GameSavePayload;
  cloudSave: GameSavePayload;
}
