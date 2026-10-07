import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GameSavePayload,
  SaveMetadata,
  SaveMachineStatus,
  SaveType,
  SyncConflictPayload,
  PlayerProgressSummary
} from '../types/save';
import {
  getLocalMetadataIndex,
  getLocalSavePayload,
  writeLocalSavePayload,
  deleteLocalSavePayload,
  computeStorageUsage,
  getNextAutoSaveSlot,
  auditSaveIntegrity,
  seedInitialDemoSaves
} from '../lib/storage';
import { calculateSha256, encodeSaveCapsule, decodeSaveCapsule } from '../lib/crypto';
import { captureCanvasSnapshot } from '../lib/snapshot';
import { sfx } from '../sounds/sfx';

export interface UseSaveLoadManagerReturn {
  slots: Record<string, SaveMetadata>;
  activeSlotId: string | null;
  status: SaveMachineStatus;
  lastError: string | null;
  storageUsage: { usedBytes: number; quotaBytes: number };
  cloudSyncStatus: 'synced' | 'pending' | 'offline' | 'conflict';
  conflictPayload: SyncConflictPayload | null;
  activeGamePayload: GameSavePayload;
  isAutoSaveEnabled: boolean;
  toggleAutoSave: () => void;
  quickSave: (sourceCanvas?: HTMLCanvasElement | null) => Promise<void>;
  quickLoad: () => Promise<GameSavePayload | null>;
  saveGame: (
    slotId?: string,
    saveType?: SaveType,
    customTitle?: string,
    sourceCanvas?: HTMLCanvasElement | null,
    overrideState?: Partial<GameSavePayload>
  ) => Promise<string>;
  loadGame: (slotId: string) => Promise<GameSavePayload | null>;
  deleteSave: (slotId: string) => Promise<void>;
  toggleLock: (slotId: string) => Promise<void>;
  forkTimeline: (slotId: string, branchName?: string) => Promise<string>;
  syncWithCloud: () => Promise<void>;
  resolveConflict: (slotId: string, resolution: 'keep_local' | 'keep_cloud' | 'fork_both') => Promise<void>;
  triggerDisasterRollback: () => Promise<GameSavePayload | null>;
  simulateSaveCorruption: (slotId: string) => Promise<void>;
  exportSaveCapsuleString: (slotId: string) => Promise<string>;
  importSaveCapsuleString: (capsuleStr: string) => Promise<string>;
  updateActiveGamePlayer: (summaryUpdate: Partial<PlayerProgressSummary>, worldUpdate?: Record<string, any>) => void;
}

const DEFAULT_GAME_STATE: GameSavePayload = {
  metadata: {
    slotId: 'quicksave_0',
    slotIndex: 0,
    saveType: 'quicksave',
    title: 'Active Field Agent Session',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checksum: '',
    isLocked: false,
    version: '1.2.0',
    thumbnailUrl: '',
    vectorClock: 1,
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
    alarmTriggered: false,
    sectorSecurity: 'Yellow Alert',
    hackNodesCompleted: 12,
    playerCoordinates: { x: 420, y: 180 }
  },
  inventory: {
    weapons: ['Plasma Carbine MK-IV', 'Cryo-Dagger', 'EMP Disruptor'],
    armor: 'Chameleon Nanite Mesh',
    nanites: 45,
    medkits: 6
  },
  questJournal: {
    primaryObjective: 'Infiltrate Core Cryo-Chamber',
    stage: 'Deck 4 Ventilation Bypass',
    objectivesCompleted: 5
  }
};

export function useSaveLoadManager(): UseSaveLoadManagerReturn {
  const [slots, setSlots] = useState<Record<string, SaveMetadata>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>('quicksave_0');
  const [status, setStatus] = useState<SaveMachineStatus>('IDLE');
  const [lastError, setLastError] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'pending' | 'offline' | 'conflict'>('synced');
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 1240000, quotaBytes: 5242880 });
  const [conflictPayload, setConflictPayload] = useState<SyncConflictPayload | null>(null);
  const [activeGamePayload, setActiveGamePayload] = useState<GameSavePayload>(DEFAULT_GAME_STATE);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and load local index
  const refreshStorageAndSlots = useCallback(async () => {
    try {
      let index = await getLocalMetadataIndex();
      if (Object.keys(index).length === 0) {
        index = await seedInitialDemoSaves();
      }
      setSlots(index);
      const usage = await computeStorageUsage();
      setStorageUsage(usage);
    } catch (err: any) {
      console.error('Failed refreshing storage:', err);
    }
  }, []);

  useEffect(() => {
    refreshStorageAndSlots();
  }, [refreshStorageAndSlots]);

  // Update live game player summary
  const updateActiveGamePlayer = useCallback((
    summaryUpdate: Partial<PlayerProgressSummary>,
    worldUpdate?: Record<string, any>
  ) => {
    setActiveGamePayload(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        summary: {
          ...prev.metadata.summary,
          ...summaryUpdate
        }
      },
      worldState: worldUpdate ? { ...prev.worldState, ...worldUpdate } : prev.worldState
    }));
  }, []);

  // Periodic playtime ticker for live game session
  useEffect(() => {
    const ticker = setInterval(() => {
      setActiveGamePayload(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          summary: {
            ...prev.metadata.summary,
            playtimeSeconds: prev.metadata.summary.playtimeSeconds + 1
          }
        }
      }));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Commit save to Local-First IndexedDB and initiate background sync
  const saveGame = useCallback(async (
    targetSlotId?: string,
    saveType: SaveType = 'manual',
    customTitle?: string,
    sourceCanvas?: HTMLCanvasElement | null,
    overrideState?: Partial<GameSavePayload>
  ): Promise<string> => {
    setStatus('SAVING');
    setLastError(null);
    try {
      // 1. Determine slot ID
      let slotId = targetSlotId;
      if (!slotId) {
        if (saveType === 'auto') {
          const index = await getLocalMetadataIndex();
          slotId = getNextAutoSaveSlot(index);
        } else if (saveType === 'quicksave') {
          slotId = 'quicksave_0';
        } else {
          // Find first open manual slot or create timestamped manual slot
          const index = await getLocalMetadataIndex();
          const existingManuals = Object.keys(index).filter(k => k.startsWith('manual_'));
          slotId = `manual_${existingManuals.length + 1}`;
        }
      }

      // 2. Generate crisp 320x180 thumbnail
      const currentBiome = (overrideState?.worldState?.biome || activeGamePayload.worldState?.biome || 'orbital_colony') as any;
      const thumb = await captureCanvasSnapshot(sourceCanvas, {
        characterName: activeGamePayload.metadata.summary.characterName,
        level: activeGamePayload.metadata.summary.level,
        chapter: activeGamePayload.metadata.summary.currentChapter,
        location: activeGamePayload.metadata.summary.currentLocation,
        biome: currentBiome
      });

      // 3. Assemble payload
      const baseState = {
        worldState: overrideState?.worldState || activeGamePayload.worldState,
        inventory: overrideState?.inventory || activeGamePayload.inventory,
        questJournal: overrideState?.questJournal || activeGamePayload.questJournal
      };

      const checksum = await calculateSha256(baseState);
      const nowIso = new Date().toISOString();

      const existingMeta = slots[slotId];
      if (existingMeta && existingMeta.isLocked && !overrideState?.metadata?.isLocked) {
        throw new Error('This slot is a Protected Milestone. Unlock it to overwrite.');
      }

      const nextVectorClock = (existingMeta?.vectorClock || 0) + 1;
      const title = customTitle || (
        saveType === 'quicksave' ? 'Quick Save // Tactical Point' :
        saveType === 'auto' ? `Auto-Save // ${activeGamePayload.metadata.summary.currentLocation}` :
        `Manual Save // ${activeGamePayload.metadata.summary.currentChapter}`
      );

      const newMetadata: SaveMetadata = {
        slotId,
        slotIndex: existingMeta?.slotIndex ?? Object.keys(slots).length + 1,
        saveType,
        title,
        createdAt: existingMeta?.createdAt || nowIso,
        updatedAt: nowIso,
        checksum,
        isLocked: overrideState?.metadata?.isLocked ?? (existingMeta?.isLocked || false),
        version: '1.2.0',
        thumbnailUrl: thumb,
        vectorClock: nextVectorClock,
        summary: {
          ...activeGamePayload.metadata.summary,
          ...(overrideState?.metadata?.summary || {})
        }
      };

      const finalPayload: GameSavePayload = {
        metadata: newMetadata,
        ...baseState
      };

      // 4. Sub-millisecond Local-First Write to IndexedDB
      await writeLocalSavePayload(finalPayload);
      setActiveSlotId(slotId);
      sfx.playSaveCommit();

      // Refresh slots
      await refreshStorageAndSlots();
      setStatus('IDLE');
      setCloudSyncStatus('pending');

      // 5. Silent background cloud sync negotiation
      setTimeout(() => {
        syncSingleSlotToCloud(finalPayload).catch(err => {
          console.warn('Background cloud sync failed (offline fallback):', err.message);
          setCloudSyncStatus('offline');
        });
      }, 500);

      return slotId;
    } catch (err: any) {
      console.error('Save failed:', err);
      setStatus('IDLE');
      setLastError(err.message || 'Failed to persist save checkpoint.');
      sfx.playAlert();
      throw err;
    }
  }, [activeGamePayload, slots, refreshStorageAndSlots]);

  // Sync single slot to Fastify cloud backend
  const syncSingleSlotToCloud = async (payload: GameSavePayload) => {
    try {
      const res = await fetch(`/api/saves/${payload.metadata.slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setCloudSyncStatus('synced');
        sfx.playSyncSuccess();
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 423) {
          // Locked milestone
          console.warn('Cloud slot is locked on server.');
        } else {
          setCloudSyncStatus('offline');
        }
      }
    } catch {
      setCloudSyncStatus('offline');
    }
  };

  // Quick Save [F5] shortcut
  const quickSave = useCallback(async (sourceCanvas?: HTMLCanvasElement | null) => {
    await saveGame('quicksave_0', 'quicksave', 'Quick Save // Tactical Point', sourceCanvas);
  }, [saveGame]);

  // Load Game by Slot ID
  const loadGame = useCallback(async (slotId: string): Promise<GameSavePayload | null> => {
    setStatus('LOADING');
    setLastError(null);
    try {
      const payload = await getLocalSavePayload(slotId);
      if (!payload) {
        throw new Error(`Save slot [${slotId}] not found in local memory vaults.`);
      }

      // Checksum integrity audit
      const audit = await auditSaveIntegrity(payload);
      if (!audit.valid) {
        setStatus('CORRUPTED');
        setLastError(`Corruption Detected in slot [${slotId}]. Checksum mismatch.`);
        sfx.playAlert();
        return null;
      }

      setActiveGamePayload(payload);
      setActiveSlotId(slotId);
      sfx.playSyncSuccess();
      setStatus('IDLE');
      return payload;
    } catch (err: any) {
      setStatus('IDLE');
      setLastError(err.message || 'Failed to load save file.');
      sfx.playAlert();
      return null;
    }
  }, []);

  // Quick Load [F9] shortcut
  const quickLoad = useCallback(async (): Promise<GameSavePayload | null> => {
    return await loadGame('quicksave_0');
  }, [loadGame]);

  // Delete Save
  const deleteSave = useCallback(async (slotId: string) => {
    try {
      const meta = slots[slotId];
      if (meta && meta.isLocked) {
        throw new Error('Slot is protected as a Milestone Branch. Unlock before purging.');
      }

      await deleteLocalSavePayload(slotId);
      await refreshStorageAndSlots();

      // Cloud deletion attempt
      fetch(`/api/saves/${slotId}`, { method: 'DELETE' }).catch(() => {});
      sfx.playClick();
    } catch (err: any) {
      setLastError(err.message || 'Failed to purge slot.');
      sfx.playAlert();
      throw err;
    }
  }, [slots, refreshStorageAndSlots]);

  // Milestone Lock Toggle
  const toggleLock = useCallback(async (slotId: string) => {
    try {
      const payload = await getLocalSavePayload(slotId);
      if (!payload) return;

      const willBeLocked = !payload.metadata.isLocked;
      payload.metadata.isLocked = willBeLocked;
      if (willBeLocked && payload.metadata.saveType === 'auto') {
        // Elevate auto-save to protected milestone so rolling auto-saves will never recycle it!
        payload.metadata.saveType = 'milestone';
        payload.metadata.title = `Milestone: ${payload.metadata.title}`;
      }

      await writeLocalSavePayload(payload);
      await refreshStorageAndSlots();
      sfx.playLockSnap(willBeLocked);

      // Inform cloud
      syncSingleSlotToCloud(payload).catch(() => {});
    } catch (err: any) {
      setLastError(err.message || 'Failed to update lock state.');
    }
  }, [refreshStorageAndSlots]);

  // Branch / Timeline Fork
  const forkTimeline = useCallback(async (slotId: string, branchName?: string): Promise<string> => {
    try {
      const source = await getLocalSavePayload(slotId);
      if (!source) throw new Error('Source save file not found.');

      const newSlotId = `branch_${Date.now().toString(36)}`;
      const newTitle = branchName || `Timeline Fork: ${source.metadata.title}`;

      const branchedPayload: GameSavePayload = {
        ...source,
        metadata: {
          ...source.metadata,
          slotId: newSlotId,
          saveType: 'milestone',
          title: newTitle,
          isLocked: true, // Auto-protect forks
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vectorClock: 1
        }
      };

      await writeLocalSavePayload(branchedPayload);
      await refreshStorageAndSlots();
      sfx.playSyncSuccess();
      return newSlotId;
    } catch (err: any) {
      setLastError(err.message || 'Timeline fork creation failed.');
      sfx.playAlert();
      throw err;
    }
  }, [refreshStorageAndSlots]);

  // Comprehensive Cloud Sync with Delta Reconciler
  const syncWithCloud = useCallback(async () => {
    setStatus('SYNCING');
    try {
      const localIndex = await getLocalMetadataIndex();
      const res = await fetch('/api/saves/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localSlots: localIndex })
      });

      if (!res.ok) {
        setCloudSyncStatus('offline');
        setStatus('IDLE');
        return;
      }

      const syncResult = await res.json();

      if (syncResult.hasConflicts && syncResult.conflicts.length > 0) {
        const firstConflict = syncResult.conflicts[0];
        const localSaveFull = await getLocalSavePayload(firstConflict.slotId);
        if (localSaveFull) {
          setConflictPayload({
            slotId: firstConflict.slotId,
            localSave: localSaveFull,
            cloudSave: firstConflict.cloudSave
          });
          setCloudSyncStatus('conflict');
          setStatus('CONFLICT_DETECTED');
          sfx.playAlert();
          return;
        }
      }

      // Upload local saves that cloud lacks
      if (syncResult.actions?.needsUpload?.length > 0) {
        for (const slotId of syncResult.actions.needsUpload) {
          const payload = await getLocalSavePayload(slotId);
          if (payload) {
            await fetch(`/api/saves/${slotId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }
      }

      // Download cloud saves that client lacks
      if (syncResult.actions?.needsDownload?.length > 0) {
        for (const item of syncResult.actions.needsDownload) {
          const cloudRes = await fetch(`/api/saves/${item.slotId}`);
          if (cloudRes.ok) {
            const data = await cloudRes.json();
            if (data.save) {
              await writeLocalSavePayload(data.save);
            }
          }
        }
      }

      await refreshStorageAndSlots();
      setCloudSyncStatus('synced');
      setStatus('IDLE');
      sfx.playSyncSuccess();
    } catch (err) {
      console.warn('Sync failed:', err);
      setCloudSyncStatus('offline');
      setStatus('IDLE');
    }
  }, [refreshStorageAndSlots]);

  // Conflict Resolution
  const resolveConflict = useCallback(async (
    slotId: string,
    resolution: 'keep_local' | 'keep_cloud' | 'fork_both'
  ) => {
    if (!conflictPayload) return;

    try {
      if (resolution === 'keep_local') {
        // Force local state to cloud
        await fetch(`/api/saves/${slotId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...conflictPayload.localSave, metadata: { ...conflictPayload.localSave.metadata, forceOverwrite: true } })
        });
      } else if (resolution === 'keep_cloud') {
        // Overwrite local with cloud
        await writeLocalSavePayload(conflictPayload.cloudSave);
      } else if (resolution === 'fork_both') {
        // Keep cloud in existing slot, fork local into a new branch
        await writeLocalSavePayload(conflictPayload.cloudSave);
        const branchId = `divergent_${Date.now().toString(36)}`;
        const branched = {
          ...conflictPayload.localSave,
          metadata: {
            ...conflictPayload.localSave.metadata,
            slotId: branchId,
            title: `Fork (Local): ${conflictPayload.localSave.metadata.title}`,
            isLocked: true
          }
        };
        await writeLocalSavePayload(branched);
        await fetch(`/api/saves/${branchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(branched)
        });
      }

      setConflictPayload(null);
      setStatus('IDLE');
      setCloudSyncStatus('synced');
      await refreshStorageAndSlots();
      sfx.playSyncSuccess();
    } catch (err: any) {
      setLastError(err.message || 'Conflict resolution error');
      sfx.playAlert();
    }
  }, [conflictPayload, refreshStorageAndSlots]);

  // Disaster Recovery: Automatic Rollback to Triple-Buffer Auto-Save Stack
  const triggerDisasterRollback = useCallback(async (): Promise<GameSavePayload | null> => {
    try {
      const index = await getLocalMetadataIndex();
      // Look through auto-saves and manual saves for most recent uncorrupted
      const candidates = Object.values(index).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      for (const cand of candidates) {
        const payload = await getLocalSavePayload(cand.slotId);
        if (payload) {
          const audit = await auditSaveIntegrity(payload);
          if (audit.valid) {
            setActiveGamePayload(payload);
            setActiveSlotId(payload.metadata.slotId);
            setStatus('IDLE');
            setLastError(null);
            sfx.playSyncSuccess();
            return payload;
          }
        }
      }

      throw new Error('No uncorrupted restoration points found in rolling backup stack.');
    } catch (err: any) {
      setLastError(err.message || 'Rollback failed.');
      sfx.playAlert();
      return null;
    }
  }, []);

  // Simulate Save Corruption for live testing and demonstration
  const simulateSaveCorruption = useCallback(async (slotId: string) => {
    const payload = await getLocalSavePayload(slotId);
    if (!payload) return;

    // Tamper with checksum or state without updating checksum
    payload.metadata.checksum = 'deadbeef_tampered_corrupted_hash';
    await writeLocalSavePayload(payload);
    await refreshStorageAndSlots();
    setStatus('CORRUPTED');
    setLastError(`Tamper Alert: Integrity check failed on slot [${slotId}]!`);
    sfx.playAlert();
  }, [refreshStorageAndSlots]);

  // Export Save Capsule string
  const exportSaveCapsuleString = useCallback(async (slotId: string): Promise<string> => {
    const payload = await getLocalSavePayload(slotId);
    if (!payload) throw new Error('Save file not found.');
    return encodeSaveCapsule(payload);
  }, []);

  // Import Save Capsule string
  const importSaveCapsuleString = useCallback(async (capsuleStr: string): Promise<string> => {
    try {
      const payload = decodeSaveCapsule(capsuleStr);
      // Generate new slot ID to avoid collisions
      const importedSlotId = `import_${Date.now().toString(36)}`;
      payload.metadata.slotId = importedSlotId;
      payload.metadata.title = `[Imported] ${payload.metadata.title}`;
      payload.metadata.updatedAt = new Date().toISOString();

      await writeLocalSavePayload(payload);
      await refreshStorageAndSlots();
      sfx.playSyncSuccess();
      return importedSlotId;
    } catch (err: any) {
      setLastError(err.message || 'Import failed.');
      sfx.playAlert();
      throw err;
    }
  }, [refreshStorageAndSlots]);

  // Auto-Save background cycle (every 3 minutes or configurable)
  useEffect(() => {
    if (!isAutoSaveEnabled) {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      return;
    }

    autoSaveTimerRef.current = setInterval(() => {
      saveGame(undefined, 'auto').catch(() => {});
    }, 3 * 60 * 1000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isAutoSaveEnabled, saveGame]);

  const toggleAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(prev => !prev);
    sfx.playClick();
  }, []);

  return {
    slots,
    activeSlotId,
    status,
    lastError,
    storageUsage,
    cloudSyncStatus,
    conflictPayload,
    activeGamePayload,
    isAutoSaveEnabled,
    toggleAutoSave,
    quickSave,
    quickLoad,
    saveGame,
    loadGame,
    deleteSave,
    toggleLock,
    forkTimeline,
    syncWithCloud,
    resolveConflict,
    triggerDisasterRollback,
    simulateSaveCorruption,
    exportSaveCapsuleString,
    importSaveCapsuleString,
    updateActiveGamePlayer
  };
}
