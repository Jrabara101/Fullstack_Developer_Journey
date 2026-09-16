import React, { useState, useEffect } from 'react';
import { useArcadeStore } from './store/useArcadeStore';
import { useGameLoop } from './hooks/useGameLoop';
import { BackgroundScene } from './components/BackgroundScene';
import { Header } from './components/Header';
import { ArcadeHud } from './components/ArcadeHud';
import { ControlRibbon } from './components/ControlRibbon';
import { GridArena } from './components/GridArena';
import { RadioLogBar } from './components/RadioLogBar';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Trigger deterministic RAF game loop hook
  useGameLoop();

  const status = useArcadeStore((s) => s.status);
  const startGame = useArcadeStore((s) => s.startGame);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Automatically open Game Over modal when status transitions to GAME_OVER
  useEffect(() => {
    if (status === 'GAME_OVER') {
      setShowGameOverModal(true);
    }
  }, [status]);

  // Initial game kickoff on first mount if idle
  useEffect(() => {
    // Start game on initial load with 30s horizon run
    startGame(30);
  }, [startGame]);

  return (
    <div className="bg-[#08020f] text-cyan-100 font-['VT323'] text-xl select-none min-h-screen relative overflow-x-hidden flex flex-col justify-between">
      {/* 80s Synthwave Background Scene */}
      <BackgroundScene />

      {/* Outrun Laser Header */}
      <Header onOpenSettings={() => setShowSettingsModal(true)} />

      {/* Main Playing Field */}
      <main className="w-full pt-24 pb-12 relative z-10 flex flex-col items-center">
        <section className="relative w-full max-w-5xl px-4 flex flex-col items-center select-none">
          {/* Top Cyber Neon HUD Console */}
          <ArcadeHud />

          {/* Quick Control Ribbon */}
          <ControlRibbon />

          {/* Main Arcade Centerpiece */}
          <GridArena />

          {/* Outrun Synthesizer Telemetry Log Bar */}
          <RadioLogBar onShowSummary={() => setShowGameOverModal(true)} />
        </section>
      </main>

      {/* Retro Synth Footer */}
      <footer className="w-full bg-[#070114]/95 border-t border-fuchsia-900/60 py-3 relative z-40">
        <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs font-['Righteous']">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-fuchsia-400">
            <span>CABINET: OUTRUN LASER 1984</span>
            <span className="text-cyan-400">NITRO CORE: 104.2 FM</span>
            <span className="text-yellow-400">PALM DRIVE SECTOR 7</span>
          </div>
          <div className="text-pink-300/80 text-center tracking-widest">
            © 1984 SYNTH-RUNNER CORP. LICENSED TO LASER ARCADE COIN-OP.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 tracking-widest">FM BROADCAST: STEREO HIGH-FI</span>
          </div>
        </div>
      </footer>

      {/* Run Summary / Game Over Modal */}
      <GameOverModal
        open={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
      />

      {/* Settings / Operator Manual Modal */}
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default App;
