import React from 'react';
import { usePetEngine } from './hooks/usePetEngine';
import { usePlaydateWs } from './hooks/usePlaydateWs';
import { TerrariumCanvas } from './components/TerrariumCanvas';
import { TopBar } from './components/TopBar';
import { VitalsDock } from './components/VitalsDock';
import { BottomCareTray } from './components/BottomCareTray';
import { FeedingDrawer } from './components/FeedingDrawer';
import { EvolutionTreeDialog } from './components/EvolutionTreeDialog';
import { PlaydateLobbyModal } from './components/PlaydateLobbyModal';
import { PetPassportModal } from './components/PetPassportModal';
import { IncubatorModal } from './components/IncubatorModal';
import { OfflineSyncToast } from './components/OfflineSyncToast';
import { INITIAL_FOODS } from './lib/speciesData';

export const App: React.FC = () => {
  const {
    pet,
    inventory,
    coins,
    activeTool,
    setActiveTool,
    selectedFoodId,
    setSelectedFoodId,
    dayNightPhase,
    offlineReport,
    setOfflineReport,
    loading,
    dispatchAction,
    triggerEvolution,
    renamePet,
    evolutionCandidate,
    isEvolutionOpen,
    setIsEvolutionOpen,
    isPlaydateOpen,
    setIsPlaydateOpen,
    isPassportOpen,
    setIsPassportOpen,
    isFeedingDrawerOpen,
    setIsFeedingDrawerOpen,
    isIncubatorOpen,
    setIsIncubatorOpen,
  } = usePetEngine();

  // Playdate WebSocket hook
  const {
    isConnected: isWsConnected,
    roomId: wsRoomId,
    peers,
    newSeedAlert,
    setNewSeedAlert,
    connectToRoom,
    disconnect: disconnectWs,
    sendMove,
    sendEmote,
    sendBallKick,
    requestPollenSwap,
  } = usePlaydateWs(pet?.id, pet?.name, pet?.speciesId);

  // Selected food object
  const selectedFood =
    inventory.find((f) => f.id === selectedFoodId) ||
    INITIAL_FOODS.find((f) => f.id === selectedFoodId) ||
    null;

  if (loading || !pet) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="text-5xl animate-bounce">🥚</div>
        <h2 className="text-lg font-bold tracking-tight">Awakening AethelPet Sanctuary...</h2>
        <p className="text-xs text-slate-400">Synchronizing monotonic circadian metabolism</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 1. Top HUD Bar */}
      <TopBar
        pet={pet}
        coins={coins}
        dayNightPhase={dayNightPhase}
        onRename={renamePet}
        onOpenEvolutionTree={() => setIsEvolutionOpen(true)}
      />

      {/* 2. Floating Vitals Telemetry Dock */}
      <VitalsDock pet={pet} />

      {/* 3. Offline Reconciliation Toast */}
      {offlineReport && (
        <OfflineSyncToast
          report={offlineReport}
          onDismiss={() => setOfflineReport(null)}
        />
      )}

      {/* 4. Living Terrarium Canvas Viewport (Decoupled Render & Physics Loops) */}
      <main className="absolute inset-0 w-full h-full">
        <TerrariumCanvas
          pet={pet}
          activeTool={activeTool}
          selectedFood={selectedFood}
          dayNightPhase={dayNightPhase}
          peers={peers}
          onFeedBite={(foodId, biteNum) => {
            if (biteNum >= 3) {
              dispatchAction('FEED', foodId);
            }
          }}
          onCleanWaste={() => dispatchAction('CLEAN')}
          onPetTouch={() => dispatchAction('PET')}
          onBallKick={(bx, by, vx, vy) => {
            dispatchAction('PLAY');
            sendBallKick(bx, by, vx, vy);
          }}
          onPeerUpdate={(x, y, mood) => {
            sendMove(x, y, mood);
          }}
        />
      </main>

      {/* 5. Docked Bottom Care Tool Shelf */}
      <BottomCareTray
        pet={pet}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenFeedingDrawer={() => setIsFeedingDrawerOpen(true)}
        onPlayBall={() => dispatchAction('PLAY')}
        onToggleSleep={() => dispatchAction('SLEEP_TOGGLE')}
        onUseMedicine={() => dispatchAction('MEDICINE')}
        onOpenEvolutionTree={() => setIsEvolutionOpen(true)}
        onOpenPlaydateLobby={() => setIsPlaydateOpen(true)}
        onOpenPassport={() => setIsPassportOpen(true)}
      />

      {/* 6. Pantry & Feeding Drawer */}
      <FeedingDrawer
        isOpen={isFeedingDrawerOpen}
        onClose={() => setIsFeedingDrawerOpen(false)}
        inventory={inventory}
        selectedFoodId={selectedFoodId}
        onSelectFood={(food) => {
          setSelectedFoodId(food.id);
          setActiveTool('FOOD_DROPPER');
          setIsFeedingDrawerOpen(false);
        }}
        onFeedItem={(foodId) => dispatchAction('FEED', foodId)}
      />

      {/* 7. Epigenetic Branching Evolution Matrix Dialog */}
      <EvolutionTreeDialog
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        pet={pet}
        evolutionCandidate={evolutionCandidate}
        onTriggerEvolve={triggerEvolution}
      />

      {/* 8. Playdate Park Multiplayer Lobby Modal */}
      <PlaydateLobbyModal
        isOpen={isPlaydateOpen}
        onClose={() => setIsPlaydateOpen(false)}
        pet={pet}
        isConnected={isWsConnected}
        roomId={wsRoomId}
        peers={peers}
        newSeedAlert={newSeedAlert}
        onConnectRoom={connectToRoom}
        onDisconnectRoom={disconnectWs}
        onSendEmote={sendEmote}
        onRequestPollenSwap={requestPollenSwap}
        onDismissSeedAlert={() => setNewSeedAlert(null)}
      />

      {/* 9. Holographic Pet Passport & Ledger Modal */}
      <PetPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        pet={pet}
      />

      {/* 10. Nursery Incubator Modal for Egg Hatching */}
      <IncubatorModal
        isOpen={isIncubatorOpen}
        onClose={() => setIsIncubatorOpen(false)}
        pet={pet}
        onHatch={() => dispatchAction('HATCH')}
      />
    </div>
  );
};

export default App;
