import { get, set, del, keys } from 'idb-keyval';
import type { GameSavePayload, SaveMetadata } from '../types/save';
import { calculateSha256 } from './crypto';
import { captureCanvasSnapshot } from './snapshot';

const META_INDEX_KEY = 'vault_save_metadata_index_v1';
const PAYLOAD_PREFIX = 'vault_payload_';
const MAX_QUOTA_BYTES = 5 * 1024 * 1024; // 5.0 MB standard game vault quota

export async function getLocalMetadataIndex(): Promise<Record<string, SaveMetadata>> {
  try {
    const raw = await get<Record<string, SaveMetadata>>(META_INDEX_KEY);
    return raw || {};
  } catch (err) {
    console.error('Error reading metadata index:', err);
    return {};
  }
}

export async function saveLocalMetadataIndex(index: Record<string, SaveMetadata>): Promise<void> {
  await set(META_INDEX_KEY, index);
}

export async function getLocalSavePayload(slotId: string): Promise<GameSavePayload | null> {
  try {
    const payload = await get<GameSavePayload>(`${PAYLOAD_PREFIX}${slotId}`);
    return payload || null;
  } catch (err) {
    console.error(`Error reading payload for slot ${slotId}:`, err);
    return null;
  }
}

export async function writeLocalSavePayload(payload: GameSavePayload): Promise<void> {
  const slotId = payload.metadata.slotId;
  await set(`${PAYLOAD_PREFIX}${slotId}`, payload);
  
  // Update index
  const index = await getLocalMetadataIndex();
  index[slotId] = payload.metadata;
  await saveLocalMetadataIndex(index);
}

export async function deleteLocalSavePayload(slotId: string): Promise<void> {
  await del(`${PAYLOAD_PREFIX}${slotId}`);
  const index = await getLocalMetadataIndex();
  delete index[slotId];
  await saveLocalMetadataIndex(index);
}

export async function computeStorageUsage(): Promise<{ usedBytes: number; quotaBytes: number }> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      return { usedBytes: Math.min(used, MAX_QUOTA_BYTES), quotaBytes: MAX_QUOTA_BYTES };
    }
  } catch {
    // Fallback to in-memory approximation
  }

  // Calculate approximate string size in index & payloads
  const allKeys = await keys();
  let totalBytes = 0;
  for (const k of allKeys) {
    const val = await get(k);
    if (val) {
      totalBytes += JSON.stringify(val).length * 2;
    }
  }
  return { usedBytes: totalBytes, quotaBytes: MAX_QUOTA_BYTES };
}

/**
 * Triple-Buffer Rolling Auto-Save Stack:
 * Chooses next slot among auto_1, auto_2, auto_3 based on oldest timestamp
 */
export function getNextAutoSaveSlot(index: Record<string, SaveMetadata>): string {
  const autoSlots = ['auto_1', 'auto_2', 'auto_3'];
  let oldestSlot = autoSlots[0];
  let oldestTime = Infinity;

  for (const id of autoSlots) {
    const slot = index[id];
    if (!slot) return id; // Empty slot found
    // If locked, skip from rolling overwrite
    if (slot.isLocked) continue;

    const time = new Date(slot.updatedAt).getTime();
    if (time < oldestTime) {
      oldestTime = time;
      oldestSlot = id;
    }
  }

  return oldestSlot;
}

/**
 * Verifies integrity of a save file against its SHA-256 hash.
 */
export async function auditSaveIntegrity(payload: GameSavePayload): Promise<{ valid: boolean; calculatedHash: string }> {
  const stateToHash = {
    worldState: payload.worldState || {},
    inventory: payload.inventory || {},
    questJournal: payload.questJournal || {}
  };
  const calculatedHash = await calculateSha256(stateToHash);
  return {
    valid: payload.metadata.checksum === calculatedHash,
    calculatedHash
  };
}

/**
 * Seed initial realistic demo saves if vault is empty
 */
export async function seedInitialDemoSaves(): Promise<Record<string, SaveMetadata>> {
  const existing = await getLocalMetadataIndex();
  if (Object.keys(existing).length > 0) return existing;

  const now = new Date();
  const demoSaves: GameSavePayload[] = [
    {
      metadata: {
        slotId: 'quicksave_0',
        slotIndex: 0,
        saveType: 'quicksave',
        title: 'Tactical Checkpoint // Orbital Spire',
        createdAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        checksum: '',
        isLocked: false,
        version: '1.2.0',
        thumbnailUrl: '',
        vectorClock: 4,
        summary: {
          characterName: 'Operative Kaelen-07',
          level: 32,
          currentChapter: 'Act III: Shattered Zenith',
          currentLocation: 'Orbital Spire // Relay Deck 4',
          playtimeSeconds: 34 * 3600 + 12 * 60 + 4,
          completionPercentage: 74,
          hp: 840,
          maxHp: 1000,
          gold: 24500
        }
      },
      worldState: {
        biome: 'orbital_colony',
        weather: 'Solar Flare Surge',
        alarmsTriggered: false,
        securityClearance: 'Alpha-9',
        doorNodesHacked: 12
      },
      inventory: {
        weapons: ['Plasma Carbine MK-IV', 'Cryo-Dagger'],
        shields: ['Aegis Reactive Barrier'],
        nanites: 45,
        medkits: 6
      },
      questJournal: {
        activeQuest: 'Infiltrate Core Chamber',
        subtasks: [
          { name: 'Disable perimeter sentry matrix', completed: true },
          { name: 'Extract encrypted biometric key', completed: true },
          { name: 'Override cryo cooling vents', completed: false }
        ]
      }
    },
    {
      metadata: {
        slotId: 'manual_1',
        slotIndex: 1,
        saveType: 'manual',
        title: 'Pre-Boss Decision: The Hadal Core',
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        checksum: '',
        isLocked: true, // Milestone file
        version: '1.2.0',
        thumbnailUrl: '',
        vectorClock: 9,
        summary: {
          characterName: 'Operative Kaelen-07',
          level: 30,
          currentChapter: 'Act II: Hadal Trench',
          currentLocation: 'Sub-Abyssal Cryo-Lab',
          playtimeSeconds: 28 * 3600 + 45 * 60,
          completionPercentage: 62,
          hp: 920,
          maxHp: 950,
          gold: 18200
        }
      },
      worldState: {
        biome: 'deep_trench',
        waterPressureBars: 450,
        reactorState: 'Critical Melt',
        specimenContained: false
      },
      inventory: {
        weapons: ['Arc Cannon', 'Graviton Pulse Pistol'],
        implants: ['Neural Accelerator'],
        oxygenCanisters: 14
      },
      questJournal: {
        activeQuest: 'Confront Arch-Bioformer Vaelen',
        subtasks: [
          { name: 'Seal containment doors', completed: true },
          { name: 'Inject neutralizing phage', completed: false }
        ]
      }
    },
    {
      metadata: {
        slotId: 'auto_1',
        slotIndex: 2,
        saveType: 'auto',
        title: 'Auto-Save // District 9 Slums Entry',
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        checksum: '',
        isLocked: false,
        version: '1.2.0',
        thumbnailUrl: '',
        vectorClock: 2,
        summary: {
          characterName: 'Operative Kaelen-07',
          level: 28,
          currentChapter: 'Act II: The Neon Undercity',
          currentLocation: 'Neo-Shinjuku Slums Alley',
          playtimeSeconds: 22 * 3600 + 10 * 60,
          completionPercentage: 51,
          hp: 750,
          maxHp: 880,
          gold: 12400
        }
      },
      worldState: {
        biome: 'neon_city',
        streetReputation: 'Respected Syndicate Associate',
        bountyLevel: 1
      },
      inventory: {
        weapons: ['Silenced Submachine Gun', 'Stun Baton'],
        creditsChip: 'Encrypted Credstick'
      },
      questJournal: {
        activeQuest: 'Meet the Information Broker',
        subtasks: [
          { name: 'Evade drone patrol', completed: true },
          { name: 'Access back-alley terminal', completed: true }
        ]
      }
    },
    {
      metadata: {
        slotId: 'auto_2',
        slotIndex: 3,
        saveType: 'auto',
        title: 'Auto-Save // Rooftop Extraction Landing',
        createdAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        checksum: '',
        isLocked: false,
        version: '1.2.0',
        thumbnailUrl: '',
        vectorClock: 1,
        summary: {
          characterName: 'Operative Kaelen-07',
          level: 27,
          currentChapter: 'Act I: Breach and Escape',
          currentLocation: 'Corporate Rooftop Helipad',
          playtimeSeconds: 19 * 3600 + 35 * 60,
          completionPercentage: 42,
          hp: 600,
          maxHp: 850,
          gold: 9800
        }
      },
      worldState: {
        biome: 'cyber_citadel',
        weather: 'Acid Rainstorm'
      },
      inventory: {
        weapons: ['Kinetic Revolver'],
        grenades: 2
      },
      questJournal: {
        activeQuest: 'Signal Extraction Gunship',
        subtasks: [
          { name: 'Survive hostile drop-pod wave', completed: true },
          { name: 'Deploy beacon transmitter', completed: true }
        ]
      }
    }
  ];

  const index: Record<string, SaveMetadata> = {};

  for (const save of demoSaves) {
    const biome = save.worldState.biome as any;
    save.metadata.thumbnailUrl = await captureCanvasSnapshot(null, {
      characterName: save.metadata.summary.characterName,
      level: save.metadata.summary.level,
      chapter: save.metadata.summary.currentChapter,
      location: save.metadata.summary.currentLocation,
      biome
    });

    const stateToHash = {
      worldState: save.worldState,
      inventory: save.inventory,
      questJournal: save.questJournal
    };
    save.metadata.checksum = await calculateSha256(stateToHash);

    await set(`${PAYLOAD_PREFIX}${save.metadata.slotId}`, save);
    index[save.metadata.slotId] = save.metadata;
  }

  await saveLocalMetadataIndex(index);
  return index;
}
