// ----------------------------------------------------
// Alchemical Codex: Tiers, Branching Evolutions, and Lore
// ----------------------------------------------------

import type { CodexEntry, ItemCategory } from './types';

export const CODEX_ENTRIES: CodexEntry[] = [
  // --- TIER 1–3: EARTH & WOOD (Foundational) ---
  {
    tier: 1,
    id: 'sprout_dawn',
    name: 'Sprout of First Dawn',
    title: 'Foundational Sprout',
    category: 'earth',
    element: 'earth',
    lore: 'Nurtured in cosmic loam, this nascent shoot pulses with the primordial spark of biological transmutation.',
    recipeDesc: 'Spawned from the Alchemical Vault crate or synthesized in early merges.',
    unlocked: true,
    stats: {
      basePoints: 10,
      catalystYield: 'None',
    },
  },
  {
    tier: 2,
    id: 'amber_sapling',
    name: 'Amber Sapling',
    title: 'Resin-Encrusted Branch',
    category: 'earth',
    element: 'earth',
    lore: 'Hardened sap encases radiant embers within its petrified bark, resisting entropy and physical decay.',
    recipeDesc: 'Merge 2 or 3 Sprouts of First Dawn.',
    unlocked: false,
    stats: {
      basePoints: 30,
      catalystYield: '5% Solar Spark',
    },
  },
  {
    tier: 3,
    id: 'verdant_hearthstone',
    name: 'Verdant Hearthstone',
    title: 'Geothermal Core',
    category: 'earth',
    element: 'earth',
    lore: 'A dense mineral cluster overgrown with luminous moss, radiating steady soothing warmth.',
    recipeDesc: 'Merge Amber Saplings or perform a 5-Merge cascade.',
    unlocked: false,
    stats: {
      basePoints: 80,
      catalystYield: '10% Earth Essence',
    },
  },

  // --- TIER 4–6: REFINED TOOLS & STEEL ---
  {
    tier: 4,
    id: 'crucible_shard',
    name: 'Crucible Shard',
    title: 'Tempered Vessel Flake',
    category: 'alloy',
    element: 'steel',
    lore: 'Fragments of ancient transmutation chambers, fired in temperatures exceeding stellar cores.',
    recipeDesc: 'Synthesized by combining Verdant Hearthstones.',
    unlocked: false,
    stats: {
      basePoints: 180,
      catalystYield: '15% Quicksilver',
    },
  },
  {
    tier: 5,
    id: 'quicksilver_alembic',
    name: 'Quicksilver Alembic',
    title: 'Fluid Retort',
    category: 'alloy',
    element: 'steel',
    lore: 'A spiraling glass-and-mercury condenser that distills vaporized spirit into physical matter.',
    recipeDesc: 'Merge Crucible Shards. Acts as a high-density catalytic center.',
    unlocked: false,
    stats: {
      basePoints: 400,
      catalystYield: '25% Pure Mercury',
    },
  },
  {
    tier: 6,
    id: 'runesteel_blade',
    name: 'Astral Runesteel Edge',
    title: 'Harmonic Resonator',
    category: 'alloy',
    element: 'steel',
    lore: 'Engraved with celestial constellations that hum when brought near unstable dimensional rifts.',
    recipeDesc: 'Synthesized from Quicksilver Alembics. Merging adjacent cracks anomalies.',
    unlocked: false,
    stats: {
      basePoints: 900,
      catalystYield: 'Double adjacent crack damage',
    },
  },

  // --- TIER 7–9: ENERGIZED RELICS & CRYSTAL CYAN ---
  {
    tier: 7,
    id: 'aether_crystal',
    name: 'Aether Glow Crystal',
    title: 'Refracted Horizon',
    category: 'crystal',
    element: 'crystal',
    lore: 'Cyan luminescence crystallized into solid geometry. It floats millimeters above tabletop surfaces.',
    recipeDesc: 'Merge Runesteel Edges. Releases localized shockwaves on synthesis.',
    unlocked: false,
    stats: {
      basePoints: 2000,
      catalystYield: 'Radial Shockwave Lv 1',
    },
  },
  {
    tier: 8,
    id: 'resonant_conduit',
    name: 'Resonant Conduit',
    title: 'Harmonic Chime Cage',
    category: 'crystal',
    element: 'crystal',
    lore: 'Chambers inside this relic echo frequencies heard only during planetary conjunctions.',
    recipeDesc: 'Merge Aether Glow Crystals. Multi-merges trigger multi-cell cascades.',
    unlocked: false,
    stats: {
      basePoints: 4500,
      catalystYield: 'Radial Shockwave Lv 2',
    },
  },
  {
    tier: 9,
    id: 'chrono_lapis',
    name: 'Chrono Lapis Core',
    title: 'Temporal Anchor',
    category: 'crystal',
    element: 'crystal',
    lore: 'Time dilates visibly around this sapphire vortex; dropped items decelerate just before touching it.',
    recipeDesc: 'Synthesized from Resonant Conduits. Adds +2 bonus moves on creation.',
    unlocked: false,
    stats: {
      basePoints: 10000,
      catalystYield: '+2 Moves on Synthesis',
    },
  },

  // --- TIER 10–11: MYTHIC ARTIFACTS & ARCANA VIOLET ---
  {
    tier: 10,
    id: 'voidweaver_talisman',
    name: 'Voidweaver Talisman',
    title: 'Singularity Lens',
    category: 'arcana',
    element: 'arcana',
    lore: 'Bent light forms a halo around its abyssal gem. Capable of transmuting any adjacent hazard.',
    recipeDesc: 'Synthesized from Chrono Lapis Cores. Instantly neutralizes touching corruption.',
    unlocked: false,
    stats: {
      basePoints: 24000,
      catalystYield: 'Anti-Anomaly Blast',
    },
  },
  {
    tier: 11,
    id: 'celestial_astrolabe',
    name: 'Celestial Astrolabe',
    title: 'Starlight Orrery',
    category: 'arcana',
    element: 'arcana',
    lore: 'Clockwork rings crafted from fallen meteors calculate the exact coordinates of alchemical transcendence.',
    recipeDesc: 'Merge Voidweaver Talismans. The penultimate step toward the Great Work.',
    unlocked: false,
    stats: {
      basePoints: 60000,
      catalystYield: 'Full Board Cascade Charge',
    },
  },

  // --- TIER 12: APEX MASTERWORK & RADIANT SOLAR GOLD ---
  {
    tier: 12,
    id: 'philosophers_nova',
    name: "Philosopher's Nova",
    title: 'The Magnum Opus',
    category: 'solar',
    element: 'solar',
    lore: 'The apex pinnacle of transmutation. Boundless light, indestructible matter, and infinite energy coalesce into a perpetual miniature sun.',
    recipeDesc: 'Synthesize two Celestial Astrolabes. Grants the legendary Tier 12 Arch-Relic badge.',
    unlocked: false,
    stats: {
      basePoints: 150000,
      catalystYield: 'Infinite Transmutation Radiance',
    },
  },

  // --- BRANCHING EVOLUTIONS (Divergent Paths) ---
  {
    tier: 6,
    id: 'sunbloom_treant',
    name: 'Sunbloom Treant',
    title: 'Solar Arbiter (Branch)',
    category: 'branch_sun',
    element: 'solar',
    lore: 'A botanical miracle born when raw flora is fused with condensed Solar Essence. Radiates solar flares across all cardinal directions.',
    recipeDesc: 'Infuse high-tier Flora (Sapling/Hearthstone) with a Solar Shard Catalyst.',
    unlocked: false,
    stats: {
      basePoints: 5000,
      catalystYield: 'Cardinal Ray Pulse',
    },
  },
  {
    tier: 6,
    id: 'abyssal_willow',
    name: 'Abyssal Willow',
    title: 'Void Sovereign (Branch)',
    category: 'branch_void',
    element: 'arcana',
    lore: 'Roots dipped into the sub-dimensional void, weeping antimatter droplets that dissolve stubborn obstacles.',
    recipeDesc: 'Infuse flora with a Void Cinder Catalyst.',
    unlocked: false,
    stats: {
      basePoints: 5000,
      catalystYield: 'Absorbs 1 Corruption Tile',
    },
  },
  {
    tier: 4,
    id: 'solar_shard',
    name: 'Solar Shard Catalyst',
    title: 'Infusion Essence',
    category: 'catalyst',
    element: 'solar',
    lore: 'A blinding radiant fragment spawned during 5-merge over-merges. Drag onto items to trigger mythic awakening.',
    recipeDesc: 'Spawned as Over-Merge bonus when merging 5 or more items at once.',
    unlocked: false,
    stats: {
      basePoints: 500,
      catalystYield: 'Branches Evolution',
    },
  },
];

export function getCodexEntry(tier: number, category?: ItemCategory): CodexEntry {
  if (category && (category === 'branch_sun' || category === 'branch_void' || category === 'catalyst')) {
    const branchEntry = CODEX_ENTRIES.find(c => c.category === category);
    if (branchEntry) return branchEntry;
  }
  const entry = CODEX_ENTRIES.find(c => c.tier === tier && !c.category.startsWith('branch_') && c.category !== 'catalyst');
  return entry || CODEX_ENTRIES[0];
}

export function getTierColor(tier: number, category?: ItemCategory): { bg: string; border: string; glow: string; text: string } {
  if (category === 'branch_sun') {
    return { bg: 'bg-amber-600/30', border: 'border-amber-400', glow: 'glow-solar', text: 'text-amber-300' };
  }
  if (category === 'branch_void') {
    return { bg: 'bg-purple-950/40', border: 'border-purple-400', glow: 'glow-arcana', text: 'text-purple-300' };
  }
  if (category === 'catalyst') {
    return { bg: 'bg-yellow-500/30', border: 'border-yellow-300', glow: 'glow-solar', text: 'text-yellow-200' };
  }

  if (tier <= 3) {
    return { bg: 'bg-amber-900/30', border: 'border-amber-600', glow: 'glow-wood', text: 'text-amber-400' };
  } else if (tier <= 6) {
    return { bg: 'bg-slate-700/30', border: 'border-slate-400', glow: 'glow-steel', text: 'text-slate-200' };
  } else if (tier <= 9) {
    return { bg: 'bg-cyan-900/30', border: 'border-cyan-400', glow: 'glow-crystal', text: 'text-cyan-300' };
  } else if (tier <= 11) {
    return { bg: 'bg-purple-900/30', border: 'border-purple-400', glow: 'glow-arcana', text: 'text-purple-300' };
  } else {
    return { bg: 'bg-yellow-600/30', border: 'border-amber-300', glow: 'glow-solar', text: 'text-amber-300' };
  }
}
