export type EventCategory = 'kill' | 'death' | 'ability' | 'checkpoint' | 'milestone';

export interface ReplayEventMarker {
  id: string;
  tick: number;
  timestampMs: number;
  category: EventCategory;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface PlayerInputPacket {
  tick: number;
  dt: number;
  keys: number; // Bitmask of pressed inputs (e.g., WASD, Space, Click)
  cursor: { x: number; y: number };
}

export interface KeyframeSnapshot {
  tick: number;
  timestampMs: number;
  entities: {
    id: string;
    type: string;
    pos: { x: number; y: number };
    velocity: { x: number; y: number };
    stateFlags: number;
  }[];
}

export interface ReplayMetadata {
  replayId: string;
  gameTitle: string;
  mapSeed?: string;
  recordedAt: string; // ISO 8601
  totalTicks: number;
  durationMs: number;
  tickRate: number; // e.g., 60
  authorName: string;
  checksum: string;
  markers: ReplayEventMarker[];
}

export interface ReplayPayload {
  keyframes: KeyframeSnapshot[];
  inputs: PlayerInputPacket[];
}

export interface FullReplayPackage {
  metadata: ReplayMetadata;
  payload: ReplayPayload;
  compressedPayload?: string;
}

export interface VerificationReport {
  isValid: boolean;
  score: number; // 0 - 100
  totalTicks: number;
  verifiedAt: string;
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  violations: string[];
  metrics: {
    averageInputRateHz: number;
    maxObservedVelocity: number;
    desyncFrameCount: number;
    maxPositionalDeviation: number;
    keyframeCount: number;
    inputCount: number;
    checksumMatches: boolean;
  };
}

// Input bitmask definitions matching client
export const INPUT_BITS = {
  UP: 1 << 0,       // W / ArrowUp
  DOWN: 1 << 1,     // S / ArrowDown
  LEFT: 1 << 2,     // A / ArrowLeft
  RIGHT: 1 << 3,    // D / ArrowRight
  BOOST: 1 << 4,    // Space
  FIRE: 1 << 5,     // Left Mouse Click
  ABILITY: 1 << 6,  // Shift / E
} as const;
