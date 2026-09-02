export type Team = 'CT' | 'T';

export type MovementState = 'IDLE' | 'WALKING' | 'RUNNING' | 'CROUCHING' | 'JUMPING' | 'FALLING';

export type HitboxZone = 'HEAD' | 'TORSO' | 'LEGS';

export interface WeaponDef {
  id: string;
  name: string;
  category: 'PISTOL' | 'RIFLE' | 'SNIPER' | 'MELEE' | 'UTILITY';
  price: number;
  damage: number;
  headshotMultiplier: number;
  legMultiplier: number;
  armorPenetration: number; // 0 to 1 (e.g. 0.775 for AK)
  cycleTime: number; // seconds between shots (e.g. 0.1s = 600 RPM)
  isAutomatic: boolean;
  clipSize: number;
  maxReserve: number;
  reloadTime: number; // seconds
  moveSpeedRatio: number; // 1.0 is max speed (250 u/s)
  spreadBase: number; // Base standing spread angle (radians)
  spreadCrouch: number; // Crouch standing spread
  spreadMove: number; // Multiplier when moving
  spreadAir: number; // Multiplier when in air
  recoilVerticalMax: number;
  recoilHorizontalMax: number;
  recoilRecoveryRate: number;
  recoilPattern: { x: number; y: number }[]; // Spray pattern offsets per shot index
  killReward: number;
  description: string;
}

export interface InventoryItem {
  weaponId: string;
  clip: number;
  reserve: number;
}

export interface PlayerInventory {
  primary: InventoryItem | null;
  secondary: InventoryItem;
  knife: InventoryItem;
  c4: InventoryItem | null;
  hasKevlar: boolean;
  hasHelmet: boolean;
  hasDefuseKit: boolean;
  activeSlot: 1 | 2 | 3 | 5; // 1=Primary, 2=Secondary, 3=Knife, 5=C4
}

export type RoundState = 'FREEZE_TIME' | 'IN_PROGRESS' | 'BOMB_PLANTED' | 'ROUND_END' | 'MATCH_END';

export interface KillFeedEntry {
  id: string;
  killerName: string;
  killerTeam: Team;
  victimName: string;
  victimTeam: Team;
  weaponName: string;
  isHeadshot: boolean;
  isWallbang?: boolean;
  timestamp: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  team: Team;
  isBot: boolean;
  health: number;
  armor: number;
  hasHelmet: boolean;
  isAlive: boolean;
  kills: number;
  deaths: number;
  assists: number;
  money: number;
  score: number;
  damageDealt: number;
}

export interface ParallaxDebugInfo {
  cameraOrigin: [number, number, number];
  cameraTarget: [number, number, number];
  muzzleOrigin: [number, number, number];
  actualHitPoint: [number, number, number];
  hasObstruction: boolean;
  spreadAngle: number;
}

export interface BotStateDebug {
  id: string;
  name: string;
  state: string;
  targetDistance: number;
  currentObjective: string;
  reactionTimer: number;
}
