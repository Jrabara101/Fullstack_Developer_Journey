import type { FighterClass, AbilityDefinition } from '../types';

export interface ClassConfig {
  fighterClass: FighterClass;
  title: string;
  subtitle: string;
  description: string;
  maxHp: number;
  maxStamina: number;
  maxMana: number;
  baseSpeed: number;
  colorTheme: string;
  abilities: AbilityDefinition[];
  passiveText: string;
}

export function getDefaultAbilities(): AbilityDefinition[] {
  return [
    {
      id: 'SLASH',
      name: 'Runic Slash',
      hotkey: 'LMB',
      manaCost: 0,
      staminaCost: 10,
      cooldownMs: 250,
      lastUsedTimestamp: 0,
      iconName: 'Sword',
      description: 'Quick sweeping blade strike. Inflicts physical and posture damage.'
    },
    {
      id: 'PARRY',
      name: 'Riposte Guard',
      hotkey: 'RMB',
      manaCost: 0,
      staminaCost: 12,
      cooldownMs: 800,
      lastUsedTimestamp: 0,
      iconName: 'Shield',
      description: 'Precision 150ms deflection window. Deflects incoming blows and inflicts 35 Posture Damage.'
    },
    {
      id: 'DASH',
      name: 'Phantom Dash',
      hotkey: 'Space',
      manaCost: 0,
      staminaCost: 24,
      cooldownMs: 650,
      lastUsedTimestamp: 0,
      iconName: 'Zap',
      description: 'Directional evasive roll grant 300ms invulnerability (I-frames).'
    },
    {
      id: 'FROST_NOVA',
      name: 'Frost Nova',
      hotkey: 'Q',
      manaCost: 35,
      staminaCost: 0,
      cooldownMs: 4000,
      lastUsedTimestamp: 0,
      iconName: 'Snowflake',
      description: 'Detonates an icy blizzard ring. Freezes nearby foes and primes them for Shatter Combos.'
    },
    {
      id: 'FLAME_SWEEP',
      name: 'Flame Sweep',
      hotkey: 'E',
      manaCost: 40,
      staminaCost: 0,
      cooldownMs: 3200,
      lastUsedTimestamp: 0,
      iconName: 'Flame',
      description: 'Wide fiery cone arc. Ignites targets with lingering burn damage.'
    },
    {
      id: 'OVERDRIVE',
      name: 'Arcane Overdrive',
      hotkey: 'R',
      manaCost: 65,
      staminaCost: 0,
      cooldownMs: 14000,
      lastUsedTimestamp: 0,
      iconName: 'Sparkles',
      description: 'Surges with raw arcane fury for 6s. +100% damage and lightning arcs on hit.'
    }
  ];
}

export const CLASS_CONFIGS: Record<FighterClass, ClassConfig> = {
  WARRIOR: {
    fighterClass: 'WARRIOR',
    title: 'Warlord Centurion',
    subtitle: 'Bulwark of the Sands',
    description: 'A heavily armored gladiator specializing in tight posture parries and punishing critical counterstrikes.',
    maxHp: 650,
    maxStamina: 140,
    maxMana: 80,
    baseSpeed: 230,
    colorTheme: '#F59E0B',
    passiveText: 'Iron Bastion: Perfect parrying restores 25 Stamina and deals +15 bonus posture damage.',
    abilities: getDefaultAbilities()
  },
  BATTLE_MAGE: {
    fighterClass: 'BATTLE_MAGE',
    title: 'Runic Spellblade',
    subtitle: 'Weaver of Arcane Cataclysms',
    description: 'Harnesses frost and flame runes to trigger elemental combustion reactions and arena-wide crowd control.',
    maxHp: 440,
    maxStamina: 100,
    maxMana: 220,
    baseSpeed: 250,
    colorTheme: '#06B6D4',
    passiveText: 'Spell Weaving: Striking a frozen target with flame triggers a Steam Shatter critical explosion.',
    abilities: getDefaultAbilities()
  },
  ROGUE: {
    fighterClass: 'ROGUE',
    title: 'Shadow Corsair',
    subtitle: 'Dancer of the Razor Edge',
    description: 'Blisteringly fast dual-dagger assassin with extended dash i-frames and lethal execution multipliers.',
    maxHp: 480,
    maxStamina: 170,
    maxMana: 110,
    baseSpeed: 285,
    colorTheme: '#10B981',
    passiveText: 'Executioner: Posture-broken foes take 2.2x lethal execution damage from strikes.',
    abilities: getDefaultAbilities()
  }
};
