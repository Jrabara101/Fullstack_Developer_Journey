import { useEffect, useRef, useState, useCallback } from 'react';
import { ArenaEngine } from './engine';
import type { ArenaGameState, FighterClass } from '../types';

export function useArenaEngine(initialSeed: string, initialClass: FighterClass = 'WARRIOR') {
  const engineRef = useRef<ArenaEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Throttled UI state exposed to React
  const [uiState, setUiState] = useState<ArenaGameState | null>(null);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new ArenaEngine(initialSeed, initialClass);
  }

  const engine = engineRef.current;

  // Bind event callbacks
  useEffect(() => {
    engine.onStateChange = (state) => {
      setUiState({ ...state });
    };

    // Initial state push
    setUiState({ ...engine.gameState });
  }, [engine]);

  // Keyboard and Mouse Event listeners
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateMovement = () => {
      let mx = 0;
      let my = 0;
      if (activeKeys.has('KeyW') || activeKeys.has('ArrowUp')) my -= 1;
      if (activeKeys.has('KeyS') || activeKeys.has('ArrowDown')) my += 1;
      if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft')) mx -= 1;
      if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight')) mx += 1;
      engine.moveInput = { x: mx, y: my };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      activeKeys.add(e.code);
      updateMovement();

      if (e.code === 'Space') {
        e.preventDefault();
        engine.executePlayerAbility('DASH');
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        engine.executePlayerAbility('FROST_NOVA');
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        engine.executePlayerAbility('FLAME_SWEEP');
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        engine.executePlayerAbility('OVERDRIVE');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
      updateMovement();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click = Slash
        engine.executePlayerAbility('SLASH');
      } else if (e.button === 2) {
        // Right click = Parry
        e.preventDefault();
        engine.executePlayerAbility('PARRY');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Transform canvas screen coordinates to world coordinates
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const screenX = clientX * scaleX;
      const screenY = clientY * scaleY;

      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;

      // Camera offset
      const playerPos = engine.gameState.player.pos;
      const camOffsetX = (centerX - playerPos.x * 0.25);
      const camOffsetY = (centerY - playerPos.y * 0.25);

      engine.cursorWorldPos = {
        x: screenX - camOffsetX,
        y: screenY - camOffsetY,
      };
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent context menu for right click parry
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engine]);

  // Fixed 60Hz RequestAnimationFrame Render and Physics Loop
  useEffect(() => {
    let lastUiThrottle = 0;

    const loop = (timestamp: number) => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Physics step
          engine.tick(timestamp);

          // Canvas render step
          engine.render(ctx, canvas.width, canvas.height);
        }
      }

      // Throttled UI state synchronization to React (every ~100ms)
      if (timestamp - lastUiThrottle > 100) {
        lastUiThrottle = timestamp;
        setUiState({ ...engine.gameState });
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [engine]);

  const selectClass = useCallback((c: FighterClass) => {
    engine.setFighterClass(c);
    setUiState({ ...engine.gameState });
  }, [engine]);

  const startBattle = useCallback(() => {
    engine.startBattle();
    setUiState({ ...engine.gameState });
  }, [engine]);

  const triggerAbility = useCallback((abilityId: string) => {
    engine.executePlayerAbility(abilityId);
    setUiState({ ...engine.gameState });
  }, [engine]);

  const setTouchMove = useCallback((vec: { x: number; y: number }) => {
    engine.moveInput = vec;
  }, [engine]);

  const restartGauntlet = useCallback(() => {
    engine.gameState.currentWave = 1;
    engine.gameState.stats = {
      damageDealt: 0,
      damageTaken: 0,
      parriesSucceeded: 0,
      postureBreaksTriggered: 0,
      timeElapsedMs: 0,
      wavesCleared: 0
    };
    engine.gameState.player.hp = engine.gameState.player.maxHp;
    engine.gameState.player.stamina = engine.gameState.player.maxStamina;
    engine.gameState.player.mana = engine.gameState.player.maxMana;
    engine.gameState.player.pos = { x: 0, y: 150 };
    engine.gameState.player.velocity = { x: 0, y: 0 };
    engine.startBattle();
    setUiState({ ...engine.gameState });
  }, [engine]);

  return {
    canvasRef,
    engine,
    gameState: uiState || engine.gameState,
    selectClass,
    startBattle,
    triggerAbility,
    setTouchMove,
    restartGauntlet
  };
}
