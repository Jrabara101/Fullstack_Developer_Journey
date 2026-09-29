import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ColorPuzzleState,
  ColorModel,
  ColorData,
  ReagentSource,
  MixOperation,
  VerificationResponse,
} from '../types/color';
import {
  createColorData,
  calculateDeltaE2000,
  mixSubtractiveKubelkaMunk,
  mixAdditiveOptics,
} from '../lib/colorMath';
import { Mulberry32, getTodayDateString } from '../lib/prng';

// Default Reagent Sources for Subtractive Mode
export const SUBTRACTIVE_REAGENTS: ReagentSource[] = [
  {
    id: 'cyan',
    code: 'CYN-01',
    name: 'Cyan Phthalo',
    color: createColorData(0, 163, 255),
    remainingVolumeMl: 45,
    maxVolumeMl: 50,
    patternTexture: 'diagonal_stripes',
    wavelengthAbsorption: { uv: 0.15, vis: 0.85, ir: 0.1 },
    ks: { k: [1.85, 0.12, 0.08], s: [0.35, 0.5, 0.65] },
  },
  {
    id: 'magenta',
    code: 'MAG-02',
    name: 'Quinacridone Magenta',
    color: createColorData(255, 0, 122),
    remainingVolumeMl: 45,
    maxVolumeMl: 50,
    patternTexture: 'waves',
    wavelengthAbsorption: { uv: 0.1, vis: 0.9, ir: 0.2 },
    ks: { k: [0.1, 1.95, 0.25], s: [0.55, 0.35, 0.5] },
  },
  {
    id: 'yellow',
    code: 'YEL-03',
    name: 'Azo Hansa Yellow',
    color: createColorData(255, 214, 0),
    remainingVolumeMl: 45,
    maxVolumeMl: 50,
    patternTexture: 'dots',
    wavelengthAbsorption: { uv: 0.25, vis: 0.7, ir: 0.05 },
    ks: { k: [0.08, 0.12, 1.92], s: [0.5, 0.65, 0.3] },
  },
  {
    id: 'carbon',
    code: 'CRB-04',
    name: 'Carbon Obsidian Shading',
    color: createColorData(24, 24, 27),
    remainingVolumeMl: 45,
    maxVolumeMl: 50,
    patternTexture: 'crosshatch',
    wavelengthAbsorption: { uv: 0.95, vis: 0.98, ir: 0.95 },
    ks: { k: [2.8, 2.8, 2.8], s: [0.15, 0.15, 0.15] },
  },
  {
    id: 'titanium',
    code: 'TIT-05',
    name: 'Titanium Scattering Tint',
    color: createColorData(248, 250, 252),
    remainingVolumeMl: 45,
    maxVolumeMl: 50,
    patternTexture: 'rings',
    wavelengthAbsorption: { uv: 0.05, vis: 0.02, ir: 0.05 },
    ks: { k: [0.02, 0.02, 0.02], s: [3.2, 3.2, 3.2] },
  },
];

// Default Reagent Sources for Additive Light Optics Mode
export const ADDITIVE_REAGENTS: ReagentSource[] = [
  {
    id: 'red',
    code: 'LAS-RED',
    name: '635nm Ruby Laser',
    color: createColorData(244, 63, 94),
    remainingVolumeMl: 30,
    maxVolumeMl: 30,
    patternTexture: 'diagonal_stripes',
  },
  {
    id: 'green',
    code: 'LAS-GRN',
    name: '532nm Emerald Laser',
    color: createColorData(34, 197, 94),
    remainingVolumeMl: 30,
    maxVolumeMl: 30,
    patternTexture: 'dots',
  },
  {
    id: 'blue',
    code: 'LAS-BLU',
    name: '450nm Sapphire Laser',
    color: createColorData(56, 189, 248),
    remainingVolumeMl: 30,
    maxVolumeMl: 30,
    patternTexture: 'waves',
  },
];

// Initial baseline neutral solvent color
const INITIAL_SOLVENT_COLOR = createColorData(195, 198, 208);
const INITIAL_BLACK_VOID_COLOR = createColorData(12, 14, 20);

export function useColorMixEngine(initialSeedDate: string = getTodayDateString()) {
  const [mode, setMode] = useState<ColorModel>('SUBTRACTIVE_CMYK');
  const [puzzleId, setPuzzleId] = useState<string>(`DAILY-${initialSeedDate}`);
  const [title, setTitle] = useState<string>('Daily Master Swatch');
  const [difficulty, setDifficulty] = useState<'Apprentice' | 'Chemist' | 'Optic Master'>('Chemist');
  const [targetColor, setTargetColor] = useState<ColorData>(() => createColorData(154, 52, 142)); // Plum orchid
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(2.0);
  const [maxMoves, setMaxMoves] = useState<number>(10);
  const [maxCrucibleCapacityMl, setMaxCrucibleCapacityMl] = useState<number>(50.0);
  const [status, setStatus] = useState<ColorPuzzleState['status']>('IDLE');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [endTime, setEndTime] = useState<number | undefined>(undefined);

  // Active volumes in crucible
  const [pigmentVolumes, setPigmentVolumes] = useState<Record<string, number>>({});
  const [solventVolumeMl, setSolventVolumeMl] = useState<number>(10.0);
  const [history, setHistory] = useState<MixOperation[]>([]);
  const [redoStack, setRedoStack] = useState<MixOperation[]>([]);
  const [reagents, setReagents] = useState<ReagentSource[]>(SUBTRACTIVE_REAGENTS);

  // Accessibility state
  const [accessibility, setAccessibility] = useState<{
    patternsEnabled: boolean;
    colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  }>({
    patternsEnabled: false,
    colorBlindFilter: 'none',
  });

  // Calculate current color from active volumes
  const currentColor = useMemo<ColorData>(() => {
    if (mode === 'SUBTRACTIVE_CMYK') {
      const hasAnyPigment = Object.values(pigmentVolumes).some((v) => v > 0);
      if (!hasAnyPigment) {
        return INITIAL_SOLVENT_COLOR;
      }
      return mixSubtractiveKubelkaMunk(pigmentVolumes, solventVolumeMl);
    } else {
      const red = pigmentVolumes['red'] || 0;
      const green = pigmentVolumes['green'] || 0;
      const blue = pigmentVolumes['blue'] || 0;
      if (red === 0 && green === 0 && blue === 0) {
        return INITIAL_BLACK_VOID_COLOR;
      }
      return mixAdditiveOptics({ red, green, blue });
    }
  }, [mode, pigmentVolumes, solventVolumeMl]);

  // Delta-E 2000 distance
  const deltaE = useMemo(() => {
    return calculateDeltaE2000(currentColor.lab, targetColor.lab);
  }, [currentColor, targetColor]);

  // Total fluid volume
  const currentVolumeMl = useMemo(() => {
    if (mode === 'SUBTRACTIVE_CMYK') {
      let sum = solventVolumeMl;
      Object.values(pigmentVolumes).forEach((v) => (sum += v));
      return Math.round(sum * 10) / 10;
    } else {
      let sum = 0;
      Object.values(pigmentVolumes).forEach((v) => (sum += v));
      return Math.round(sum * 10) / 10;
    }
  }, [mode, pigmentVolumes, solventVolumeMl]);

  // Move count
  const moveCount = history.length;

  // Initialize or reseed daily puzzle
  const generateDailyPuzzle = useCallback((dateStr: string, selectedMode: ColorModel = mode) => {
    const prng = new Mulberry32(dateStr + (selectedMode === 'SUBTRACTIVE_CMYK' ? '-sub' : '-add'));

    let target: ColorData;
    let initialReagents: ReagentSource[];

    if (selectedMode === 'SUBTRACTIVE_CMYK') {
      initialReagents = SUBTRACTIVE_REAGENTS.map((r) => ({ ...r, remainingVolumeMl: r.maxVolumeMl }));
      // Synthesize a realistic reachable color target using 2-4 pigment drops
      const simDrops: Record<string, number> = {
        cyan: prng.range(1, 5) * 0.5,
        magenta: prng.range(1, 6) * 0.5,
        yellow: prng.range(0, 4) * 0.5,
        carbon: prng.range(0, 2) * 0.5,
        titanium: prng.range(0, 2) * 0.5,
      };
      target = mixSubtractiveKubelkaMunk(simDrops, 10.0);
    } else {
      initialReagents = ADDITIVE_REAGENTS.map((r) => ({ ...r, remainingVolumeMl: r.maxVolumeMl }));
      const red = prng.range(2, 12) * 0.5;
      const green = prng.range(2, 12) * 0.5;
      const blue = prng.range(2, 12) * 0.5;
      target = mixAdditiveOptics({ red, green, blue });
    }

    setPuzzleId(`DAILY-${dateStr}`);
    setTitle(`Daily Master Swatch #${dateStr}`);
    setTargetColor(target);
    setToleranceThreshold(2.0);
    setMaxMoves(selectedMode === 'SUBTRACTIVE_CMYK' ? 10 : 8);
    setReagents(initialReagents);
    setPigmentVolumes({});
    setSolventVolumeMl(10.0);
    setHistory([]);
    setRedoStack([]);
    setStatus('IDLE');
    setStartTime(Date.now());
    setEndTime(undefined);
  }, [mode]);

  // Switch between Subtractive and Additive mode
  const switchMode = useCallback((newMode: ColorModel) => {
    setMode(newMode);
    generateDailyPuzzle(getTodayDateString(), newMode);
  }, [generateDailyPuzzle]);

  // Recompute state after operations
  const recalculateFromHistory = useCallback((ops: MixOperation[], curMode: ColorModel) => {
    const volumes: Record<string, number> = {};
    ops.forEach((op) => {
      if (op.tool === 'flush') {
        Object.keys(volumes).forEach((k) => delete volumes[k]);
      } else {
        volumes[op.reagentId] = (volumes[op.reagentId] || 0) + op.volumeAddedMl;
      }
    });
    setPigmentVolumes(volumes);
  }, []);

  // Check victory condition
  useEffect(() => {
    if (status !== 'COMPLETED' && history.length > 0 && deltaE <= toleranceThreshold) {
      setStatus('COMPLETED');
      setEndTime(Date.now());
    } else if (status === 'COMPLETED' && deltaE > toleranceThreshold) {
      setStatus('IDLE');
      setEndTime(undefined);
    }
  }, [deltaE, toleranceThreshold, status, history.length]);

  // Dispense reagent (Pipette or Pour)
  const dispenseReagent = useCallback(
    (reagentId: string, volumeMl: number, tool: 'pipette' | 'pour' = 'pipette') => {
      if (status === 'COMPLETED') return;
      if (currentVolumeMl + volumeMl > maxCrucibleCapacityMl) return;
      if (history.length >= maxMoves) {
        setStatus('FAILED');
        return;
      }

      setStatus('DISPENSING');

      // Update remaining reagent volume in source flask
      setReagents((prev) =>
        prev.map((r) =>
          r.id === reagentId
            ? { ...r, remainingVolumeMl: Math.max(0, Math.round((r.remainingVolumeMl - volumeMl) * 10) / 10) }
            : r
        )
      );

      const nextVolumes = {
        ...pigmentVolumes,
        [reagentId]: (pigmentVolumes[reagentId] || 0) + volumeMl,
      };
      setPigmentVolumes(nextVolumes);

      // Compute resulting color
      const resColor =
        mode === 'SUBTRACTIVE_CMYK'
          ? mixSubtractiveKubelkaMunk(nextVolumes, solventVolumeMl)
          : mixAdditiveOptics({
              red: nextVolumes['red'] || 0,
              green: nextVolumes['green'] || 0,
              blue: nextVolumes['blue'] || 0,
            });

      const operation: MixOperation = {
        id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tool,
        reagentId,
        volumeAddedMl: volumeMl,
        resultingColor: resColor,
        timestamp: Date.now(),
      };

      setHistory((prev) => [...prev, operation]);
      setRedoStack([]); // Clear redo on new action

      setTimeout(() => {
        setStatus((s) => (s === 'DISPENSING' ? 'IDLE' : s));
      }, 300);
    },
    [status, currentVolumeMl, maxCrucibleCapacityMl, history.length, maxMoves, pigmentVolumes, mode, solventVolumeMl]
  );

  // Stir crucible: triggers cyclonic homogenization
  const stirCrucible = useCallback(() => {
    if (status === 'COMPLETED' || status === 'STIRRING') return;
    setStatus('STIRRING');
    setTimeout(() => {
      setStatus('ANALYZING');
      setTimeout(() => {
        setStatus(deltaE <= toleranceThreshold ? 'COMPLETED' : 'IDLE');
      }, 350);
    }, 600);
  }, [status, deltaE, toleranceThreshold]);

  // Undo (Command Pattern)
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const lastOp = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Refund reagent source
    if (lastOp.tool !== 'flush') {
      setReagents((prev) =>
        prev.map((r) =>
          r.id === lastOp.reagentId
            ? { ...r, remainingVolumeMl: Math.min(r.maxVolumeMl, r.remainingVolumeMl + lastOp.volumeAddedMl) }
            : r
        )
      );
    }

    setHistory(newHistory);
    setRedoStack((prev) => [lastOp, ...prev]);
    recalculateFromHistory(newHistory, mode);
    setStatus('IDLE');
  }, [history, recalculateFromHistory, mode]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextOp = redoStack[0];
    const newRedo = redoStack.slice(1);

    // Consume reagent source
    if (nextOp.tool !== 'flush') {
      setReagents((prev) =>
        prev.map((r) =>
          r.id === nextOp.reagentId
            ? { ...r, remainingVolumeMl: Math.max(0, r.remainingVolumeMl - nextOp.volumeAddedMl) }
            : r
        )
      );
    }

    const newHistory = [...history, nextOp];
    setHistory(newHistory);
    setRedoStack(newRedo);
    recalculateFromHistory(newHistory, mode);
  }, [redoStack, history, recalculateFromHistory, mode]);

  // Flush crucible: decontamination with fresh solvent
  const flushCrucible = useCallback(() => {
    const flushOp: MixOperation = {
      id: `op-flush-${Date.now()}`,
      tool: 'flush',
      reagentId: 'solvent',
      volumeAddedMl: 0,
      resultingColor: mode === 'SUBTRACTIVE_CMYK' ? INITIAL_SOLVENT_COLOR : INITIAL_BLACK_VOID_COLOR,
      timestamp: Date.now(),
    };
    setHistory((prev) => [...prev, flushOp]);
    setRedoStack([]);
    setPigmentVolumes({});
    setStatus('IDLE');
  }, [mode]);

  // Accessibility Controls
  const togglePatterns = useCallback(() => {
    setAccessibility((prev) => ({ ...prev, patternsEnabled: !prev.patternsEnabled }));
  }, []);

  const setColorBlindFilter = useCallback(
    (colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
      setAccessibility((prev) => ({ ...prev, colorBlindFilter }));
    },
    []
  );

  // Server-Authoritative Verification Call
  const verifySolutionOnServer = useCallback(
    async (playerName: string = 'Alchemist'): Promise<VerificationResponse> => {
      const payload = {
        puzzleId,
        playerName,
        timeElapsedMs: (endTime || Date.now()) - startTime,
        operations: history.map((op) => ({
          tool: op.tool,
          reagentId: op.reagentId,
          volumeMl: op.volumeAddedMl,
          timestamp: op.timestamp,
        })),
      };

      try {
        const res = await fetch('/api/puzzles/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        // Fallback local authoritative calculation if server is offline
        const simulatedDeltaE = deltaE;
        const verified = simulatedDeltaE <= toleranceThreshold;
        return {
          verified,
          puzzleId,
          calculatedColor: currentColor,
          targetColor,
          calculatedDeltaE: simulatedDeltaE,
          toleranceThreshold,
          matchPercentage: Math.max(0, Math.min(100, Math.round((1 - simulatedDeltaE / 20) * 1000) / 10)),
          movesUsed: history.length,
          volumeUsedMl: currentVolumeMl,
          shareString: `🧪 ChromaLab [${puzzleId}] ${verified ? '✓ SOLVED' : 'INCOMPLETE'} (${simulatedDeltaE.toFixed(2)} ΔE)`,
          message: verified ? 'Client Spectrophotometry Certified' : 'Color tolerance not met',
        };
      }
    },
    [puzzleId, endTime, startTime, history, deltaE, toleranceThreshold, currentColor, targetColor, currentVolumeMl]
  );

  // Initialize daily puzzle on mount
  useEffect(() => {
    generateDailyPuzzle(initialSeedDate, mode);
  }, []);

  return {
    state: {
      puzzleId,
      title,
      difficulty,
      mode,
      targetColor,
      currentColor,
      baselineColor: mode === 'SUBTRACTIVE_CMYK' ? INITIAL_SOLVENT_COLOR : INITIAL_BLACK_VOID_COLOR,
      deltaE,
      toleranceThreshold,
      currentVolumeMl,
      maxCrucibleCapacityMl,
      reagents,
      history,
      redoStack,
      moveCount,
      maxMoves,
      status,
      startTime,
      endTime,
      accessibility,
    },
    actions: {
      dispenseReagent,
      stirCrucible,
      undo,
      redo,
      flushCrucible,
      switchMode,
      generateDailyPuzzle,
      togglePatterns,
      setColorBlindFilter,
      verifySolutionOnServer,
    },
  };
}
