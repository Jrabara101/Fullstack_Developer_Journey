import { KeyframeSnapshot, EntityState } from '../types/replay';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Shortest path angular interpolation (equivalent to 2D slerp)
 */
export function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  return a + diff * Math.max(0, Math.min(1, t));
}

export function lerpVec(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t)
  };
}

/**
 * High-precision interpolation between keyframe snapshots for a specific continuous tick float.
 */
export function interpolateKeyframes(
  keyframes: KeyframeSnapshot[],
  currentTick: number
): EntityState[] {
  if (!keyframes || keyframes.length === 0) return [];
  if (keyframes.length === 1) return keyframes[0].entities;

  // Clamp tick
  if (currentTick <= keyframes[0].tick) return keyframes[0].entities;
  if (currentTick >= keyframes[keyframes.length - 1].tick) {
    return keyframes[keyframes.length - 1].entities;
  }

  // Binary search or linear scan for bounding keyframes
  let lowerIdx = 0;
  let upperIdx = keyframes.length - 1;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].tick <= currentTick && keyframes[i + 1].tick >= currentTick) {
      lowerIdx = i;
      upperIdx = i + 1;
      break;
    }
  }

  const kfA = keyframes[lowerIdx];
  const kfB = keyframes[upperIdx];

  if (kfA.tick === kfB.tick) return kfA.entities;

  const alpha = (currentTick - kfA.tick) / (kfB.tick - kfA.tick);

  // Map and interpolate each entity
  return kfA.entities.map(entA => {
    const entB = kfB.entities.find(e => e.id === entA.id) || entA;

    return {
      id: entA.id,
      type: entA.type,
      pos: lerpVec(entA.pos, entB.pos, alpha),
      velocity: lerpVec(entA.velocity, entB.velocity, alpha),
      stateFlags: alpha > 0.5 ? entB.stateFlags : entA.stateFlags,
      health: entA.health !== undefined && entB.health !== undefined
        ? lerp(entA.health, entB.health, alpha)
        : entA.health,
      rotation: entA.rotation !== undefined && entB.rotation !== undefined
        ? lerpAngle(entA.rotation, entB.rotation, alpha)
        : entA.rotation
    };
  });
}
