import { useEffect, useRef, useCallback, useState } from 'react';
import { ReactionPhase, ReflexMode, PeripheralTarget, ReactionRecord } from '../types/reaction';
import { soundManager } from '../utils/audio';
import { calculateStats, getArchetype, getCurrentTimeBlock, saveSessionRecord } from '../utils/analytics';

interface UsePrecisionTimerOptions {
  totalRounds?: number;
  mode: ReflexMode;
  onSessionComplete?: (record: ReactionRecord) => void;
}

export function usePrecisionTimer({
  totalRounds = 5,
  mode,
  onSessionComplete,
}: UsePrecisionTimerOptions) {
  // Deterministic FSM State
  const [phase, setPhase] = useState<ReactionPhase>('IDLE');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentRunMs, setCurrentRunMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [escalatingPenaltyDelay, setEscalatingPenaltyDelay] = useState<number>(0);
  const [peripheralTarget, setPeripheralTarget] = useState<PeripheralTarget | null>(null);
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);

  // High-Resolution Refs (to avoid stale closures and zero-latency access)
  const phaseRef = useRef<ReactionPhase>('IDLE');
  const triggerTimestampRef = useRef<number>(0);
  const timerTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const falseStartsRef = useRef<number>(0);
  const historyRef = useRef<number[]>([]);
  const currentRoundRef = useRef<number>(1);
  const modeRef = useRef<ReflexMode>(mode);
  const escalatingPenaltyRef = useRef<number>(0);

  // Keep refs in sync with state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    falseStartsRef.current = falseStarts;
  }, [falseStarts]);

  // Clean garbage collection of timeouts
  const clearPendingTimer = useCallback(() => {
    if (timerTimeoutIdRef.current) {
      clearTimeout(timerTimeoutIdRef.current);
      timerTimeoutIdRef.current = null;
    }
  }, []);

  // Generates randomized peripheral coordinates within safe boundary
  const generatePeripheralTarget = useCallback((): PeripheralTarget => {
    const minX = 15;
    const maxX = 85;
    const minY = 20;
    const maxY = 80;
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    const size = Math.floor(Math.random() * 20) + 55; // 55px - 75px
    return { x, y, size };
  }, []);

  // Arm the Waiting Chamber (Red Anticipation)
  const armWaitPhase = useCallback(() => {
    clearPendingTimer();
    setPhase('WAITING');
    phaseRef.current = 'WAITING';
    setPeripheralTarget(null);
    setClickCoords(null);

    soundManager.playArm();

    // Baseline random delay: 2000ms - 4800ms
    // Escalating penalty: +800ms per false start to deter rhythmic spamming
    const baseDelay = Math.floor(Math.random() * 2800) + 2000;
    const penaltyAdd = escalatingPenaltyRef.current * 700;
    const totalDelay = Math.min(baseDelay + penaltyAdd, 8000);

    timerTimeoutIdRef.current = setTimeout(() => {
      // Transition to TRIGGERED
      triggerTimestampRef.current = performance.now();
      setPhase('TRIGGERED');
      phaseRef.current = 'TRIGGERED';

      if (modeRef.current === 'audio') {
        soundManager.playAuditoryModeCue();
      } else {
        soundManager.playTriggerBurst();
      }

      if (modeRef.current === 'peripheral') {
        setPeripheralTarget(generatePeripheralTarget());
      }
    }, totalDelay);
  }, [clearPendingTimer, generatePeripheralTarget]);

  // Reset Combine Session
  const resetSession = useCallback(() => {
    clearPendingTimer();
    setCurrentRound(1);
    currentRoundRef.current = 1;
    setCurrentRunMs(null);
    setHistory([]);
    historyRef.current = [];
    setFalseStarts(0);
    falseStartsRef.current = 0;
    setEscalatingPenaltyDelay(0);
    escalatingPenaltyRef.current = 0;
    setPeripheralTarget(null);
    setClickCoords(null);
    setPhase('IDLE');
    phaseRef.current = 'IDLE';
  }, [clearPendingTimer]);

  // Handle proceed to next round
  const proceedToNextRound = useCallback(() => {
    if (currentRoundRef.current < totalRounds) {
      const nextRound = currentRoundRef.current + 1;
      setCurrentRound(nextRound);
      currentRoundRef.current = nextRound;
      armWaitPhase();
    } else {
      // 5-Round Combine Complete!
      setPhase('REPORT_SUMMARY');
      phaseRef.current = 'REPORT_SUMMARY';
      soundManager.playSessionComplete();

      // Compute statistics and persist
      const stats = calculateStats(historyRef.current);
      const archetype = getArchetype(stats.mean);
      const record: ReactionRecord = {
        id: `syn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        timeBlock: getCurrentTimeBlock(),
        mode: modeRef.current,
        averageMs: parseFloat(stats.mean.toFixed(1)),
        medianMs: parseFloat(stats.median.toFixed(1)),
        bestMs: parseFloat(stats.best.toFixed(1)),
        consistencyVariance: parseFloat(stats.variance.toFixed(1)),
        stdDevMs: parseFloat(stats.stdDev.toFixed(1)),
        rounds: [...historyRef.current],
        falseStarts: falseStartsRef.current,
        archetype: archetype.name,
      };

      saveSessionRecord(record);
      if (onSessionComplete) {
        onSessionComplete(record);
      }
    }
  }, [totalRounds, armWaitPhase, onSessionComplete]);

  // Core Low-Latency Input Processor
  const processInput = useCallback(
    (clientX?: number, clientY?: number) => {
      const currentP = phaseRef.current;

      // Coordinate tracking for shockwave
      const x = clientX ?? window.innerWidth / 2;
      const y = clientY ?? window.innerHeight / 2;
      setClickCoords({ x, y });

      if (currentP === 'IDLE') {
        armWaitPhase();
      } else if (currentP === 'WAITING') {
        // FALSE START JUMP!
        clearPendingTimer();
        const nextFalseStarts = falseStartsRef.current + 1;
        setFalseStarts(nextFalseStarts);
        falseStartsRef.current = nextFalseStarts;

        // Escalate penalty delay
        escalatingPenaltyRef.current += 1;
        setEscalatingPenaltyDelay(escalatingPenaltyRef.current * 700);

        setPhase('EARLY_PENALTY');
        phaseRef.current = 'EARLY_PENALTY';
        soundManager.playPenalty();
      } else if (currentP === 'EARLY_PENALTY') {
        // Retry current round after penalty
        armWaitPhase();
      } else if (currentP === 'TRIGGERED') {
        // VALID REFLEX CAPTURE!
        const latency = performance.now() - triggerTimestampRef.current;

        // Outlier filtering: impossible human reaction (<50ms anticipation / accidental debounce)
        if (latency < 50) {
          clearPendingTimer();
          const nextFalseStarts = falseStartsRef.current + 1;
          setFalseStarts(nextFalseStarts);
          falseStartsRef.current = nextFalseStarts;
          setPhase('EARLY_PENALTY');
          phaseRef.current = 'EARLY_PENALTY';
          soundManager.playPenalty();
          return;
        }

        const precisionLatency = parseFloat(latency.toFixed(1));
        setCurrentRunMs(precisionLatency);

        const newHistory = [...historyRef.current, precisionLatency];
        setHistory(newHistory);
        historyRef.current = newHistory;

        // Visual and auditory feedback based on speed
        if (precisionLatency < 190) {
          soundManager.playSupersonic();
        } else {
          soundManager.playClickGood();
        }

        setPhase('ROUND_RESOLVED');
        phaseRef.current = 'ROUND_RESOLVED';
      } else if (currentP === 'ROUND_RESOLVED') {
        proceedToNextRound();
      }
    },
    [armWaitPhase, clearPendingTimer, proceedToNextRound]
  );

  // Native Passive Event Listeners Setup (Window Level)
  useEffect(() => {
    const handleNativePointerDown = (e: PointerEvent) => {
      // Don't trigger if interacting with interactive controls (buttons, modals, docks)
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('input') ||
          target.closest('[role="dialog"]') ||
          target.closest('header') ||
          target.closest('footer') ||
          target.closest('[data-no-trigger="true"]'))
      ) {
        return;
      }

      processInput(e.clientX, e.clientY);
    };

    const handleNativeKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Ignore if user is inside an input field
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          return;
        }

        e.preventDefault();
        processInput();
      }
    };

    // Attach high-priority native listeners with { passive: true } for sub-millisecond dispatch
    window.addEventListener('pointerdown', handleNativePointerDown, { passive: true });
    window.addEventListener('keydown', handleNativeKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handleNativePointerDown);
      window.removeEventListener('keydown', handleNativeKeyDown);
      clearPendingTimer();
    };
  }, [processInput, clearPendingTimer]);

  return {
    phase,
    currentRound,
    totalRounds,
    currentRunMs,
    history,
    falseStarts,
    escalatingPenaltyDelay,
    peripheralTarget,
    clickCoords,
    armWaitPhase,
    resetSession,
    proceedToNextRound,
    processInput,
  };
}
