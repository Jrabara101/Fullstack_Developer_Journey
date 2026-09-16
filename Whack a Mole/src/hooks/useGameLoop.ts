import { useEffect, useRef } from 'react';
import { useArcadeStore, DIFFICULTY_PROFILES } from '../store/useArcadeStore';
import { MoleType } from '../types';

export function useGameLoop() {
  const status = useArcadeStore((s) => s.status);
  const timeLeft = useArcadeStore((s) => s.timeLeft);
  const initialDuration = useArcadeStore((s) => s.initialDuration);
  const difficulty = useArcadeStore((s) => s.difficulty);
  const gridDimension = useArcadeStore((s) => s.gridDimension);
  const moles = useArcadeStore((s) => s.moles);

  const tickGame = useArcadeStore((s) => s.tickGame);
  const decrementTimer = useArcadeStore((s) => s.decrementTimer);
  const spawnMole = useArcadeStore((s) => s.spawnMole);

  // References for deterministic RAF loop state
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timerAccumulatorRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);

  useEffect(() => {
    if (status !== 'PLAYING') {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();
    timerAccumulatorRef.current = 0;
    nextSpawnTimeRef.current = Date.now() + 150; // Initial fast kick-off spawn

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const now = Date.now();

      // 1. Central Expiration Cleanup
      tickGame(now);

      // 2. Deterministic Second Tick
      timerAccumulatorRef.current += deltaMs;
      if (timerAccumulatorRef.current >= 1000) {
        timerAccumulatorRef.current -= 1000;
        decrementTimer();
      }

      // 3. Dynamic Spawn Scheduler with Difficulty Curve
      if (now >= nextSpawnTimeRef.current) {
        const totalSlots = gridDimension * gridDimension;
        const currentMoles = useArcadeStore.getState().moles;

        // Count active moles and find free slots
        const freeSlots: number[] = [];
        let activeCount = 0;

        for (let i = 0; i < totalSlots; i++) {
          const mole = currentMoles[i];
          if (mole && !mole.hit && now < mole.expiresAt) {
            activeCount++;
          } else {
            freeSlots.push(i);
          }
        }

        const profile = DIFFICULTY_PROFILES[difficulty];
        // Dynamic stage acceleration: 0 (start of round) -> 1 (near end of round)
        const stageProgress = Math.max(0, Math.min(1, 1 - timeLeft / Math.max(1, initialDuration)));
        
        // As time runs down, maxConcurrent increases slightly and interval tightens
        const dynamicMaxConcurrent = profile.maxConcurrent + (stageProgress > 0.6 ? 1 : 0);

        if (freeSlots.length > 0 && activeCount < dynamicMaxConcurrent) {
          // Weighted random slot selection
          const randomIndex = Math.floor(Math.random() * freeSlots.length);
          const chosenSlot = freeSlots[randomIndex];

          // Dynamic target selection
          const roll = Math.random();
          let moleType: MoleType = 'normal';

          if (roll < profile.bombRate) {
            moleType = 'bomb';
          } else if (roll < profile.bombRate + profile.goldRate) {
            moleType = 'gold';
          }

          // Dynamic stay lifespan: accelerates by up to 25% at late stage
          const staySpeedMultiplier = 1 - stageProgress * 0.25;
          const dynamicDuration = Math.round(profile.stayDuration * staySpeedMultiplier);

          spawnMole(chosenSlot, moleType, dynamicDuration);
        }

        // Schedule next spawn interval
        const baseInterval = profile.spawnMin + Math.random() * (profile.spawnMax - profile.spawnMin);
        const dynamicInterval = Math.max(250, Math.round(baseInterval * (1 - stageProgress * 0.3)));
        nextSpawnTimeRef.current = now + dynamicInterval;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [status, timeLeft, initialDuration, difficulty, gridDimension, tickGame, decrementTimer, spawnMole]);
}
