// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Headless React Game Engine Hook (useHangmanGame)
// Socket.io integration with optimistic updates, local fallback & keyboard listener
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  Difficulty,
  GameOverPayload,
  GuessResult,
  HangmanSessionState,
  HintResult,
  ThemeId,
} from '../../../../shared/types';
import { audioEngine } from '../lib/audio';

// Embedded fallback words for instantaneous offline / standalone capability
const LOCAL_FALLBACK_WORDS = [
  { word: 'CRYPTOGRAM', category: 'Cryptography', difficulty: 'HARD' as Difficulty, definition: 'A text written in code or cipher', partOfSpeech: 'noun', etymology: 'Greek kryptos (hidden) + gramma (letter)' },
  { word: 'OBSIDIAN', category: 'Geology', difficulty: 'HARD' as Difficulty, definition: 'Dark natural volcanic glass', partOfSpeech: 'noun', etymology: 'Latin obsidianus' },
  { word: 'AUTOMATON', category: 'Cybernetics', difficulty: 'MEDIUM' as Difficulty, definition: 'A self-operating machine or mechanism', partOfSpeech: 'noun', etymology: 'Greek automatos (self-acting)' },
  { word: 'VOYAGER', category: 'Exploration', difficulty: 'MEDIUM' as Difficulty, definition: 'A person who makes a long cosmic or maritime journey', partOfSpeech: 'noun', etymology: 'French voyage' },
  { word: 'LABYRINTH', category: 'Mythology', difficulty: 'HARD' as Difficulty, definition: 'A complicated irregular network of passages', partOfSpeech: 'noun', etymology: 'Greek labyrinthos' },
  { word: 'EPHEMERAL', category: 'Philosophy', difficulty: 'OBSCURE' as Difficulty, definition: 'Lasting for a very brief duration', partOfSpeech: 'adjective', etymology: 'Greek ephemeros (lasting a day)' },
  { word: 'ZEPHYR', category: 'Atmosphere', difficulty: 'HARD' as Difficulty, definition: 'A light, gentle westerly breeze', partOfSpeech: 'noun', etymology: 'Greek Zephyros' },
];

export function useHangmanGame() {
  const [session, setSession] = useState<HangmanSessionState>({
    sessionId: 'local-init',
    theme: 'deep_sea_diver',
    status: 'PLAYING',
    maxStrikes: 6,
    strikesUsed: 0,
    wordLength: 10,
    maskedWord: Array(10).fill(null),
    guessedLetters: [],
    correctLetters: [],
    incorrectLetters: [],
    history: [],
    category: 'Cryptography',
    difficulty: 'HARD',
    hintsAvailable: 3,
    unlockedHints: [],
    dailyMode: false,
    startTime: Date.now(),
    elapsedMs: 0,
  });

  const [gameOverPayload, setGameOverPayload] = useState<GameOverPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const localSecretWordRef = useRef<string>('CRYPTOGRAM');
  const localWordDataRef = useRef<any>(LOCAL_FALLBACK_WORDS[0]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorNotice(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('game:state', (newState: HangmanSessionState) => {
      setSession(newState);
      audioEngine.updateTensionAtmosphere(newState.strikesUsed, newState.maxStrikes);
    });

    socket.on('game:guess-result', (result: GuessResult) => {
      if (result.isCorrect) {
        audioEngine.playCorrectMatch();
      } else {
        audioEngine.playStrikeError(result.strikesUsed);
      }
      audioEngine.updateTensionAtmosphere(result.strikesUsed, 6);
    });

    socket.on('game:hint', (hint: HintResult) => {
      audioEngine.playRadarPing();
    });

    socket.on('game:over', (payload: GameOverPayload) => {
      setGameOverPayload(payload);
      if (payload.status === 'WON') {
        audioEngine.playVictory();
      } else {
        audioEngine.playDefeat();
      }
    });

    socket.on('game:error', (msg: string) => {
      setErrorNotice(msg);
      setTimeout(() => setErrorNotice(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Standalone / Offline game initiator
  const startLocalGame = useCallback((theme: ThemeId, difficulty: Difficulty, daily: boolean = false) => {
    const pool = LOCAL_FALLBACK_WORDS.filter((w) => w.difficulty === difficulty);
    const chosen = (pool.length > 0 ? pool : LOCAL_FALLBACK_WORDS)[
      Math.floor(Math.random() * (pool.length > 0 ? pool.length : LOCAL_FALLBACK_WORDS.length))
    ];

    localSecretWordRef.current = chosen.word;
    localWordDataRef.current = chosen;

    const initialSession: HangmanSessionState = {
      sessionId: 'local-' + Date.now(),
      theme,
      status: 'PLAYING',
      maxStrikes: 6,
      strikesUsed: 0,
      wordLength: chosen.word.length,
      maskedWord: Array(chosen.word.length).fill(null),
      guessedLetters: [],
      correctLetters: [],
      incorrectLetters: [],
      history: [],
      category: chosen.category,
      difficulty,
      hintsAvailable: 3,
      unlockedHints: [],
      dailyMode: daily,
      startTime: Date.now(),
      elapsedMs: 0,
    };

    setSession(initialSession);
    setGameOverPayload(null);
    audioEngine.updateTensionAtmosphere(0, 6);
  }, []);

  // Primary Guess Handler
  const guess = useCallback((letter: string) => {
    const char = letter.toUpperCase();

    if (session.status !== 'PLAYING') return;
    if (session.guessedLetters.includes(char)) return;

    if (socketRef.current && isConnected) {
      socketRef.current.emit('game:guess', char);
      return;
    }

    // Local execution fallback
    const secret = localSecretWordRef.current;
    const isCorrect = secret.includes(char);
    const newStrikes = isCorrect ? session.strikesUsed : session.strikesUsed + 1;
    const newGuessed = [...session.guessedLetters, char];
    const newCorrect = isCorrect ? [...session.correctLetters, char] : session.correctLetters;
    const newIncorrect = !isCorrect ? [...session.incorrectLetters, char] : session.incorrectLetters;
    const newMasked = secret.split('').map((c) => (newGuessed.includes(c) ? c : null));

    const isWin = secret.split('').every((c) => newGuessed.includes(c));
    const isLoss = newStrikes >= session.maxStrikes;
    const newStatus = isWin ? 'WON' : isLoss ? 'LOST' : 'PLAYING';

    // Progressive Hint unlocking locally after 3 misses
    const newUnlocked = [...session.unlockedHints];
    if (newStrikes >= 3 && newUnlocked.length === 0) {
      const vowels = secret.split('').filter((c) => 'AEIOU'.includes(c)).length;
      newUnlocked.push(`Vowel Count: ${vowels}`);
    }
    if (newStrikes >= 4 && newUnlocked.length === 1 && localWordDataRef.current.partOfSpeech) {
      newUnlocked.push(`Part of Speech: ${localWordDataRef.current.partOfSpeech}`);
    }
    if (newStrikes >= 5 && newUnlocked.length === 2 && localWordDataRef.current.etymology) {
      newUnlocked.push(`Etymology: ${localWordDataRef.current.etymology}`);
    }

    const nextState: HangmanSessionState = {
      ...session,
      strikesUsed: newStrikes,
      guessedLetters: newGuessed,
      correctLetters: newCorrect,
      incorrectLetters: newIncorrect,
      maskedWord: newMasked,
      status: newStatus,
      unlockedHints: newUnlocked,
      history: [...session.history, { letter: char, isCorrect, timestamp: Date.now() }],
    };

    setSession(nextState);

    // Audio triggers
    if (isCorrect) {
      audioEngine.playCorrectMatch();
    } else {
      audioEngine.playStrikeError(newStrikes);
    }
    audioEngine.updateTensionAtmosphere(newStrikes, session.maxStrikes);

    if (isWin || isLoss) {
      const emojiGrid = nextState.history.map((g) => (g.isCorrect ? '🟩' : '🟥')).join(' ');
      const share = `🔐 THE CIPHER GALLOWS\n${emojiGrid}\n⚡ Strikes: ${newStrikes}/6 | ${isWin ? '✅ DECRYPTED' : '💀 COLLAPSED'}`;

      const payload: GameOverPayload = {
        status: isWin ? 'WON' : 'LOST',
        word: secret,
        definition: localWordDataRef.current.definition,
        partOfSpeech: localWordDataRef.current.partOfSpeech,
        strikesUsed: newStrikes,
        totalGuesses: nextState.history.length,
        elapsedMs: Date.now() - session.startTime,
        shareText: share,
      };

      setGameOverPayload(payload);
      if (isWin) audioEngine.playVictory();
      else audioEngine.playDefeat();
    }
  }, [session, isConnected]);

  // Use hint handler
  const useHint = useCallback(() => {
    if (session.status !== 'PLAYING' || session.hintsAvailable <= 0) return;

    if (socketRef.current && isConnected) {
      socketRef.current.emit('game:hint');
      return;
    }

    // Local hint fallback
    const secret = localSecretWordRef.current;
    const unrevealed = [...new Set(secret.split('').filter((c) => !session.guessedLetters.includes(c)))];
    if (unrevealed.length > 0) {
      const revealChar = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      guess(revealChar);
      setSession((prev) => ({ ...prev, hintsAvailable: Math.max(0, prev.hintsAvailable - 1) }));
    }
  }, [session, isConnected, guess]);

  // Start new game
  const startNewGame = useCallback((
    theme: ThemeId = session.theme,
    difficulty: Difficulty = session.difficulty,
    daily: boolean = false
  ) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('game:new', { theme, difficulty, daily });
      setGameOverPayload(null);
    } else {
      startLocalGame(theme, difficulty, daily);
    }
  }, [isConnected, session.theme, session.difficulty, startLocalGame]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        guess(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess]);

  return {
    session,
    gameOverPayload,
    isConnected,
    errorNotice,
    guess,
    useHint,
    startNewGame,
    secretWordForLoss: gameOverPayload?.word,
  };
}
