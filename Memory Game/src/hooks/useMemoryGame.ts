import { useState, useEffect, useRef, useCallback } from 'react';
import { CardData, Difficulty, TimerMode, GameStatus, GameStats, ScoreRecord } from '../types';
import { generateDeck, DIFFICULTY_CONFIGS } from '../utils/cardDeck';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_LEADERBOARD_KEY = 'kinetic_memory_leaderboard_v1';

export function useMemoryGame(
  initialDifficulty: Difficulty = 'easy',
  initialTimerMode: TimerMode = 'countdown',
  glimpseEnabled: boolean = true
) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [timerMode, setTimerMode] = useState<TimerMode>(initialTimerMode);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isBoardLocked, setIsBoardLocked] = useState<boolean>(false);
  const [glimpseCountdown, setGlimpseCountdown] = useState<number>(0);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    moves: 0,
    flips: 0,
    pairsCleared: 0,
    totalPairs: DIFFICULTY_CONFIGS[initialDifficulty].totalPairs,
    combo: 1,
    maxCombo: 1,
    score: 0,
    accuracy: 100,
    timeRemaining: DIFFICULTY_CONFIGS[initialDifficulty].countdownSeconds,
    timeElapsed: 0,
    hintsRemaining: 2,
  });

  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const timerRef = useRef<number | null>(null);
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Save to leaderboard
  const saveScoreRecord = useCallback((won: boolean, finalStats: GameStats) => {
    const newRecord: ScoreRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      difficulty,
      timerMode,
      moves: finalStats.moves,
      timeSeconds: timerMode === 'countdown' 
        ? config.countdownSeconds - finalStats.timeRemaining 
        : finalStats.timeElapsed,
      accuracy: finalStats.accuracy,
      score: finalStats.score,
      maxCombo: finalStats.maxCombo,
      won
    };

    setLeaderboard(prev => {
      const updated = [newRecord, ...prev].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [difficulty, timerMode, config.countdownSeconds]);

  // Start or Reset the game
  const startNewGame = useCallback((
    newDifficulty: Difficulty = difficulty,
    newTimerMode: TimerMode = timerMode
  ) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const newConfig = DIFFICULTY_CONFIGS[newDifficulty];
    const initialDeck = generateDeck(newDifficulty);

    setDifficulty(newDifficulty);
    setTimerMode(newTimerMode);
    setFlippedIndices([]);
    setIsBoardLocked(false);
    setFocusedIndex(0);

    const initialStats: GameStats = {
      moves: 0,
      flips: 0,
      pairsCleared: 0,
      totalPairs: newConfig.totalPairs,
      combo: 1,
      maxCombo: 1,
      score: 0,
      accuracy: 100,
      timeRemaining: newConfig.countdownSeconds,
      timeElapsed: 0,
      hintsRemaining: 2,
    };
    setStats(initialStats);

    if (glimpseEnabled) {
      // "Glimpse" Priming Phase: All cards face-up for 2 seconds
      setStatus('glimpse');
      setGlimpseCountdown(2);
      setIsBoardLocked(true);

      const primedDeck = initialDeck.map(c => ({ ...c, isFlipped: true }));
      setCards(primedDeck);

      // Countdown the glimpse phase
      let timeLeft = 2;
      const glimpseInterval = setInterval(() => {
        timeLeft -= 1;
        setGlimpseCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(glimpseInterval);
          // Turn cards face down and enter playing state
          setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
          setIsBoardLocked(false);
          setStatus('playing');
        }
      }, 1000);
    } else {
      setCards(initialDeck);
      setStatus('playing');
    }
  }, [difficulty, timerMode, glimpseEnabled]);

  // Initialize on mount
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Game timer loop
  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setStats(prev => {
        if (timerMode === 'countdown') {
          const nextTime = prev.timeRemaining - 1;

          // Sound tick tension in the final 10 seconds
          if (nextTime <= 10 && nextTime > 0) {
            soundEngine.playTick(nextTime <= 5);
          }

          if (nextTime <= 0) {
            // Time Out - Game Over
            clearInterval(timerRef.current!);
            setStatus('lost');
            soundEngine.playGameOver();
            saveScoreRecord(false, { ...prev, timeRemaining: 0 });
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: nextTime, timeElapsed: prev.timeElapsed + 1 };
        } else {
          // Count-up stopwatch
          return { ...prev, timeElapsed: prev.timeElapsed + 1 };
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timerMode, saveScoreRecord]);

  // Handle Card Click / Flip
  const handleCardClick = useCallback((index: number) => {
    if (status !== 'playing' || isBoardLocked) return;

    const clickedCard = cards[index];
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundEngine.playFlip();

    // Flip the clicked card
    const updatedCards = [...cards];
    updatedCards[index] = { ...clickedCard, isFlipped: true };
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If first card flipped
    if (newFlipped.length === 1) {
      soundEngine.playReveal();
      return;
    }

    // If second card flipped, evaluate match
    if (newFlipped.length === 2) {
      setIsBoardLocked(true); // Lock the board
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = updatedCards[firstIndex];
      const secondCard = updatedCards[secondIndex];

      const isMatch = firstCard.pairId === secondCard.pairId;

      setStats(prev => {
        const moves = prev.moves + 1;
        const totalFlips = prev.flips + 2;
        const pairsCleared = isMatch ? prev.pairsCleared + 1 : prev.pairsCleared;
        const accuracy = Math.round((pairsCleared / moves) * 100);

        let combo = isMatch ? prev.combo + 1 : 1;
        let maxCombo = Math.max(prev.maxCombo, combo);

        let scoreDelta = 0;
        if (isMatch) {
          // Score formula based on difficulty and combo
          const basePoints = difficulty === 'hard' ? 300 : difficulty === 'medium' ? 200 : 100;
          scoreDelta = basePoints * prev.combo;
        }

        let timeRemaining = prev.timeRemaining;
        if (timerMode === 'countdown') {
          if (isMatch) {
            // Time bonus (+3s on match)
            timeRemaining = Math.min(config.countdownSeconds, timeRemaining + 3);
          } else if (config.mismatchPenaltySeconds > 0) {
            // Negative penalty on hard mode (-2s on mismatch)
            timeRemaining = Math.max(1, timeRemaining - config.mismatchPenaltySeconds);
          }
        }

        return {
          ...prev,
          moves,
          flips: totalFlips,
          pairsCleared,
          accuracy,
          combo,
          maxCombo,
          score: prev.score + scoreDelta,
          timeRemaining
        };
      });

      if (isMatch) {
        // MATCH SUCCESS
        setTimeout(() => {
          soundEngine.playMatch(stats.combo);
          if (timerMode === 'countdown') soundEngine.playBonus();

          setCards(prev => {
            const next = [...prev];
            next[firstIndex] = { ...next[firstIndex], isMatched: true };
            next[secondIndex] = { ...next[secondIndex], isMatched: true };
            return next;
          });

          setFlippedIndices([]);
          setIsBoardLocked(false);

          // Check for victory
          if (stats.pairsCleared + 1 === config.totalPairs) {
            setStatus('won');
            soundEngine.playVictory();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#c0c1ff', '#4edea3', '#ffb95f', '#8083ff']
            });
            saveScoreRecord(true, {
              ...stats,
              pairsCleared: config.totalPairs,
              moves: stats.moves + 1,
              accuracy: Math.round(((stats.pairsCleared + 1) / (stats.moves + 1)) * 100)
            });
          }
        }, 300);
      } else {
        // MISMATCH FAILURE
        // Trigger horizontal denial shake animation on mismatched cards
        setTimeout(() => {
          soundEngine.playMismatch();
          if (timerMode === 'countdown' && config.mismatchPenaltySeconds > 0) {
            soundEngine.playPenalty();
          }

          setCards(prev => {
            const next = [...prev];
            next[firstIndex] = { ...next[firstIndex], isShaking: true };
            next[secondIndex] = { ...next[secondIndex], isShaking: true };
            return next;
          });
        }, 200);

        // Deliberate 800ms to 1000ms Grace Period: allow player's brain to map the card
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstIndex] = { ...next[firstIndex], isFlipped: false, isShaking: false };
            next[secondIndex] = { ...next[secondIndex], isFlipped: false, isShaking: false };
            return next;
          });
          setFlippedIndices([]);
          setIsBoardLocked(false); // Unlock board
        }, 900);
      }
    }
  }, [cards, flippedIndices, isBoardLocked, status, stats, difficulty, timerMode, config, saveScoreRecord]);

  // Hint Feature: flashes an unfound matching pair
  const triggerHint = useCallback(() => {
    if (stats.hintsRemaining <= 0 || status !== 'playing' || isBoardLocked) return;

    // Find all unmatched cards
    const unmatchedCards = cards.filter(c => !c.isMatched);
    if (unmatchedCards.length < 2) return;

    // Find a pair
    const pairMap: Record<string, number[]> = {};
    cards.forEach((card, idx) => {
      if (!card.isMatched) {
        if (!pairMap[card.pairId]) pairMap[card.pairId] = [];
        pairMap[card.pairId].push(idx);
      }
    });

    const candidatePair = Object.values(pairMap).find(arr => arr.length === 2);
    if (!candidatePair) return;

    soundEngine.playHint();
    setStats(prev => ({ ...prev, hintsRemaining: prev.hintsRemaining - 1 }));

    // Highlight the pair temporarily
    const [idxA, idxB] = candidatePair;
    setCards(prev => {
      const next = [...prev];
      next[idxA] = { ...next[idxA], isHighlighted: true };
      next[idxB] = { ...next[idxB], isHighlighted: true };
      return next;
    });

    setTimeout(() => {
      setCards(prev => {
        const next = [...prev];
        if (next[idxA]) next[idxA] = { ...next[idxA], isHighlighted: false };
        if (next[idxB]) next[idxB] = { ...next[idxB], isHighlighted: false };
        return next;
      });
    }, 1200);
  }, [cards, stats.hintsRemaining, status, isBoardLocked]);

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    }
  }, [status]);

  // Simulate Victory (for rapid UI showcase and testing)
  const simulateVictory = useCallback(() => {
    setStatus('won');
    soundEngine.playVictory();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#c0c1ff', '#4edea3', '#ffb95f']
    });
  }, []);

  return {
    difficulty,
    timerMode,
    status,
    cards,
    stats,
    config,
    isBoardLocked,
    glimpseCountdown,
    focusedIndex,
    setFocusedIndex,
    leaderboard,
    handleCardClick,
    startNewGame,
    triggerHint,
    togglePause,
    simulateVictory
  };
}
