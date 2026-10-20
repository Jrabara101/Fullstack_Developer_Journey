import { LevelData } from './types';

export const CAMPAIGN_LEVELS: LevelData[] = [
  {
    id: 'campaign_01',
    title: 'Chamber 01: Vector Parabola',
    author: 'AeroLab Core',
    chapter: 'Chamber 1 - Kinetic Basics',
    description: 'Calibrate your trajectory. Place a Directional Bouncer along the lower floor to rebound the rubber payload over the partition wall into the emerald receptacle.',
    dimensions: { width: 960, height: 580 },
    emitter: {
      pos: { x: 120, y: 120 },
      initialVelocity: { x: 120, y: 0 },
      ballType: 'rubber'
    },
    goal: {
      pos: { x: 820, y: 460 },
      radius: 36
    },
    staticBodies: [
      {
        id: 'wall_01',
        type: 'ramp',
        pos: { x: 500, y: 380 },
        rotationDeg: 90,
        isLocked: true,
        properties: { width: 220, height: 22, label: 'Reinforced Partition' }
      },
      {
        id: 'floor_ledge',
        type: 'ramp',
        pos: { x: 140, y: 160 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 140, height: 16, label: 'Launch Shelf' }
      }
    ],
    allowedInventory: {
      ball: 0,
      bouncer: 2,
      gravity_well: 0,
      portal: 0,
      ramp: 1,
      hazard: 0,
      goal: 0
    },
    parItems: 1
  },
  {
    id: 'campaign_02',
    title: 'Chamber 02: Singularity Slingshot',
    author: 'AeroLab Core',
    chapter: 'Chamber 2 - Gravity Wells',
    description: 'A lethal laser grid cuts across the chamber. Place a localized Gravity Well node to warp spacetime and bend the payload into an orbital slingshot.',
    dimensions: { width: 960, height: 580 },
    emitter: {
      pos: { x: 150, y: 100 },
      initialVelocity: { x: 100, y: 30 },
      ballType: 'rubber'
    },
    goal: {
      pos: { x: 800, y: 160 },
      radius: 36
    },
    staticBodies: [
      {
        id: 'laser_center',
        type: 'hazard',
        pos: { x: 480, y: 260 },
        rotationDeg: 90,
        isLocked: true,
        properties: { width: 260, height: 16, label: 'Lethal Laser Array' }
      },
      {
        id: 'bedrock_bottom',
        type: 'ramp',
        pos: { x: 480, y: 530 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 400, height: 20, label: 'Basalt Trench' }
      }
    ],
    allowedInventory: {
      ball: 0,
      bouncer: 1,
      gravity_well: 2,
      portal: 0,
      ramp: 1,
      hazard: 0,
      goal: 0
    },
    parItems: 1
  },
  {
    id: 'campaign_03',
    title: 'Chamber 03: Wormhole Topology',
    author: 'AeroLab Core',
    chapter: 'Chamber 3 - Spacetime Portals',
    description: 'A colossal monolith isolates the containment bay. Route the high-density Steel Ball through linked portal horizons to bypass the sealed barrier.',
    dimensions: { width: 960, height: 580 },
    emitter: {
      pos: { x: 140, y: 100 },
      initialVelocity: { x: 80, y: 0 },
      ballType: 'steel'
    },
    goal: {
      pos: { x: 820, y: 440 },
      radius: 36
    },
    staticBodies: [
      {
        id: 'central_monolith',
        type: 'ramp',
        pos: { x: 480, y: 290 },
        rotationDeg: 90,
        isLocked: true,
        properties: { width: 480, height: 40, label: 'Hermetic Monolith' }
      },
      {
        id: 'laser_floor',
        type: 'hazard',
        pos: { x: 700, y: 540 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 240, height: 14, label: 'Lower Ion Fence' }
      }
    ],
    allowedInventory: {
      ball: 0,
      bouncer: 1,
      gravity_well: 1,
      portal: 2,
      ramp: 1,
      hazard: 0,
      goal: 0
    },
    parItems: 2
  },
  {
    id: 'campaign_04',
    title: 'Chamber 04: Kinetic Deflector Matrix',
    author: 'AeroLab Core',
    chapter: 'Chamber 4 - Deflector Precision',
    description: 'Guide the fast-falling sphere through a pinball-like gauntlet. Angle Deflector Paddles with the 360° gizmo to hit maximum terminal velocity before capture.',
    dimensions: { width: 960, height: 580 },
    emitter: {
      pos: { x: 160, y: 90 },
      initialVelocity: { x: 140, y: -20 },
      ballType: 'rubber'
    },
    goal: {
      pos: { x: 840, y: 140 },
      radius: 36
    },
    staticBodies: [
      {
        id: 'wall_upper',
        type: 'ramp',
        pos: { x: 380, y: 220 },
        rotationDeg: -25,
        isLocked: true,
        properties: { width: 140, height: 16, label: 'Stationary Angle A' }
      },
      {
        id: 'laser_mid',
        type: 'hazard',
        pos: { x: 600, y: 340 },
        rotationDeg: 45,
        isLocked: true,
        properties: { width: 180, height: 14, label: 'Slicing Laser' }
      },
      {
        id: 'floor_buffer',
        type: 'ramp',
        pos: { x: 500, y: 550 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 500, height: 20, label: 'Sub-floor' }
      }
    ],
    allowedInventory: {
      ball: 0,
      bouncer: 2,
      gravity_well: 1,
      portal: 0,
      ramp: 3,
      hazard: 0,
      goal: 0
    },
    parItems: 2
  },
  {
    id: 'campaign_05',
    title: 'Chamber 05: The Harmonic Singularity',
    author: 'AeroLab Core',
    chapter: 'Chamber 5 - Mastery Gauntlet',
    description: 'The master trial: Combine gravity wells, bouncers, and deflectors to orchestrate a continuous momentum trajectory through multiple danger vectors.',
    dimensions: { width: 960, height: 580 },
    emitter: {
      pos: { x: 110, y: 140 },
      initialVelocity: { x: 160, y: 40 },
      ballType: 'steel'
    },
    goal: {
      pos: { x: 860, y: 300 },
      radius: 34
    },
    staticBodies: [
      {
        id: 'hazard_top',
        type: 'hazard',
        pos: { x: 360, y: 160 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 200, height: 14, label: 'Upper Hazard' }
      },
      {
        id: 'hazard_low',
        type: 'hazard',
        pos: { x: 640, y: 420 },
        rotationDeg: 0,
        isLocked: true,
        properties: { width: 220, height: 14, label: 'Lower Hazard' }
      },
      {
        id: 'center_pylon',
        type: 'ramp',
        pos: { x: 500, y: 300 },
        rotationDeg: 90,
        isLocked: true,
        properties: { width: 120, height: 26, label: 'Isolation Pylon' }
      }
    ],
    allowedInventory: {
      ball: 0,
      bouncer: 2,
      gravity_well: 2,
      portal: 2,
      ramp: 2,
      hazard: 0,
      goal: 0
    },
    parItems: 3
  }
];
