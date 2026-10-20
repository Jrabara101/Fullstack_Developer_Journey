import React, { useState, useEffect, useRef } from 'react';
import { useReplayEngine } from './engine/useReplayEngine';
import { CyberArenaGame } from './game/CyberArenaGame';
import { TopTelemetryBar } from './components/TopTelemetryBar';
import { TimelineScrubber } from './components/TimelineScrubber';
import { TransportDock } from './components/TransportDock';
import { EventLogSheet } from './components/EventLogSheet';
import { ClipExportDialog } from './components/ClipExportDialog';
import { VerificationModal } from './components/VerificationModal';
import { ReplayLibraryModal } from './components/ReplayLibraryModal';
import { GhostSelectorModal } from './components/GhostSelectorModal';
import { VerificationReport, ReplayMetadata, ReplayPayload } from './types/replay';

export function App() {
  const engine = useReplayEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal / Drawer visibility states
  const [isEventsSheetOpen, setIsEventsSheetOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isGhostSelectorOpen, setIsGhostSelectorOpen] = useState(false);

  // Load initial demo match from backend on first launch
  useEffect(() => {
    fetch('/api/replays')
      .then(res => res.json())
      .then(async (replays: ReplayMetadata[]) => {
        if (replays && replays.length > 0) {
          // Fetch the first match details
          const firstId = replays[0].replayId;
          const fullRes = await fetch(`/api/replays/${firstId}`);
          if (fullRes.ok) {
            const data = await fullRes.json();
            engine.actions.loadReplayData(data.metadata, data.payload);
          }
        }
      })
      .catch(err => {
        console.warn('Initial replay fetch skipped or backend starting up...', err);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Toggle Live Recording flight mode
  const handleToggleRecording = () => {
    if (engine.state.status === 'RECORDING') {
      engine.actions.stopRecording();
    } else {
      engine.actions.startRecording('Tactical Live Combat Run');
    }
  };

  // Run remote deterministic verification
  const handleRunRemoteVerification = async (): Promise<VerificationReport | null> => {
    const replayId = engine.metadata.replayId;
    try {
      const res = await fetch(`/api/replays/${replayId}/verify`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.report;
      }

      // If replay wasn't in DB yet, run verify-raw
      const rawPayload = {
        keyframes: engine.ringBuffer.getAllKeyframes(),
        inputs: engine.ringBuffer.getAllInputs()
      };
      const rawRes = await fetch('/api/replays/verify-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: engine.metadata, payload: rawPayload })
      });
      if (rawRes.ok) {
        const rawJson = await rawRes.json();
        return rawJson.report;
      }
    } catch (err) {
      console.error('Verification request failed:', err);
    }
    return null;
  };

  // Save replay to backend SQLite database
  const handleUploadToBackend = async (
    metadata: ReplayMetadata,
    compressedPayload: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/replays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, compressedPayload })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to post replay to backend:', err);
      return false;
    }
  };

  // Find active milestone marker if near current tick
  const activeMarker = engine.markers.find(
    m => Math.abs(m.tick - engine.state.currentTick) <= 4
  ) || null;

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex flex-col bg-[#07090E] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* 1. Top Telemetry Header Ribbon */}
      <TopTelemetryBar
        metadata={engine.metadata}
        sessionState={engine.state}
        memoryStats={engine.memoryStats}
        activeMarker={activeMarker}
        onToggleRecording={handleToggleRecording}
        onOpenExportDialog={() => setIsExportDialogOpen(true)}
        onOpenLibraryModal={() => setIsLibraryModalOpen(true)}
        onOpenGhostSelector={() => setIsGhostSelectorOpen(true)}
      />

      {/* 2. Center Viewport Cinema Deck */}
      <main className="relative flex-1 w-full flex items-center justify-center p-3 overflow-hidden bg-[#07090E]">
        <CyberArenaGame
          sessionState={engine.state}
          interpolatedEntities={engine.interpolatedEntities}
          ghostEntities={engine.ghostEntities}
          currentInput={engine.currentInput}
          onRecordTick={engine.actions.recordTick}
          onAddMarker={engine.actions.addMarker}
          canvasRefOut={canvasRef}
        />

        {/* Live Flight Mode Banner overlay */}
        {engine.state.status === 'RECORDING' && (
          <div className="absolute top-6 left-8 bg-rose-950/80 border border-rose-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none shadow-lg animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-bold text-rose-300 tracking-wider">
              STREAMING DIRECTLY TO TYPED RING BUFFER
            </span>
          </div>
        )}

        {/* Quick Keyboard Shortcuts Hint Bar */}
        <div className="absolute bottom-4 right-6 hidden xl:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800/80 pointer-events-none">
          <span>[SPACE] Play/Pause</span>
          <span>·</span>
          <span>[J / L] ±5s</span>
          <span>·</span>
          <span>[, / .] Frame Step</span>
          <span>·</span>
          <span>[G] Ghost</span>
        </div>
      </main>

      {/* 3. Interactive Timeline Scrubber & Highlight Ribbon */}
      <TimelineScrubber
        sessionState={engine.state}
        markers={engine.markers}
        onSeek={engine.actions.seekToTick}
        onStartScrubbing={engine.actions.startScrubbing}
        onScrub={engine.actions.scrubToTick}
        onEndScrubbing={engine.actions.endScrubbing}
        onSetLoopRange={engine.actions.setLoopRange}
        onTogglePlayPause={engine.actions.togglePlayPause}
        onStepForward={engine.actions.stepForward}
        onStepBackward={engine.actions.stepBackward}
        onJumpSeconds={engine.actions.jumpSeconds}
        onToggleGhost={() => engine.actions.toggleGhost()}
      />

      {/* 4. Floating Transport Dock */}
      <TransportDock
        sessionState={engine.state}
        markerCount={engine.markers.length}
        onTogglePlayPause={engine.actions.togglePlayPause}
        onStepForward={engine.actions.stepForward}
        onStepBackward={engine.actions.stepBackward}
        onJumpSeconds={engine.actions.jumpSeconds}
        onSetPlaybackSpeed={engine.actions.setPlaybackSpeed}
        onToggleLooping={engine.actions.toggleLooping}
        onSetLoopRange={engine.actions.setLoopRange}
        onToggleGhost={() => engine.actions.toggleGhost()}
        onOpenEventsSheet={() => setIsEventsSheetOpen(true)}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 5. Modals & Drawers */}
      <EventLogSheet
        isOpen={isEventsSheetOpen}
        onClose={() => setIsEventsSheetOpen(false)}
        markers={engine.markers}
        currentTick={engine.state.currentTick}
        onSeekToTick={(tick) => engine.actions.seekToTick(tick, false)}
      />

      <ClipExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        metadata={engine.metadata}
        totalTicks={engine.state.totalTicks}
        canvasRef={canvasRef}
        onExportSlice={engine.actions.exportReplayPackage}
        onUploadToBackend={handleUploadToBackend}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        metadata={engine.metadata}
        payload={{
          keyframes: engine.ringBuffer.getAllKeyframes(),
          inputs: engine.ringBuffer.getAllInputs()
        }}
        onRunRemoteVerification={handleRunRemoteVerification}
      />

      <ReplayLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        onLoadReplay={(meta, payload) => engine.actions.loadReplayData(meta, payload)}
        onLoadGhost={(meta, payload) => engine.actions.loadGhostReplay(meta, payload)}
      />

      <GhostSelectorModal
        isOpen={isGhostSelectorOpen}
        onClose={() => setIsGhostSelectorOpen(false)}
        activeGhost={engine.state.ghostReplayData}
        onLoadGhost={(meta, payload) => engine.actions.loadGhostReplay(meta, payload)}
        onRemoveGhost={() => engine.actions.toggleGhost(false)}
      />
    </div>
  );
}

export default App;
