// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Shared Game State Contract
// ═══════════════════════════════════════════════════════════════════════════════

export type GameStatus = 'IDLE' | 'PLAYING' | 'WON' | 'LOST';

export type ThemeId = 'steampunk_automaton' | 'deep_sea_diver' | 'orbital_astronaut';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'OBSCURE';

export interface GuessAttempt {
  letter: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface HangmanSessionState {
  sessionId: string;
  theme: ThemeId;
  status: GameStatus;
  maxStrikes: number;
  strikesUsed: number;
  wordLength: number;
  maskedWord: (string | null)[];
  guessedLetters: string[];
  correctLetters: string[];
  incorrectLetters: string[];
  history: GuessAttempt[];
  category: string;
  difficulty: Difficulty;
  hintsAvailable: number;
  unlockedHints: string[];
  dailyMode: boolean;
  startTime: number;
  elapsedMs: number;
}

export interface WordData {
  word: string;
  category: string;
  difficulty: Difficulty;
  definition?: string;
  partOfSpeech?: string;
  etymology?: string;
  vowelCount?: number;
}

export interface DailyCipherData {
  date: string;
  seed: number;
  wordData: Omit<WordData, 'word'> & { wordLength: number };
}

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  maskedWord: (string | null)[];
  strikesUsed: number;
  status: GameStatus;
  hintsAvailable: number;
  newHints?: string[];
}

export interface HintResult {
  type: 'vowel_count' | 'part_of_speech' | 'etymology' | 'category_clue' | 'random_reveal';
  content: string;
  hintsRemaining: number;
}

export interface GameOverPayload {
  status: 'WON' | 'LOST';
  word: string;
  definition?: string;
  partOfSpeech?: string;
  strikesUsed: number;
  totalGuesses: number;
  elapsedMs: number;
  shareText: string;
}

// Letter frequency data for English corpus telemetry
export const ENGLISH_LETTER_FREQUENCY: Record<string, number> = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0,
  N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3,
  L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4,
  F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5,
  V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.10,
  Z: 0.07,
};

// Socket.io event contracts
export interface ServerToClientEvents {
  'game:state': (state: HangmanSessionState) => void;
  'game:guess-result': (result: GuessResult) => void;
  'game:hint': (hint: HintResult) => void;
  'game:over': (payload: GameOverPayload) => void;
  'game:error': (message: string) => void;
}

export interface ClientToServerEvents {
  'game:new': (opts: { theme: ThemeId; difficulty: Difficulty; daily?: boolean }) => void;
  'game:guess': (letter: string) => void;
  'game:hint': () => void;
  'game:reset': () => void;
}
