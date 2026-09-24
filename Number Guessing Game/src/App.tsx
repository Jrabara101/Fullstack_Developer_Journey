import { useState } from 'react';
import { useVaultGame } from './hooks/useVaultGame';
import { BackgroundEffects } from './components/game/BackgroundEffects';
import { HeaderBar } from './components/game/HeaderBar';
import { VaultChassis } from './components/game/VaultChassis';
import { RangeVisualizer } from './components/game/RangeVisualizer';
import { TumblerTerminal } from './components/game/TumblerTerminal';
import { ThermalProximitySensor } from './components/game/ThermalProximitySensor';
import { CircuitIntegrityFuses } from './components/game/CircuitIntegrityFuses';
import { BreachLogFeed } from './components/game/BreachLogFeed';
import { TelemetryHintTerminal } from './components/game/TelemetryHintTerminal';
import { EndOfRunShowcase } from './components/game/EndOfRunShowcase';
import { DailyStatsModal } from './components/game/DailyStatsModal';

export default function App() {
  const {
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
    setGameMode,
    startNewGame,
    toggleMute,
    simulateWin,
  } = useVaultGame();

  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [endOfRunDismissed, setEndOfRunDismissed] = useState(false);

  // Determine if End-of-Run showcase should be displayed
  const isGameOver = gameState.status === 'VICTORY' || gameState.status === 'DEFEAT';
  const showEndOfRun = isGameOver && !endOfRunDismissed;

  const handleRestart = () => {
    setEndOfRunDismissed(false);
    startNewGame();
  };

  // Get last distance for thermal proximity
  const lastGuess = gameState.history[0];
  const lastDistance = lastGuess ? lastGuess.distance : null;

  return (
    <div className="relative min-h-screen bg-surface-container-lowest text-on-surface antialiased flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Background Cyber Grid & Vignette */}
      <BackgroundEffects />

      {/* Fixed Header Bar */}
      <HeaderBar
        gameMode={gameMode}
        onSelectMode={(mode) => {
          setEndOfRunDismissed(false);
          setGameMode(mode);
        }}
        attemptsUsed={gameState.attemptsUsed}
        maxAttempts={gameState.maxAttempts}
        currentStreak={stats.currentStreak}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenStats={() => setStatsModalOpen(true)}
      />

      {/* Main Console Bay */}
      <main className="relative z-10 w-full pt-20 pb-12 px-4 sm:px-6 flex items-center justify-center flex-1">
        <div className="w-full flex flex-col items-center justify-center">
          <VaultChassis onSimulateWin={simulateWin} lastDistance={lastDistance}>
            {/* 1. UPPER STATUS & BRACKET SQUEEZE STRIP */}
            <RangeVisualizer
              currentMinBound={gameState.currentMinBound}
              currentMaxBound={gameState.currentMaxBound}
              rangeMin={gameState.rangeMin}
              rangeMax={gameState.rangeMax}
              currentGuess={tumblerValue}
              onSelectValue={setTumblerValue}
            />

            {/* 2. CENTRAL TUMBLER DIAL & NUMERICAL STEPPER BAY */}
            <TumblerTerminal
              tumblerValue={tumblerValue}
              onValueChange={setTumblerValue}
              onStep={stepTumbler}
              onBisect={applyBisect}
              optimalBisect={optimalBisect}
              onReset={resetTumblerToMid}
              onSubmit={submitGuess}
              disabled={isGameOver}
              isEvaluating={fsmStage === 'EVALUATING'}
            />

            {/* 3. MICRO-FEEDBACK & PHYSICAL ATTEMPTS FUSE STRIP */}
            <div className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <ThermalProximitySensor
                lastDistance={lastDistance}
                target={gameState.target}
                currentGuess={tumblerValue}
              />

              <CircuitIntegrityFuses
                attemptsUsed={gameState.attemptsUsed}
                maxAttempts={gameState.maxAttempts}
                isVictory={gameState.status === 'VICTORY'}
                isDefeated={gameState.status === 'DEFEAT'}
              />
            </div>

            {/* 4. LOWER TELEMETRY SPLIT DECK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreachLogFeed history={gameState.history} />

              <TelemetryHintTerminal
                target={gameState.target}
                hints={gameState.hints}
                onUnlockHint={unlockHint}
                disabled={isGameOver}
              />
            </div>
          </VaultChassis>
        </div>
      </main>

      {/* End of Run Showcase Dialog */}
      <EndOfRunShowcase
        open={showEndOfRun}
        onClose={() => setEndOfRunDismissed(true)}
        won={gameState.status === 'VICTORY'}
        target={gameState.target}
        attemptsUsed={gameState.attemptsUsed}
        maxAttempts={gameState.maxAttempts}
        timeElapsed={timeElapsed}
        score={gameState.score}
        archetypeResult={archetypeResult}
        shareString={shareString}
        onPlayAgain={handleRestart}
      />

      {/* Career Diagnostics & Stats Modal */}
      <DailyStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        stats={stats}
      />

      {/* Global Tactical Footer */}
      <footer className="relative z-10 w-full bg-surface-container-lowest/80 border-t border-outline-variant/30 py-4 px-6 text-on-surface-variant font-mono text-[11px]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-primary font-bold">VAULT_KERNEL // BUILD 4.2.19</span>
            <span className="hidden sm:inline text-outline">|</span>
            <span className="hidden sm:inline">SECURE TELEMETRY LINK</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setStatsModalOpen(true)}
              className="hover:text-primary transition-colors uppercase"
            >
              BREACH LOGS
            </button>
            <span className="text-outline">|</span>
            <span className="text-outline-variant">© 2026 CIPHERTECH VAULT SEC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
