import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { VectorStage } from './components/game/VectorStage';
import { WordDeck } from './components/game/WordDeck';
import { TactileKeyboard } from './components/game/TactileKeyboard';
import { TelemetryDock } from './components/game/TelemetryDock';
import { EndgameModal } from './components/game/EndgameModal';
import { useHangmanGame } from './hooks/useHangmanGame';
import { audioEngine } from './lib/audio';
import { RefreshCw, AlertTriangle, Activity, Lock, Cpu, Compass } from 'lucide-react';
import type { ThemeId, Difficulty } from '../../shared/types';

export function App() {
  const {
    session,
    gameOverPayload,
    isConnected,
    errorNotice,
    guess,
    useHint,
    startNewGame,
    secretWordForLoss,
  } = useHangmanGame();

  const [muted, setMuted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Toggle Audio Mute
  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  // Change Theme
  const handleThemeChange = (newTheme: ThemeId) => {
    startNewGame(newTheme, session.difficulty, session.dailyMode);
  };

  // Change Difficulty
  const handleDifficultyChange = (newDiff: Difficulty) => {
    startNewGame(session.theme, newDiff, false);
  };

  // Toggle Daily
  const handleToggleDaily = () => {
    const nextDaily = !session.dailyMode;
    startNewGame(session.theme, session.difficulty, nextDaily);
  };

  // Decryption success percentage
  const revealedCount = session.maskedWord.filter((c) => c !== null).length;
  const decryptRatio = ((revealedCount / session.wordLength) * 100).toFixed(1);
  const remainingGlyphs = session.wordLength - revealedCount;

  // Telemetry gauge calculation based on theme
  const getTelemetryLabels = () => {
    switch (session.theme) {
      case 'deep_sea_diver':
        return {
          metric1Name: 'CHAMBER PSI',
          metric1Val: `${(101.3 + session.strikesUsed * 18.4).toFixed(1)} kPa`,
          metric2Name: 'DEPTH GAIN',
          metric2Val: `${800 + session.strikesUsed * 180}m`,
          metric3Name: 'HULL INTEGRITY',
          metric3Val: `${Math.max(10, 100 - session.strikesUsed * 16)}%`,
        };
      case 'steampunk_automaton':
        return {
          metric1Name: 'STEAM PRESSURE',
          metric1Val: `${(85 + session.strikesUsed * 24).toFixed(0)} PSI`,
          metric2Name: 'TORQUE LOAD',
          metric2Val: `${(240 + session.strikesUsed * 65)} Nm`,
          metric3Name: 'COGWHEEL WEAR',
          metric3Val: `${session.strikesUsed * 16}%`,
        };
      case 'orbital_astronaut':
      default:
        return {
          metric1Name: 'O2 SUIT TANK',
          metric1Val: `${Math.max(8, 98 - session.strikesUsed * 15)}%`,
          metric2Name: 'TETHER DRIFT',
          metric2Val: `${(session.strikesUsed * 3.8).toFixed(1)} m/s`,
          metric3Name: 'RAD HAZARD',
          metric3Val: session.strikesUsed >= 4 ? 'HIGH' : 'NOMINAL',
        };
    }
  };

  const gauges = getTelemetryLabels();

  return (
    <div className="min-h-screen bg-background text-[#eae1da] flex flex-col font-sans selection:bg-primary selection:text-[#12100e]">
      {/* HEADER */}
      <Header
        theme={session.theme}
        onThemeChange={handleThemeChange}
        difficulty={session.difficulty}
        onDifficultyChange={handleDifficultyChange}
        dailyMode={session.dailyMode}
        onToggleDaily={handleToggleDaily}
        strikes={session.strikesUsed}
        maxStrikes={session.maxStrikes}
        isConnected={isConnected}
        muted={muted}
        onToggleMute={handleToggleMute}
      />

      {/* ERROR NOTICE TOAST */}
      {errorNotice && (
        <div className="fixed top-16 right-4 z-50 bg-secondary-container/90 border border-secondary text-secondary px-4 py-2 rounded-lg font-mono text-xs shadow-xl animate-bounce">
          {errorNotice}
        </div>
      )}

      {/* MAIN COCKPIT VIEWPORT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* TOP SYSTEM CALIBRATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-low border border-surface-high/60 p-3 rounded-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs font-bold text-primary uppercase tracking-widest">
                TACTICAL CONSOLE // ONLINE
              </span>
            </div>
            <span className="font-mono text-xs text-outline-variant">::</span>
            <span className="font-mono text-xs text-muted-foreground">
              DECK SEED:{' '}
              <strong className="text-tertiary">
                {session.dailyMode ? '#DAILY_SYNC' : `#OP-${session.sessionId.slice(0, 6)}`}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span>DECRYPTION PROGRESS:</span>
              <span className="font-bold text-primary">{decryptRatio}%</span>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-lg border border-surface-high/40">
              <span className="font-mono text-[11px] text-secondary uppercase font-bold">
                PRESSURE:
              </span>
              <span className="font-mono text-xs text-secondary font-bold">
                {session.strikesUsed} / {session.maxStrikes}
              </span>
            </div>
          </div>
        </div>

        {/* SPLIT COCKPIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT DECK: VECTOR CHAMBER & TELEMETRY GAUGES (5 COLUMNS) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="relative bg-surface-low border border-surface-high/60 rounded-xl p-4 shadow-2xl overflow-hidden flex flex-col items-center justify-between min-h-[480px]">
              {/* Tactical drafting background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-tactical-grid" />

              {/* Coordinates HUD overlay */}
              <div className="absolute top-2 left-3 font-mono text-[9px] text-outline">
                00.00° / LAT-N
              </div>
              <div className="absolute top-2 right-3 font-mono text-[9px] text-outline uppercase">
                {session.theme.replace('_', ' ')}
              </div>
              <div className="absolute bottom-2 left-3 font-mono text-[9px] text-outline">
                CALIPER TOLERANCE: ±0.02mm
              </div>
              <div
                className={`absolute bottom-2 right-3 font-mono text-[9px] ${
                  session.strikesUsed >= 5
                    ? 'text-secondary animate-pulse'
                    : session.strikesUsed >= 3
                    ? 'text-tertiary'
                    : 'text-primary'
                }`}
              >
                {session.strikesUsed >= 5
                  ? 'CRITICAL_TENSION: RUPTURE IMMINENT'
                  : session.strikesUsed >= 3
                  ? 'NODE_BETA: STRESS PEAK'
                  : 'NODE_ALPHA: CALIBRATED'}
              </div>

              {/* Header inside vector chamber */}
              <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 bg-surface-container/80 px-2.5 py-1 rounded backdrop-blur-md border border-surface-high/40">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-[10px] text-[#eae1da] uppercase">
                    ISOMETRIC CADENCE STAGE
                  </span>
                </div>
                <div className="font-mono text-[10px] bg-secondary-container/20 text-secondary border border-secondary/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                  STRIKE LOAD: {session.strikesUsed}/{session.maxStrikes}
                </div>
              </div>

              {/* Vector Stage Component */}
              <VectorStage
                theme={session.theme}
                strikes={session.strikesUsed}
                maxStrikes={session.maxStrikes}
                status={session.status}
              />

              {/* Lower Diagnostic Gauges */}
              <div className="w-full grid grid-cols-3 gap-2 bg-surface-container/90 border border-surface-high/40 p-2.5 rounded-lg z-10">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                    {gauges.metric1Name}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary tracking-tight">
                    {gauges.metric1Val}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                    {gauges.metric2Name}
                  </span>
                  <span className="font-mono text-sm font-bold text-tertiary tracking-tight">
                    {gauges.metric2Val}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                    {gauges.metric3Name}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary tracking-tight">
                    {gauges.metric3Val}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-surface-low border border-surface-high/40 rounded-lg">
              <button
                type="button"
                onClick={() => startNewGame(session.theme, session.difficulty, session.dailyMode)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-xs uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>RE-CALIBRATE / NEW DECK</span>
              </button>
              <span className="font-mono text-[10px] text-muted-foreground">
                LATENCY: {isConnected ? '12ms' : '0ms (LOCAL)'}
              </span>
            </div>
          </div>

          {/* RIGHT DECK: CIPHER WORD REVEAL MATRIX & WORKBAY (7 COLUMNS) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* CIPHER WORD REVEAL RACK */}
            <div className="bg-surface-low border border-surface-high/60 p-5 rounded-xl shadow-xl flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    CIPHER STREAM: WORD LENGTH {session.wordLength}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  ENCRYPTION: ROT-OCTAL
                </span>
              </div>

              {/* 3D Flip Card Word Deck */}
              <WordDeck
                maskedWord={session.maskedWord}
                status={session.status}
                secretWord={secretWordForLoss}
              />

              {/* Telemetry Status Context */}
              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-surface-high/40 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-tertiary">
                  <Compass className="w-3.5 h-3.5" />
                  CATEGORY: {session.category}
                </span>
                <span className="text-muted-foreground font-bold">
                  {remainingGlyphs} REMAINING GLYPHS
                </span>
              </div>
            </div>

            {/* TACTILE KEYBOARD MATRIX */}
            <div className="bg-surface-low border border-surface-high/60 p-4 rounded-xl shadow-xl flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  MECHANICAL KEYCAP ARRAY // QWERTY
                </span>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> MATCH
                  </span>
                  <span className="flex items-center gap-1 text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> STRIKE
                  </span>
                </div>
              </div>

              <TactileKeyboard
                guessedLetters={session.guessedLetters}
                correctLetters={session.correctLetters}
                incorrectLetters={session.incorrectLetters}
                onGuess={guess}
                disabled={session.status !== 'PLAYING'}
                showFrequencyHeatmap={showHeatmap}
              />
            </div>

            {/* FLANKING TACTICAL TOOLS: HINT RADAR & FREQUENCY TELEMETRY */}
            <TelemetryDock
              hintsAvailable={session.hintsAvailable}
              unlockedHints={session.unlockedHints}
              category={session.category}
              difficulty={session.difficulty}
              guessedLetters={session.guessedLetters}
              onUseHint={useHint}
              showFrequencyHeatmap={showHeatmap}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              disabled={session.status !== 'PLAYING'}
            />
          </div>
        </div>

        {/* CRITICAL THRESHOLD ALERT BANNER */}
        {session.strikesUsed >= 3 && (
          <div
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between px-5 shadow-lg transition-all ${
              session.strikesUsed >= 5
                ? 'bg-secondary-container/30 border-secondary animate-pulse'
                : 'bg-secondary-container/15 border-secondary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-secondary" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                  HAZARD CAUTION: STRUCTURAL INTEGRITY AT{' '}
                  {Math.max(0, 100 - (session.strikesUsed / session.maxStrikes) * 100).toFixed(0)}%
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {session.maxStrikes - session.strikesUsed} MISTAKES REMAINING BEFORE TOTAL CIPHER
                  PURGE
                </span>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-secondary bg-secondary-container/40 border border-secondary/40 px-3 py-1 rounded-md hidden sm:inline-block">
              {session.strikesUsed >= 5 ? '⚠️ EMERGENCY OVERRIDE' : 'HALT PROTOCOL READY'}
            </span>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-low border-t border-surface-high/60 py-4 mt-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>TERMINAL STATUS: {isConnected ? 'ONLINE' : 'STANDALONE'}</span>
            <span>|</span>
            <span>CRYPTO ENGINE v4.2</span>
          </div>
          <div>© NEO-VICTORIAN CRYPTOGRAPHIC WORKSHOP // TACTICAL EDITION</div>
          <div className="flex items-center gap-4">
            <span className="text-primary hover:underline cursor-pointer">TELEMETRY</span>
            <span className="hover:underline cursor-pointer">FIELD MANUAL</span>
          </div>
        </div>
      </footer>

      {/* ENDGAME SHOWCASE MODAL */}
      <EndgameModal
        payload={gameOverPayload}
        isOpen={Boolean(gameOverPayload)}
        onRestart={() => startNewGame(session.theme, session.difficulty, session.dailyMode)}
        dailyMode={session.dailyMode}
      />
    </div>
  );
}
export default App;
