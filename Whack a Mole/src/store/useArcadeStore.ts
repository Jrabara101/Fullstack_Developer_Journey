import { create } from 'zustand';
import { MoleType, MoleInstance, GameStatus, Difficulty, GridDimension, DifficultyProfile } from '../types';
import { playSound, setSoundEnabled, isSoundEnabled } from '../utils/audio';

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  easy: {
    label: 'CRUISE',
    spawnMin: 950,
    spawnMax: 1350,
    stayDuration: 1800,
    maxConcurrent: 2,
    bombRate: 0.15,
    goldRate: 0.20,
  },
  normal: {
    label: 'TURBO',
    spawnMin: 650,
    spawnMax: 950,
    stayDuration: 1300,
    maxConcurrent: 3,
    bombRate: 0.22,
    goldRate: 0.18,
  },
  hyper: {
    label: 'OUTRUN',
    spawnMin: 420,
    spawnMax: 700,
    stayDuration: 950,
    maxConcurrent: 4,
    bombRate: 0.28,
    goldRate: 0.22,
  },
};

const HIGH_SCORE_KEY = 'synth_runner_hiscore';

const getInitialHighScore = (): number => {
  if (typeof window === 'undefined') return 3850;
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored, 10) || 3850 : 3850;
};

export interface WhackResult {
  hit: boolean;
  type?: MoleType;
  points?: number;
  isNewHigh?: boolean;
}

export interface ArcadeState {
  status: GameStatus;
  score: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  initialDuration: number;
  moles: Record<number, MoleInstance | null>;
  
  // Telemetry & Statistics
  totalClicks: number;
  successfulHits: number;
  goldHits: number;
  bombHits: number;
  highScore: number;
  isNewRecord: boolean;
  screenShake: boolean;
  screenFlash: boolean;
  radioLog: string;

  // Options
  difficulty: Difficulty;
  gridDimension: GridDimension;
  soundActive: boolean;

  // Actions
  startGame: (duration?: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  tickGame: (now: number) => void;
  decrementTimer: () => void;
  spawnMole: (slotIndex: number, type: MoleType, duration: number) => void;
  despawnMole: (slotIndex: number) => void;
  whackMole: (slotIndex: number) => WhackResult;
  recordMiss: (slotIndex: number) => void;
  endGame: () => void;
  resetGame: () => void;
  setDifficulty: (diff: Difficulty) => void;
  setGridDimension: (dim: GridDimension) => void;
  toggleSound: () => void;
  setRadioLog: (msg: string) => void;
  clearFx: () => void;
}

export const useArcadeStore = create<ArcadeState>((set, get) => ({
  status: 'IDLE',
  score: 0,
  combo: 1,
  maxCombo: 1,
  timeLeft: 30,
  initialDuration: 30,
  moles: {},
  
  totalClicks: 0,
  successfulHits: 0,
  goldHits: 0,
  bombHits: 0,
  highScore: getInitialHighScore(),
  isNewRecord: false,
  screenShake: false,
  screenFlash: false,
  radioLog: 'SYNTHWAVE SOUNDSYSTEM ACTIVE // 128 BPM NITRO READY',

  difficulty: 'normal',
  gridDimension: 3,
  soundActive: true,

  startGame: (duration = 30) => {
    playSound('coin');
    const totalSlots = get().gridDimension * get().gridDimension;
    const cleanMoles: Record<number, MoleInstance | null> = {};
    for (let i = 0; i < totalSlots; i++) cleanMoles[i] = null;

    set({
      status: 'PLAYING',
      score: 0,
      combo: 1,
      maxCombo: 1,
      timeLeft: duration,
      initialDuration: duration,
      moles: cleanMoles,
      totalClicks: 0,
      successfulHits: 0,
      goldHits: 0,
      bombHits: 0,
      isNewRecord: false,
      screenShake: false,
      screenFlash: false,
      radioLog: `[RUN INITIATED] Outrun ${get().difficulty.toUpperCase()} mode live. Tap cassettes & DeLoreans!`,
    });
  },

  pauseGame: () => {
    if (get().status === 'PLAYING') {
      set({
        status: 'PAUSED',
        radioLog: '[PAUSE] Cassette deck paused. Cruise halted.',
      });
    }
  },

  resumeGame: () => {
    if (get().status === 'PAUSED') {
      set({
        status: 'PLAYING',
        radioLog: '[RESUME] Full throttle resumed.',
      });
    }
  },

  togglePause: () => {
    const { status, pauseGame, resumeGame, startGame } = get();
    if (status === 'PLAYING') pauseGame();
    else if (status === 'PAUSED') resumeGame();
    else if (status === 'IDLE' || status === 'GAME_OVER') startGame();
  },

  spawnMole: (slotIndex, type, duration) => {
    const now = Date.now();
    const expiresAt = now + duration;
    set((state) => ({
      moles: {
        ...state.moles,
        [slotIndex]: {
          id: `${slotIndex}-${now}`,
          slotIndex,
          type,
          spawnTime: now,
          duration,
          expiresAt,
          hit: false,
        },
      },
    }));
  },

  despawnMole: (slotIndex) => {
    set((state) => {
      if (!state.moles[slotIndex]) return state;
      return {
        moles: {
          ...state.moles,
          [slotIndex]: null,
        },
      };
    });
  },

  whackMole: (slotIndex) => {
    const state = get();
    if (state.status !== 'PLAYING') return { hit: false };

    const mole = state.moles[slotIndex];
    const now = Date.now();

    // Instant hit validation against mutable timestamp boundary
    if (!mole || mole.hit || now > mole.expiresAt) {
      get().recordMiss(slotIndex);
      return { hit: false };
    }

    let points = 0;
    let comboBonus = 1;
    let newGoldHits = state.goldHits;
    let newBombHits = state.bombHits;
    let newSuccessfulHits = state.successfulHits + 1;
    let shouldShake = false;
    let shouldFlash = false;
    let logMsg = '';

    if (mole.type === 'normal') {
      points = 50 * state.combo;
      comboBonus = 1;
      playSound('hit-normal');
      logMsg = `[GROOVE] Cassette Tape Secured! (+${points} MPH)`;
    } else if (mole.type === 'gold') {
      points = 150 * state.combo;
      comboBonus = 2;
      newGoldHits++;
      playSound('hit-gold');
      logMsg = `[DELOREAN] Flux Capacitor engaged! Hyper Boost (+${points} MPH)`;
    } else if (mole.type === 'bomb') {
      points = -100;
      newBombHits++;
      shouldShake = true;
      shouldFlash = true;
      playSound('hit-bomb');
      logMsg = `[WIPEOUT] Cyber Skull Hazard hit! Nitro drop (-100 MPH)`;
    }

    const nextScore = Math.max(0, state.score + points);
    const nextCombo = mole.type === 'bomb' ? 1 : state.combo + comboBonus;
    const nextMaxCombo = Math.max(state.maxCombo, nextCombo);
    const isNewHigh = nextScore > state.highScore;
    const newHigh = isNewHigh ? nextScore : state.highScore;

    if (isNewHigh && typeof window !== 'undefined') {
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newHigh.toString());
      } catch (e) {
        // Safe storage
      }
    }

    set((s) => ({
      score: nextScore,
      combo: nextCombo,
      maxCombo: nextMaxCombo,
      highScore: newHigh,
      isNewRecord: s.isNewRecord || isNewHigh,
      totalClicks: s.totalClicks + 1,
      successfulHits: newSuccessfulHits,
      goldHits: newGoldHits,
      bombHits: newBombHits,
      screenShake: shouldShake,
      screenFlash: shouldFlash,
      radioLog: logMsg,
      moles: {
        ...s.moles,
        [slotIndex]: {
          ...mole,
          hit: true,
        },
      },
    }));

    // Auto cleanup mole entity after hit spring exit
    setTimeout(() => {
      get().despawnMole(slotIndex);
    }, 120);

    // Auto reset shake/flash
    if (shouldShake || shouldFlash) {
      setTimeout(() => {
        set({ screenShake: false, screenFlash: false });
      }, 300);
    }

    return { hit: true, type: mole.type, points, isNewHigh };
  },

  recordMiss: (_slotIndex) => {
    const state = get();
    if (state.status !== 'PLAYING') return;

    playSound('miss');
    set({
      combo: 1,
      totalClicks: state.totalClicks + 1,
      radioLog: '[OFF-GRID] Missed tap. Multiplier reset.',
    });
  },

  tickGame: (now) => {
    const { status, moles } = get();
    if (status !== 'PLAYING') return;

    // Check expiration on active moles
    let hasExpired = false;
    const nextMoles = { ...moles };

    for (const slotStr in moles) {
      const slot = Number(slotStr);
      const mole = moles[slot];
      if (mole && !mole.hit && now >= mole.expiresAt) {
        nextMoles[slot] = null;
        hasExpired = true;
      }
    }

    if (hasExpired) {
      set({ moles: nextMoles });
    }
  },

  decrementTimer: () => {
    const { status, timeLeft, endGame } = get();
    if (status !== 'PLAYING') return;

    const nextTime = timeLeft - 1;
    if (nextTime <= 0) {
      endGame();
    } else {
      if (nextTime <= 5) {
        playSound('tick');
      }
      set({ timeLeft: nextTime });
    }
  },

  endGame: () => {
    playSound('game-over');
    const { score, gridDimension } = get();
    const cleanMoles: Record<number, MoleInstance | null> = {};
    for (let i = 0; i < gridDimension * gridDimension; i++) cleanMoles[i] = null;

    set({
      status: 'GAME_OVER',
      timeLeft: 0,
      moles: cleanMoles,
      radioLog: `[RUN COMPLETE] Miami Grid final speed: ${score.toLocaleString()} MPH recorded.`,
    });
  },

  resetGame: () => {
    const { gridDimension, initialDuration } = get();
    const cleanMoles: Record<number, MoleInstance | null> = {};
    for (let i = 0; i < gridDimension * gridDimension; i++) cleanMoles[i] = null;

    set({
      status: 'IDLE',
      score: 0,
      combo: 1,
      maxCombo: 1,
      timeLeft: initialDuration,
      moles: cleanMoles,
      isNewRecord: false,
      screenShake: false,
      screenFlash: false,
      radioLog: '[CASSETTE REWOUND] New 1984 Run ready. Hit cassettes & DeLoreans.',
    });
  },

  setDifficulty: (difficulty) => {
    set({
      difficulty,
      radioLog: `[TRANSMISSION] Mode geared to ${difficulty.toUpperCase()}.`,
    });
  },

  setGridDimension: (gridDimension) => {
    const cleanMoles: Record<number, MoleInstance | null> = {};
    for (let i = 0; i < gridDimension * gridDimension; i++) cleanMoles[i] = null;
    set({
      gridDimension,
      moles: cleanMoles,
      radioLog: `[ARENA MATRIX] Grid reconfigured to ${gridDimension}x${gridDimension}.`,
    });
  },

  toggleSound: () => {
    const next = !get().soundActive;
    setSoundEnabled(next);
    set({
      soundActive: next,
      radioLog: next ? '[AUDIO] High-Fi Synth stereo active.' : '[AUDIO] Radio transmitter muted.',
    });
  },

  setRadioLog: (radioLog) => set({ radioLog }),

  clearFx: () => set({ screenShake: false, screenFlash: false }),
}));
