export type LifeStage = 'EGG' | 'BABY' | 'CHILD' | 'TEEN' | 'ADULT' | 'ANCIENT';
export type PetMood = 'ECSTATIC' | 'CONTENT' | 'HUNGRY' | 'DIRTY' | 'EXHAUSTED' | 'SICK';
export type FoodCategory = 'FRUIT' | 'MEAT' | 'SWEET' | 'MEDICINE';

export interface EpigeneticProfile {
  sugarIntake: number;
  proteinIntake: number;
  hygieneCareAverage: number; // 0.0 - 1.0
  playDisciplineRatio: number; // 0.0 - 1.0
}

export interface PetVitals {
  hunger: number; // 0 - 100 (100 = full)
  hygiene: number; // 0 - 100 (100 = spotless)
  happiness: number; // 0 - 100 (100 = joyful)
  energy: number; // 0 - 100 (100 = fully rested)
}

export interface PetEntity {
  id: string;
  name: string;
  speciesId: string;
  stage: LifeStage;
  mood: PetMood;
  vitals: PetVitals;
  ageDays: number;
  experience: number;
  wasteCount: number; // number of uncleaned droppings
  isSleeping: boolean;
  epigenetics: EpigeneticProfile;
  bornAt: string;
  lastTickAt: string;
  lineagePath?: string[];
  careActionsTotal?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  hungerRestore: number;
  happinessRestore: number;
  epigeneticModifiers: Partial<EpigeneticProfile>;
  quantity: number;
  icon: string;
  description: string;
  color: string;
}

export interface PeerPetState {
  petId: string;
  name: string;
  speciesId: string;
  x: number;
  y: number;
  mood: PetMood;
  emote?: string | null;
  lastUpdate: number;
}

export interface VirtualPetGameState {
  pet: PetEntity;
  inventory: FoodItem[];
  coins: number;
  activeTool: 'HAND' | 'SPONGE' | 'FOOD_DROPPER' | 'BALL' | null;
  selectedFoodId: string | null;
  dayNightPhase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
  roomSync: {
    isConnected: boolean;
    roomId: string | null;
    peers: PeerPetState[];
  };
}

export interface SpeciesInfo {
  id: string;
  name: string;
  stage: LifeStage;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  features: string[];
  dietPreference: string;
  epigeneticRequirement: string;
  avatarEmoji: string;
}

export interface HybridSeed {
  id: string;
  donorPetName: string;
  donorSpecies: string;
  rarity: 'COMMON' | 'RARE' | 'MYTHIC' | 'CELESTIAL';
  traits: string[];
  createdAt: string;
}

export interface SyncResponse {
  pet: PetEntity;
  serverTime: string;
  elapsedSeconds: number;
  offlineReport?: {
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
