import { useState, useMemo, useRef } from 'react';
import { useSaveLoadManager } from './hooks/useSaveLoadManager';
import { TacticalGameViewport } from './components/game/TacticalGameViewport';
import { VaultHeader } from './components/vault/VaultHeader';
import { SlotFilterTabs } from './components/vault/SlotFilterTabs';
import type { FilterCategory } from './components/vault/SlotFilterTabs';
import { SlotCard } from './components/vault/SlotCard';
import { SlotInspectorDrawer } from './components/vault/SlotInspectorDrawer';
import { ConflictDialog } from './components/vault/ConflictDialog';
import { ExportImportModal } from './components/vault/ExportImportModal';
import { DisasterRecoveryBanner } from './components/vault/DisasterRecoveryBanner';
import { sfx } from './sounds/sfx';
import { Eye, Layers, Sparkles } from 'lucide-react';

export function App() {
  const {
    slots,
    activeSlotId,
    status,
    lastError,
    storageUsage,
    cloudSyncStatus,
    conflictPayload,
    activeGamePayload,
    isAutoSaveEnabled,
    toggleAutoSave,
    quickSave,
    quickLoad,
    saveGame,
    loadGame,
    deleteSave,
    toggleLock,
    forkTimeline,
    syncWithCloud,
    resolveConflict,
    triggerDisasterRollback,
    simulateSaveCorruption,
    exportSaveCapsuleString,
    importSaveCapsuleString,
    updateActiveGamePlayer
  } = useSaveLoadManager();

  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectSlotId, setInspectSlotId] = useState<string | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [showGameSimulator, setShowGameSimulator] = useState(true);

  // Live game viewport canvas reference for screenshot captures
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter slots
  const filteredSlots = useMemo(() => {
    return Object.values(slots).filter((slot) => {
      // Category filter
      if (category === 'manual' && slot.saveType !== 'manual') return false;
      if (category === 'auto' && slot.saveType !== 'auto') return false;
      if (category === 'locked' && !slot.isLocked && slot.saveType !== 'milestone') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = slot.title.toLowerCase().includes(q);
        const matchesChapter = slot.summary.currentChapter.toLowerCase().includes(q);
        const matchesLoc = slot.summary.currentLocation.toLowerCase().includes(q);
        const matchesChar = slot.summary.characterName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChapter && !matchesLoc && !matchesChar) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [slots, category, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const all = Object.values(slots);
    return {
      all: all.length,
      manual: all.filter((s) => s.saveType === 'manual').length,
      auto: all.filter((s) => s.saveType === 'auto').length,
      locked: all.filter((s) => s.isLocked || s.saveType === 'milestone').length
    };
  }, [slots]);

  // Handlers
  const handleQuickSave = () => {
    quickSave(canvasRef.current);
  };

  const handleManualSave = () => {
    saveGame(undefined, 'manual', undefined, canvasRef.current);
  };

  const handleOverwrite = (slotId: string) => {
    saveGame(slotId, slots[slotId]?.saveType || 'manual', undefined, canvasRef.current);
  };

  const handleForkTimeline = async (slotId: string) => {
    await forkTimeline(slotId);
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-[#F8FAFC] flex flex-col items-center selection:bg-cyan-500/30 font-sans pb-16">
      {/* Background Decorative Ambient Neon Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Max 1280px Centered Station */}
      <div className="w-full max-w-[1280px] px-4 sm:px-6 pt-6 space-y-6 relative z-10">
        {/* Disaster Recovery Urgent Banner (If Corrupted) */}
        <DisasterRecoveryBanner
          isCorrupted={status === 'CORRUPTED'}
          errorMessage={lastError}
          slots={slots}
          onTriggerRollback={triggerDisasterRollback}
          isOpenModal={isDisasterModalOpen}
          onCloseModal={() => setIsDisasterModalOpen(false)}
        />

        {/* Top Archive Header Ribbon */}
        <VaultHeader
          activeSlotId={activeSlotId}
          activeSlotMetadata={activeSlotId ? slots[activeSlotId] : null}
          storageUsage={storageUsage}
          cloudSyncStatus={cloudSyncStatus}
          onSyncNow={syncWithCloud}
          onOpenExportImport={() => {
            sfx.playClick();
            setIsExportImportOpen(true);
          }}
          onQuickSave={handleQuickSave}
          onQuickLoad={quickLoad}
          onToggleDisasterModal={() => {
            sfx.playClick();
            setIsDisasterModalOpen(true);
          }}
        />

        {/* Interactive Game Viewport Toggle Strip */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
              ACTIVE RUNTIME SIMULATOR &amp; DIORAMA GENERATOR
            </span>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowGameSimulator(prev => !prev);
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
          >
            <Eye size={13} />
            <span>{showGameSimulator ? 'COLLAPSE SIMULATOR' : 'EXPAND SIMULATOR'}</span>
          </button>
        </div>

        {/* Live Interactive Game Viewport */}
        {showGameSimulator && (
          <div className="animate-in fade-in duration-300">
            <TacticalGameViewport
              activeSavePayload={activeGamePayload}
              onQuickSave={handleQuickSave}
              onManualSave={handleManualSave}
              onQuickLoad={quickLoad}
              onUpdatePlayer={updateActiveGamePlayer}
              canvasRef={canvasRef}
            />
          </div>
        )}

        {/* Filter & Organization Ribbon */}
        <SlotFilterTabs
          currentCategory={category}
          onSelectCategory={setCategory}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAutoSaveEnabled={isAutoSaveEnabled}
          onToggleAutoSave={toggleAutoSave}
          onNewManualSave={handleManualSave}
        />

        {/* Status Notification Alert (if Saving / Loading / Syncing) */}
        {status !== 'IDLE' && status !== 'CORRUPTED' && (
          <div className="px-4 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs font-mono text-cyan-300 animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="animate-spin" />
              <span>VAULT ENGINE STATUS: {status}... COMMITTING QUANTUM STATE</span>
            </div>
            <span className="text-[10px] text-slate-400">NON-BLOCKING WORKER ACTIVE</span>
          </div>
        )}

        {/* Slot Matrix Grid (3-to-4 Columns) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider text-white">
                MEMORY CARTRIDGES ({filteredSlots.length})
              </span>
            </div>
            <span className="text-slate-500">
              DUAL-VAULT PERSISTENCE • INDEXEDDB + CLOUD MESH
            </span>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="w-full py-16 rounded-xl border border-dashed border-slate-800 bg-[#0D121F]/40 flex flex-col items-center justify-center text-slate-500 font-mono text-sm space-y-2">
              <Layers size={36} className="text-slate-700 mb-1" />
              <div>No memory cartridges match filter query.</div>
              <button
                onClick={handleManualSave}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                + Commit new checkpoint save now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredSlots.map((slot) => (
                <SlotCard
                  key={slot.slotId}
                  metadata={slot}
                  isActive={slot.slotId === activeSlotId}
                  onSelectInspect={(id) => {
                    setInspectSlotId(id);
                  }}
                  onLoad={loadGame}
                  onOverwrite={handleOverwrite}
                  onToggleLock={toggleLock}
                  onForkTimeline={handleForkTimeline}
                  onDelete={deleteSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Slot Inspector Drawer (440px Sheet) */}
      <SlotInspectorDrawer
        slotId={inspectSlotId}
        isOpen={Boolean(inspectSlotId)}
        onClose={() => setInspectSlotId(null)}
        onExportCapsule={exportSaveCapsuleString}
        onSimulateCorruption={simulateSaveCorruption}
        onLoadSlot={loadGame}
      />

      {/* Timeline Conflict Resolution Dialog */}
      <ConflictDialog
        isOpen={Boolean(conflictPayload)}
        conflict={conflictPayload}
        onResolve={resolveConflict}
        onClose={() => {}}
      />

      {/* Export / Import Save Capsule & QR Portability Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        activeSlotId={activeSlotId}
        slots={slots}
        onExportCapsuleString={exportSaveCapsuleString}
        onImportCapsuleString={importSaveCapsuleString}
      />
    </div>
  );
}

export default App;
