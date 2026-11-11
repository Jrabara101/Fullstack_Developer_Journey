import React, { useState, useEffect } from 'react';
import {
  Brain,
  Mail,
  Shield,
  Megaphone,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Flashcard types & services
import { Deck, Flashcard } from './types/flashcards';
import { DEFAULT_DECKS } from './data/defaultDecks';
import { SpacedRepetitionEngine } from './services/spacedRepetition';
import { sounds } from './services/soundEffects';

// Editorial types & data
import {
  EVENT_PRESETS,
  DEFAULT_ITINERARY,
  SAMPLE_HOUSEHOLDS,
  SAMPLE_TABLES,
  INITIAL_POLAROIDS,
  INITIAL_VOTES,
  INITIAL_RIDESHARES,
} from './data/defaultEvents';
import { GuestParty, GuestRsvpData, EventType } from './types/editorial';

// Components
import { Navbar } from './components/common/Navbar';
import { TactileCardCanvas } from './components/flashcards/TactileCardCanvas';
import { MemoryDecayDashboard } from './components/flashcards/MemoryDecayDashboard';
import { MagicDeckGenerator } from './components/flashcards/MagicDeckGenerator';
import { MultiplayerCrunchRoom } from './components/flashcards/MultiplayerCrunchRoom';
import { DeckLibrary } from './components/flashcards/DeckLibrary';
import { FiveMinuteBlitzModal } from './components/flashcards/FiveMinuteBlitzModal';
import { SyncStatusIndicator } from './components/flashcards/SyncStatusIndicator';

// Editorial Components
import { HeroUnsealing } from './components/editorial/HeroUnsealing';
import { InteractiveItinerary } from './components/editorial/InteractiveItinerary';
import { PolaroidGuestWall } from './components/editorial/PolaroidGuestWall';
import { SeatingExplorer } from './components/editorial/SeatingExplorer';
import { MagicLinkInvite } from './components/editorial/MagicLinkInvite';
import { AtmosphereVoting } from './components/editorial/AtmosphereVoting';
import { TravelCoordinator } from './components/editorial/TravelCoordinator';
import { HostCommandDrawer } from './components/editorial/HostCommandDrawer';
import { RsvpModal } from './components/editorial/RsvpModal';

const STORAGE_KEY_DECKS = 'antigravity_flashcards_decks_v2';
const STORAGE_KEY_RSVPS = 'antigravity_editorial_rsvps_v1';

export function App() {
  // Application Mode: 'flashcards' (Cognitive Studio) vs 'editorial' (Bespoke Editorial)
  const [appMode, setAppMode] = useState<'flashcards' | 'editorial'>('flashcards');

  // Global SFX Mute state
  const [isSfxMuted, setIsSfxMuted] = useState<boolean>(false);

  // -------------------------------------------------------------
  // COGNITIVE STUDIO STATE
  // -------------------------------------------------------------
  const [decks, setDecks] = useState<Deck[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_DECKS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_DECKS;
  });

  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || 'deck-neuroanatomy');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [flashcardTab, setFlashcardTab] = useState<'study' | 'decay' | 'magic' | 'crunch' | 'library'>('study');
  const [isBlitzOpen, setIsBlitzOpen] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now());

  // Save decks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
      setLastSavedAt(Date.now());
    } catch {}
  }, [decks]);

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  const handleGradeCard = (cardId: string, grade: 1 | 2 | 3 | 4, speedMs: number) => {
    setDecks((prevDecks) =>
      prevDecks.map((d) => {
        if (d.id !== selectedDeckId) return d;
        const updatedCards = d.cards.map((c) => {
          if (c.id !== cardId) return c;
          const result = SpacedRepetitionEngine.calculateNextReview(c, grade, speedMs);
          return {
            ...c,
            ...result,
            lastReviewedAt: Date.now(),
            lastResponseSpeedMs: speedMs,
            history: [
              ...(c.history || []),
              { date: Date.now(), grade, speedMs },
            ],
          };
        });
        return {
          ...d,
          lastStudiedAt: Date.now(),
          cards: updatedCards,
        };
      })
    );
  };

  const handleAddOcclusionCard = (card: Flashcard) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === selectedDeckId
          ? { ...d, cards: [card, ...d.cards], cardCount: d.cards.length + 1 }
          : d
      )
    );
  };

  const handleAddNewDeck = (newDeck: Deck) => {
    setDecks([newDeck, ...decks]);
    setSelectedDeckId(newDeck.id);
    setActiveCardIndex(0);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    if (selectedDeckId === deckId) {
      const remaining = decks.filter((d) => d.id !== deckId);
      if (remaining.length > 0) setSelectedDeckId(remaining[0].id);
    }
  };

  const handleExportDecks = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(decks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `antigravity_flashcards_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sounds.playMasteredSound();
  };

  const handleImportDecks = (imported: Deck[]) => {
    setDecks(imported);
    if (imported.length > 0) setSelectedDeckId(imported[0].id);
  };

  const handleForkDeck = (deckToFork: Deck) => {
    const forked: Deck = {
      ...deckToFork,
      id: `deck-forked-${Date.now()}`,
      title: `${deckToFork.title} (Custom Fork)`,
      isForked: true,
      forkedFrom: deckToFork.title,
      cards: deckToFork.cards.map((c, i) => ({
        ...c,
        id: `card-fork-${Date.now()}-${i}`,
        intervalDays: 1,
        repetitionCount: 0,
        lapseCount: 0,
        lastReviewedAt: null,
      })),
    };
    setDecks([forked, ...decks]);
  };

  // -------------------------------------------------------------
  // BESPOKE EDITORIAL STATE
  // -------------------------------------------------------------
  const [editorialTheme, setEditorialTheme] = useState<EventType>('wedding');
  const [currentPartyCode, setCurrentPartyCode] = useState<string>('smith-family');
  const [isRsvpOpen, setIsRsvpOpen] = useState<boolean>(false);
  const [isHostDrawerOpen, setIsHostDrawerOpen] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(
    'Reminder: Complimentary shuttles depart Florence Santa Maria Novella at 3:15 PM.'
  );

  const activeThemeConfig = EVENT_PRESETS[editorialTheme] || EVENT_PRESETS.wedding;
  const activeParty = SAMPLE_HOUSEHOLDS[currentPartyCode] || SAMPLE_HOUSEHOLDS['smith-family'];
  const activeItinerary = DEFAULT_ITINERARY[editorialTheme] || DEFAULT_ITINERARY.wedding;
  const activeVotes = INITIAL_VOTES[editorialTheme] || INITIAL_VOTES.wedding;

  const handleSaveRsvp = (data: GuestRsvpData) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_RSVPS) || '{}');
      existing[data.inviteCode] = data;
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(existing));
    } catch {}
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        appMode === 'flashcards'
          ? 'bg-[#F8F7F4] text-[#141413]'
          : activeThemeConfig.bgClass + (editorialTheme === 'conference' ? ' text-white' : ' text-[#1C1917]')
      }`}
    >
      {/* GLOBAL NAVBAR */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        editorialTheme={editorialTheme}
        setEditorialTheme={setEditorialTheme}
        flashcardTab={flashcardTab}
        setFlashcardTab={setFlashcardTab}
        isSfxMuted={isSfxMuted}
        setIsSfxMuted={setIsSfxMuted}
        onOpenBlitz={() => setIsBlitzOpen(true)}
      />

      {/* Broadcast Announcement Sticky Banner (if active in Bespoke Editorial) */}
      {appMode === 'editorial' && broadcastMessage && (
        <div className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-4 text-xs font-semibold animate-fade-in">
          <div className="max-w-5xl mx-auto flex items-center gap-2">
            <Megaphone className="w-4 h-4 animate-bounce shrink-0" />
            <span>HOST BROADCAST: {broadcastMessage}</span>
          </div>
          <button
            onClick={() => setBroadcastMessage(null)}
            className="p-1 hover:bg-amber-700 rounded-full cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      <main className="pb-24">
        {appMode === 'flashcards' ? (
          /* ============================================================ */
          /* COGNITIVE STUDIO: FLASHCARD & ACTIVE RECALL EXPERIENCE       */
          /* ============================================================ */
          <div>
            {flashcardTab === 'study' && activeDeck && (
              <TactileCardCanvas
                cards={activeDeck.cards}
                activeCardIndex={activeCardIndex}
                setActiveCardIndex={setActiveCardIndex}
                onGradeCard={handleGradeCard}
                deckTitle={activeDeck.title}
                deckId={activeDeck.id}
                onAddOcclusionCard={handleAddOcclusionCard}
                onOpenBlitz={() => setIsBlitzOpen(true)}
              />
            )}

            {flashcardTab === 'decay' && (
              <MemoryDecayDashboard
                decks={decks}
                onSelectDeckForStudy={(deckId) => {
                  setSelectedDeckId(deckId);
                  setActiveCardIndex(0);
                  setFlashcardTab('study');
                }}
                onOpenBlitz={() => setIsBlitzOpen(true)}
              />
            )}

            {flashcardTab === 'magic' && (
              <MagicDeckGenerator
                onAddDeck={handleAddNewDeck}
                onOpenDeck={(deckId) => {
                  setSelectedDeckId(deckId);
                  setActiveCardIndex(0);
                  setFlashcardTab('study');
                }}
              />
            )}

            {flashcardTab === 'crunch' && activeDeck && (
              <MultiplayerCrunchRoom
                deck={activeDeck}
                onForkDeck={handleForkDeck}
              />
            )}

            {flashcardTab === 'library' && (
              <DeckLibrary
                decks={decks}
                onSelectDeck={(deckId) => {
                  setSelectedDeckId(deckId);
                  setActiveCardIndex(0);
                  setFlashcardTab('study');
                }}
                onAddDeck={handleAddNewDeck}
                onDeleteDeck={handleDeleteDeck}
                onExportDecks={handleExportDecks}
                onImportDecks={handleImportDecks}
              />
            )}

            {/* Bottom Floating Status Bar */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
              <SyncStatusIndicator lastSavedAt={lastSavedAt} />
            </div>

            {/* 5-Minute Blitz Modal */}
            <FiveMinuteBlitzModal
              isOpen={isBlitzOpen}
              onClose={() => setIsBlitzOpen(false)}
              cards={decks.flatMap((d) => d.cards)}
              onBlitzCardGraded={(cId, g) => handleGradeCard(cId, g, 2000)}
            />
          </div>
        ) : (
          /* ============================================================ */
          /* BESPOKE EDITORIAL: INTERACTIVE EVENT INVITATION SUITE       */
          /* ============================================================ */
          <div className="space-y-12">
            {/* 1. Personalized Magic-Link Banner */}
            <MagicLinkInvite
              currentParty={activeParty}
              onSelectParty={setCurrentPartyCode}
              availableParties={SAMPLE_HOUSEHOLDS}
              onOpenRsvp={() => setIsRsvpOpen(true)}
            />

            {/* 2. Interactive Unsealing Hero Experience */}
            <HeroUnsealing
              theme={activeThemeConfig}
              onOpenRsvp={() => setIsRsvpOpen(true)}
              guestName={activeParty.primaryGuest}
            />

            {/* 3. Dynamic Time-Zone & Interactive Itinerary */}
            <InteractiveItinerary
              itinerary={activeItinerary}
              eventTitle={activeThemeConfig.title}
            />

            {/* 4. Interactive Seating / Session Explorer */}
            <SeatingExplorer
              tables={SAMPLE_TABLES}
              initialGuestName={activeParty.primaryGuest.split(' ')[0]}
            />

            {/* 5. Tactile Guest Wall & Polaroid Gallery */}
            <PolaroidGuestWall initialPolaroids={INITIAL_POLAROIDS} />

            {/* 6. Crowd-Sourced Atmosphere: Song / Topic Voting */}
            <AtmosphereVoting
              items={activeVotes}
              themeType={editorialTheme}
            />

            {/* 7. Smart Dietary, Travel & Ride-Share Coordinator */}
            <TravelCoordinator initialRides={INITIAL_RIDESHARES} />

            {/* Host Command Center Drawer Trigger */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => {
                  sounds.playCardSnap();
                  setIsHostDrawerOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900 hover:bg-black text-amber-300 font-semibold text-xs shadow-xl border border-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Host Command Center</span>
              </button>
            </div>

            {/* Host Command Center Drawer */}
            <HostCommandDrawer
              isOpen={isHostDrawerOpen}
              onClose={() => setIsHostDrawerOpen(false)}
              broadcastMessage={broadcastMessage}
              onSetBroadcastMessage={setBroadcastMessage}
            />

            {/* RSVP Modal */}
            <RsvpModal
              isOpen={isRsvpOpen}
              onClose={() => setIsRsvpOpen(false)}
              party={activeParty}
              onSaveRsvp={handleSaveRsvp}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
