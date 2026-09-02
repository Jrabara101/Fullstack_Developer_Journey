export type CrosshairStyle = 'CROSS' | 'DOT' | 'CROSS_DOT';

export interface GameSettings {
  sensitivity: number; // radians per pixel of mouse movement
  fov: number; // vertical field of view in degrees
  invertY: boolean;
  masterVolume: number; // 0..1
  sfxVolume: number; // 0..1
  crosshairStyle: CrosshairStyle;
  crosshairColor: string;
  showFps: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 0.0022,
  fov: 72,
  invertY: false,
  masterVolume: 0.8,
  sfxVolume: 1.0,
  crosshairStyle: 'CROSS',
  crosshairColor: '#7ddf64',
  showFps: false,
};

export const SETTINGS_LIMITS = {
  sensitivity: { min: 0.0005, max: 0.008, step: 0.0001 },
  fov: { min: 60, max: 110, step: 1 },
  masterVolume: { min: 0, max: 1, step: 0.05 },
  sfxVolume: { min: 0, max: 1, step: 0.05 },
} as const;

const STORAGE_KEY = 'acer-strike:settings:v1';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Merge stored values over the defaults one key at a time, so a partial or
 * outdated payload never leaves a field undefined.
 */
function coerce(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  const input = raw as Partial<Record<keyof GameSettings, unknown>>;
  const out: GameSettings = { ...DEFAULT_SETTINGS };

  if (typeof input.sensitivity === 'number' && Number.isFinite(input.sensitivity)) {
    out.sensitivity = clamp(input.sensitivity, SETTINGS_LIMITS.sensitivity.min, SETTINGS_LIMITS.sensitivity.max);
  }
  if (typeof input.fov === 'number' && Number.isFinite(input.fov)) {
    out.fov = clamp(input.fov, SETTINGS_LIMITS.fov.min, SETTINGS_LIMITS.fov.max);
  }
  if (typeof input.invertY === 'boolean') out.invertY = input.invertY;
  if (typeof input.masterVolume === 'number' && Number.isFinite(input.masterVolume)) {
    out.masterVolume = clamp(input.masterVolume, 0, 1);
  }
  if (typeof input.sfxVolume === 'number' && Number.isFinite(input.sfxVolume)) {
    out.sfxVolume = clamp(input.sfxVolume, 0, 1);
  }
  if (input.crosshairStyle === 'CROSS' || input.crosshairStyle === 'DOT' || input.crosshairStyle === 'CROSS_DOT') {
    out.crosshairStyle = input.crosshairStyle;
  }
  if (typeof input.crosshairColor === 'string' && /^#[0-9a-f]{6}$/i.test(input.crosshairColor)) {
    out.crosshairColor = input.crosshairColor;
  }
  if (typeof input.showFps === 'boolean') out.showFps = input.showFps;

  return out;
}

export function loadSettings(): GameSettings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    return coerce(JSON.parse(stored));
  } catch {
    // Private mode, blocked storage, or corrupt JSON — defaults are always safe.
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Persisting is a convenience; failing to store must never break play.
  }
}
