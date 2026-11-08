export type MoodCraving = 
  | 'all'
  | 'rainy-day'
  | 'chocolatey-nutty'
  | 'bright-floral'
  | 'clean-focus'
  | 'caffeine-free';

export type MilkOption = 'oat' | 'whole' | 'almond' | 'none';

export type TimeOfDayPhase = 'morning' | 'midday' | 'golden-hour' | 'evening-lounge';

export type WeatherCondition = 'crisp-sunny' | 'rainy-drizzle' | 'overcast-fog' | 'golden-breeze';

export interface CupLayer {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'espresso' | 'filter' | 'signature' | 'tea-botanical' | 'decaf';
  price: number;
  size: string;
  temp: 'hot' | 'iced' | 'both';
  roastWarmth: 1 | 2 | 3;
  sweetness: 1 | 2 | 3;
  caffeineKick: 1 | 2 | 3;
  tastingNotes: string[];
  moodCravings: MoodCraving[];
  cupAnatomy: CupLayer[];
  ratioDescription: string;
  description: string;
  calories: number;
  isGlutenFree: boolean;
  isVeganByDefault: boolean;
  soulmatePastryId?: string;
  seasonalTag?: string;
  isBaristaPick?: boolean;
  baristaNote?: string;
}

export interface PastryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  bakedMinutesAgo: number;
  bakeBatchNumber: string;
  stockRemaining: number;
  isGlutenFree: boolean;
  isVegan: boolean;
  pairingDrinkName: string;
  image: string;
}

export interface BrewStep {
  time: string;
  action: string;
  waterAmount: string;
  tip: string;
}

export interface BrewRecipe {
  method: 'V60 Pour-Over' | 'AeroPress' | 'French Press';
  doseGrams: number;
  waterGrams: number;
  waterTempC: number;
  bloomSeconds: number;
  totalTimeSeconds: number;
  grindSize: string;
  ratio: string;
  steps: BrewStep[];
}

export interface CoffeeBeanBag {
  id: string;
  name: string;
  originCountry: string;
  region: string;
  farmName: string;
  producer: string;
  elevation: string;
  variety: string;
  processMethod: string;
  roastProfile: 'Light' | 'Medium-Light' | 'Medium';
  tastingNotes: string[];
  acidity: string;
  body: string;
  price: number;
  weightGrams: number;
  roastBatchDate: string;
  story: string;
  flavorTags: MoodCraving[];
  brewRecipes: {
    v60: BrewRecipe;
    aeropress: BrewRecipe;
    frenchpress: BrewRecipe;
  };
}

export interface SeatingZone {
  id: string;
  name: string;
  shortLabel: string;
  numberTag: number;
  currentOccupancyPct: number;
  totalSeats: number;
  outletsCount: number;
  vibe: string;
  bestFor: string;
  lighting: string;
  noiseLevel: 'Quiet Whisper' | 'Gentle Hum' | 'Lively Cafe Buzz';
  dogFriendly: boolean;
  hasFastWifi: boolean;
  description: string;
  pinX: number; // percentage across floorplan
  pinY: number; // percentage down floorplan
  image: string;
}

export interface BaristaSpotlight {
  id: string;
  name: string;
  role: string;
  shiftToday: string;
  photo: string;
  favDrinkName: string;
  favDrinkId: string;
  tastingQuote: string;
  secretModification: string;
  pairingPastryId: string;
}

export interface CommunityCup {
  id: string;
  from: string;
  recipientNote: string;
  drinkName: string;
  amount: number;
  timestamp: string;
  isClaimed: boolean;
  claimedBy?: string;
  stickyColor: 'yellow' | 'sage' | 'peach' | 'amber';
}

export interface CartItem {
  cartItemId: string;
  itemId: string;
  itemType: 'drink' | 'pastry' | 'bean';
  name: string;
  price: number;
  milkChoice?: MilkOption;
  tempChoice?: 'hot' | 'iced';
  quantity: number;
  pairedPastry?: {
    id: string;
    name: string;
    price: number;
  };
  customNote?: string;
}

export type ArrivalMode = 'walking-5' | 'walking-10' | 'biking-10' | 'dine-in-table' | 'curbside-15';

export interface WeatherInfo {
  condition: WeatherCondition;
  tempF: number;
  label: string;
  recommendationReason: string;
  suggestedDrinkId: string;
}

export interface TurntableTrack {
  title: string;
  artist: string;
  album: string;
  rpm: '33 RPM' | '45 RPM';
  side: 'Side A' | 'Side B';
}

