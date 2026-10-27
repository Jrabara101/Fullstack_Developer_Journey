import { StoryCartridge, EngineRuntimeState } from '../types/engine';

const CARTRIDGE_STORAGE_KEY = 'tae_cartridge_active';
const RUNTIME_STORAGE_KEY = 'tae_runtime_state';
const SAVED_CARTRIDGES_KEY = 'tae_custom_cartridges';

export const storage = {
  saveActiveCartridge(cartridge: StoryCartridge): void {
    try {
      localStorage.setItem(CARTRIDGE_STORAGE_KEY, JSON.stringify(cartridge));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  loadActiveCartridge(): StoryCartridge | null {
    try {
      const data = localStorage.getItem(CARTRIDGE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveRuntimeState(state: Partial<EngineRuntimeState>): void {
    try {
      // Save serializable properties
      const payload = {
        currentRoomId: state.currentRoomId,
        visitedRoomIds: state.visitedRoomIds,
        inventoryIds: state.inventoryIds,
        flags: state.flags,
        variables: state.variables,
        turnCount: state.turnCount,
        narrativeLog: state.narrativeLog,
      };
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Runtime save failed:', e);
    }
  },

  loadRuntimeState(): Partial<EngineRuntimeState> | null {
    try {
      const data = localStorage.getItem(RUNTIME_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearRuntimeState(): void {
    try {
      localStorage.removeItem(RUNTIME_STORAGE_KEY);
    } catch {}
  },
};
