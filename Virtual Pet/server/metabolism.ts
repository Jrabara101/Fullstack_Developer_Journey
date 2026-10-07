import { PetEntity, PetMood, PetVitals } from '../src/types/pet.js';

export interface OfflineReconciliationResult {
  updatedVitals: PetVitals;
  newMood: PetMood;
  newWasteCount: number;
  newAgeDays: number;
  elapsedSeconds: number;
  report: {
    hoursAway: number;
    decayApplied: {
      hungerLoss: number;
      hygieneLoss: number;
      happinessLoss: number;
      energyChange: number;
    };
    wasteSpawned: number;
    summaryText: string;
  };
}

export function reconcileOfflineDecay(
  pet: PetEntity,
  nowIso: string = new Date().toISOString()
): OfflineReconciliationResult {
  const lastTickTime = new Date(pet.lastTickAt).getTime();
  const nowTime = new Date(nowIso).getTime();
  const elapsedSeconds = Math.max(0, (nowTime - lastTickTime) / 1000);
  const elapsedHours = elapsedSeconds / 3600;

  // Don't apply decay for egg stage until hatched
  if (pet.stage === 'EGG') {
    return {
      updatedVitals: { ...pet.vitals },
      newMood: 'CONTENT',
      newWasteCount: 0,
      newAgeDays: pet.ageDays,
      elapsedSeconds,
      report: {
        hoursAway: Number(elapsedHours.toFixed(1)),
        decayApplied: { hungerLoss: 0, hygieneLoss: 0, happinessLoss: 0, energyChange: 0 },
        wasteSpawned: 0,
        summaryText: 'The egg remained warm in the nursery incubator.',
      },
    };
  }

  const vitals = { ...pet.vitals };
  let hungerLoss = 0;
  let hygieneLoss = 0;
  let energyChange = 0;
  let happinessLoss = 0;

  // Circadian rates
  if (pet.isSleeping) {
    // Dream state: Slower hunger decay, gentle hygiene loss, deep energy recovery
    hungerLoss = elapsedHours * 2.8;
    hygieneLoss = elapsedHours * 2.2;
    energyChange = elapsedHours * 20.0; // recovers up to 100
  } else {
    // Active state
    hungerLoss = elapsedHours * 6.5;
    const wasteAcceleration = 1.0 + pet.wasteCount * 0.4;
    hygieneLoss = elapsedHours * 5.0 * wasteAcceleration;
    energyChange = -(elapsedHours * 5.2);
  }

  // Calculate waste accumulation: 1 waste per ~4 hours offline, capped at 6
  const wasteSpawned = Math.floor(elapsedHours / 4);
  const newWasteCount = Math.min(6, pet.wasteCount + wasteSpawned);

  // Apply decay clamped to 0..100
  vitals.hunger = Math.max(0, Math.min(100, vitals.hunger - hungerLoss));
  vitals.hygiene = Math.max(0, Math.min(100, vitals.hygiene - hygieneLoss));
  vitals.energy = Math.max(0, Math.min(100, vitals.energy + energyChange));

  // Happiness depends on other vitals & environment cleanliness
  if (vitals.hunger < 40) {
    happinessLoss += (40 - vitals.hunger) * 0.3 * elapsedHours;
  }
  if (vitals.hygiene < 40) {
    happinessLoss += (40 - vitals.hygiene) * 0.3 * elapsedHours;
  }
  if (newWasteCount > 0) {
    happinessLoss += newWasteCount * 2.5 * elapsedHours;
  }

  vitals.happiness = Math.max(0, Math.min(100, vitals.happiness - happinessLoss));

  // Determine authoritative mood
  const newMood = resolveAuthoritativeMood(vitals);

  // Calculate age progression: 1 day per 24 hours elapsed
  const newAgeDays = Number((pet.ageDays + elapsedHours / 24).toFixed(2));

  // Summarize offline impact
  let summaryText = `Welcome back! You were away for ${elapsedHours.toFixed(1)}h. `;
  if (wasteSpawned > 0) {
    summaryText += `${wasteSpawned} new droppings accumulated in the terrarium. `;
  }
  if (pet.isSleeping) {
    summaryText += `Your companion rested peacefully in dream state.`;
  } else if (newMood === 'SICK') {
    summaryText += `Vitals dropped critically—your pet needs medicine and cleaning!`;
  } else if (newMood === 'HUNGRY') {
    summaryText += `Your pet's stomach is rumbling for a wholesome meal.`;
  } else {
    summaryText += `Your pet stayed comfortable and is eager to play!`;
  }

  return {
    updatedVitals: vitals,
    newMood,
    newWasteCount,
    newAgeDays,
    elapsedSeconds,
    report: {
      hoursAway: Number(elapsedHours.toFixed(1)),
      decayApplied: {
        hungerLoss: Number(hungerLoss.toFixed(1)),
        hygieneLoss: Number(hygieneLoss.toFixed(1)),
        happinessLoss: Number(happinessLoss.toFixed(1)),
        energyChange: Number(energyChange.toFixed(1)),
      },
      wasteSpawned,
      summaryText,
    },
  };
}

export function resolveAuthoritativeMood(vitals: PetVitals): PetMood {
  if (vitals.hygiene <= 15 || vitals.hunger <= 12) {
    return 'SICK';
  }
  if (vitals.energy <= 20) {
    return 'EXHAUSTED';
  }
  if (vitals.hunger <= 35) {
    return 'HUNGRY';
  }
  if (vitals.hygiene <= 35) {
    return 'DIRTY';
  }
  if (vitals.happiness >= 80 && vitals.hunger >= 60 && vitals.hygiene >= 60) {
    return 'ECSTATIC';
  }
  return 'CONTENT';
}
