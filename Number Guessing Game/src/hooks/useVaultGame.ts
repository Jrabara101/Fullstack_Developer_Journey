import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DirectionFeedback,
  FSMStage,
  GameMode,
  GuessRecord,
  NumberGameState,
  ArchetypeResult,
} from '../types/game';
import { getDailyTarget, getRandomTarget, getTodayDateString } from '../engine/prng';
import {
  calculateArchetype,
  calculateElimination,
  calculateOptimalBisect,
  generateShareEmojiGrid,
} from '../engine/math';
import { soundManager } from '../engine/audio';
import { recordGameResult, loadVaultStats } from '../engine/storage';

const INITIAL_MIN = 1;
const INITIAL_MAX = 100;
const MAX_ATTEMPTS = 7;
const BASE_SCORE = 10000;

export interface UseVaultGameReturn {
  // State
  gameState: NumberGameState;
  fsmStage: FSMStage;
  gameMode: GameMode;
  tumblerValue: number;
  timeElapsed: number;
  archetypeResult: ArchetypeResult | null;
  shareString: string;
  isMuted: boolean;
  optimalBisect: number;
  stats: ReturnType<typeof loadVaultStats>;

  // Actions
  setTumblerValue: (val: number) => void;
  stepTumbler: (delta: number) => void;
  applyBisect: () => void;
  resetTumblerToMid: () => void;
  submitGuess: () => void;
  unlockHint: (hintType: 'parityRevealed' | 'primeRevealed' | 'digitSumRevealed') => void;
  setFsmStage: (stage: FSMStage) => void;
  setGameMode: (mode: GameMode) => void;
  startNewGame: (overrideMode?: GameMode) => void;
  toggleMute: () => void;
  simulateWin: () => void;
}

export function useVaultGame(): UseVaultGameReturn {
  const [gameMode, setGameModeState] = useState<GameMode>('daily');
  const [fsmStage, setFsmStage] = useState<FSMStage>('ACTIVE_GUESSING');
  const [tumblerValue, setTumblerValueState] = useState<number>(50);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [stats, setStats] = useState(() => loadVaultStats());

  // Initialize Game State
  const [gameState, setGameState] = useState<NumberGameState>(() => {
    const target = getDailyTarget(getTodayDateString(), INITIAL_MIN, INITIAL_MAX);
    return {
      target,
      rangeMin: INITIAL_MIN,
      rangeMax: INITIAL_MAX,
      currentMinBound: INITIAL_MIN,
      currentMaxBound: INITIAL_MAX,
      maxAttempts: MAX_ATTEMPTS,
      attemptsUsed: 0,
      history: [],
      status: 'ACTIVE_GUESSING',
      score: BASE_SCORE,
      hints: {
        parityRevealed: false,
        primeRevealed: false,
        digitSumRevealed: false,
      },
      dailyMode: true,
    };
  });

  // Timer loop when active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (fsmStage === 'ACTIVE_GUESSING' || fsmStage === 'EVALUATING') {
      interval = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fsmStage]);

  // Optimal bisect helper
  const optimalBisect = useMemo(() => {
    return calculateOptimalBisect(gameState.currentMinBound, gameState.currentMaxBound);
  }, [gameState.currentMinBound, gameState.currentMaxBound]);

  // Adjust tumbler value with boundary check and audio click
  const setTumblerValue = useCallback(
    (val: number) => {
      const clamped = Math.max(INITIAL_MIN, Math.min(INITIAL_MAX, val));
      if (clamped !== tumblerValue) {
        soundManager.playTumblerClick(clamped - 50);
        setTumblerValueState(clamped);
      }
    },
    [tumblerValue]
  );

  // Stepper increment/decrement
  const stepTumbler = useCallback(
    (delta: number) => {
      const nextVal = Math.max(INITIAL_MIN, Math.min(INITIAL_MAX, tumblerValue + delta));
      soundManager.playStepSound(delta > 0);
      setTumblerValueState(nextVal);
    },
    [tumblerValue]
  );

  // Snap tumbler to current bracket midpoint
  const applyBisect = useCallback(() => {
    soundManager.playTumblerClick(optimalBisect - 50);
    setTumblerValueState(optimalBisect);
  }, [optimalBisect]);

  // Reset tumbler to center of domain (50)
  const resetTumblerToMid = useCallback(() => {
    setTumblerValueState(50);
    soundManager.playTumblerClick(0);
  }, []);

  // Archetype & End of run metrics
  const archetypeResult = useMemo(() => {
    if (gameState.status === 'VICTORY' || gameState.status === 'DEFEAT') {
      return calculateArchetype(
        gameState.history,
        gameState.rangeMin,
        gameState.rangeMax,
        gameState.status === 'VICTORY'
      );
    }
    return null;
  }, [gameState.status, gameState.history, gameState.rangeMin, gameState.rangeMax]);

  // Share emoji string
  const shareString = useMemo(() => {
    if (!archetypeResult) return '';
    const dateStr = gameState.dailyMode ? getTodayDateString() : undefined;
    return generateShareEmojiGrid(
      gameState.history,
      gameState.attemptsUsed,
      gameState.maxAttempts,
      gameState.status === 'VICTORY',
      archetypeResult.title,
      gameState.score,
      dateStr
    );
  }, [archetypeResult, gameState]);

  // Start new game
  const startNewGame = useCallback(
    (modeToStart?: GameMode) => {
      const targetMode = modeToStart || gameMode;
      const isDaily = targetMode === 'daily';
      const newTarget = isDaily
        ? getDailyTarget(getTodayDateString(), INITIAL_MIN, INITIAL_MAX)
        : getRandomTarget(INITIAL_MIN, INITIAL_MAX);

      setGameState({
        target: newTarget,
        rangeMin: INITIAL_MIN,
        rangeMax: INITIAL_MAX,
        currentMinBound: INITIAL_MIN,
        currentMaxBound: INITIAL_MAX,
        maxAttempts: MAX_ATTEMPTS,
        attemptsUsed: 0,
        history: [],
        status: 'ACTIVE_GUESSING',
        score: BASE_SCORE,
        hints: {
          parityRevealed: false,
          primeRevealed: false,
          digitSumRevealed: false,
        },
        dailyMode: isDaily,
      });

      setTumblerValueState(50);
      setTimeElapsed(0);
      setFsmStage('ACTIVE_GUESSING');
      setStats(loadVaultStats());
    },
    [gameMode]
  );

  // Switch game mode
  const setGameMode = useCallback(
    (newMode: GameMode) => {
      setGameModeState(newMode);
      startNewGame(newMode);
    },
    [startNewGame]
  );

  // Submit current guess
  const submitGuess = useCallback(() => {
    if (fsmStage !== 'ACTIVE_GUESSING' && fsmStage !== 'EVALUATING') return;
    if (gameState.status === 'VICTORY' || gameState.status === 'DEFEAT') return;

    setFsmStage('EVALUATING');
    const guessVal = tumblerValue;
    const target = gameState.target;
    const attemptsUsed = gameState.attemptsUsed + 1;
    const distance = Math.abs(guessVal - target);

    let direction: DirectionFeedback;
    let newMin = gameState.currentMinBound;
    let newMax = gameState.currentMaxBound;

    if (guessVal === target) {
      direction = 'CORRECT';
      newMin = target;
      newMax = target;
    } else if (guessVal > target) {
      direction = 'TOO_HIGH';
      newMax = Math.min(gameState.currentMaxBound, guessVal - 1);
    } else {
      direction = 'TOO_LOW';
      newMin = Math.max(gameState.currentMinBound, guessVal + 1);
    }

    const eliminated = calculateElimination(
      guessVal,
      direction,
      gameState.currentMinBound,
      gameState.currentMaxBound
    );

    const record: GuessRecord = {
      value: guessVal,
      direction,
      distance,
      eliminatedPossibilities: eliminated,
      timestamp: Date.now(),
    };

    const newHistory = [record, ...gameState.history];
    const isWon = direction === 'CORRECT';
    const isLost = !isWon && attemptsUsed >= gameState.maxAttempts;

    // Calculate score penalty
    const attemptPenalty = (attemptsUsed - 1) * 1100;
    const timePenalty = Math.min(1500, timeElapsed * 10);
    let hintPenalty = 0;
    if (gameState.hints.parityRevealed) hintPenalty += 500;
    if (gameState.hints.primeRevealed) hintPenalty += 800;
    if (gameState.hints.digitSumRevealed) hintPenalty += 600;

    let computedScore = Math.max(
      1000,
      BASE_SCORE - attemptPenalty - timePenalty - hintPenalty
    );
    if (isWon) {
      // Bonus for quick breach
      computedScore += (MAX_ATTEMPTS - attemptsUsed) * 800;
    }

    // Audio Feedback & Tension
    soundManager.playTensionPulse(attemptsUsed, gameState.maxAttempts);

    if (isWon) {
      soundManager.playVictory();
      setFsmStage('VICTORY');
    } else if (isLost) {
      soundManager.playDefeat();
      setFsmStage('DEFEAT');
    } else {
      if (direction === 'TOO_HIGH') {
        soundManager.playHighCue();
      } else {
        soundManager.playLowCue();
      }
      setFsmStage('ACTIVE_GUESSING');
    }

    const nextStatus = isWon ? 'VICTORY' : isLost ? 'DEFEAT' : 'ACTIVE_GUESSING';

    setGameState((prev) => ({
      ...prev,
      currentMinBound: newMin,
      currentMaxBound: newMax,
      attemptsUsed,
      history: newHistory,
      status: nextStatus,
      score: computedScore,
    }));

    // Record stats on game termination
    if (isWon || isLost) {
      const finalArchetype = calculateArchetype(
        newHistory,
        gameState.rangeMin,
        gameState.rangeMax,
        isWon
      );
      const updatedStats = recordGameResult(
        isWon,
        attemptsUsed,
        computedScore,
        target,
        finalArchetype.title,
        gameState.dailyMode
      );
      setStats(updatedStats);
    }
  }, [fsmStage, gameState, tumblerValue, timeElapsed]);

  // Unlock telemetry probe
  const unlockHint = useCallback(
    (hintKey: 'parityRevealed' | 'primeRevealed' | 'digitSumRevealed') => {
      if (gameState.hints[hintKey]) return;
      soundManager.playHintReveal();
      setGameState((prev) => ({
        ...prev,
        hints: {
          ...prev.hints,
          [hintKey]: true,
        },
        score: Math.max(500, prev.score - 600),
      }));
    },
    [gameState.hints]
  );

  // Toggle Mute
  const toggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Simulate win helper for demonstration
  const simulateWin = useCallback(() => {
    setTumblerValueState(gameState.target);
    soundManager.playVictory();
    const record: GuessRecord = {
      value: gameState.target,
      direction: 'CORRECT',
      distance: 0,
      eliminatedPossibilities: gameState.currentMaxBound - gameState.currentMinBound,
      timestamp: Date.now(),
    };
    const finalHistory = [record, ...gameState.history];
    const finalArchetype = calculateArchetype(
      finalHistory,
      gameState.rangeMin,
      gameState.rangeMax,
      true
    );
    const updatedStats = recordGameResult(
      true,
      gameState.attemptsUsed + 1,
      gameState.score,
      gameState.target,
      finalArchetype.title,
      gameState.dailyMode
    );
    setStats(updatedStats);
    setFsmStage('VICTORY');
    setGameState((prev) => ({
      ...prev,
      currentMinBound: prev.target,
      currentMaxBound: prev.target,
      attemptsUsed: prev.attemptsUsed + 1,
      status: 'VICTORY',
      history: finalHistory,
    }));
  }, [gameState]);

  return {
    gameState,
    fsmStage,
    gameMode,
    tumblerValue,
    timeElapsed,
    archetypeResult,
    shareString,
    isMuted,
    optimalBisect,
    stats,
    setTumblerValue,
    stepTumbler,
    applyBisect,
    resetTumblerToMid,
    submitGuess,
    unlockHint,
    setFsmStage,
    setGameMode,
    startNewGame,
    toggleMute,
    simulateWin,
  };
}
