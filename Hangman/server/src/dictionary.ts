// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Word Dictionary & Validation Service
// ═══════════════════════════════════════════════════════════════════════════════

import type { Difficulty, WordData } from '../../shared/types.js';

interface RawWord {
  word: string;
  category: string;
  definition?: string;
  partOfSpeech?: string;
  etymology?: string;
}

const WORD_BANK: Record<Difficulty, RawWord[]> = {
  EASY: [
    { word: 'PLANET', category: 'Science', definition: 'A celestial body orbiting a star', partOfSpeech: 'noun', etymology: 'Greek planetes — wanderer' },
    { word: 'BRIDGE', category: 'Architecture', definition: 'A structure spanning a physical obstacle', partOfSpeech: 'noun', etymology: 'Old English brycg' },
    { word: 'GARDEN', category: 'Nature', definition: 'A piece of ground used for growing flowers or vegetables', partOfSpeech: 'noun', etymology: 'Anglo-Norman gardin' },
    { word: 'ROCKET', category: 'Technology', definition: 'A vehicle propelled by engine exhaust', partOfSpeech: 'noun', etymology: 'Italian rocchetta — small distaff' },
    { word: 'CASTLE', category: 'History', definition: 'A large fortified building from the medieval period', partOfSpeech: 'noun', etymology: 'Latin castellum — fortified place' },
    { word: 'SILVER', category: 'Materials', definition: 'A lustrous white precious metal', partOfSpeech: 'noun', etymology: 'Old English seolfor' },
    { word: 'FALCON', category: 'Nature', definition: 'A bird of prey with long pointed wings', partOfSpeech: 'noun', etymology: 'Latin falco — sickle, referring to claws' },
    { word: 'CANDLE', category: 'Objects', definition: 'A cylinder of wax with a wick for giving light', partOfSpeech: 'noun', etymology: 'Latin candela — to shine' },
    { word: 'FROZEN', category: 'Nature', definition: 'Turned into ice or covered with ice', partOfSpeech: 'adjective', etymology: 'Old English froren' },
    { word: 'WINTER', category: 'Seasons', definition: 'The coldest season of the year', partOfSpeech: 'noun', etymology: 'Old English winter' },
    { word: 'THRONE', category: 'History', definition: 'A ceremonial chair for a sovereign', partOfSpeech: 'noun', etymology: 'Greek thronos — elevated seat' },
    { word: 'STREAM', category: 'Nature', definition: 'A small narrow river', partOfSpeech: 'noun', etymology: 'Old English stream' },
    { word: 'TEMPLE', category: 'Architecture', definition: 'A building devoted to worship', partOfSpeech: 'noun', etymology: 'Latin templum — sacred space' },
    { word: 'PIRATE', category: 'History', definition: 'A person who attacks ships at sea', partOfSpeech: 'noun', etymology: 'Greek peirates — one who attacks' },
    { word: 'GUITAR', category: 'Music', definition: 'A stringed musical instrument', partOfSpeech: 'noun', etymology: 'Spanish guitarra from Greek kithara' },
  ],
  MEDIUM: [
    { word: 'QUANTUM', category: 'Physics', definition: 'The minimum amount of any physical entity', partOfSpeech: 'noun', etymology: 'Latin quantum — how much' },
    { word: 'ECLIPSE', category: 'Astronomy', definition: 'An obscuring of light from one celestial body by another', partOfSpeech: 'noun', etymology: 'Greek ekleipsis — abandonment' },
    { word: 'PARADOX', category: 'Philosophy', definition: 'A seemingly contradictory statement that may be true', partOfSpeech: 'noun', etymology: 'Greek paradoxon — contrary to expectation' },
    { word: 'ALCHEMY', category: 'History', definition: 'The medieval forerunner of chemistry', partOfSpeech: 'noun', etymology: 'Arabic al-kimiya — the transmutation' },
    { word: 'COMPASS', category: 'Navigation', definition: 'An instrument showing cardinal directions', partOfSpeech: 'noun', etymology: 'Latin compassus — circle together' },
    { word: 'CITADEL', category: 'Architecture', definition: 'A fortress protecting or dominating a city', partOfSpeech: 'noun', etymology: 'Italian cittadella — little city' },
    { word: 'HORIZON', category: 'Nature', definition: 'The line where earth meets sky', partOfSpeech: 'noun', etymology: 'Greek horizōn — bounding circle' },
    { word: 'FURNACE', category: 'Technology', definition: 'An enclosed structure in which material is heated', partOfSpeech: 'noun', etymology: 'Latin fornax — oven' },
    { word: 'VOYAGER', category: 'Exploration', definition: 'A person who makes a long journey', partOfSpeech: 'noun', etymology: 'French voyage — journey by sea' },
    { word: 'CRYPTIC', category: 'Language', definition: 'Having a meaning that is mysterious or obscure', partOfSpeech: 'adjective', etymology: 'Greek kryptikos — hidden' },
    { word: 'PINNACLE', category: 'Nature', definition: 'The highest point of something', partOfSpeech: 'noun', etymology: 'Latin pinnaculum — small peak' },
    { word: 'TEMPEST', category: 'Nature', definition: 'A violent windy storm', partOfSpeech: 'noun', etymology: 'Latin tempestas — season, storm' },
    { word: 'LANTERN', category: 'Objects', definition: 'A lamp with a transparent case protecting the flame', partOfSpeech: 'noun', etymology: 'Latin lanterna from Greek lampter' },
    { word: 'AQUEDUCT', category: 'Engineering', definition: 'A bridge for carrying water across a valley', partOfSpeech: 'noun', etymology: 'Latin aquaeductus — water conduit' },
    { word: 'MOSAIC', category: 'Art', definition: 'A picture produced by arranging small colored pieces', partOfSpeech: 'noun', etymology: 'Greek mouseios — of the Muses' },
  ],
  HARD: [
    { word: 'LABYRINTH', category: 'Mythology', definition: 'An intricate network of passages', partOfSpeech: 'noun', etymology: 'Greek labyrinthos — maze of the Minotaur' },
    { word: 'OBSIDIAN', category: 'Geology', definition: 'Dark volcanic glass formed from rapid lava cooling', partOfSpeech: 'noun', etymology: 'Latin obsidianus, after Obsius' },
    { word: 'EPHEMERAL', category: 'Philosophy', definition: 'Lasting for a very short time', partOfSpeech: 'adjective', etymology: 'Greek ephemeros — lasting a day' },
    { word: 'ALGORITHM', category: 'Mathematics', definition: 'A step-by-step procedure for calculations', partOfSpeech: 'noun', etymology: 'Arabic al-Khwarizmi — the man of Khwarezm' },
    { word: 'CHRYSALIS', category: 'Biology', definition: 'The pupa of a butterfly enclosed in a cocoon', partOfSpeech: 'noun', etymology: 'Greek khrysallis — golden sheath' },
    { word: 'TALISMAN', category: 'Mythology', definition: 'An object believed to bring good luck', partOfSpeech: 'noun', etymology: 'Arabic tilasm from Greek telesma — rite' },
    { word: 'SILHOUETTE', category: 'Art', definition: 'A dark outline against a lighter background', partOfSpeech: 'noun', etymology: 'French — named after Étienne de Silhouette' },
    { word: 'CARTOGRAPHY', category: 'Science', definition: 'The art or practice of drawing maps', partOfSpeech: 'noun', etymology: 'French carte — card, map + Greek graphein' },
    { word: 'ZEPHYR', category: 'Nature', definition: 'A soft gentle breeze', partOfSpeech: 'noun', etymology: 'Greek Zephyros — god of the west wind' },
    { word: 'BASILISK', category: 'Mythology', definition: 'A legendary reptile reputed to kill by its gaze', partOfSpeech: 'noun', etymology: 'Greek basiliskos — little king' },
    { word: 'MONOLITH', category: 'Architecture', definition: 'A large single upright block of stone', partOfSpeech: 'noun', etymology: 'Greek monolithos — single stone' },
    { word: 'ARCHIPELAGO', category: 'Geography', definition: 'A chain of islands', partOfSpeech: 'noun', etymology: 'Italian arcipelago — chief sea' },
  ],
  OBSCURE: [
    { word: 'SYNECDOCHE', category: 'Rhetoric', definition: 'A figure of speech where a part represents the whole', partOfSpeech: 'noun', etymology: 'Greek synekdoche — simultaneous understanding' },
    { word: 'QUIXOTIC', category: 'Literature', definition: 'Extremely idealistic; unrealistic and impractical', partOfSpeech: 'adjective', etymology: 'Spanish — from Don Quixote' },
    { word: 'OUROBOROS', category: 'Symbolism', definition: 'A serpent eating its own tail, symbolizing eternity', partOfSpeech: 'noun', etymology: 'Greek oura — tail + boros — devouring' },
    { word: 'VERISIMILITUDE', category: 'Literature', definition: 'The appearance of being true or real', partOfSpeech: 'noun', etymology: 'Latin verisimilitudo — likeness to truth' },
    { word: 'SHIBBOLETH', category: 'Language', definition: 'A custom or belief distinguishing a group', partOfSpeech: 'noun', etymology: 'Hebrew shibboleth — ear of corn' },
    { word: 'PYRRHIC', category: 'History', definition: 'A victory won at too great a cost', partOfSpeech: 'adjective', etymology: 'Named after King Pyrrhus of Epirus' },
    { word: 'PALIMPSEST', category: 'History', definition: 'A manuscript page reused after earlier writing was erased', partOfSpeech: 'noun', etymology: 'Greek palimpsestos — scraped again' },
    { word: 'CHIAROSCURO', category: 'Art', definition: 'The treatment of light and shade in painting', partOfSpeech: 'noun', etymology: 'Italian chiaro — clear + oscuro — dark' },
    { word: 'CATHARSIS', category: 'Philosophy', definition: 'The purging of emotions through art', partOfSpeech: 'noun', etymology: 'Greek katharsis — purification' },
    { word: 'LIMINAL', category: 'Philosophy', definition: 'Relating to a transitional stage or threshold', partOfSpeech: 'adjective', etymology: 'Latin limen — threshold' },
  ],
};

// ─── Mulberry32 PRNG for Daily Cipher ────────────────────────────────────────

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00Z');
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return year * 10000 + month * 100 + day;
}

// ─── Dictionary Service ──────────────────────────────────────────────────────

export function getRandomWord(difficulty: Difficulty): WordData {
  const pool = WORD_BANK[difficulty];
  const idx = Math.floor(Math.random() * pool.length);
  const raw = pool[idx];
  return {
    word: raw.word,
    category: raw.category,
    difficulty,
    definition: raw.definition,
    partOfSpeech: raw.partOfSpeech,
    etymology: raw.etymology,
    vowelCount: raw.word.split('').filter((c) => 'AEIOU'.includes(c)).length,
  };
}

export function getDailyWord(dateStr?: string): WordData & { seed: number } {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  const seed = dateSeed(today);
  const rng = mulberry32(seed);

  // Cycle through difficulties per day
  const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'OBSCURE'];
  const diffIdx = Math.floor(rng() * difficulties.length);
  const difficulty = difficulties[diffIdx];
  const pool = WORD_BANK[difficulty];
  const wordIdx = Math.floor(rng() * pool.length);
  const raw = pool[wordIdx];

  return {
    word: raw.word,
    category: raw.category,
    difficulty,
    definition: raw.definition,
    partOfSpeech: raw.partOfSpeech,
    etymology: raw.etymology,
    vowelCount: raw.word.split('').filter((c) => 'AEIOU'.includes(c)).length,
    seed,
  };
}

export function getAllWords(): WordData[] {
  const all: WordData[] = [];
  for (const diff of Object.keys(WORD_BANK) as Difficulty[]) {
    for (const raw of WORD_BANK[diff]) {
      all.push({
        word: raw.word,
        category: raw.category,
        difficulty: diff,
        definition: raw.definition,
        partOfSpeech: raw.partOfSpeech,
        etymology: raw.etymology,
        vowelCount: raw.word.split('').filter((c) => 'AEIOU'.includes(c)).length,
      });
    }
  }
  return all;
}

export function validateWord(word: string): boolean {
  const upperWord = word.toUpperCase();
  for (const diff of Object.keys(WORD_BANK) as Difficulty[]) {
    if (WORD_BANK[diff].some((w) => w.word === upperWord)) return true;
  }
  return false;
}
