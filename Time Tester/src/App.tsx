import React, { useState, useEffect, useCallback } from 'react';
import { ReflexMode, ReactionRecord } from './types/reaction';
import { usePrecisionTimer } from './hooks/usePrecisionTimer';
import { soundManager } from './utils/audio';
import { loadSavedSessions } from './utils/analytics';
import { ReflexCanvas } from './components/ReflexCanvas';
import { TelemetryHeader } from './components/TelemetryHeader';
import { TelemetryDock } from './components/TelemetryDock';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { BioRhythmJournal } from './components/BioRhythmJournal';
import { ReflexPassportModal } from './components/ReflexPassportModal';
import { ModesDialog } from './components/ModesDialog';
import { Swords, X } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<ReflexMode>('visual');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessions, setSessions] = useState<ReactionRecord[]>([]);
  const [lastCompletedSession, setLastCompletedSession] = useState<ReactionRecord | null>(null);

  // Modal Dialog States
  const [journalOpen, setJournalOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Peer Challenge Hash Detection State
  const [peerChallenge, setPeerChallenge] = useState<{
    target: number;
    mode: string;
    seed: string;
  } | null>(null);

  // Load sessions and check challenge hash on mount
  useEffect(() => {
    const loaded = loadSavedSessions();
    setSessions(loaded);

    // Parse URL Hash (e.g. #mode=visual&target=185&seed=SYN-...)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const targetParam = params.get('target');
      const modeParam = params.get('mode') as ReflexMode | null;
      const seedParam = params.get('seed');

      if (targetParam) {
        setPeerChallenge({
          target: parseInt(targetParam, 10),
          mode: modeParam || 'visual',
          seed: seedParam || 'VERIFIED_SEED',
        });
        if (modeParam && ['visual', 'audio', 'peripheral'].includes(modeParam)) {
          setMode(modeParam);
        }
      }
    }
  }, []);

  const handleSessionComplete = useCallback((record: ReactionRecord) => {
    setLastCompletedSession(record);
    setSessions((prev) => [record, ...prev]);
    setSummaryOpen(true);
  }, []);

  // Precision Timer Hook with deterministic FSM
  const {
    phase,
    currentRound,
    totalRounds,
    currentRunMs,
    history,
    falseStarts,
    escalatingPenaltyDelay,
    peripheralTarget,
    clickCoords,
    resetSession,
    proceedToNextRound,
  } = usePrecisionTimer({
    totalRounds: 5,
    mode,
    onSessionComplete: handleSessionComplete,
  });

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.setEnabled(nextState);
    if (nextState) {
      soundManager.playArm();
    }
  };

  const handleSelectMode = (newMode: ReflexMode) => {
    setMode(newMode);
    resetSession();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-void text-white flex flex-col justify-between font-sans">
      {/* Reticle & Scanline Ambient Layer */}
      <div className="absolute inset-0 hud-grid pointer-events-none z-0" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-40 z-0" />

      {/* Telemetry Corner Reticle Brackets */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="border-l-2 border-t-2 border-cyan-500/40 w-6 h-6" />
          <div className="border-r-2 border-t-2 border-cyan-500/40 w-6 h-6" />
        </div>
        <div className="flex justify-between items-end">
          <div className="border-l-2 border-b-2 border-cyan-500/40 w-6 h-6" />
          <div className="border-r-2 border-b-2 border-cyan-500/40 w-6 h-6" />
        </div>
      </div>

      {/* Peer Challenge Banner (if challenge URL loaded) */}
      {peerChallenge && (
        <div className="relative z-40 mx-auto mt-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md animate-in slide-in-from-top-3">
          <Swords className="w-4 h-4 text-cyan-400" />
          <span>
            PEER CHALLENGE ACTIVE: TARGET TO BEAT{' '}
            <strong className="text-white font-bold">{peerChallenge.target}ms</strong> ({peerChallenge.mode.toUpperCase()})
          </span>
          <button
            onClick={() => setPeerChallenge(null)}
            className="hover:text-white cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Floating Telemetry Header */}
      <TelemetryHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        mode={mode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onResetSession={resetSession}
        onOpenModes={() => setModesOpen(true)}
      />

      {/* Full-Bleed Viewport Reflex Canvas */}
      <ReflexCanvas
        phase={phase}
        mode={mode}
        currentRunMs={currentRunMs}
        currentRound={currentRound}
        totalRounds={totalRounds}
        escalatingPenaltyDelay={escalatingPenaltyDelay}
        peripheralTarget={peripheralTarget}
        clickCoords={clickCoords}
        onProceedNext={proceedToNextRound}
      />

      {/* Bottom Telemetry Dock */}
      <TelemetryDock
        history={history}
        totalRounds={totalRounds}
        currentRound={currentRound}
        onOpenJournal={() => setJournalOpen(true)}
        onOpenPassport={() => setPassportOpen(true)}
      />

      {/* Final Session Scorecard Modal */}
      <ReportSummaryModal
        open={summaryOpen}
        history={history}
        falseStarts={falseStarts}
        mode={mode}
        onRestart={resetSession}
        onOpenPassport={() => setPassportOpen(true)}
        onClose={() => setSummaryOpen(false)}
      />

      {/* Shareable Reflex Passport Modal */}
      <ReflexPassportModal
        open={passportOpen}
        sessionRecord={lastCompletedSession}
        currentHistory={history}
        mode={mode}
        onClose={() => setPassportOpen(false)}
      />

      {/* Bio-Rhythm & Fatigue Journal Modal */}
      <BioRhythmJournal
        open={journalOpen}
        sessions={sessions}
        onSessionsUpdated={setSessions}
        onClose={() => setJournalOpen(false)}
      />

      {/* Sensory Reflex Mode Selector Dialog */}
      <ModesDialog
        open={modesOpen}
        activeMode={mode}
        onSelectMode={handleSelectMode}
        onClose={() => setModesOpen(false)}
      />
    </div>
  );
}
export default App;
