import React, { useState, useEffect, useMemo } from 'react';
import type { Photograph, ViewMode, GalleryTheme, LightQuality, TonalSwatch, ViewingRoomState } from './types';
import { EXHIBITION_PHOTOGRAPHS, EXHIBITION_SERIES } from './data/exhibitionData';
import { VisualIntelligenceEngine } from './services/visualIntelligence';
import { Header } from './components/Header';
import { CurationBar } from './components/CurationBar';
import { ExhibitionFlow } from './components/ExhibitionFlow';
import { ContactSheetIndex } from './components/ContactSheetIndex';
import { CinemaSlideshow } from './components/CinemaSlideshow';
import { LoupeLightbox } from './components/LoupeLightbox';
import { CollectorsTray } from './components/CollectorsTray';
import { ViewingRoomBanner } from './components/ViewingRoomBanner';

export const App: React.FC = () => {
  // Gallery Theme: cotton (default), white, or darkroom
  const [theme, setTheme] = useState<GalleryTheme>(() => {
    const saved = localStorage.getItem('kairos_gallery_theme') as GalleryTheme;
    return saved === 'cotton' || saved === 'white' || saved === 'darkroom' ? saved : 'cotton';
  });

  // 3-Mode View Switcher: exhibition, contact-sheet, cinema
  const [viewMode, setViewMode] = useState<ViewMode>('exhibition');

  // Sensory Curation Filters
  const [selectedLight, setSelectedLight] = useState<LightQuality | 'All'>('All');
  const [selectedSwatch, setSelectedSwatch] = useState<TonalSwatch | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string>('all');

  // Collector's Tray Selection (persisted in localStorage)
  const [collectedIds, setCollectedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('kairos_collected_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set(['plate-01', 'plate-03', 'plate-07']); // default sample curate
  });

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<Photograph | null>(null);

  // Private Viewing Room state parsed from URL hash
  const [viewingRoomState, setViewingRoomState] = useState<ViewingRoomState | null>(null);

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kairos_gallery_theme', theme);
  }, [theme]);

  // Persist collected IDs
  useEffect(() => {
    localStorage.setItem('kairos_collected_ids', JSON.stringify(Array.from(collectedIds)));
  }, [collectedIds]);

  // Check URL hash for shared viewing room on mount and hash changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#room=')) {
        const token = hash.replace('#room=', '');
        const state = VisualIntelligenceEngine.decodeViewingRoom(token);
        if (state) {
          setViewingRoomState(state);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleCycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'cotton') return 'white';
      if (prev === 'white') return 'darkroom';
      return 'cotton';
    });
  };

  const handleToggleCollect = (photo: Photograph) => {
    setCollectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  };

  const handleRemoveCollected = (id: string) => {
    setCollectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleClearCollected = () => {
    setCollectedIds(new Set());
  };

  // Filter exhibition photographs
  const filteredPhotographs = useMemo(() => {
    let list = EXHIBITION_PHOTOGRAPHS;

    // If inside a private viewing room, restrict to curated plate IDs
    if (viewingRoomState) {
      const roomSet = new Set(viewingRoomState.selectedIds);
      list = list.filter((p) => roomSet.has(p.id));
    }

    if (selectedSeries !== 'all') {
      list = list.filter((p) => p.seriesId === selectedSeries);
    }

    if (selectedLight !== 'All') {
      list = list.filter((p) => p.lightQuality === selectedLight);
    }

    if (selectedSwatch !== null) {
      list = list.filter((p) => p.tonalSwatch === selectedSwatch);
    }

    return list;
  }, [viewingRoomState, selectedSeries, selectedLight, selectedSwatch]);

  // List of collected photograph objects
  const collectedPhotos = useMemo(() => {
    return EXHIBITION_PHOTOGRAPHS.filter((p) => collectedIds.has(p.id));
  }, [collectedIds]);

  // Lightbox navigation
  const currentLightboxIndex = useMemo(() => {
    if (!activeLightboxPhoto) return -1;
    return filteredPhotographs.findIndex((p) => p.id === activeLightboxPhoto.id);
  }, [activeLightboxPhoto, filteredPhotographs]);

  const handleNextLightbox = () => {
    if (filteredPhotographs.length === 0) return;
    const nextIdx = (currentLightboxIndex + 1) % filteredPhotographs.length;
    setActiveLightboxPhoto(filteredPhotographs[nextIdx]);
  };

  const handlePrevLightbox = () => {
    if (filteredPhotographs.length === 0) return;
    const prevIdx = (currentLightboxIndex - 1 + filteredPhotographs.length) % filteredPhotographs.length;
    setActiveLightboxPhoto(filteredPhotographs[prevIdx]);
  };

  const activeSeriesTitle = useMemo(() => {
    if (viewingRoomState) return viewingRoomState.title;
    const found = EXHIBITION_SERIES.find((s) => s.id === selectedSeries);
    return found ? found.title : 'Complete Exhibition Archive';
  }, [selectedSeries, viewingRoomState]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-400">
      {/* Header with Whisper-Quiet View Switcher & Lighting Swatch */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeCycle={handleCycleTheme}
        collectorCount={collectedIds.size}
        onOpenTray={() => setIsTrayOpen(true)}
        activeSeriesTitle={activeSeriesTitle}
      />

      {/* Private Viewing Room Banner if active */}
      {viewingRoomState && (
        <ViewingRoomBanner
          roomState={viewingRoomState}
          onExitRoom={() => {
            setViewingRoomState(null);
            window.location.hash = '';
          }}
        />
      )}

      {/* Main Exhibition Canvas based on View Mode */}
      <main className="flex-1 w-full">
        {filteredPhotographs.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-serif italic text-2xl text-neutral-400 mb-2">
              No photographic plates match this curatorial filter.
            </p>
            <button
              onClick={() => {
                setSelectedLight('All');
                setSelectedSwatch(null);
                setSelectedSeries('all');
              }}
              className="mt-4 px-4 py-2 rounded-full border text-xs font-mono tracking-wider uppercase hover:border-neutral-500"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'exhibition' ? (
          <ExhibitionFlow
            photographs={filteredPhotographs}
            onInspect={setActiveLightboxPhoto}
            collectedIds={collectedIds}
            onToggleCollect={handleToggleCollect}
          />
        ) : viewMode === 'contact-sheet' ? (
          <ContactSheetIndex
            photographs={filteredPhotographs}
            onInspect={setActiveLightboxPhoto}
            collectedIds={collectedIds}
            onToggleCollect={handleToggleCollect}
            activeSwatch={selectedSwatch}
            activeLight={selectedLight}
          />
        ) : (
          <CinemaSlideshow
            photographs={filteredPhotographs}
            initialIndex={0}
            onExit={() => setViewMode('exhibition')}
            collectedIds={collectedIds}
            onToggleCollect={handleToggleCollect}
          />
        )}
      </main>

      {/* Sensory & Light-Driven Curation Bar (Floating) - hide in cinema mode */}
      {viewMode !== 'cinema' && (
        <CurationBar
          selectedLight={selectedLight}
          onSelectLight={setSelectedLight}
          selectedSwatch={selectedSwatch}
          onSelectSwatch={setSelectedSwatch}
          selectedSeries={selectedSeries}
          onSelectSeries={setSelectedSeries}
          totalFilteredCount={filteredPhotographs.length}
        />
      )}

      {/* Distraction-Free "Loupe & Field Note" Lightbox */}
      {activeLightboxPhoto && (
        <LoupeLightbox
          photo={activeLightboxPhoto}
          onClose={() => setActiveLightboxPhoto(null)}
          onNext={handleNextLightbox}
          onPrev={handlePrevLightbox}
          collectedIds={collectedIds}
          onToggleCollect={handleToggleCollect}
          onOpenInquiry={() => {
            if (!collectedIds.has(activeLightboxPhoto.id)) {
              handleToggleCollect(activeLightboxPhoto);
            }
            setIsTrayOpen(true);
          }}
        />
      )}

      {/* Collector's Tray & Inquiry Dock */}
      <CollectorsTray
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        collectedPhotos={collectedPhotos}
        onRemovePhoto={handleRemoveCollected}
        onClearAll={handleClearCollected}
        onInspect={(photo) => {
          setIsTrayOpen(false);
          setActiveLightboxPhoto(photo);
        }}
        onViewingRoomCreated={(state) => {
          setViewingRoomState(state);
        }}
      />
    </div>
  );
};

export default App;
