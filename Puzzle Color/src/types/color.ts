export type ColorModel = 'SUBTRACTIVE_CMYK' | 'ADDITIVE_RGB';

export interface ColorData {
  r: number; // 0 - 255
  g: number;
  b: number;
  hex: string;
  lab: { l: number; a: number; b: number };
}

export type PatternTexture = 'dots' | 'diagonal_stripes' | 'waves' | 'crosshatch' | 'rings';

export interface ReagentSource {
  id: string;
  code: string;
  name: string;
  color: ColorData;
  remainingVolumeMl: number;
  maxVolumeMl: number;
  patternTexture?: PatternTexture;
  wavelengthAbsorption?: { uv: number; vis: number; ir: number };
  ks?: { k: [number, number, number]; s: [number, number, number] }; // Kubelka-Munk K/S coefficients (R, G, B)
}

export interface MixOperation {
  id: string;
  tool: 'pipette' | 'pour' | 'filter' | 'flush';
  reagentId: string;
  volumeAddedMl: number;
  resultingColor: ColorData;
  timestamp: number;
}

export interface ColorPuzzleState {
  puzzleId: string;
  title: string;
  difficulty: 'Apprentice' | 'Chemist' | 'Optic Master';
  mode: ColorModel;
  targetColor: ColorData;
  currentColor: ColorData;
  baselineColor: ColorData;
  deltaE: number; // 0.0 to 100.0 (Lower is closer, <=2.0 is win condition)
  toleranceThreshold: number; // e.g. 1.8
  currentVolumeMl: number;
  maxCrucibleCapacityMl: number;
  reagents: ReagentSource[];
  history: MixOperation[];
  redoStack: MixOperation[];
  moveCount: number;
  maxMoves: number;
  status: 'IDLE' | 'DISPENSING' | 'STIRRING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  dailySeed?: string;
  startTime: number;
  endTime?: number;
  accessibility: {
    patternsEnabled: boolean;
    colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
}

export interface LeaderboardEntry {
  id: string;
  puzzleId: string;
  playerName: string;
  movesUsed: number;
  volumeUsedMl: number;
  volumeEfficiency: number; // Percentage efficiency vs ideal volume
  deltaE: number;
  timeElapsedMs: number;
  date: string;
  verified: boolean;
  signature?: string;
}

export interface ActionLogPayload {
  puzzleId: string;
  playerName?: string;
  timeElapsedMs: number;
  operations: {
    tool: 'pipette' | 'pour' | 'filter' | 'flush';
    reagentId: string;
    volumeMl: number;
    timestamp: number;
  }[];
}

export interface VerificationResponse {
  verified: boolean;
  puzzleId: string;
  calculatedColor: ColorData;
  targetColor: ColorData;
  calculatedDeltaE: number;
  toleranceThreshold: number;
  matchPercentage: number;
  movesUsed: number;
  volumeUsedMl: number;
  leaderboardRank?: number;
  shareString: string;
  message: string;
}

export interface DuelPlayerState {
  id: string;
  name: string;
  deltaE: number;
  currentColorHex: string;
  movesCount: number;
  isFinished: boolean;
}
