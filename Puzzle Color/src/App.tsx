import React, { useState, useEffect } from 'react';
import { useColorMixEngine } from './hooks/useColorMixEngine';
import { useAudioHaptics } from './hooks/useAudioHaptics';
import { HeaderBar } from './components/hud/HeaderBar';
import { SplitSwatchLens } from './components/hud/SplitSwatchLens';
import { VolumeStepBudget } from './components/hud/VolumeStepBudget';
import { FluidCrucibleCanvas } from './components/crucible/FluidCrucibleCanvas';
import { CrucibleControls } from './components/crucible/CrucibleControls';
import { PipetteRack } from './components/dispensers/PipetteRack';
import { CielabPolarPlot } from './components/telemetry/CielabPolarPlot';
import { SpectralCurve } from './components/telemetry/SpectralCurve';
import { ChemicalInspectorDrawer } from './components/telemetry/ChemicalInspectorDrawer';
import { VictoryShareDialog } from './components/dialogs/VictoryShareDialog';
import { AccessibilityDialog } from './components/dialogs/AccessibilityDialog';
import { LeaderboardDialog } from './components/dialogs/LeaderboardDialog';
import { DuelLobbyDialog } from './components/dialogs/DuelLobbyDialog';
import { getColorBlindFilterStyle } from './lib/daltonize';
import { FlaskConical, HelpCircle, Layers, Sun } from 'lucide-react';

export function App() {
  const { state, actions } = useColorMixEngine();
  const audio = useAudioHaptics();

  // Audio mute state
  const [audioMuted, setAudioMuted] = useState(false);

  // Dialog & Drawer toggles
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDuelOpen, setIsDuelOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sound triggers
  const handleDispenseWithSound = (reagentId: string, volumeMl: number, tool: 'pipette' | 'pour') => {
    actions.dispenseReagent(reagentId, volumeMl, tool);
    if (!audioMuted) {
      if (tool === 'pipette') {
        audio.playDrip(reagentId === 'yellow' ? 950 : reagentId === 'magenta' ? 820 : 700);
      } else {
        audio.playPour();
      }
    }
  };

  const handleStirWithSound = () => {
    actions.stirCrucible();
    if (!audioMuted) {
      audio.playStir();
    }
  };

  const handleUndoWithSound = () => {
    actions.undo();
    if (!audioMuted) {
      audio.playClick();
    }
  };

  const handleFlushWithSound = () => {
    actions.flushCrucible();
    if (!audioMuted) {
      audio.playPour();
    }
  };

  // Play success sound when solved
  useEffect(() => {
    if (state.status === 'COMPLETED' && !audioMuted) {
      audio.playSuccess();
    }
  }, [state.status, audioMuted]);

  // Colorblind filter style for the main laboratory viewport
  const colorBlindFilter = getColorBlindFilterStyle(state.accessibility.colorBlindFilter);

  return (
    <div
      className="min-h-screen bg-[#0c0e14] text-slate-100 flex flex-col antialiased selection:bg-primary selection:text-slate-950"
      style={{ filter: colorBlindFilter }}
    >
      {/* Top Telemetry Header */}
      <HeaderBar
        mode={state.mode}
        onSwitchMode={actions.switchMode}
        puzzleId={state.puzzleId}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenDuel={() => setIsDuelOpen(true)}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted((m) => !m)}
      />

      {/* Main Laboratory Bench */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-20 pb-16 flex flex-col gap-5">
        {/* Lab Metadata & Mode Switch Pill (Mobile) */}
        <div className="flex sm:hidden items-center justify-between bg-surface-low border border-surface-high/60 p-2 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-300">{state.puzzleId}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => actions.switchMode('SUBTRACTIVE_CMYK')}
              className={`px-2 py-1 rounded ${
                state.mode === 'SUBTRACTIVE_CMYK' ? 'bg-primary text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              CMYK
            </button>
            <button
              onClick={() => actions.switchMode('ADDITIVE_RGB')}
              className={`px-2 py-1 rounded ${
                state.mode === 'ADDITIVE_RGB' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              RGB
            </button>
          </div>
        </div>

        {/* 1. TOP TELEMETRY: SPLIT SWATCH APERTURE & MOVE LIMIT GAUGE */}
        <section className="flex flex-col gap-2 bg-surface-low border border-surface-high/60 p-4 rounded-2xl shadow-xl relative overflow-hidden">
          {/* Split Swatch Comparison Lens */}
          <SplitSwatchLens
            targetColor={state.targetColor}
            currentColor={state.currentColor}
            deltaE={state.deltaE}
            patternsEnabled={state.accessibility.patternsEnabled}
          />

          {/* Volume and Injections Budget Readout */}
          <VolumeStepBudget
            moveCount={state.moveCount}
            maxMoves={state.maxMoves}
            currentVolumeMl={state.currentVolumeMl}
            maxVolumeMl={state.maxCrucibleCapacityMl}
          />
        </section>

        {/* 2. CENTER MIXING CRUCIBLE & FLUID DIFFUSION STAGE */}
        <section className="relative bg-surface-lowest border border-surface-high/60 rounded-2xl p-5 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
          {/* Subtle Ambient Laser Glow Behind Crucible */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-700 blur-3xl"
            style={{ backgroundColor: state.currentColor.hex }}
          />

          {/* HTML5 Canvas Crucible Simulation */}
          <FluidCrucibleCanvas
            currentColor={state.currentColor}
            targetColor={state.targetColor}
            currentVolumeMl={state.currentVolumeMl}
            maxVolumeMl={state.maxCrucibleCapacityMl}
            status={state.status}
            patternsEnabled={state.accessibility.patternsEnabled}
          />

          {/* Interactive Crucible Controls (Stir, Undo, Flush) */}
          <CrucibleControls
            onStir={handleStirWithSound}
            onUndo={handleUndoWithSound}
            onFlush={handleFlushWithSound}
            canUndo={state.history.length > 0}
            isStirring={state.status === 'STIRRING'}
            onDropDispense={(id, vol) => handleDispenseWithSound(id, vol, 'pipette')}
          />
        </section>

        {/* 3. THUMB-ORIENTED REAGENT DISPENSER RACK */}
        <PipetteRack
          reagents={state.reagents}
          onDispense={handleDispenseWithSound}
          patternsEnabled={state.accessibility.patternsEnabled}
          disabled={state.status === 'COMPLETED'}
        />

        {/* 4. REAL-TIME SPECTROPHOTOMETRIC DIAGNOSTICS BAY */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Perceptual Colorimetry Telemetry
            </span>
            <span className="font-mono text-[10px] text-primary">CIELAB 1976 / 2000 Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* a* vs b* Chromaticity Polar Grid */}
            <CielabPolarPlot
              currentColor={state.currentColor}
              targetColor={state.targetColor}
              deltaE={state.deltaE}
            />

            {/* 380 - 740nm Visible Reflectance Curve */}
            <SpectralCurve
              currentColor={state.currentColor}
              targetColor={state.targetColor}
            />
          </div>
        </section>

        {/* Quick Instructions & Hotkeys Footer Card */}
        <footer className="p-4 rounded-xl bg-surface-low border border-surface-high/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FlaskConical className="w-4 h-4 text-primary" />
              <span>Goal: Synthesize target swatch within ΔE ≤ {state.toleranceThreshold.toFixed(1)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-surface-container px-2 py-0.5 rounded border border-surface-high">
              [1-{state.reagents.length}] Dispense
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded border border-surface-high">
              [Space] Stir
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded border border-surface-high">
              [Z] Undo
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded border border-surface-high">
              [R] Flush
            </span>
          </div>
        </footer>
      </main>

      {/* Chemical Inspector Drawer */}
      <ChemicalInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        currentColor={state.currentColor}
        targetColor={state.targetColor}
        deltaE={state.deltaE}
        currentVolumeMl={state.currentVolumeMl}
        moveCount={state.moveCount}
      />

      {/* Accessibility & Daltonization Modal */}
      <AccessibilityDialog
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        patternsEnabled={state.accessibility.patternsEnabled}
        colorBlindFilter={state.accessibility.colorBlindFilter}
        onTogglePatterns={actions.togglePatterns}
        onSelectColorBlindFilter={actions.setColorBlindFilter}
      />

      {/* Leaderboard Modal */}
      <LeaderboardDialog
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        puzzleId={state.puzzleId}
      />

      {/* 1v1 Color Clash Duel Modal */}
      <DuelLobbyDialog
        isOpen={isDuelOpen}
        onClose={() => setIsDuelOpen(false)}
        playerDeltaE={state.deltaE}
        playerColor={state.currentColor}
        playerMoves={state.moveCount}
        targetColor={state.targetColor}
      />

      {/* Victory & Share Modal */}
      <VictoryShareDialog
        isOpen={state.status === 'COMPLETED'}
        onClose={() => {}}
        onRestart={() => actions.generateDailyPuzzle(new Date().toISOString().split('T')[0], state.mode)}
        puzzleId={state.puzzleId}
        targetColor={state.targetColor}
        currentColor={state.currentColor}
        deltaE={state.deltaE}
        toleranceThreshold={state.toleranceThreshold}
        history={state.history}
        movesUsed={state.moveCount}
        maxMoves={state.maxMoves}
        volumeUsedMl={state.currentVolumeMl}
        timeElapsedMs={(state.endTime || Date.now()) - state.startTime}
        isDaily={true}
        onVerify={actions.verifySolutionOnServer}
      />
    </div>
  );
}
