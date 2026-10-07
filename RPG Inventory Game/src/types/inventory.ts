export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'quest' | 'relic';
export type EquipSlot = 
  | 'head'
  | 'chest'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'main_hand'
  | 'off_hand'
  | 'amulet'
  | 'ring';

export interface StatModifiers {
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  attackPower?: number;
  armor?: number;
  critChance?: number; // percentage (e.g. 5.5 = 5.5%)
  elementalHaste?: number; // percentage
  stamina?: number;
  weight: number;      // in kg
}

export interface ItemEntity {
  uid: string;         // Unique instance UUID
  id: string;          // Base template ID
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  width: number;       // Grid width (1-3)
  height: number;      // Grid height (1-3)
  isRotated: boolean;
  equipSlot?: EquipSlot;
  isTwoHanded?: boolean;
  durability?: number;
  maxDurability?: number;
  stackCount?: number;
  maxStack?: number;
  stats: StatModifiers;
  iconType: string;    // Identifier for procedural or svg icon
  valueGold: number;
  affixes?: string[];
}

export interface PlacedItem {
  item: ItemEntity;
  x: number; // 0-based column (0 to cols-1)
  y: number; // 0-based row (0 to rows-1)
}

export interface CharacterSheet {
  playerId: string;
  username: string;
  avatarUrl: string;
  characterClass: 'Paladin' | 'Shadowblade' | 'Archmage' | 'Dreadnought';
  level: number;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  baseStats: { 
    strength: number; 
    dexterity: number; 
    intelligence: number;
  };
  equipped: Partial<Record<EquipSlot, ItemEntity>>;
  inventoryGrid: {
    cols: number;
    rows: number;
    items: PlacedItem[];
  };
  gold: number;
  maxCarryWeight: number;
}

export interface ComputedCharacterStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  attackPower: number;
  armor: number;
  critChance: number;
  elementalHaste: number;
  stamina: number;
  totalWeight: number;
  maxWeight: number;
  encumbrancePercent: number;
  isOverburdened: boolean;
  movementPenaltyPercent: number;
  staminaRecoveryPenaltyPercent: number;
}

export interface StatDifferential {
  label: string;
  diff: number;
  isPositiveGood: boolean;
  formatted: string;
}

export interface QuestObjective {
  id: string;
  title: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  bossName?: string;
  rewardExp: number;
  rewardGold: number;
  rewardItems: ItemEntity[];
  objectives: QuestObjective[];
  status: 'available' | 'active' | 'completed';
}

export type LootRollType = 'need' | 'greed' | 'pass';

export interface LootRollEntry {
  playerId: string;
  playerName: string;
  rollType: LootRollType;
  rollValue: number; // 1-100
  timestamp: number;
}

export interface ActiveLootDrop {
  dropId: string;
  item: ItemEntity;
  questTitle: string;
  startedAt: number;
  expiresAt: number;
  durationSeconds: number;
  rolls: Record<string, LootRollEntry>; // playerId -> entry
  resolved: boolean;
  winnerId?: string;
  winnerName?: string;
  winningRoll?: number;
  winningType?: LootRollType;
}

export interface TradeOffer {
  items: ItemEntity[];
  gold: number;
  locked: boolean;
  confirmed: boolean;
}

export interface TradeSession {
  tradeId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderOffer: TradeOffer;
  receiverOffer: TradeOffer;
  state: 'STAGING' | 'LOCKED' | 'CONFIRMED' | 'CANCELLED';
  lockTimer?: number; // seconds remaining in anti-scam lock
}

export type RoomStateMode = 'CAMP_LOBBY' | 'QUEST_ENCOUNTER' | 'TRADE_ACTIVE';

export interface RoomState {
  roomId: string;
  mode: RoomStateMode;
  partyMembers: CharacterSheet[];
  activeQuest?: Quest;
  activeLootDrop?: ActiveLootDrop;
  activeTrade?: TradeSession;
}

// WebSocket Message Protocol
export type WSClientMessage =
  | { type: 'JOIN_ROOM'; roomId: string; player: CharacterSheet }
  | { type: 'LEAVE_ROOM'; roomId: string; playerId: string }
  | { type: 'UPDATE_SHEET'; roomId: string; player: CharacterSheet }
  | { type: 'INVENTORY_MOVE'; roomId: string; playerId: string; itemUid: string; targetX: number; targetY: number; isRotated: boolean }
  | { type: 'EQUIP_ITEM'; roomId: string; playerId: string; itemUid: string; targetSlot: EquipSlot }
  | { type: 'UNEQUIP_ITEM'; roomId: string; playerId: string; slot: EquipSlot; targetX?: number; targetY?: number }
  | { type: 'DROP_ITEM'; roomId: string; playerId: string; itemUid: string }
  | { type: 'TRADE_INIT'; roomId: string; senderId: string; receiverId: string }
  | { type: 'TRADE_UPDATE_OFFER'; roomId: string; tradeId: string; playerId: string; items: ItemEntity[]; gold: number }
  | { type: 'TRADE_TOGGLE_LOCK'; roomId: string; tradeId: string; playerId: string; locked: boolean }
  | { type: 'TRADE_ACCEPT'; roomId: string; tradeId: string; playerId: string }
  | { type: 'TRADE_CANCEL'; roomId: string; tradeId: string; playerId: string }
  | { type: 'QUEST_STEP_TRIGGER'; roomId: string; questId: string }
  | { type: 'LOOT_SUBMIT_ROLL'; roomId: string; dropId: string; playerId: string; rollType: LootRollType }
  | { type: 'SPAWN_BOT_COMPANION'; roomId: string };

export type WSServerMessage =
  | { type: 'ROOM_SYNC'; state: RoomState }
  | { type: 'PARTY_MEMBER_JOINED'; member: CharacterSheet }
  | { type: 'PARTY_MEMBER_LEFT'; playerId: string }
  | { type: 'PLAYER_UPDATED'; player: CharacterSheet }
  | { type: 'TRADE_STATE_CHANGED'; trade: TradeSession | null }
  | { type: 'TRADE_COMPLETED_SUCCESS'; tradeId: string; summary: string }
  | { type: 'QUEST_UPDATED'; quest: Quest }
  | { type: 'LOOT_DROP_SPAWNED'; drop: ActiveLootDrop }
  | { type: 'LOOT_ROLL_RECEIVED'; dropId: string; roll: LootRollEntry }
  | { type: 'LOOT_DROP_RESOLVED'; drop: ActiveLootDrop }
  | { type: 'SYSTEM_NOTIFICATION'; message: string; level: 'info' | 'success' | 'warning' | 'error' };
