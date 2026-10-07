import { PetEntity, LifeStage } from '../src/types/pet.js';

export interface EvolutionCheckResult {
  canEvolve: boolean;
  nextSpeciesId: string | null;
  nextStage: LifeStage | null;
  prerequisiteExplanation: string;
}

export function evaluateEpigeneticEvolution(pet: PetEntity): EvolutionCheckResult {
  const { stage, experience, epigenetics, ageDays } = pet;
  const actions = pet.careActionsTotal || 0;

  // Stage 1: EGG -> BABY
  if (stage === 'EGG') {
    return {
      canEvolve: true,
      nextSpeciesId: 'blobkin',
      nextStage: 'BABY',
      prerequisiteExplanation: 'Egg is fully incubated and ready to hatch!',
    };
  }

  // Stage 2: BABY -> CHILD (Threshold: EXP >= 60 or Actions >= 6)
  if (stage === 'BABY') {
    const isEligible = experience >= 60 || actions >= 6;
    if (!isEligible) {
      return {
        canEvolve: false,
        nextSpeciesId: null,
        nextStage: null,
        prerequisiteExplanation: `Needs 60 EXP (Current: ${experience}/60). Nurture your Blobkin with meals, bath time, and play!`,
      };
    }

    if (epigenetics.hygieneCareAverage >= 0.7) {
      return {
        canEvolve: true,
        nextSpeciesId: 'chibi_sprout',
        nextStage: 'CHILD',
        prerequisiteExplanation: 'Pristine hygiene purity has awakened the photosynthetic Chibi Sprout pathway!',
      };
    }

    if (epigenetics.proteinIntake >= epigenetics.sugarIntake) {
      return {
        canEvolve: true,
        nextSpeciesId: 'nibble_pug',
        nextStage: 'CHILD',
        prerequisiteExplanation: 'Hearty protein intake has developed muscular dragon puppy instincts into Nibble Pug!',
      };
    }

    return {
      canEvolve: true,
      nextSpeciesId: 'sparkle_mite',
      nextStage: 'CHILD',
      prerequisiteExplanation: 'A sugary confectionery diet has energized floating plasma dust into Sparkle Mite!',
    };
  }

  // Stage 3: CHILD -> TEEN (Threshold: EXP >= 160 or Actions >= 16)
  if (stage === 'CHILD') {
    const isEligible = experience >= 160 || actions >= 16;
    if (!isEligible) {
      return {
        canEvolve: false,
        nextSpeciesId: null,
        nextStage: null,
        prerequisiteExplanation: `Needs 160 EXP (Current: ${experience}/160) to enter adolescence.`,
      };
    }

    if (epigenetics.hygieneCareAverage >= 0.75 && epigenetics.proteinIntake > 30) {
      return {
        canEvolve: true,
        nextSpeciesId: 'verdant_cub',
        nextStage: 'TEEN',
        prerequisiteExplanation: 'Forest harmony and clean terrarium metrics unlock Verdant Cub!',
      };
    }

    if (epigenetics.proteinIntake >= 50 && epigenetics.playDisciplineRatio >= 0.5) {
      return {
        canEvolve: true,
        nextSpeciesId: 'pyro_fang',
        nextStage: 'TEEN',
        prerequisiteExplanation: 'High-protein diet paired with disciplined exercise ignites Pyro Fang!',
      };
    }

    if (epigenetics.sugarIntake >= 50) {
      return {
        canEvolve: true,
        nextSpeciesId: 'glimmer_sprite',
        nextStage: 'TEEN',
        prerequisiteExplanation: 'Confectionery diet and dream state sweetness blossom into Glimmer Sprite!',
      };
    }

    return {
      canEvolve: true,
      nextSpeciesId: 'iron_shell',
      nextStage: 'TEEN',
      prerequisiteExplanation: 'Patience, endurance, and structured sleeping routines forged Iron Shell!',
    };
  }

  // Stage 4: TEEN -> ADULT (Threshold: EXP >= 300 or Actions >= 30)
  if (stage === 'TEEN') {
    const isEligible = experience >= 300 || actions >= 30;
    if (!isEligible) {
      return {
        canEvolve: false,
        nextSpeciesId: null,
        nextStage: null,
        prerequisiteExplanation: `Needs 300 EXP (Current: ${experience}/300) to mature into adulthood.`,
      };
    }

    if (epigenetics.playDisciplineRatio >= 0.65 && epigenetics.proteinIntake >= 75) {
      return {
        canEvolve: true,
        nextSpeciesId: 'cyber_drake',
        nextStage: 'ADULT',
        prerequisiteExplanation: 'Elite discipline and peak protein power synched the legendary Cyber Drake!',
      };
    }

    if (epigenetics.hygieneCareAverage >= 0.85) {
      return {
        canEvolve: true,
        nextSpeciesId: 'mossy_boulderkind',
        nextStage: 'ADULT',
        prerequisiteExplanation: 'Spotless sanctuary hygiene has grounded your companion into Mossy Boulderkind!',
      };
    }

    if (epigenetics.sugarIntake >= 80) {
      return {
        canEvolve: true,
        nextSpeciesId: 'astral_wisp',
        nextStage: 'ADULT',
        prerequisiteExplanation: 'Cosmic sugar resonance lifts your companion into weightless Astral Wisp!',
      };
    }

    if (epigenetics.hygieneCareAverage >= 0.75 && epigenetics.playDisciplineRatio >= 0.55) {
      return {
        canEvolve: true,
        nextSpeciesId: 'solar_gryphon',
        nextStage: 'ADULT',
        prerequisiteExplanation: 'Pristine purity and athletic play summon the Solar Gryphon!',
      };
    }

    if (epigenetics.proteinIntake >= 70) {
      return {
        canEvolve: true,
        nextSpeciesId: 'mecha_titan',
        nextStage: 'ADULT',
        prerequisiteExplanation: 'Heavy calorie intake and industrial strength build Mecha Titan!',
      };
    }

    return {
      canEvolve: true,
      nextSpeciesId: 'voidling',
      nextStage: 'ADULT',
      prerequisiteExplanation: 'Twilight calm and subtle affection manifest the mysterious Shadow Voidling!',
    };
  }

  // Stage 5: ADULT -> ANCIENT (Threshold: EXP >= 600 or Actions >= 60)
  if (stage === 'ADULT') {
    const isEligible = experience >= 600 || actions >= 60;
    if (!isEligible) {
      return {
        canEvolve: false,
        nextSpeciesId: null,
        nextStage: null,
        prerequisiteExplanation: `Needs 600 EXP (Current: ${experience}/600) to ascend to Ancient status.`,
      };
    }

    if (epigenetics.hygieneCareAverage >= 0.85 && epigenetics.playDisciplineRatio >= 0.7) {
      return {
        canEvolve: true,
        nextSpeciesId: 'celestial_guardian',
        nextStage: 'ANCIENT',
        prerequisiteExplanation: 'Mastery of mind, body, and habitat ascends your pet into Celestial Guardian!',
      };
    }

    if (ageDays >= 7) {
      return {
        canEvolve: true,
        nextSpeciesId: 'chrono_dragon',
        nextStage: 'ANCIENT',
        prerequisiteExplanation: 'Surviving through multiple circadian weeks awakens Chrono Dragon!',
      };
    }

    return {
      canEvolve: true,
      nextSpeciesId: 'gaia_behemoth',
      nextStage: 'ANCIENT',
      prerequisiteExplanation: 'Deep sanctuary roots flourish into the towering Gaia Behemoth!',
    };
  }

  return {
    canEvolve: false,
    nextSpeciesId: null,
    nextStage: null,
    prerequisiteExplanation: 'This companion has attained the ultimate Ancient form.',
  };
}
