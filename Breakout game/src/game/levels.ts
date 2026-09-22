import { SectorLevel, PowerUpType } from './types';

export const SECTORS: SectorLevel[] = [
  {
    id: 1,
    name: 'NEON GATEWAY',
    subtitle: 'Sector 01 — Kinetic Induction',
    description: 'Practice 5-zone paddle reflection. Target the open seams at columns 2 and 5 to breach the ceiling!',
    rows: 5,
    cols: 8,
    pattern: (r: number, c: number) => {
      // Intentional vertical tunnels at col 1 and 6
      if ((c === 1 || c === 6) && (r === 3 || r === 4)) {
        return null; // Empty seam invites tunnel carving
      }
      
      let powerUp: PowerUpType | undefined;
      if (r === 0 && (c === 3 || c === 4)) powerUp = 'multi_ball';
      if (r === 2 && c === 2) powerUp = 'laser';
      if (r === 3 && c === 5) powerUp = 'wide_paddle';

      if (r === 0) return { tier: 2, hits: 2, powerUp }; // Armored row atop
      if (r <= 2) return { tier: 1, hits: 2, powerUp }; // Amber mid
      return { tier: 0, hits: 1, powerUp }; // Emerald bottom
    }
  },
  {
    id: 2,
    name: 'CEILING LATTICE',
    subtitle: 'Sector 02 — Upper-Deck Breach',
    description: 'Engineered for ceiling trapping. Drill through the narrow center slot to trap the ball above the deck!',
    rows: 6,
    cols: 9,
    pattern: (r: number, c: number) => {
      // Central vertical elevator shaft at col 4
      if (c === 4 && r >= 2) {
        return null; // Open tunnel directly leads to upper deck
      }
      
      let powerUp: PowerUpType | undefined;
      if (r === 0 && c === 4) powerUp = 'explosive';
      if (r === 1 && c === 2) powerUp = 'multi_ball';
      if (r === 2 && c === 6) powerUp = 'slow_mo';
      if (r === 4 && c === 0) powerUp = 'magnetic';

      if (r < 2) return { tier: 2, hits: 3, powerUp }; // Heavy armored ceiling
      if (r < 4) return { tier: 1, hits: 2, powerUp };
      return { tier: 0, hits: 1, powerUp };
    }
  },
  {
    id: 3,
    name: 'ARMORED BASTION',
    subtitle: 'Sector 03 — Explosive Matrix',
    description: 'Reinforced magenta plates guard volatile explosive clusters. Detonate one cluster to shatter whole blocks!',
    rows: 6,
    cols: 10,
    pattern: (r: number, c: number) => {
      let powerUp: PowerUpType | undefined;
      if (r === 2 && (c === 3 || c === 6)) {
        // Explosive cluster
        return { tier: 3, hits: 1, powerUp: 'explosive' };
      }
      if (r === 1 && c === 1) powerUp = 'laser';
      if (r === 4 && c === 8) powerUp = 'wide_paddle';
      if (r === 3 && c === 4) powerUp = 'multi_ball';

      if (r === 0 || r === 1) return { tier: 2, hits: 3, powerUp };
      if (r <= 3) return { tier: 1, hits: 2, powerUp };
      return { tier: 0, hits: 1, powerUp };
    }
  },
  {
    id: 4,
    name: 'QUANTUM CHASM',
    subtitle: 'Sector 04 — Dual Flank Breach',
    description: 'Side chutes funnel into the upper void. Master sharp 25-degree edge deflections to whip balls through the perimeter.',
    rows: 7,
    cols: 10,
    pattern: (r: number, c: number) => {
      // Flank chutes at col 0 and 9
      if ((c === 0 || c === 9) && r >= 3) {
        return null;
      }
      // Checkerboard gaps in lower tier
      if (r >= 5 && (r + c) % 2 === 0) {
        return null;
      }

      let powerUp: PowerUpType | undefined;
      if (r === 0 && (c === 1 || c === 8)) powerUp = 'multi_ball';
      if (r === 2 && c === 5) powerUp = 'laser';
      if (r === 3 && c === 2) powerUp = 'magnetic';
      if (r === 1 && c === 4) powerUp = 'slow_mo';

      if (r < 2) return { tier: 2, hits: 3, powerUp };
      if (r < 4) return { tier: 1, hits: 2, powerUp };
      return { tier: 0, hits: 1, powerUp };
    }
  },
  {
    id: 5,
    name: 'CYBER CORE OMEGA',
    subtitle: 'Sector 05 — Mainframe Overload',
    description: 'The supreme kinetic test. High-density armored shielding, multiple explosive nodes, and chaotic multi-ball frenzy.',
    rows: 7,
    cols: 10,
    pattern: (r: number, c: number) => {
      let powerUp: PowerUpType | undefined;
      if ((r === 1 || r === 3) && (c === 2 || c === 7)) {
        return { tier: 3, hits: 1, powerUp: 'explosive' };
      }
      if (r === 0 && c === 5) powerUp = 'laser';
      if (r === 2 && c === 5) powerUp = 'multi_ball';
      if (r === 4 && c === 1) powerUp = 'wide_paddle';
      if (r === 4 && c === 8) powerUp = 'magnetic';

      if (r <= 1) return { tier: 2, hits: 3, powerUp };
      if (r <= 4) return { tier: 1, hits: 2, powerUp };
      return { tier: 0, hits: 1, powerUp };
    }
  }
];
