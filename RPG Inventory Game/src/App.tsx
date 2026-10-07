import React, { useState, useEffect } from 'react';
import { useInventoryEngine } from './hooks/useInventoryEngine';
import { Header } from './components/Header';
import { CharacterSheetPaperDoll } from './components/CharacterSheetPaperDoll';
import { SpatialInventoryBag } from './components/SpatialInventoryBag';
import { PartyInspectRoster } from './components/PartyInspectRoster';
import { QuestTrackerPodium } from './components/QuestTrackerPodium';
import { ItemTooltip } from './components/ItemTooltip';
import { InspectModal } from './components/InspectModal';
import { LiveTradeDialog } from './components/LiveTradeDialog';
import { LootRollModal } from './components/LootRollModal';
import { GuideModal } from './components/GuideModal';
import { ItemIcon } from './components/ItemIcon';
import { ITEM_CATALOG } from './data/mockData';
import { ItemCategory, ItemEntity } from './types/inventory';
import { getItemDimensions } from './engine/spatialGrid';
import { Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export function App() {
  const {
    roomId,
    setRoomId,
    isConnected,
    playerSheet,
    computedStats,
    roomState,
    draggedItem,
    hoveredCell,
    setHoveredCell,
    hoveredEquipSlot,
    setHoveredEquipSlot,
    hoveredItemForTooltip,
    setHoveredItemForTooltip,
    inspectTarget,
    setInspectTarget,
    notification,
    handleStartDrag,
    handleRotateDragged,
    handleCancelDrag,
    handleDropOnGrid,
    handleEquipItem,
    handleUnequipItem,
    handleDropItem,
    handleQuickSort,
    handleAddItemToBag,
    handleInitiateTrade,
    handleUpdateTradeOffer,
    handleToggleTradeLock,
    handleAcceptTrade,
    handleCancelTrade,
    handleTriggerQuestStep,
    handleSubmitLootRoll,
    handleDismissLootDrop,
    handleSpawnBotCompanion,
  } = useInventoryEngine('VALK');

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Track global mouse position for tooltip and drag ghost
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // If releasing mouse outside valid drop areas, cancel drag
      if (draggedItem) {
        setTimeout(() => {
          handleCancelDrag();
        }, 50);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedItem, handleCancelDrag]);

  // Demo item adder
  const handleAddItemDemo = (category: ItemCategory) => {
    const candidates = ITEM_CATALOG.filter(i => i.category === category);
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      handleAddItemToBag(chosen);
    }
  };

  const handleHoverItem = (item: ItemEntity | null, e?: React.MouseEvent) => {
    if (item && e) {
      setHoveredItemForTooltip({ item });
    } else {
      setHoveredItemForTooltip(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col font-['Outfit',sans-serif] selection:bg-indigo-500/30">
      {/* Top Application Header */}
      <Header
        roomId={roomId}
        onChangeRoomId={setRoomId}
        roomMode={roomState.mode}
        isConnected={isConnected}
        partyCount={roomState.partyMembers.length}
        onOpenGuide={() => setShowGuide(true)}
      />

      {/* Floating System Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-mono font-medium ${
            notification.level === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : notification.level === 'warning'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              : notification.level === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
          }`}>
            {notification.level === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : notification.level === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : notification.level === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-indigo-400" />
            )}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Main Game Workbench (3-Pane Master Layout) */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto flex flex-col xl:flex-row items-start justify-center gap-6">
        {/* LEFT PANE: Character Sheet & Paper Doll Rig */}
        <section className="w-full xl:w-auto flex justify-center">
          <CharacterSheetPaperDoll
            playerSheet={playerSheet}
            stats={computedStats}
            draggedItem={draggedItem}
            hoveredEquipSlot={hoveredEquipSlot}
            onStartDrag={(item, origin, x, y, slot) => handleStartDrag(item, origin, x, y, slot)}
            onHoverSlot={setHoveredEquipSlot}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onHoverItemForTooltip={handleHoverItem}
          />
        </section>

        {/* CENTER PANE: Spatial Tetris-Style Bag Inventory Grid */}
        <section className="w-full xl:w-auto flex-1 flex justify-center">
          <SpatialInventoryBag
            playerSheet={playerSheet}
            draggedItem={draggedItem}
            hoveredCell={hoveredCell}
            onHoverCell={setHoveredCell}
            onStartDrag={(item, origin, x, y) => handleStartDrag(item, origin, x, y)}
            onDropOnGrid={handleDropOnGrid}
            onEquipItem={handleEquipItem}
            onDropItem={handleDropItem}
            onQuickSort={handleQuickSort}
            onHoverItemForTooltip={handleHoverItem}
            onRotateDragged={handleRotateDragged}
            onAddItemDemo={handleAddItemDemo}
          />
        </section>

        {/* RIGHT PANE: Party Vanguard Roster & Quest / Loot Trackers */}
        <section className="w-full xl:w-80 flex flex-col gap-6 items-center">
          <PartyInspectRoster
            partyMembers={roomState.partyMembers}
            localPlayerId={playerSheet.playerId}
            onInspect={setInspectTarget}
            onInitiateTrade={handleInitiateTrade}
            onSpawnBot={handleSpawnBotCompanion}
          />

          <QuestTrackerPodium
            quest={roomState.activeQuest}
            onAdvanceQuestStep={handleTriggerQuestStep}
            onHoverItemForTooltip={handleHoverItem}
          />
        </section>
      </main>

      {/* Dragging Item Floating Ghost */}
      {draggedItem && (
        <div
          className="fixed pointer-events-none z-50 select-none opacity-90 transition-transform duration-75"
          style={{
            left: `${mousePos.x - 24}px`,
            top: `${mousePos.y - 24}px`,
          }}
        >
          {(() => {
            const { width, height } = getItemDimensions(draggedItem.item, draggedItem.item.isRotated);
            return (
              <div 
                className="bg-indigo-950/80 border-2 border-indigo-400 rounded-xl p-2 shadow-2xl flex flex-col items-center justify-center backdrop-blur-sm"
                style={{
                  width: `${width * 54}px`,
                  height: `${height * 54}px`,
                }}
              >
                <ItemIcon 
                  iconType={draggedItem.item.iconType} 
                  rarity={draggedItem.item.rarity} 
                  className="w-10 h-10 animate-pulse" 
                />
                <span className="text-[10px] font-mono text-white mt-1 font-bold">
                  {draggedItem.item.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono text-amber-300">
                  [R] Rotate
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Diablo-Style Hovered Item Tooltip */}
      {hoveredItemForTooltip && !draggedItem && (
        <ItemTooltip
          item={hoveredItemForTooltip.item}
          playerSheet={playerSheet}
          position={mousePos}
        />
      )}

      {/* Live Read-Only Party Inspection Modal */}
      {inspectTarget && (
        <InspectModal
          member={inspectTarget}
          onClose={() => setInspectTarget(null)}
          onHoverItemForTooltip={handleHoverItem}
        />
      )}

      {/* Synchronized 2-Player Trade Chamber */}
      {roomState.activeTrade && (
        <LiveTradeDialog
          trade={roomState.activeTrade}
          localPlayer={playerSheet}
          onUpdateOffer={handleUpdateTradeOffer}
          onToggleLock={handleToggleTradeLock}
          onAcceptTrade={handleAcceptTrade}
          onCancelTrade={handleCancelTrade}
          onHoverItemForTooltip={handleHoverItem}
        />
      )}

      {/* Need / Greed Loot Roll Podium Overlay */}
      {roomState.activeLootDrop && (
        <LootRollModal
          drop={roomState.activeLootDrop}
          localPlayerId={playerSheet.playerId}
          onSubmitRoll={handleSubmitLootRoll}
          onHoverItemForTooltip={handleHoverItem}
          onClose={handleDismissLootDrop}
        />
      )}

      {/* Tactical Controls & Rules Guide Modal */}
      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}

export default App;
