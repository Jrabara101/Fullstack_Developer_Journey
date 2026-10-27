import { create } from 'zustand';
import {
  Direction,
  EngineRuntimeState,
  NarrativeLogEntry,
  RoomChoice,
  RoomExit,
  RoomNode,
  StoryCartridge,
  WorldEntity,
} from '../types/engine';
import { CLOCKWORK_OBSERVATORY } from '../data/clockworkObservatory';
import { parseNaturalLanguageCommand, DIRECTION_SYNONYMS } from '../lib/parser';
import { sound } from '../lib/audio';
import { storage } from '../lib/storage';
import { generateId } from '../lib/utils';
import { decodeCartridgeFromUrlHash } from '../lib/urlSeed';

export interface EngineStoreState extends EngineRuntimeState {
  selectedRoomId: string | null;
  canvasPan: { x: number; y: number };
  canvasZoom: number;
  isGodModeOpen: boolean;
  isCartridgeModalOpen: boolean;
  isEntityModalOpen: boolean;
  editingEntityId: string | null;
  isAudioMuted: boolean;
  commandInputShake: boolean;
  autoScrollToBottom: boolean;

  // Mode and view management
  setMode: (mode: 'PLAY' | 'CREATE') => void;
  toggleMode: () => void;
  setSelectedRoomId: (roomId: string | null) => void;
  setCanvasPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;
  setGodModeOpen: (open: boolean) => void;
  setCartridgeModalOpen: (open: boolean) => void;
  setEntityModalOpen: (open: boolean, entityId?: string | null) => void;
  toggleAudioMute: () => void;
  triggerInputShake: () => void;

  // Play Runtime Actions
  submitCommand: (rawInput: string) => void;
  executeEntityAction: (entityId: string, action: string) => void;
  selectChoice: (choice: RoomChoice) => void;
  moveToRoom: (targetRoomId: string, directionUsed?: string) => boolean;
  fastTravel: (targetRoomId: string) => void;
  undoTurn: () => void;
  resetPlayRuntime: () => void;
  loadCartridge: (cartridge: StoryCartridge) => void;

  // God Mode & Creator Actions
  setFlag: (name: string, value: boolean) => void;
  setVariable: (name: string, value: number) => void;
  teleportToRoom: (roomId: string) => void;
  spawnItemInSatchel: (entityId: string) => void;
  removeItemFromSatchel: (entityId: string) => void;
  updateCartridgeMeta: (meta: { title?: string; author?: string; synopsis?: string }) => void;
  updateRoom: (roomId: string, patch: Partial<RoomNode>) => void;
  addRoom: (room?: Partial<RoomNode>) => string;
  deleteRoom: (roomId: string) => void;
  addExit: (fromRoomId: string, exit: RoomExit) => void;
  removeExit: (roomId: string, direction: Direction) => void;
  updateEntity: (entity: WorldEntity) => void;
  deleteEntity: (entityId: string) => void;
}

// Initial state builder
function getInitialCartridge(): StoryCartridge {
  // Check URL hash first
  if (typeof window !== 'undefined' && window.location.hash) {
    const fromUrl = decodeCartridgeFromUrlHash(window.location.hash);
    if (fromUrl) return fromUrl;
  }
  // Check local storage next
  const saved = storage.loadActiveCartridge();
  if (saved && saved.id && saved.rooms && saved.startingRoomId) {
    return saved;
  }
  return CLOCKWORK_OBSERVATORY;
}

const initialCartridge = getInitialCartridge();
const startRoom = initialCartridge.startingRoomId;

// Snapshot generator for Undo
function createSnapshot(state: {
  currentRoomId: string;
  visitedRoomIds: string[];
  inventoryIds: string[];
  flags: Record<string, boolean>;
  variables: Record<string, number>;
  turnCount: number;
  narrativeLog: NarrativeLogEntry[];
  cartridge: StoryCartridge;
}): string {
  return JSON.stringify({
    currentRoomId: state.currentRoomId,
    visitedRoomIds: state.visitedRoomIds,
    inventoryIds: state.inventoryIds,
    flags: state.flags,
    variables: state.variables,
    turnCount: state.turnCount,
    narrativeLog: state.narrativeLog,
    entities: state.cartridge.entities,
    rooms: state.cartridge.rooms,
  });
}

export const useEngineStore = create<EngineStoreState>((set, get) => ({
  mode: 'PLAY',
  cartridge: initialCartridge,
  currentRoomId: startRoom,
  visitedRoomIds: [startRoom],
  inventoryIds: [],
  flags: { ...initialCartridge.initialFlags },
  variables: { ...initialCartridge.initialVariables },
  turnCount: 1,
  narrativeLog: [
    {
      id: generateId('log'),
      turn: 1,
      type: 'DISCOVERY',
      roomTitle: initialCartridge.rooms[startRoom]?.title || 'Observation Point',
      contentMarkup: initialCartridge.rooms[startRoom]?.descriptionMarkup || 'You step into the chamber.',
      timestamp: Date.now(),
    },
  ],
  historyStack: [],

  selectedRoomId: startRoom,
  canvasPan: { x: 80, y: 80 },
  canvasZoom: 1,
  isGodModeOpen: false,
  isCartridgeModalOpen: false,
  isEntityModalOpen: false,
  editingEntityId: null,
  isAudioMuted: false,
  commandInputShake: false,
  autoScrollToBottom: true,

  setMode: (mode) => {
    set({ mode });
  },

  toggleMode: () => {
    const { mode, selectedRoomId, currentRoomId } = get();
    const nextMode = mode === 'PLAY' ? 'CREATE' : 'PLAY';
    sound.playParchmentTap();

    if (nextMode === 'CREATE') {
      // Sync selected room to current player room
      set({ mode: nextMode, selectedRoomId: currentRoomId });
    } else {
      // If a room was selected in studio, teleport playtest to that room
      if (selectedRoomId) {
        set({ mode: nextMode, currentRoomId: selectedRoomId });
      } else {
        set({ mode: nextMode });
      }
    }
  },

  setSelectedRoomId: (roomId) => set({ selectedRoomId: roomId }),

  setCanvasPan: (updater) =>
    set((state) => ({
      canvasPan: typeof updater === 'function' ? updater(state.canvasPan) : updater,
    })),

  setCanvasZoom: (updater) =>
    set((state) => ({
      canvasZoom: Math.max(0.3, Math.min(2.5, typeof updater === 'function' ? updater(state.canvasZoom) : updater)),
    })),

  setGodModeOpen: (open) => set({ isGodModeOpen: open }),
  setCartridgeModalOpen: (open) => set({ isCartridgeModalOpen: open }),
  setEntityModalOpen: (open, entityId = null) =>
    set({ isEntityModalOpen: open, editingEntityId: entityId }),

  toggleAudioMute: () => {
    const isMuted = sound.toggleMute();
    set({ isAudioMuted: isMuted });
  },

  triggerInputShake: () => {
    set({ commandInputShake: true });
    sound.playShudder();
    setTimeout(() => {
      set({ commandInputShake: false });
    }, 380);
  },

  // Submit player command
  submitCommand: (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const state = get();
    const currentRoom = state.cartridge.rooms[state.currentRoomId];
    if (!currentRoom) return;

    // Save current state snapshot before executing action
    const snapshot = createSnapshot(state);
    const nextHistory = [...state.historyStack.slice(-19), snapshot]; // keep up to 20 turns

    const parsed = parseNaturalLanguageCommand(
      trimmed,
      currentRoom,
      state.cartridge,
      state.inventoryIds
    );

    // Echo player's command in narrative log
    const commandEchoEntry: NarrativeLogEntry = {
      id: generateId('echo'),
      turn: state.turnCount,
      type: 'COMMAND_ECHO',
      contentMarkup: `> ${trimmed}`,
      timestamp: Date.now(),
    };

    if (!parsed.isValid) {
      state.triggerInputShake();
      const errorEntry: NarrativeLogEntry = {
        id: generateId('err'),
        turn: state.turnCount,
        type: 'ERROR',
        contentMarkup: `[shake]${parsed.errorMessage || "Unknown command."}[/shake]`,
        timestamp: Date.now(),
      };
      set({
        narrativeLog: [...state.narrativeLog, commandEchoEntry, errorEntry],
      });
      return;
    }

    // Process valid commands
    switch (parsed.normalizedAction) {
      case 'ACTION_GO': {
        const dir = parsed.matchedExitDirection;
        if (!dir) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `[shake]Which direction? Available: ${currentRoom.exits.map(e => e.direction.toUpperCase()).join(', ')}[/shake]`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        const exit = currentRoom.exits.find((e) => e.direction === dir);
        if (!exit) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `There is no path leading **${dir}** from here.`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        // Check if exit is locked
        if (exit.isLocked) {
          // Check unlock conditions
          let canUnlock = false;
          if (exit.unlockCondition) {
            const hasRequiredItems = exit.unlockCondition.requiredItems
              ? exit.unlockCondition.requiredItems.every((item) => state.inventoryIds.includes(item))
              : true;
            const hasRequiredFlags = exit.unlockCondition.requiredFlags
              ? exit.unlockCondition.requiredFlags.every((flag) => state.flags[flag])
              : true;
            canUnlock = hasRequiredItems && hasRequiredFlags;
          }

          if (!canUnlock) {
            state.triggerInputShake();
            set({
              narrativeLog: [
                ...state.narrativeLog,
                commandEchoEntry,
                {
                  id: generateId('log'),
                  turn: state.turnCount,
                  type: 'ERROR',
                  contentMarkup: `[shake]The way ${dir} is locked![/shake] ${exit.lockDescription || 'You lack the key or prerequisite.'}`,
                  timestamp: Date.now(),
                },
              ],
            });
            return;
          }
        }

        // Move to target room
        const targetRoom = state.cartridge.rooms[exit.targetRoomId];
        if (!targetRoom) return;

        sound.playDiscoveryChime();
        const nextTurn = state.turnCount + 1;
        const nextVisited = state.visitedRoomIds.includes(targetRoom.id)
          ? state.visitedRoomIds
          : [...state.visitedRoomIds, targetRoom.id];

        const roomEntry: NarrativeLogEntry = {
          id: generateId('log'),
          turn: nextTurn,
          type: 'DISCOVERY',
          roomTitle: targetRoom.title,
          contentMarkup: targetRoom.descriptionMarkup,
          timestamp: Date.now(),
        };

        set({
          turnCount: nextTurn,
          currentRoomId: targetRoom.id,
          visitedRoomIds: nextVisited,
          historyStack: nextHistory,
          narrativeLog: [...state.narrativeLog, commandEchoEntry, roomEntry],
        });
        break;
      }

      case 'ACTION_LOOK': {
        sound.playParchmentTap();
        const lookEntry: NarrativeLogEntry = {
          id: generateId('log'),
          turn: state.turnCount,
          type: 'PROSE',
          roomTitle: currentRoom.title,
          contentMarkup: currentRoom.descriptionMarkup,
          timestamp: Date.now(),
        };
        set({
          narrativeLog: [...state.narrativeLog, commandEchoEntry, lookEntry],
        });
        break;
      }

      case 'ACTION_INVENTORY': {
        sound.playParchmentTap();
        const items = state.inventoryIds
          .map((id) => state.cartridge.entities[id])
          .filter(Boolean);
        const invMarkup =
          items.length > 0
            ? `**In your satchel:**\n${items.map((i) => `• [[${i.name}|id:${i.id}]] — *${i.description}*`).join('\n')}`
            : 'Your satchel is empty.';

        set({
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'PROSE',
              contentMarkup: invMarkup,
              timestamp: Date.now(),
            },
          ],
        });
        break;
      }

      case 'ACTION_HELP': {
        sound.playParchmentTap();
        const helpMarkup = `**Available Commands:**
• **Navigation:** \`go north\`, \`n\`, \`south\`, \`east\`, \`west\`, \`up\`, \`down\`
• **Observation:** \`look\`, \`examine <item>\`, \`read <book>\`
• **Interaction:** \`take <item>\`, \`use <item>\`, \`combine <item> with <item>\`
• **Information:** \`inventory\` (or \`i\`), \`help\`
• **Tactile Mode:** Click any highlighted [[cyan word]] directly inside the prose for instant contextual verb pills!`;

        set({
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'SYSTEM',
              contentMarkup: helpMarkup,
              timestamp: Date.now(),
            },
          ],
        });
        break;
      }

      case 'ACTION_INSPECT': {
        const entityId = parsed.matchedEntityId;
        if (!entityId) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `You do not see '${parsed.directObject}' here.`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        const entity = state.cartridge.entities[entityId];
        sound.playParchmentTap();
        const inspectEntry: NarrativeLogEntry = {
          id: generateId('log'),
          turn: state.turnCount,
          type: 'PROSE',
          contentMarkup: `**${entity.name}:** ${entity.onInspectText || entity.description}`,
          timestamp: Date.now(),
        };

        set({
          narrativeLog: [...state.narrativeLog, commandEchoEntry, inspectEntry],
        });
        break;
      }

      case 'ACTION_TAKE': {
        const entityId = parsed.matchedEntityId;
        if (!entityId || !currentRoom.entityIds.includes(entityId)) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `There is no '${parsed.directObject}' here to take.`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        const entity = state.cartridge.entities[entityId];
        if (!entity.isTakeable) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `The ${entity.name} is too large, fixed, or unyielding to take.`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        // Take item
        sound.playPickup();
        const nextRoomEntityIds = currentRoom.entityIds.filter((id) => id !== entityId);
        const updatedRooms = {
          ...state.cartridge.rooms,
          [currentRoom.id]: {
            ...currentRoom,
            entityIds: nextRoomEntityIds,
          },
        };

        set({
          historyStack: nextHistory,
          inventoryIds: [...state.inventoryIds, entityId],
          cartridge: {
            ...state.cartridge,
            rooms: updatedRooms,
          },
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'PROSE',
              contentMarkup: `[gold]You take the ${entity.name} and stow it securely into your satchel.[/gold]`,
              timestamp: Date.now(),
            },
          ],
        });
        break;
      }

      case 'ACTION_USE': {
        const entityId = parsed.matchedEntityId;
        if (!entityId) {
          state.triggerInputShake();
          set({
            narrativeLog: [
              ...state.narrativeLog,
              commandEchoEntry,
              {
                id: generateId('log'),
                turn: state.turnCount,
                type: 'ERROR',
                contentMarkup: `You do not have or see '${parsed.directObject}' to use.`,
                timestamp: Date.now(),
              },
            ],
          });
          return;
        }

        const entity = state.cartridge.entities[entityId];
        sound.playDiscoveryChime();

        // Apply flags set on use
        const nextFlags = { ...state.flags };
        if (entity.setFlagsOnUse) {
          for (const flag of entity.setFlagsOnUse) {
            nextFlags[flag] = true;
          }
        }

        // Check if unlocks an exit direction in current room
        const updatedRooms = { ...state.cartridge.rooms };
        if (entity.unlocksExitDirection) {
          const roomToUnlock = updatedRooms[currentRoom.id];
          if (roomToUnlock) {
            roomToUnlock.exits = roomToUnlock.exits.map((ex) =>
              ex.direction === entity.unlocksExitDirection ? { ...ex, isLocked: false } : ex
            );
          }
        }

        set({
          historyStack: nextHistory,
          flags: nextFlags,
          cartridge: {
            ...state.cartridge,
            rooms: updatedRooms,
          },
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'PROSE',
              contentMarkup: entity.onUseText || `You use the ${entity.name}.`,
              timestamp: Date.now(),
            },
          ],
        });
        break;
      }

      case 'ACTION_COMBINE': {
        // e.g. combine cog with spindle
        const itemAId = parsed.matchedEntityId;
        const entityA = itemAId ? state.cartridge.entities[itemAId] : null;

        // Find second item from indirect object or inventory
        let entityB: WorldEntity | null = null;
        if (parsed.indirectObject) {
          entityB =
            state.inventoryIds
              .map((id) => state.cartridge.entities[id])
              .find(
                (e) =>
                  e.name.toLowerCase().includes(parsed.indirectObject!.toLowerCase()) ||
                  e.aliases.some((a) => a.toLowerCase().includes(parsed.indirectObject!.toLowerCase()))
              ) || null;
        }

        if (entityA && entityA.combineWithEntityId) {
          const targetCombineId = entityA.combineWithEntityId;
          const hasTarget = state.inventoryIds.includes(targetCombineId);

          if (hasTarget && (!entityB || entityB.id === targetCombineId)) {
            // Successful recipe combination!
            // E.g. brass_cog + star_spindle = chronometer_key
            sound.playDiscoveryChime();
            const craftedKeyId = 'chronometer_key';
            const remainingInv = state.inventoryIds.filter(
              (id) => id !== entityA.id && id !== targetCombineId
            );

            set({
              historyStack: nextHistory,
              inventoryIds: [...remainingInv, craftedKeyId],
              narrativeLog: [
                ...state.narrativeLog,
                commandEchoEntry,
                {
                  id: generateId('log'),
                  turn: state.turnCount,
                  type: 'PROSE',
                  contentMarkup: `[gold]✦ ITEM CRAFTED: Assembled Chronos Key ✦[/gold]\n\nYou align the precision hex-socket of the **Toothed Brass Cog** onto the fluted axle of the **Star Spindle**. The spring-pins seat with a musical click, locking them into a single, calibrated instrument!`,
                  timestamp: Date.now(),
                },
              ],
            });
            return;
          }
        }

        state.triggerInputShake();
        set({
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'ERROR',
              contentMarkup: 'Those items cannot be combined together.',
              timestamp: Date.now(),
            },
          ],
        });
        break;
      }

      default: {
        state.triggerInputShake();
        set({
          narrativeLog: [
            ...state.narrativeLog,
            commandEchoEntry,
            {
              id: generateId('log'),
              turn: state.turnCount,
              type: 'ERROR',
              contentMarkup: `I don't know how to '${trimmed}'. Type 'help' for guidance.`,
              timestamp: Date.now(),
            },
          ],
        });
      }
    }
  },

  // Clickable Entity Popover Verb Actions
  executeEntityAction: (entityId: string, action: string) => {
    const state = get();
    const entity = state.cartridge.entities[entityId];
    if (!entity) return;

    switch (action.toLowerCase()) {
      case 'inspect':
      case 'examine':
        state.submitCommand(`examine ${entity.name}`);
        break;
      case 'take':
      case 'grab':
        state.submitCommand(`take ${entity.name}`);
        break;
      case 'use':
      case 'ignite':
      case 'activate':
        state.submitCommand(`use ${entity.name}`);
        break;
      case 'combine':
        if (entity.combineWithEntityId) {
          const other = state.cartridge.entities[entity.combineWithEntityId];
          if (other) {
            state.submitCommand(`combine ${entity.name} with ${other.name}`);
          }
        }
        break;
      default:
        state.submitCommand(`${action} ${entity.name}`);
    }
  },

  // Narrative Choice Pill Click
  selectChoice: (choice: RoomChoice) => {
    const state = get();
    sound.playParchmentTap();

    const snapshot = createSnapshot(state);
    const nextHistory = [...state.historyStack.slice(-19), snapshot];

    const echoEntry: NarrativeLogEntry = {
      id: generateId('choice'),
      turn: state.turnCount,
      type: 'COMMAND_ECHO',
      contentMarkup: `[choice]» ${choice.label}[/choice]`,
      timestamp: Date.now(),
    };

    const nextFlags = { ...state.flags };
    if (choice.setFlags) {
      for (const flag of choice.setFlags) {
        nextFlags[flag] = true;
      }
    }

    const nextInv = [...state.inventoryIds];
    if (choice.giveItemIds) {
      for (const item of choice.giveItemIds) {
        if (!nextInv.includes(item)) nextInv.push(item);
      }
    }

    const entries: NarrativeLogEntry[] = [echoEntry];
    if (choice.responseMarkup) {
      entries.push({
        id: generateId('log'),
        turn: state.turnCount,
        type: 'PROSE',
        contentMarkup: choice.responseMarkup,
        timestamp: Date.now(),
      });
    }

    if (choice.targetRoomId && state.cartridge.rooms[choice.targetRoomId]) {
      const target = state.cartridge.rooms[choice.targetRoomId];
      const nextVisited = state.visitedRoomIds.includes(target.id)
        ? state.visitedRoomIds
        : [...state.visitedRoomIds, target.id];
      entries.push({
        id: generateId('log'),
        turn: state.turnCount + 1,
        type: 'DISCOVERY',
        roomTitle: target.title,
        contentMarkup: target.descriptionMarkup,
        timestamp: Date.now(),
      });

      set({
        turnCount: state.turnCount + 1,
        currentRoomId: target.id,
        visitedRoomIds: nextVisited,
        flags: nextFlags,
        inventoryIds: nextInv,
        historyStack: nextHistory,
        narrativeLog: [...state.narrativeLog, ...entries],
      });
    } else {
      set({
        flags: nextFlags,
        inventoryIds: nextInv,
        historyStack: nextHistory,
        narrativeLog: [...state.narrativeLog, ...entries],
      });
    }
  },

  moveToRoom: (targetRoomId: string, directionUsed?: string) => {
    const state = get();
    const target = state.cartridge.rooms[targetRoomId];
    if (!target) return false;

    const snapshot = createSnapshot(state);
    const nextHistory = [...state.historyStack.slice(-19), snapshot];
    const nextTurn = state.turnCount + 1;
    const nextVisited = state.visitedRoomIds.includes(target.id)
      ? state.visitedRoomIds
      : [...state.visitedRoomIds, target.id];

    sound.playDiscoveryChime();

    const echo: NarrativeLogEntry = {
      id: generateId('echo'),
      turn: state.turnCount,
      type: 'COMMAND_ECHO',
      contentMarkup: directionUsed ? `> go ${directionUsed}` : `> proceed to ${target.title}`,
      timestamp: Date.now(),
    };

    const discovery: NarrativeLogEntry = {
      id: generateId('log'),
      turn: nextTurn,
      type: 'DISCOVERY',
      roomTitle: target.title,
      contentMarkup: target.descriptionMarkup,
      timestamp: Date.now(),
    };

    set({
      turnCount: nextTurn,
      currentRoomId: target.id,
      visitedRoomIds: nextVisited,
      historyStack: nextHistory,
      narrativeLog: [...state.narrativeLog, echo, discovery],
    });
    return true;
  },

  // Fast-travel via Auto-Map Radar click
  fastTravel: (targetRoomId: string) => {
    const state = get();
    if (!state.visitedRoomIds.includes(targetRoomId)) return;
    if (state.currentRoomId === targetRoomId) return;

    const target = state.cartridge.rooms[targetRoomId];
    if (!target) return;

    sound.playDiscoveryChime();
    const snapshot = createSnapshot(state);
    const nextHistory = [...state.historyStack.slice(-19), snapshot];
    const nextTurn = state.turnCount + 1;

    set({
      turnCount: nextTurn,
      currentRoomId: target.id,
      historyStack: nextHistory,
      narrativeLog: [
        ...state.narrativeLog,
        {
          id: generateId('log'),
          turn: nextTurn,
          type: 'SYSTEM',
          contentMarkup: `*[Fast Travel]* You traverse the corridors back to the **${target.title}**.`,
          timestamp: Date.now(),
        },
        {
          id: generateId('log'),
          turn: nextTurn,
          type: 'DISCOVERY',
          roomTitle: target.title,
          contentMarkup: target.descriptionMarkup,
          timestamp: Date.now(),
        },
      ],
    });
  },

  // Undo / Rewind previous turn
  undoTurn: () => {
    const state = get();
    if (state.historyStack.length === 0) return;

    const previousSnapshot = state.historyStack[state.historyStack.length - 1];
    const remainingHistory = state.historyStack.slice(0, -1);

    try {
      const data = JSON.parse(previousSnapshot);
      sound.playParchmentTap();

      set({
        currentRoomId: data.currentRoomId,
        visitedRoomIds: data.visitedRoomIds,
        inventoryIds: data.inventoryIds,
        flags: data.flags,
        variables: data.variables,
        turnCount: data.turnCount,
        narrativeLog: data.narrativeLog,
        cartridge: {
          ...state.cartridge,
          entities: data.entities || state.cartridge.entities,
          rooms: data.rooms || state.cartridge.rooms,
        },
        historyStack: remainingHistory,
      });
    } catch (err) {
      console.error('Failed to restore history snapshot:', err);
    }
  },

  resetPlayRuntime: () => {
    const { cartridge } = get();
    const start = cartridge.startingRoomId;
    storage.clearRuntimeState();

    set({
      currentRoomId: start,
      visitedRoomIds: [start],
      inventoryIds: [],
      flags: { ...cartridge.initialFlags },
      variables: { ...cartridge.initialVariables },
      turnCount: 1,
      historyStack: [],
      narrativeLog: [
        {
          id: generateId('log'),
          turn: 1,
          type: 'DISCOVERY',
          roomTitle: cartridge.rooms[start]?.title || 'Starting Point',
          contentMarkup: cartridge.rooms[start]?.descriptionMarkup || 'Adventure begun.',
          timestamp: Date.now(),
        },
      ],
    });
  },

  loadCartridge: (cartridge: StoryCartridge) => {
    storage.saveActiveCartridge(cartridge);
    const start = cartridge.startingRoomId;

    set({
      cartridge,
      currentRoomId: start,
      visitedRoomIds: [start],
      inventoryIds: [],
      flags: { ...cartridge.initialFlags },
      variables: { ...cartridge.initialVariables },
      turnCount: 1,
      historyStack: [],
      selectedRoomId: start,
      narrativeLog: [
        {
          id: generateId('log'),
          turn: 1,
          type: 'DISCOVERY',
          roomTitle: cartridge.rooms[start]?.title || 'Adventure Begun',
          contentMarkup: cartridge.rooms[start]?.descriptionMarkup || 'You arrive at the scene.',
          timestamp: Date.now(),
        },
      ],
    });
  },

  // God Mode & Creator actions
  setFlag: (name, value) => {
    set((state) => ({
      flags: { ...state.flags, [name]: value },
    }));
  },

  setVariable: (name, value) => {
    set((state) => ({
      variables: { ...state.variables, [name]: value },
    }));
  },

  teleportToRoom: (roomId) => {
    const state = get();
    if (!state.cartridge.rooms[roomId]) return;
    state.fastTravel(roomId);
  },

  spawnItemInSatchel: (entityId) => {
    set((state) => ({
      inventoryIds: state.inventoryIds.includes(entityId)
        ? state.inventoryIds
        : [...state.inventoryIds, entityId],
    }));
    sound.playPickup();
  },

  removeItemFromSatchel: (entityId) => {
    set((state) => ({
      inventoryIds: state.inventoryIds.filter((id) => id !== entityId),
    }));
  },

  updateCartridgeMeta: (meta) => {
    set((state) => ({
      cartridge: {
        ...state.cartridge,
        ...meta,
      },
    }));
  },

  updateRoom: (roomId, patch) => {
    set((state) => {
      const room = state.cartridge.rooms[roomId];
      if (!room) return state;
      const updatedRooms = {
        ...state.cartridge.rooms,
        [roomId]: { ...room, ...patch },
      };
      return {
        cartridge: { ...state.cartridge, rooms: updatedRooms },
      };
    });
  },

  addRoom: (partial = {}) => {
    const id = generateId('room');
    const newRoom: RoomNode = {
      id,
      title: partial.title || 'New Chamber',
      biomeMood: partial.biomeMood || 'sanctuary',
      descriptionMarkup: partial.descriptionMarkup || 'A quiet, unrecorded chamber awaits your words.',
      exits: partial.exits || [],
      entityIds: partial.entityIds || [],
      choices: partial.choices || [],
      editorPosition: partial.editorPosition || { x: 300, y: 300 },
    };

    set((state) => ({
      selectedRoomId: id,
      cartridge: {
        ...state.cartridge,
        rooms: {
          ...state.cartridge.rooms,
          [id]: newRoom,
        },
      },
    }));
    sound.playDiscoveryChime();
    return id;
  },

  deleteRoom: (roomId) => {
    set((state) => {
      if (Object.keys(state.cartridge.rooms).length <= 1) return state; // Don't delete last room
      const { [roomId]: deleted, ...remainingRooms } = state.cartridge.rooms;

      // Remove any exits pointing to this deleted room
      for (const rId of Object.keys(remainingRooms)) {
        remainingRooms[rId].exits = remainingRooms[rId].exits.filter(
          (ex) => ex.targetRoomId !== roomId
        );
      }

      const firstRemainingKey = Object.keys(remainingRooms)[0];
      const nextRoomId: string = firstRemainingKey || state.cartridge.startingRoomId;
      return {
        selectedRoomId: firstRemainingKey || null,
        currentRoomId: state.currentRoomId === roomId ? nextRoomId : state.currentRoomId,
        cartridge: { ...state.cartridge, rooms: remainingRooms },
      };
    });
  },

  addExit: (fromRoomId, exit) => {
    set((state) => {
      const room = state.cartridge.rooms[fromRoomId];
      if (!room) return state;
      // Filter out existing exit in that direction
      const nextExits = room.exits.filter((e) => e.direction !== exit.direction);
      nextExits.push(exit);

      return {
        cartridge: {
          ...state.cartridge,
          rooms: {
            ...state.cartridge.rooms,
            [fromRoomId]: { ...room, exits: nextExits },
          },
        },
      };
    });
  },

  removeExit: (roomId, direction) => {
    set((state) => {
      const room = state.cartridge.rooms[roomId];
      if (!room) return state;
      return {
        cartridge: {
          ...state.cartridge,
          rooms: {
            ...state.cartridge.rooms,
            [roomId]: {
              ...room,
              exits: room.exits.filter((e) => e.direction !== direction),
            },
          },
        },
      };
    });
  },

  updateEntity: (entity) => {
    set((state) => ({
      cartridge: {
        ...state.cartridge,
        entities: {
          ...state.cartridge.entities,
          [entity.id]: entity,
        },
      },
    }));
  },

  deleteEntity: (entityId) => {
    set((state) => {
      const { [entityId]: deleted, ...remaining } = state.cartridge.entities;
      // Also remove from any room entityIds
      const updatedRooms = { ...state.cartridge.rooms };
      for (const rId of Object.keys(updatedRooms)) {
        updatedRooms[rId].entityIds = updatedRooms[rId].entityIds.filter((id) => id !== entityId);
      }

      return {
        inventoryIds: state.inventoryIds.filter((id) => id !== entityId),
        cartridge: {
          ...state.cartridge,
          entities: remaining,
          rooms: updatedRooms,
        },
      };
    });
  },
}));
