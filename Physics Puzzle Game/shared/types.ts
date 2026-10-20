export type BodyCategory = 'ball' | 'bouncer' | 'gravity_well' | 'portal' | 'ramp' | 'hazard' | 'goal';
export type BallType = 'steel' | 'rubber' | 'floater';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlacedWidget {
  id: string;
  type: BodyCategory;
  pos: Vector2D;
  rotationDeg: number;
  isLocked: boolean; // Immutable level design objects vs player items
  properties: {
    restitution?: number;
    forceMagnitude?: number;
    gravityRadius?: number;
    portalTargetId?: string;
    width?: number;
    height?: number;
    speedBoost?: number;
    label?: string;
  };
}

export interface LevelData {
  id: string;
  title: string;
  author: string;
  chapter?: string;
  description?: string;
  seed?: string;
  dimensions: { width: number; height: number };
  emitter: { 
    pos: Vector2D; 
    initialVelocity: Vector2D; 
    ballType: BallType;
  };
  goal: { pos: Vector2D; radius: number };
  staticBodies: PlacedWidget[];
  allowedInventory: Record<BodyCategory, number>; // Max allowed per type
  parItems: number;
}

export interface SimulationStats {
  elapsedMs: number;
  maxVelocity: number;
  bounces: number;
  kineticEnergyScore: number;
  stars?: number;
  solvedTick?: number;
  failureReason?: string;
}

export interface PhysicsPuzzleState {
  status: 'EDITING' | 'SIMULATING' | 'PAUSED' | 'VICTORY' | 'FAILED';
  currentLevel: LevelData;
  activePlacements: PlacedWidget[];
  selectedWidgetId: string | null;
  remainingBudget: Record<BodyCategory, number>;
  simulationStats: SimulationStats;
}

export interface SolutionVerificationRequest {
  levelId: string;
  seed?: string;
  placements: Array<{
    id: string;
    type: BodyCategory;
    pos: Vector2D;
    rotationDeg: number;
    properties: PlacedWidget['properties'];
  }>;
  playerHandle?: string;
}

export interface SolutionVerificationResponse {
  verified: boolean;
  levelId: string;
  ticks: number;
  elapsedMs: number;
  bounces: number;
  maxVelocity: number;
  kineticEnergyScore: number;
  gadgetsUsed: number;
  parItems: number;
  stars: number;
  emojiCard: string;
  message: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  id: string;
  levelId: string;
  playerHandle: string;
  gadgetsUsed: number;
  elapsedMs: number;
  kineticEnergyScore: number;
  stars: number;
  emojiCard: string;
  createdAt: string;
}
