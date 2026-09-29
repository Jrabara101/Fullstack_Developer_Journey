// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Authoritative Game Engine
// ═══════════════════════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import type {
  Difficulty,
  GameOverPayload,
  GameStatus,
  GuessAttempt,
  GuessResult,
  HangmanSessionState,
  HintResult,
  ThemeId,
  WordData,
} from '../../shared/types.js';
import { getRandomWord, getDailyWord } from './dictionary.js';

export class GameSession {
  readonly sessionId: string;
  private secretWord: string;
  private wordData: WordData;
  theme: ThemeId;
  status: GameStatus;
  maxStrikes: number;
  strikesUsed: number;
  guessedLetters: string[];
  history: GuessAttempt[];
  hintsAvailable: number;
  unlockedHints: string[];
  dailyMode: boolean;
  startTime: number;

  constructor(opts: {
    theme: ThemeId;
    difficulty: Difficulty;
    daily?: boolean;
  }) {
    this.sessionId = uuidv4();
    this.theme = opts.theme;
    this.dailyMode = opts.daily ?? false;
    this.maxStrikes = 6;
    this.strikesUsed = 0;
    this.guessedLetters = [];
    this.history = [];
    this.status = 'PLAYING';
    this.hintsAvailable = 3;
    this.unlockedHints = [];
    this.startTime = Date.now();

    if (this.dailyMode) {
      const daily = getDailyWord();
      this.secretWord = daily.word;
      this.wordData = daily;
    } else {
      const word = getRandomWord(opts.difficulty);
      this.secretWord = word.word;
      this.wordData = word;
    }
  }

  get maskedWord(): (string | null)[] {
    return this.secretWord.split('').map((ch) =>
      this.guessedLetters.includes(ch) ? ch : null
    );
  }

  get correctLetters(): string[] {
    return this.guessedLetters.filter((l) => this.secretWord.includes(l));
  }

  get incorrectLetters(): string[] {
    return this.guessedLetters.filter((l) => !this.secretWord.includes(l));
  }

  get elapsedMs(): number {
    return Date.now() - this.startTime;
  }

  private checkWin(): boolean {
    return this.secretWord.split('').every((ch) =>
      this.guessedLetters.includes(ch)
    );
  }

  private checkLoss(): boolean {
    return this.strikesUsed >= this.maxStrikes;
  }

  guess(letter: string): GuessResult {
    const normalizedLetter = letter.toUpperCase();

    if (this.status !== 'PLAYING') {
      throw new Error('Game is not in progress');
    }

    if (this.guessedLetters.includes(normalizedLetter)) {
      throw new Error(`Letter "${normalizedLetter}" already guessed`);
    }

    if (!/^[A-Z]$/.test(normalizedLetter)) {
      throw new Error('Invalid letter');
    }

    this.guessedLetters.push(normalizedLetter);
    const isCorrect = this.secretWord.includes(normalizedLetter);

    if (!isCorrect) {
      this.strikesUsed++;
    }

    this.history.push({
      letter: normalizedLetter,
      isCorrect,
      timestamp: Date.now(),
    });

    // Auto-unlock progressive hints after 3 misses
    const newHints: string[] = [];
    if (this.strikesUsed >= 3 && this.unlockedHints.length === 0) {
      const hint = `Vowel Count: ${this.wordData.vowelCount}`;
      this.unlockedHints.push(hint);
      newHints.push(hint);
    }
    if (this.strikesUsed >= 4 && this.unlockedHints.length === 1 && this.wordData.partOfSpeech) {
      const hint = `Part of Speech: ${this.wordData.partOfSpeech}`;
      this.unlockedHints.push(hint);
      newHints.push(hint);
    }
    if (this.strikesUsed >= 5 && this.unlockedHints.length === 2 && this.wordData.etymology) {
      const hint = `Etymology: ${this.wordData.etymology}`;
      this.unlockedHints.push(hint);
      newHints.push(hint);
    }

    if (this.checkWin()) {
      this.status = 'WON';
    } else if (this.checkLoss()) {
      this.status = 'LOST';
    }

    return {
      letter: normalizedLetter,
      isCorrect,
      maskedWord: this.maskedWord,
      strikesUsed: this.strikesUsed,
      status: this.status,
      hintsAvailable: this.hintsAvailable,
      newHints: newHints.length > 0 ? newHints : undefined,
    };
  }

  useHint(): HintResult {
    if (this.status !== 'PLAYING') {
      throw new Error('Game is not in progress');
    }
    if (this.hintsAvailable <= 0) {
      throw new Error('No hints remaining');
    }

    this.hintsAvailable--;

    // Reveal a random unrevealed letter
    const unrevealedLetters = [...new Set(
      this.secretWord.split('').filter((ch) => !this.guessedLetters.includes(ch))
    )];

    if (unrevealedLetters.length > 0) {
      const revealLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
      this.guessedLetters.push(revealLetter);
      this.history.push({
        letter: revealLetter,
        isCorrect: true,
        timestamp: Date.now(),
      });

      if (this.checkWin()) {
        this.status = 'WON';
      }

      return {
        type: 'random_reveal',
        content: `Revealed: ${revealLetter}`,
        hintsRemaining: this.hintsAvailable,
      };
    }

    return {
      type: 'category_clue',
      content: `Category: ${this.wordData.category}`,
      hintsRemaining: this.hintsAvailable,
    };
  }

  getState(): HangmanSessionState {
    return {
      sessionId: this.sessionId,
      theme: this.theme,
      status: this.status,
      maxStrikes: this.maxStrikes,
      strikesUsed: this.strikesUsed,
      wordLength: this.secretWord.length,
      maskedWord: this.maskedWord,
      guessedLetters: this.guessedLetters,
      correctLetters: this.correctLetters,
      incorrectLetters: this.incorrectLetters,
      history: this.history,
      category: this.wordData.category,
      difficulty: this.wordData.difficulty,
      hintsAvailable: this.hintsAvailable,
      unlockedHints: this.unlockedHints,
      dailyMode: this.dailyMode,
      startTime: this.startTime,
      elapsedMs: this.elapsedMs,
    };
  }

  getGameOverPayload(): GameOverPayload {
    const emojiGrid = this.history.map((g) =>
      g.isCorrect ? '🟩' : '🟥'
    ).join(' ');

    const shareText = this.dailyMode
      ? `🔐 THE CIPHER GALLOWS — Daily Cipher\n${emojiGrid}\n⚡ Strikes: ${this.strikesUsed}/${this.maxStrikes} | 🔤 ${this.secretWord.length} letters\n${this.status === 'WON' ? '✅ DECRYPTED' : '💀 COMPROMISED'}`
      : `🔐 THE CIPHER GALLOWS\n${emojiGrid}\n⚡ ${this.strikesUsed}/${this.maxStrikes} | ${this.status === 'WON' ? '✅' : '💀'}`;

    return {
      status: this.status as 'WON' | 'LOST',
      word: this.secretWord,
      definition: this.wordData.definition,
      partOfSpeech: this.wordData.partOfSpeech,
      strikesUsed: this.strikesUsed,
      totalGuesses: this.history.length,
      elapsedMs: this.elapsedMs,
      shareText,
    };
  }
}
