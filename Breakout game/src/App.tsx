import React, { useState, useEffect, useRef } from 'react';
import { BreakoutEngine } from './game/engine';
import { GameStats, ActivePowerUp, GameSettings } from './game/types';
import { HUD } from './components/HUD';
import { ArenaCanvas } from './components/ArenaCanvas';
import { PowerUpTray } from './components/PowerUpTray';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { sound } from './game/audio';

export const App: React.FC = () => {
  const engineRef = useRef<BreakoutEngine | null>(null);
  const [engineReady, setEngineReady] = useState(false);

  // Synced States
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 50000,
    lives: 3,
    maxLives: 3,
    combo: 1,
    maxCombo: 1,
    bricksDestroyed: 0,
    totalBricks: 48,
    activeSector: 1,
    isGameOver: false,
    isVictory: false,
    rank: 'A',
  });

  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [isWaitingLaunch, setIsWaitingLaunch] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    soundVolume: 0.6,
    reducedMotion: false,
    crtOverlay: true,
    ballSpeedMultiplier: 1.0,
    homingAssistEnabled: true,
  });

  // Modal Dialogs
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);

  // Initialize Breakout Engine on Mount
  useEffect(() => {
    const canvas = document.getElementById('game-arena-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const engine = new BreakoutEngine(canvas);
    engineRef.current = engine;

    // Connect Engine Callbacks
    engine.onStatsChange = (newStats) => setStats(newStats);
    engine.onPowerUpsChange = (powers) => setActivePowerUps(powers);
    engine.onLaunchStateChange = (waiting) => setIsWaitingLaunch(waiting);
    engine.onSectorComplete = () => setIsGameOverOpen(true);
    engine.onGameOver = () => setIsGameOverOpen(true);

    // Initial stats sync
    setStats({ ...engine.stats });
    engine.start();
    setEngineReady(true);

    return () => {
      engine.destroy();
    };
  }, []);

  // Update Engine when Settings change
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (engineRef.current) {
      engineRef.current.settings = updated;
    }
    if (updated.soundEnabled !== undefined) {
      sound.enabled = updated.soundEnabled;
    }
    if (updated.soundVolume !== undefined) {
      sound.volume = updated.soundVolume;
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const engine = engineRef.current;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.keys.right = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isGameOverOpen) {
          handleRestart();
        } else if (isPaused) {
          handleResume();
        } else if (engine.isWaitingLaunch) {
          engine.launchBall();
        } else if (engine.paddle.hasLasers) {
          engine.fireLasers();
        } else if (engine.paddle.caughtBall) {
          engine.launchBall();
        }
      } else if (e.code === 'Escape') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engineRef.current.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engineRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOverOpen, isPaused]);

  // Actions
  const handleLaunch = () => {
    if (engineRef.current) {
      engineRef.current.launchBall();
    }
  };

  const togglePause = () => {
    if (!engineRef.current || isWaitingLaunch) return;
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    engineRef.current.isPaused = newPaused;
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    setIsPaused(false);
    engineRef.current.isPaused = false;
  };

  const handleToggleSound = () => {
    handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleRestart = () => {
    setIsGameOverOpen(false);
    if (engineRef.current) {
      engineRef.current.stats.lives = 3;
      engineRef.current.stats.score = 0;
      engineRef.current.loadSector(engineRef.current.stats.activeSector);
    }
  };

  const handleNextSector = () => {
    setIsGameOverOpen(false);
    if (engineRef.current) {
      const nextId = (engineRef.current.stats.activeSector % 5) + 1;
      engineRef.current.loadSector(nextId);
    }
  };

  const handleSelectSector = (sectorId: number) => {
    if (engineRef.current) {
      engineRef.current.loadSector(sectorId);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen w-screen flex flex-col justify-between items-center p-2 sm:p-4 md:p-5 relative overflow-hidden select-none font-sans">
      {/* Ambient Neon Blobs in Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-slate-900/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP FLOATING HUD */}
      <HUD 
        stats={stats}
        soundEnabled={settings.soundEnabled}
        isPaused={isPaused}
        onToggleSound={handleToggleSound}
        onTogglePause={togglePause}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
      />

      {/* ACTIVE POWER-UP STATUS PILLS */}
      <PowerUpTray activePowerUps={activePowerUps} />

      {/* PRIMARY SECTION: ARCADE ARENA */}
      <ArenaCanvas 
        engine={engineRef.current}
        isWaitingLaunch={isWaitingLaunch}
        isPaused={isPaused}
        crtOverlay={settings.crtOverlay}
        onLaunch={handleLaunch}
        onResume={handleResume}
      />

      {/* FOOTER CONTROLS & STATUS DOCK */}
      <footer className="w-full max-w-5xl z-20 mt-1">
        <div className="glass-panel rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 border border-slate-800 text-xs font-mono">
          {/* Desktop Keyboard Shortcuts */}
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px] shadow-sm">
                MOUSE / ◄ ► / A D
              </kbd>
              <span>Paddle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px] shadow-sm">
                SPACE
              </kbd>
              <span>Launch / Laser</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px] shadow-sm">
                ESC
              </kbd>
              <span>Pause</span>
            </div>
          </div>

          {/* Brick Tier Legend */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
              <span className="text-slate-300">1-Hit (100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></span>
              <span className="text-slate-300">2-Hit (250)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.7)]"></span>
              <span className="text-slate-300">Armored (500)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]"></span>
              <span className="text-slate-300">Explosive</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL DIALOGS */}
      <GameOverModal 
        isOpen={isGameOverOpen}
        stats={stats}
        onRestart={handleRestart}
        onNextSector={handleNextSector}
        onOpenLevelSelect={() => {
          setIsGameOverOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LevelSelectModal 
        isOpen={isLevelSelectOpen}
        activeSectorId={stats.activeSector}
        onSelectSector={handleSelectSector}
        onClose={() => setIsLevelSelectOpen(false)}
      />
    </div>
  );
};
