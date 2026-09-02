import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { HUD } from './components/HUD';
import { BuyMenu } from './components/BuyMenu';
import { Scoreboard } from './components/Scoreboard';
import { TacticalDevPanel } from './components/TacticalDevPanel';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { SettingsPanel } from './components/SettingsPanel';
import { MatchEndScreen } from './components/MatchEndScreen';
import { HitFeedback } from './components/HitFeedback';
import { GameSettings, loadSettings, saveSettings } from './game/settings';
import { Team } from './types/game';
import { Crosshair, Terminal } from 'lucide-react';

type AppScreen = 'MENU' | 'PLAYING' | 'MATCH_END';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showBuyMenu, setShowBuyMenu] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(0);
  const [, setTick] = useState(0);

  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  // Mirrors of React state the imperative event handlers need to read without
  // being re-bound on every change.
  const settingsRef = useRef(settings);
  const screenRef = useRef(screen);
  const pausedRef = useRef(isPaused);
  const overlayOpenRef = useRef(false);
  const showSettingsRef = useRef(showSettings);
  const buyMenuRef = useRef(showBuyMenu);
  const hadPointerLockRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    showSettingsRef.current = showSettings;
  }, [showSettings]);
  useEffect(() => {
    buyMenuRef.current = showBuyMenu;
  }, [showBuyMenu]);

  // Any overlay that should swallow gameplay input while it is open.
  const overlayOpen = showBuyMenu || showSettings || isPaused || screen !== 'PLAYING';
  useEffect(() => {
    overlayOpenRef.current = overlayOpen;
  }, [overlayOpen]);

  const inputState = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    walk: false,
  });

  const clearMovementInput = () => {
    const s = inputState.current;
    s.moveForward = s.moveBackward = s.moveLeft = s.moveRight = false;
    s.jump = s.crouch = s.walk = false;
  };

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      engineRef.current?.applySettings(next);
      return next;
    });
  }, []);

  // --- ENGINE LIFECYCLE ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    engine.applySettings(settingsRef.current);

    // The engine starts a round in its constructor; hold it frozen until the
    // player actually deploys from the menu.
    engine.isPaused = true;

    let lastUiUpdate = 0;
    engine.onStateUpdate = () => {
      const now = performance.now();
      if (now - lastUiUpdate > 33) {
        lastUiUpdate = now;
        setTick((t) => (t + 1) % 10000);
      }
    };

    engine.onMatchEnd = () => {
      document.exitPointerLock?.();
      clearMovementInput();
      setScreen('MATCH_END');
    };

    let animationFrameId: number;
    let lastTime = performance.now();
    let fpsAccum = 0;
    let fpsFrames = 0;

    const loop = (time: number) => {
      const delta = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      engine.update(delta, inputState.current);

      // Rolling 1-second FPS average
      fpsAccum += delta;
      fpsFrames++;
      if (fpsAccum >= 1) {
        setFps(Math.round(fpsFrames / fpsAccum));
        fpsAccum = 0;
        fpsFrames = 0;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      engine.camera.aspect = width / height;
      engine.camera.updateProjectionMatrix();
      engine.renderer.setSize(width, height, false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      engine.onStateUpdate = undefined;
      engine.onMatchEnd = undefined;
    };
  }, []);

  // Keep the engine's pause flag in step with the UI.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.isPaused = screen !== 'PLAYING' || isPaused || showSettings;
  }, [screen, isPaused, showSettings]);

  // --- SCREEN TRANSITIONS ---

  const requestPointerLock = useCallback(() => {
    // Can reject (already exiting, embedded frame, user gesture rules). The
    // match still runs without it — the capture prompt stays up until it takes.
    try {
      const result = canvasRef.current?.requestPointerLock() as unknown;
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch(() => undefined);
      }
    } catch {
      // Non-fatal: play continues with the pointer unlocked.
    }
  }, []);

  const startMatch = useCallback(
    (team: Team) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setPlayerTeam(team);
      engine.restartMatch();
      engine.applySettings(settingsRef.current);
      setScreen('PLAYING');
      setIsPaused(false);
      setShowSettings(false);
      requestPointerLock();
    },
    [requestPointerLock]
  );

  const resumeFromPause = useCallback(() => {
    setIsPaused(false);
    setShowSettings(false);
    requestPointerLock();
  }, [requestPointerLock]);

  const quitToMenu = useCallback(() => {
    document.exitPointerLock?.();
    clearMovementInput();
    setIsPaused(false);
    setShowSettings(false);
    setShowBuyMenu(false);
    setShowScoreboard(false);
    setScreen('MENU');
  }, []);

  const rematch = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.restartMatch();
    setScreen('PLAYING');
    setIsPaused(false);
    requestPointerLock();
  }, [requestPointerLock]);

  // --- INPUT HANDLERS ---
  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current;
      const wasLocked = hadPointerLockRef.current;
      hadPointerLockRef.current = locked;
      setIsPointerLocked(locked);

      // Only pause when the mouse is released after actually being held
      // (Esc, alt-tab). If lock was never granted the match keeps running and
      // the capture prompt stays up, rather than freezing with no way back.
      if (!locked && wasLocked && screenRef.current === 'PLAYING' && !overlayOpenRef.current) {
        clearMovementInput();
        setIsPaused(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current || !engineRef.current) return;
      if (overlayOpenRef.current) return;

      const engine = engineRef.current;
      const { sensitivity, invertY } = settingsRef.current;

      engine.playerYaw -= e.movementX * sensitivity;
      const pitchDelta = e.movementY * sensitivity * (invertY ? -1 : 1);
      engine.playerPitch = Math.max(-1.35, Math.min(1.35, engine.playerPitch - pitchDelta));
    };

    const handleMouseDown = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || overlayOpenRef.current) return;
      if (document.pointerLockElement !== canvasRef.current) return;

      if (e.button === 0) {
        engine.isShooting = true;
        engine.handlePrimaryFire();
      } else if (e.button === 1) {
        e.preventDefault();
        engine.toggleShoulderSwap();
      } else if (e.button === 2) {
        e.preventDefault();
        if (engine.bombPlanted) engine.startDefusingBomb();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (e.button === 0) {
        engine.isShooting = false;
        engine.stopPlantingBomb();
      } else if (e.button === 2) {
        engine.stopDefusingBomb();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const engine = engineRef.current;
      if (!engine || e.repeat) return;

      // Escape is the only key that works from every screen.
      if (code === 'Escape') {
        if (screenRef.current !== 'PLAYING') return;
        if (showSettingsRef.current) {
          setShowSettings(false);
          return;
        }
        if (buyMenuRef.current) {
          setShowBuyMenu(false);
          return;
        }
        if (pausedRef.current) {
          resumeFromPause();
        } else {
          clearMovementInput();
          engine.isShooting = false;
          document.exitPointerLock?.();
          setIsPaused(true);
        }
        return;
      }

      if (screenRef.current !== 'PLAYING') return;

      // Buy menu owns the keyboard except for its own toggle.
      if (buyMenuRef.current) {
        if (code === 'KeyB') setShowBuyMenu(false);
        return;
      }

      if (overlayOpenRef.current) return;

      if (code === 'KeyW') inputState.current.moveForward = true;
      if (code === 'KeyS') inputState.current.moveBackward = true;
      if (code === 'KeyA') inputState.current.moveLeft = true;
      if (code === 'KeyD') inputState.current.moveRight = true;
      if (code === 'Space') inputState.current.jump = true;
      if (code === 'ControlLeft' || code === 'ControlRight') inputState.current.crouch = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') inputState.current.walk = true;

      if (code === 'KeyV') {
        engine.toggleShoulderSwap();
      } else if (code === 'KeyR') {
        engine.reload();
      } else if (code === 'Digit1') {
        engine.selectWeaponSlot(1);
      } else if (code === 'Digit2') {
        engine.selectWeaponSlot(2);
      } else if (code === 'Digit3') {
        engine.selectWeaponSlot(3);
      } else if (code === 'Digit5') {
        engine.selectWeaponSlot(5);
      } else if (code === 'KeyE') {
        if (engine.bombPlanted) {
          engine.startDefusingBomb();
        } else if (engine.activeWeapon.id === 'c4' || engine.playerTeam === 'T') {
          engine.startPlantingBomb();
        }
      } else if (code === 'KeyB') {
        clearMovementInput();
        setShowBuyMenu(true);
      } else if (code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      } else if (code === 'Backquote' || code === 'F1') {
        setShowDevPanel((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const engine = engineRef.current;

      if (code === 'KeyW') inputState.current.moveForward = false;
      if (code === 'KeyS') inputState.current.moveBackward = false;
      if (code === 'KeyA') inputState.current.moveLeft = false;
      if (code === 'KeyD') inputState.current.moveRight = false;
      if (code === 'Space') inputState.current.jump = false;
      if (code === 'ControlLeft' || code === 'ControlRight') inputState.current.crouch = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') inputState.current.walk = false;

      if (code === 'KeyE' && engine) {
        engine.stopPlantingBomb();
        engine.stopDefusingBomb();
      }

      if (code === 'Tab') setShowScoreboard(false);
    };

    const handleWheel = (e: WheelEvent) => {
      const engine = engineRef.current;
      if (!engine || overlayOpenRef.current) return;

      const slots: (1 | 2 | 3 | 5)[] = [1, 2, 3];
      if (engine.playerInventory.c4) slots.push(5);

      const currentIdx = slots.indexOf(engine.playerInventory.activeSlot);
      const nextIdx =
        e.deltaY > 0
          ? (currentIdx + 1) % slots.length
          : (currentIdx - 1 + slots.length) % slots.length;
      engine.selectWeaponSlot(slots[nextIdx]);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [resumeFromPause]);

  const engine = engineRef.current;
  const inMatch = screen === 'PLAYING';

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="block h-full w-full cursor-crosshair" />

      {/* In-match HUD */}
      {inMatch && engine && (
        <HUD
          engine={engine}
          crosshairStyle={settings.crosshairStyle}
          crosshairColor={settings.crosshairColor}
        />
      )}
      {inMatch && engine && !isPaused && <HitFeedback engine={engine} />}

      {/* FPS counter */}
      {settings.showFps && inMatch && (
        <div className="absolute left-4 top-4 z-30 rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1 font-mono text-[11px] font-bold tabular-nums text-emerald-400">
          {fps} FPS
        </div>
      )}

      {inMatch && showBuyMenu && engine && (
        <BuyMenu engine={engine} onClose={() => setShowBuyMenu(false)} />
      )}

      {inMatch && showScoreboard && engine && <Scoreboard engine={engine} />}

      {inMatch && showDevPanel && engine && (
        <TacticalDevPanel engine={engine} onClose={() => setShowDevPanel(false)} />
      )}

      {/* Click-to-capture prompt: only when actually in a live round */}
      {inMatch && !isPointerLocked && !overlayOpen && (
        <div
          onClick={requestPointerLock}
          className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center bg-slate-950/70 font-mono backdrop-blur-sm"
        >
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 px-8 py-6 text-center shadow-2xl">
            <Crosshair className="mx-auto mb-3 h-7 w-7 animate-pulse text-amber-400" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-100">
              Click to capture mouse
            </p>
            <p className="mt-1.5 text-[11px] text-slate-500">Esc to pause</p>
          </div>
        </div>
      )}

      {screen === 'MENU' && (
        <MainMenu onStart={startMatch} onOpenSettings={() => setShowSettings(true)} />
      )}

      {inMatch && isPaused && !showSettings && (
        <PauseMenu
          onResume={resumeFromPause}
          onOpenSettings={() => setShowSettings(true)}
          onQuitToMenu={quitToMenu}
        />
      )}

      {screen === 'MATCH_END' && engine && (
        <MatchEndScreen engine={engine} onRematch={rematch} onQuitToMenu={quitToMenu} />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Dev suite trigger, in-match only */}
      {inMatch && !overlayOpen && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={() => setShowDevPanel((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-xl backdrop-blur-md transition-colors hover:bg-slate-800"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Tech Dev Suite [~]</span>
          </button>
        </div>
      )}
    </div>
  );
}
