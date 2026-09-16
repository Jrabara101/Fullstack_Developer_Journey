import { useState, useEffect } from 'react';
import { useMemoryGame } from './hooks/useMemoryGame';
import { Header } from './components/Header';
import { GameHud } from './components/GameHud';
import { CardMatrix } from './components/CardMatrix';
import { ControlDeck } from './components/ControlDeck';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { MatrixSelectModal } from './components/MatrixSelectModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { GameSettings, Difficulty, TimerMode } from './types';
import { soundEngine } from './utils/audio';

const STORAGE_SETTINGS_KEY = 'kinetic_memory_settings_v1';

export function App() {
  // Settings with persistent localStorage
  const [settings, setSettings] = useState<GameSettings>(() => {
    const defaultReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    return {
      soundEnabled: true,
      soundVolume: 0.5,
      reducedMotion: defaultReducedMotion,
      glimpseEnabled: true,
      highContrast: false
    };
  });

  // Modal open states
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMatrixSelectOpen, setIsMatrixSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync settings with audio engine and storage
  const updateSettings = (newPartial: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  useEffect(() => {
    soundEngine.setMuted(!settings.soundEnabled);
    soundEngine.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Hook into core game state engine
  const {
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
  } = useMemoryGame('easy', 'countdown', settings.glimpseEnabled);

  // Handle difficulty progression on victory
  const handleAdvanceDifficulty = () => {
    const nextDiff: Difficulty =
      difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
    startNewGame(nextDiff, timerMode);
  };

  const clearLeaderboard = () => {
    try {
      localStorage.removeItem('kinetic_memory_leaderboard_v1');
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className={`min-h-screen bg-surface flex flex-col text-on-surface ${settings.reducedMotion ? 'reduced-motion' : ''}`}>
      {/* TOP FIXED NAVIGATION */}
      <Header
        status={status}
        isMuted={!settings.soundEnabled}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        onTogglePause={togglePause}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenMatrixSelect={() => setIsMatrixSelectOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* MAIN ARENA CONTAINER */}
      <main className="w-full pt-16 flex-1 flex flex-col justify-between relative overflow-hidden">
        <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-4 lg:p-6 overflow-hidden">
          {/* Ambient Kinetic Backdrops */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-primary-container/10 rounded-full blur-[140px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-12 w-80 h-80 bg-secondary/10 rounded-full blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 right-10 w-96 h-96 bg-tertiary/10 rounded-full blur-[130px]"
          />

          {/* TOP HUD BAR */}
          <GameHud
            config={config}
            stats={stats}
            timerMode={timerMode}
            onOpenMatrixSelect={() => setIsMatrixSelectOpen(true)}
          />

          {/* CENTER ARENA: CARD MATRIX */}
          <CardMatrix
            cards={cards}
            config={config}
            status={status}
            isBoardLocked={isBoardLocked}
            glimpseCountdown={glimpseCountdown}
            focusedIndex={focusedIndex}
            reducedMotion={settings.reducedMotion}
            onCardClick={handleCardClick}
            setFocusedIndex={setFocusedIndex}
            onResume={togglePause}
          />

          {/* BOTTOM CONTROL DECK & TELEMETRY */}
          <ControlDeck
            stats={stats}
            config={config}
            status={status}
            onHint={triggerHint}
            onReset={() => startNewGame(difficulty, timerMode)}
            onSimulateVictory={simulateVictory}
          />
        </div>
      </main>

      {/* FOOTER STATUS BAR */}
      <footer className="w-full bg-surface-container-lowest/90 py-3 border-t border-outline-variant/20 shadow-[0_-1px_12px_rgba(0,0,0,0.3)] relative z-20">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-secondary flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              ONLINE 60 FPS
            </span>
            <span className="font-mono text-[11px] text-outline">
              SYNC ENGINE V2.4 • TACTILE PHYSICS ACTIVE
            </span>
          </div>
          <div className="font-mono text-[11px] text-outline">
            © 2024 KINETIC MEMORY LABS. REACT + VITE ARCADE ENGINE.
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <VictoryModal
        isOpen={status === 'won'}
        stats={stats}
        config={config}
        timerMode={timerMode}
        difficulty={difficulty}
        onClose={() => startNewGame(difficulty, timerMode)}
        onRestart={() => startNewGame(difficulty, timerMode)}
        onAdvanceDifficulty={handleAdvanceDifficulty}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      <GameOverModal
        isOpen={status === 'lost'}
        stats={stats}
        config={config}
        onRestart={() => startNewGame(difficulty, timerMode)}
        onOpenMatrixSelect={() => setIsMatrixSelectOpen(true)}
        onClose={() => startNewGame(difficulty, timerMode)}
      />

      <MatrixSelectModal
        isOpen={isMatrixSelectOpen}
        currentDifficulty={difficulty}
        currentTimerMode={timerMode}
        onClose={() => setIsMatrixSelectOpen(false)}
        onApply={(newDiff: Difficulty, newMode: TimerMode) => startNewGame(newDiff, newMode)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        records={leaderboard}
        onClose={() => setIsLeaderboardOpen(false)}
        onClear={clearLeaderboard}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
