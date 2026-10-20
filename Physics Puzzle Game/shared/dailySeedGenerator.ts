import { LevelData, PlacedWidget, BodyCategory } from './types';

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return (hash >>> 0) || 1337;
}

/**
 * Generate a deterministic Daily "Singularity Seed" Gauntlet puzzle
 */
export function generateDailyPuzzle(isoDate: string): LevelData {
  const seedNum = hashStringToSeed(`DAILY_${isoDate}_GAUNTLET`);
  const rng = mulberry32(seedNum);

  const width = 960;
  const height = 580;

  // Emitter location on left quadrant
  const emitterX = Math.round(90 + rng() * 120);
  const emitterY = Math.round(70 + rng() * 60);
  const vx = Math.round(80 + rng() * 140);
  const vy = Math.round(-30 + rng() * 60);
  const ballType = rng() > 0.6 ? 'steel' : rng() > 0.3 ? 'rubber' : 'floater';

  // Goal location on right quadrant
  const goalX = Math.round(width - 120 - rng() * 100);
  const goalY = Math.round(height - 110 - rng() * 90);
  const goalRadius = 32;

  const staticBodies: PlacedWidget[] = [];

  // Generate 2 or 3 bedrock obstacles
  const numObstacles = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < numObstacles; i++) {
    const ox = Math.round(280 + (i * 180) + (rng() * 40 - 20));
    const oy = Math.round(180 + rng() * 220);
    const rot = Math.round((rng() - 0.5) * 60);
    const w = Math.round(90 + rng() * 50);
    const h = 18;

    staticBodies.push({
      id: `bedrock_${i + 1}`,
      type: 'ramp',
      pos: { x: ox, y: oy },
      rotationDeg: rot,
      isLocked: true,
      properties: {
        width: w,
        height: h,
        restitution: 0.8,
        label: `Bedrock Barrier #${i + 1}`
      }
    });
  }

  // Generate 1 or 2 lethal laser barriers
  const numLasers = 1 + (rng() > 0.4 ? 1 : 0);
  for (let i = 0; i < numLasers; i++) {
    const lx = Math.round(350 + (i * 220) + (rng() * 50 - 25));
    const ly = Math.round(280 + rng() * 160);
    const lRot = Math.round(rng() > 0.5 ? 90 : 0);

    staticBodies.push({
      id: `laser_${i + 1}`,
      type: 'hazard',
      pos: { x: lx, y: ly },
      rotationDeg: lRot,
      isLocked: true,
      properties: {
        width: 100,
        height: 14,
        label: `Lethal Laser Barrier #${i + 1}`
      }
    });
  }

  const allowedInventory: Record<BodyCategory, number> = {
    ball: 0,
    bouncer: 2,
    gravity_well: 1,
    portal: 2, // 1 pair
    ramp: 2,
    hazard: 0,
    goal: 0
  };

  return {
    id: `daily_${isoDate}`,
    title: `Singularity Gauntlet: ${isoDate}`,
    author: 'AeroLab Seed Director',
    chapter: 'Daily Singularity',
    description: `A globally synchronized celestial chamber keyed to seed ${isoDate}. Navigate the laser lattice and harness gravitational slingshots with strict budget limits.`,
    seed: isoDate,
    dimensions: { width, height },
    emitter: {
      pos: { x: emitterX, y: emitterY },
      initialVelocity: { x: vx, y: vy },
      ballType
    },
    goal: {
      pos: { x: goalX, y: goalY },
      radius: goalRadius
    },
    staticBodies,
    allowedInventory,
    parItems: 3
  };
}
