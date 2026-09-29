import React, { useState, useEffect, useRef } from 'react';
import { useCardGameSocket } from './hooks/useCardGameSocket.js';
import { useSoundEffects } from './hooks/useSoundEffects.js';
import { TopBar } from './components/navigation/TopBar.js';
import { LobbyView } from './components/lobby/LobbyView.js';
import { FeltTableArena } from './components/table/FeltTableArena.js';
import { ActionDock } from './components/hand/ActionDock.js';
import { WageringDrawer } from './components/wagering/WageringDrawer.js';
import { BluffChallengeModal } from './components/modals/BluffChallengeModal.js';
import { RoundPayoutModal } from './components/modals/RoundPayoutModal.js';
import { PocketControllerView } from './components/controller/PocketControllerView.js';
import { TableEmotesOverlay } from './components/emotes/TableEmotesOverlay.js';
import { AlertToast } from './components/ui/AlertToast.js';

export function App() {
  const {
    gameState,
    alerts,
    activeEmotes,
    errorMessage,
    joinRoom,
    startGame,
    playCard,
    drawCard,
    betAnte,
    callBluff,
    concedeBluff,
    passTurn,
    nextRound,
    addBot,
    sendEmote,
    leaveRoom
  } = useCardGameSocket();

  const {
    isMuted,
    toggleMute,
    playCardFlick,
    playChipClink,
    playTickingClock,
    playBluffSiren,
    playVictoryFanfare,
    playSlam
  } = useSoundEffects();

  // Dual Viewport Mode: 'table' (Desktop 16:9 Arena) vs 'controller' (Pocket Mobile Hand)
  const [viewportMode, setViewportMode] = useState<'table' | 'controller'>('table');
  const [isWagerOpen, setIsWagerOpen] = useState(false);

  // Auto-detect mode from URL query or screen dimensions on first load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'controller' || window.innerWidth < 768) {
      setViewportMode('controller');
    }

    const codeParam = urlParams.get('code');
    if (codeParam && (!gameState || gameState.phase === 'LOBBY')) {
      const defaultUser = `Guest_${Math.floor(100 + Math.random() * 900)}`;
      joinRoom(defaultUser, codeParam);
    }
  }, []);

  // Time-crunch sensory juice: Accelerating ticking audio under 5 seconds
  const lastTickTimeRef = useRef<number>(0);
  useEffect(() => {
    if (gameState?.phase === 'PLAYER_TURN' && gameState.turnTimeRemainingMs > 0 && gameState.turnTimeRemainingMs < 5000) {
      const now = Date.now();
      if (now - lastTickTimeRef.current >= 800) {
        lastTickTimeRef.current = now;
        playTickingClock();
      }
    }
  }, [gameState?.turnTimeRemainingMs, gameState?.phase, playTickingClock]);

  // Audio trigger for emote slam
  useEffect(() => {
    if (activeEmotes.length > 0) {
      const latest = activeEmotes[activeEmotes.length - 1];
      if (latest.emote === 'slam') playSlam();
      else if (latest.emote === 'chips') playChipClink();
    }
  }, [activeEmotes, playSlam, playChipClink]);

  const handlePlayCardWithSound = (cardId: string, declaredColor?: any, isBluff?: boolean, meldCardIds?: string[]) => {
    playCardFlick();
    playCard(cardId, declaredColor, isBluff, meldCardIds);
  };

  const handleBetAnteWithSound = (amount: number) => {
    playChipClink();
    betAnte(amount);
  };

  const localPlayer = gameState?.players.find(p => p.id === gameState?.myPlayerId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <TopBar
        gameState={gameState}
        viewportMode={viewportMode}
        onToggleViewportMode={() => setViewportMode(prev => prev === 'table' ? 'controller' : 'table')}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onLeaveRoom={leaveRoom}
      />

      {/* Floating System Alerts & Error Toasts */}
      <AlertToast alerts={alerts} errorMessage={errorMessage} />

      {/* Dynamic Animated Table Emotes */}
      <TableEmotesOverlay emotes={activeEmotes} />

      {/* Main Game Surface */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 md:p-6 max-w-7xl mx-auto">
        {!gameState || gameState.phase === 'LOBBY' ? (
          <LobbyView
            gameState={gameState}
            onJoinRoom={joinRoom}
            onStartGame={startGame}
            onAddBot={addBot}
          />
        ) : viewportMode === 'controller' ? (
          /* Dual-Viewport: Pocket Controller Mode */
          <PocketControllerView
            gameState={gameState}
            onPlayCard={handlePlayCardWithSound}
            onDrawCard={drawCard}
            onPassTurn={passTurn}
            onOpenWager={() => setIsWagerOpen(true)}
            onSendEmote={sendEmote}
          />
        ) : (
          /* Dual-Viewport: Table Broadcast Mode */
          <div className="w-full flex flex-col items-center justify-between gap-4">
            <FeltTableArena
              gameState={gameState}
              onDrawCard={drawCard}
            />

            <ActionDock
              gameState={gameState}
              onPlayCard={handlePlayCardWithSound}
              onDrawCard={drawCard}
              onPassTurn={passTurn}
              onOpenWager={() => setIsWagerOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Wagering Drawer Sheet */}
      {gameState && localPlayer && (
        <WageringDrawer
          open={isWagerOpen}
          onOpenChange={setIsWagerOpen}
          player={localPlayer}
          currentAnte={gameState.currentAnte}
          potChips={gameState.potChips}
          onBetAnte={handleBetAnteWithSound}
          onFold={passTurn}
        />
      )}

      {/* Bluff Challenge Modal (5-Second Screen-wide Alert) */}
      {gameState && (
        <BluffChallengeModal
          gameState={gameState}
          onCallBluff={callBluff}
          onConcedeBluff={concedeBluff}
          playSiren={playBluffSiren}
        />
      )}

      {/* Round Payout & Victory Showdown Modal */}
      {gameState && (
        <RoundPayoutModal
          gameState={gameState}
          onNextRound={nextRound}
          playFanfare={playVictoryFanfare}
        />
      )}
    </div>
  );
}

export default App;
