import { CardData, Difficulty, DifficultyConfig, ShapeCategory } from '../types';

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Phase 01 • Warmup',
    subtitle: 'Tactile Matrix (4 × 4)',
    gridCols: 4,
    gridRows: 4,
    totalCards: 16,
    totalPairs: 8,
    countdownSeconds: 60,
    mismatchPenaltySeconds: 0,
    description: 'Generous attack window, high-contrast silhouettes, ideal for cognitive calibration.'
  },
  medium: {
    id: 'medium',
    label: 'Phase 02 • Core',
    subtitle: 'Neural Circuit (6 × 4)',
    gridCols: 6,
    gridRows: 4,
    totalCards: 24,
    totalPairs: 12,
    countdownSeconds: 75,
    mismatchPenaltySeconds: 0,
    description: 'Expanded visual field with subtle thematic nuances to challenge working memory.'
  },
  hard: {
    id: 'hard',
    label: 'Phase 03 • Hard',
    subtitle: 'Arcane Hyperdrive (8 × 4)',
    gridCols: 8,
    gridRows: 4,
    totalCards: 32,
    totalPairs: 16,
    countdownSeconds: 90,
    mismatchPenaltySeconds: 2,
    description: 'High-stakes protocol: rapid time decay and -2s clock penalty per mismatch error.'
  }
};

interface ArchetypeTemplate {
  icon: string;
  label: string;
  shape: ShapeCategory;
  archetype: string;
  accentColor: string;
}

const ARCHETYPES: ArchetypeTemplate[] = [
  { icon: 'diamond', label: 'Quantum Prism', shape: 'diamond', archetype: 'Matrix', accentColor: '#c0c1ff' },
  { icon: 'auto_awesome', label: 'Aura Bloom', shape: 'star', archetype: 'Arcane', accentColor: '#4edea3' },
  { icon: 'adjust', label: 'Orbit Core', shape: 'circle', archetype: 'Cosmic', accentColor: '#8083ff' },
  { icon: 'local_fire_department', label: 'Plasma Flare', shape: 'triangle', archetype: 'Energy', accentColor: '#ffb95f' },
  { icon: 'shield', label: 'Aegis Barrier', shape: 'shield', archetype: 'Defense', accentColor: '#4dc9ff' },
  { icon: 'bolt', label: 'Hyper Velocity', shape: 'cross', archetype: 'Kinetic', accentColor: '#ffd166' },
  { icon: 'fingerprint', label: 'Biometric Node', shape: 'square', archetype: 'Bio', accentColor: '#ff7a90' },
  { icon: 'stream', label: 'Chrono Stream', shape: 'hexagon', archetype: 'Temporal', accentColor: '#a78bfa' },
  { icon: 'token', label: 'Cipher Token', shape: 'circle', archetype: 'Cyber', accentColor: '#38bdf8' },
  { icon: 'cyclone', label: 'Vortex Vector', shape: 'hexagon', archetype: 'Kinetic', accentColor: '#f472b6' },
  { icon: 'hive', label: 'Neural Mesh', shape: 'hexagon', archetype: 'Neural', accentColor: '#34d399' },
  { icon: 'vpn_key', label: 'Master Crypt', shape: 'cross', archetype: 'Security', accentColor: '#fb923c' },
  { icon: 'all_inclusive', label: 'Infinity Loop', shape: 'diamond', archetype: 'Quantum', accentColor: '#e879f9' },
  { icon: 'radar', label: 'Pulse Array', shape: 'circle', archetype: 'Radar', accentColor: '#2dd4bf' },
  { icon: 'satellite_alt', label: 'Deep Uplink', shape: 'square', archetype: 'Cosmic', accentColor: '#818cf8' },
  { icon: 'lock', label: 'Firewall Vault', shape: 'shield', archetype: 'Security', accentColor: '#f87171' },
];

/**
 * Generates a freshly shuffled deck for the given difficulty.
 */
export function generateDeck(difficulty: Difficulty): CardData[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const selectedArchetypes = ARCHETYPES.slice(0, config.totalPairs);

  const cards: CardData[] = [];

  selectedArchetypes.forEach((archetype, index) => {
    const pairId = `pair-${index}-${archetype.icon}`;

    // First card of pair
    cards.push({
      id: `${pairId}-a`,
      pairId,
      icon: archetype.icon,
      label: archetype.label,
      shape: archetype.shape,
      archetype: archetype.archetype,
      accentColor: archetype.accentColor,
      isFlipped: false,
      isMatched: false,
      isShaking: false,
      isHighlighted: false
    });

    // Second card of pair
    cards.push({
      id: `${pairId}-b`,
      pairId,
      icon: archetype.icon,
      label: archetype.label,
      shape: archetype.shape,
      archetype: archetype.archetype,
      accentColor: archetype.accentColor,
      isFlipped: false,
      isMatched: false,
      isShaking: false,
      isHighlighted: false
    });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}
