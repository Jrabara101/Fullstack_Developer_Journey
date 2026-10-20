import React, { useState, useEffect } from 'react';
import { useArenaEngine } from './game/useArenaEngine';
import { getTodaySeedString } from './game/prng';
import { ColosseumStage } from './components/ColosseumStage';
import { TopBossBar } from './components/TopBossBar';
import { GladiatorDock } from './components/GladiatorDock';
import { AbilityTray } from './components/AbilityTray';
import { SettingsDrawer } from './components/SettingsDrawer';
import { PostMatchModal } from './components/PostMatchModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LobbyScreen } from './components/LobbyScreen';
import { TouchControls } from './components/TouchControls';
import type { FighterClass } from './types';

export function App() {
  const [seed, setSeed] = useState<string>(getTodaySeedString());
  const [selectedClass, setSelectedClass] = useState<FighterClass>('WARRIOR');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Fetch daily seed from backend server on mount
  useEffect(() => {
    fetch('/api/arena/daily')
      .then(res => res.json())
      .then(data => {
        if (data.seed) {
          setSeed(data.seed);
        }
      })
      .catch(() => {
        // Uses fallback seed calculated locally
      });
  }, []);

  const {
    canvasRef,
    engine,
    gameState,
    selectClass,
    startBattle,
    triggerAbility,
    setTouchMove,
    restartGauntlet
  } = useArenaEngine(seed, selectedClass);

  const handleClassChange = (c: FighterClass) => {
    setSelectedClass(c);
    selectClass(c);
  };

  const isLobby = gameState.status === 'LOBBY';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080D] font-outfit select-none">
      {/* 1. Main Colosseum Canvas Stage */}
      <ColosseumStage
        canvasRef={canvasRef}
        gameState={gameState}
      />

      {/* 2. Top Navigation & Boss Bar HUD */}
      {!isLobby && (
        <TopBossBar
          gameState={gameState}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 3. Bottom Gladiator Command Dock */}
      {!isLobby && (
        <footer className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
          {/* Left: Player Vitals Cluster */}
          <div className="pointer-events-auto">
            <GladiatorDock player={gameState.player} />
          </div>

          {/* Center / Right: 6-Slot Ability Tray */}
          <div className="pointer-events-auto">
            <AbilityTray
              abilities={gameState.player.abilities}
              playerStamina={gameState.player.stamina}
              playerMana={gameState.player.mana}
              onTriggerAbility={triggerAbility}
            />
          </div>
        </footer>
      )}

      {/* 4. Touch Controls for Mobile */}
      {!isLobby && (
        <TouchControls
          onMove={setTouchMove}
          onTriggerAbility={triggerAbility}
        />
      )}

      {/* 5. Lobby Onboarding Screen */}
      {isLobby && (
        <LobbyScreen
          seed={seed}
          selectedClass={selectedClass}
          onSelectClass={handleClassChange}
          onStartBattle={startBattle}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 6. Post-Battle Victory / Defeat Modal */}
      {(gameState.status === 'VICTORY' || gameState.status === 'GAME_OVER') && (
        <PostMatchModal
          gameState={gameState}
          telemetry={engine.telemetry}
          durationMs={engine.totalMatchDurationMs}
          onRestart={restartGauntlet}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* 7. Daily Arena Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentSeed={seed}
      />

      {/* 8. Settings Drawer Sheet */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cameraShake={engine.cameraShakeMultiplier}
        onCameraShakeChange={(val) => {
          engine.cameraShakeMultiplier = val;
        }}
        isAimAssisting={engine.isAimAssisting}
        onToggleAimAssist={() => {
          engine.isAimAssisting = !engine.isAimAssisting;
        }}
      />
    </div>
  );
}

export default App;
