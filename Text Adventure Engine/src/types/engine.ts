export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export type BiomeMood = 'sanctuary' | 'crypt' | 'arcane' | 'peril' | 'twilight';

export interface ConditionRule {
  requiredFlags?: string[];
  forbiddenFlags?: string[];
  requiredItems?: string[];
  minVariables?: Record<string, number>;
}

export interface WorldEntity {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  isTakeable: boolean;
  isUsable: boolean;
  combineWithEntityId?: string;
  onInspectText?: string;
  onUseText?: string;
  setFlagsOnUse?: string[];
  unlocksExitDirection?: Direction;
}

export interface RoomExit {
  direction: Direction;
  targetRoomId: string;
  isLocked?: boolean;
  lockDescription?: string;
  unlockCondition?: ConditionRule;
  conduitLabel?: string;
}

export interface RoomChoice {
  id: string;
  label: string;
  targetRoomId?: string;
  responseMarkup?: string;
  condition?: ConditionRule;
  setFlags?: string[];
  giveItemIds?: string[];
}

export interface RoomNode {
  id: string;
  title: string;
  biomeMood: BiomeMood;
  descriptionMarkup: string; // Supports [[Entity]] and {if flag} blocks
  exits: RoomExit[];
  entityIds: string[];
  choices: RoomChoice[];
  editorPosition: { x: number; y: number }; // 2D coordinates for Creator Canvas
}

export interface StoryCartridge {
  id: string;
  title: string;
  author: string;
  version: string;
  synopsis: string;
  startingRoomId: string;
  rooms: Record<string, RoomNode>;
  entities: Record<string, WorldEntity>;
  initialFlags: Record<string, boolean>;
  initialVariables: Record<string, number>;
}

export type NarrativeEntryType = 'PROSE' | 'COMMAND_ECHO' | 'SYSTEM' | 'DISCOVERY' | 'ERROR';

export interface NarrativeLogEntry {
  id: string;
  turn: number;
  type: NarrativeEntryType;
  roomTitle?: string;
  contentMarkup: string;
  timestamp?: number;
}

export interface EngineRuntimeState {
  mode: 'PLAY' | 'CREATE';
  cartridge: StoryCartridge;
  currentRoomId: string;
  visitedRoomIds: string[];
  inventoryIds: string[];
  flags: Record<string, boolean>;
  variables: Record<string, number>;
  turnCount: number;
  narrativeLog: NarrativeLogEntry[];
  historyStack: string[]; // Serialized snapshots for Undo/Rewind
}

export interface ParsedCommand {
  raw: string;
  verb: string;
  normalizedAction: ActionVerb;
  directObject?: string;
  preposition?: string;
  indirectObject?: string;
  matchedEntityId?: string;
  matchedExitDirection?: Direction;
  isValid: boolean;
  errorMessage?: string;
}

export type ActionVerb =
  | 'ACTION_GO'
  | 'ACTION_INSPECT'
  | 'ACTION_TAKE'
  | 'ACTION_USE'
  | 'ACTION_COMBINE'
  | 'ACTION_UNLOCK'
  | 'ACTION_TALK'
  | 'ACTION_INVENTORY'
  | 'ACTION_LOOK'
  | 'ACTION_HELP'
  | 'ACTION_UNKNOWN';
