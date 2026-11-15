import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { PORTFOLIO_ARTIFACTS } from './data/artifacts';
import { computeArtifactMeta } from './engine/paletteEngine';
import { buildExhibitionSequence } from './engine/rhythmSequencer';
import { rankArtifactsForPersona, resolvePersonaFromSearch } from './engine/personaResolver';
import { loadInitialBriefcase, persistBriefcaseLocally } from './engine/briefcaseService';
import type {
  BriefcaseItemState,
  ColorHarmonyId,
  ComputedArtifactMeta,
  Discipline,
  StudioLightingMode,
  ViewPostureMode,
  VisualMood,
} from './types/portfolio';
import { Masthead } from './components/Masthead';
import { CurationBar } from './components/CurationBar';
import { ExhibitionCanvas } from './components/ExhibitionCanvas';
import { ContactSheetView } from './components/ContactSheetView';
import { DirectorsReelView } from './components/DirectorsReelView';
import { InspectionStageModal } from './components/InspectionStageModal';
import { ClientBriefcaseDrawer } from './components/ClientBriefcaseDrawer';
import { ScopeMatchmakerModal } from './components/ScopeMatchmakerModal';

export function App() {
  // 1. Studio Lighting Environment (Archival Cotton default)
  const [lightingMode, setLightingMode] = useState<StudioLightingMode>('cotton');

  // 2. 3-Mode View Posture Switcher
  const [viewMode, setViewMode] = useState<ViewPostureMode>('exhibition');

  // 3. Sensory, Craft & Palette Filter State
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | 'All Work'>('All Work');
  const [selectedColor, setSelectedColor] = useState<ColorHarmonyId | null>(null);
  const [selectedMood, setSelectedMood] = useState<VisualMood | null>(null);

  // 4. Persona-Aware Link Resolver (?for=linear, ?lens=photography, ?role=product-design)
  const [searchQuery, setSearchQuery] = useState<string>(() => window.location.search);
  const persona = useMemo(() => resolvePersonaFromSearch(searchQuery), [searchQuery]);

  // 5. Stateful Client Briefcase & Viewing Room
  const initialBriefcase = useMemo(() => loadInitialBriefcase(window.location.search), []);
  const [briefcaseTitle, setBriefcaseTitle] = useState<string>(initialBriefcase.title);
  const [briefcaseItems, setBriefcaseItems] = useState<BriefcaseItemState[]>(initialBriefcase.items);
  const [briefcaseOpen, setBriefcaseOpen] = useState<boolean>(
    Boolean(initialBriefcase.loadedFromToken)
  );
  const [briefcaseInquiryDefault, setBriefcaseInquiryDefault] = useState(false);

  // 6. Active Inspection Stage & Scope Matchmaker Modals
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [scopeMatchmakerOpen, setScopeMatchmakerOpen] = useState(false);

  // 7. Scroll tracking for Masthead glass & Auto-hiding Curation Ribbon
  const [scrolled, setScrolled] = useState(false);
  const [ribbonHiddenByScroll, setRibbonHiddenByScroll] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightingMode);
  }, [lightingMode]);

  useEffect(() => {
    persistBriefcaseLocally(briefcaseTitle, briefcaseItems);
  }, [briefcaseTitle, briefcaseItems]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 180 && y > lastScrollY.current + 6) {
        setRibbonHiddenByScroll(true);
      } else if (y < lastScrollY.current - 6 || y <= 140) {
        setRibbonHiddenByScroll(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Backend Visual Intelligence Engine Pipeline:
  // Step A: Rank by Persona Context -> Step B: Compute Perceptual Palette, Contrast & Ambient Matting
  const rankedMetas = useMemo(() => {
    const ordered = rankArtifactsForPersona(PORTFOLIO_ARTIFACTS, persona);
    return ordered.map(computeArtifactMeta);
  }, [persona]);

  const metaById = useMemo(() => {
    const map = new Map<string, ComputedArtifactMeta>();
    for (const m of rankedMetas) map.set(m.artifact.id, m);
    return map;
  }, [rankedMetas]);

  // Step C: Apply Craft, Color Harmony & Mood Slices
  const filteredMetas = useMemo(() => {
    return rankedMetas.filter((m) => {
      const { artifact } = m;
      if (
        selectedDiscipline !== 'All Work' &&
        !artifact.disciplines.includes(selectedDiscipline)
      ) {
        return false;
      }
      if (selectedColor && artifact.colorHarmony !== selectedColor) {
        return false;
      }
      if (selectedMood && artifact.mood !== selectedMood) {
        return false;
      }
      return true;
    });
  }, [rankedMetas, selectedDiscipline, selectedColor, selectedMood]);

  const matchingIds = useMemo(
    () => new Set(filteredMetas.map((m) => m.artifact.id)),
    [filteredMetas]
  );

  const hasActiveFilters =
    selectedDiscipline !== 'All Work' || selectedColor !== null || selectedMood !== null;

  // Step D: Sequence into Alternating Editorial Rhythm & Matched-Height Diptychs
  const exhibitionRows = useMemo(
    () => buildExhibitionSequence(filteredMetas),
    [filteredMetas]
  );

  // Top 10 Career Highlights for the 60-Second Director's Reel
  const topTenHighlights = useMemo(() => {
    return rankedMetas
      .filter((m) => m.artifact.isTopTenHighlight)
      .sort((a, b) => (a.artifact.highlightRank ?? 99) - (b.artifact.highlightRank ?? 99))
      .slice(0, 10);
  }, [rankedMetas]);

  const pinnedIds = useMemo(
    () => new Set(briefcaseItems.map((item) => item.id)),
    [briefcaseItems]
  );

  const cycleLighting = () => {
    setLightingMode((prev) =>
      prev === 'cotton' ? 'white' : prev === 'white' ? 'darkroom' : 'cotton'
    );
  };

  const handleTogglePin = (id: string) => {
    setBriefcaseItems((prev) => {
      if (prev.some((i) => i.id === id)) {
        return prev.filter((i) => i.id !== id);
      }
      return [...prev, { id, note: '' }];
    });
  };

  const handleMoveBriefcaseItem = (id: string, direction: -1 | 1) => {
    setBriefcaseItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      copy.splice(target, 0, removed);
      return copy;
    });
  };

  const handleUpdateBriefcaseNote = (id: string, note: string) => {
    setBriefcaseItems((prev) => prev.map((i) => (i.id === id ? { ...i, note } : i)));
  };

  const handleSelectPersonaPreset = (queryString: string) => {
    const baseUrl = window.location.pathname;
    const nextUrl = queryString ? `${baseUrl}${queryString}` : baseUrl;
    window.history.replaceState({}, '', nextUrl);
    setSearchQuery(queryString);
  };

  const handleResetFilters = () => {
    setSelectedDiscipline('All Work');
    setSelectedColor(null);
    setSelectedMood(null);
  };

  const handleOpenBriefcaseInquiryFromInspect = (id: string) => {
    if (!pinnedIds.has(id)) {
      setBriefcaseItems((prev) => [...prev, { id, note: '' }]);
    }
    setInspectedId(null);
    setBriefcaseInquiryDefault(true);
    setBriefcaseOpen(true);
  };

  const inspectedMeta = inspectedId ? metaById.get(inspectedId) ?? null : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Whisper-Quiet Masthead */}
      <Masthead
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        lightingMode={lightingMode}
        onCycleLighting={cycleLighting}
        briefcaseCount={briefcaseItems.length}
        onOpenBriefcase={() => {
          setBriefcaseInquiryDefault(false);
          setBriefcaseOpen(true);
        }}
        onOpenScopeMatchmaker={() => setScopeMatchmakerOpen(true)}
        totalArtifacts={rankedMetas.length}
        scrolled={scrolled}
      />

      {/* Sensory, Craft & Palette Curation Ribbon (Visible in Exhibition & Index views) */}
      {viewMode !== 'reel' && (
        <CurationBar
          selectedDiscipline={selectedDiscipline}
          onSelectDiscipline={setSelectedDiscipline}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
          visibleCount={filteredMetas.length}
          totalCount={rankedMetas.length}
          hiddenByScroll={ribbonHiddenByScroll && viewMode === 'exhibition'}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Primary View Posture */}
      <div className="flex-1">
        {viewMode === 'exhibition' && (
          <ExhibitionCanvas
            rows={exhibitionRows}
            totalCatalogCount={rankedMetas.length}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
            onInspect={(id) => setInspectedId(id)}
            persona={persona}
            onSelectPersonaPreset={handleSelectPersonaPreset}
            onResetFilters={handleResetFilters}
          />
        )}

        {viewMode === 'index' && (
          <ContactSheetView
            allMetas={rankedMetas}
            matchingIds={matchingIds}
            hasActiveFilters={hasActiveFilters}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
            onInspect={(id) => setInspectedId(id)}
          />
        )}
      </div>

      {/* 60-Second Director's Reel (Full-Screen Posture) */}
      {viewMode === 'reel' && (
        <DirectorsReelView
          highlights={topTenHighlights}
          pinnedIds={pinnedIds}
          onTogglePin={handleTogglePin}
          onInspect={(id) => setInspectedId(id)}
          onExit={() => setViewMode('exhibition')}
        />
      )}

      {/* Discreet Bottom Briefcase Dock Pill (Quick access while scrolling) */}
      {viewMode !== 'reel' && !inspectedMeta && !briefcaseOpen && briefcaseItems.length > 0 && (
        <div className="fixed bottom-5 right-5 sm:right-10 z-30">
          <button
            type="button"
            onClick={() => {
              setBriefcaseInquiryDefault(false);
              setBriefcaseOpen(true);
            }}
            className="px-4 py-2.5 rounded-full glass-whisper border border-[var(--border-hairline-strong)] shadow-[0_12px_36px_rgba(0,0,0,0.12)] inline-flex items-center gap-2.5 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-vermilion)]" />
            <Bookmark className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span className="font-mono-catalog text-[11px] uppercase tracking-[0.07em] text-[var(--text-primary)]">
              Briefcase [{String(briefcaseItems.length).padStart(2, '0')}]
            </span>
          </button>
        </div>
      )}

      {/* Restrained Swiss Archival Colophon Footer */}
      {viewMode !== 'reel' && (
        <footer className="border-t border-[var(--border-hairline)] py-10">
          <div className="exhibition-grid-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="font-mono-catalog text-[11px] uppercase tracking-[0.07em] text-[var(--text-muted)]">
              ATELIER SØRENSEN • EXHIBITION MONOGRAPH IV • ALL ASPECT RATIOS UNCROPPED
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono-catalog text-[11px] text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={() => {
                  const loaded = loadInitialBriefcase('?briefcase=8a4f');
                  setBriefcaseTitle(loaded.title);
                  setBriefcaseItems(loaded.items);
                  setBriefcaseOpen(true);
                }}
                className="hover:text-[var(--text-primary)] underline underline-offset-4 cursor-pointer"
              >
                Sample Viewing Room (?briefcase=8a4f)
              </button>
              <button
                type="button"
                onClick={() => setScopeMatchmakerOpen(true)}
                className="hover:text-[var(--text-primary)] underline underline-offset-4 cursor-pointer"
              >
                Commission Estimator
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Process X-Ray Loupe & Zero-Chrome Inspection Stage */}
      {inspectedMeta && (
        <InspectionStageModal
          meta={inspectedMeta}
          allMetas={filteredMetas.length > 0 ? filteredMetas : rankedMetas}
          isPinned={pinnedIds.has(inspectedMeta.artifact.id)}
          onTogglePin={handleTogglePin}
          onSelectArtifact={(id) => setInspectedId(id)}
          onClose={() => setInspectedId(null)}
          onOpenBriefcaseInquiry={handleOpenBriefcaseInquiryFromInspect}
        />
      )}

      {/* Stateful Client Briefcase & Viewing Room Drawer */}
      <ClientBriefcaseDrawer
        isOpen={briefcaseOpen}
        onClose={() => {
          setBriefcaseOpen(false);
          setBriefcaseInquiryDefault(false);
        }}
        roomTitle={briefcaseTitle}
        onChangeRoomTitle={setBriefcaseTitle}
        items={briefcaseItems}
        metaById={metaById}
        onMoveItem={handleMoveBriefcaseItem}
        onUpdateNote={handleUpdateBriefcaseNote}
        onRemoveItem={(id) =>
          setBriefcaseItems((prev) => prev.filter((item) => item.id !== id))
        }
        onInspectArtifact={(id) => {
          setBriefcaseOpen(false);
          setInspectedId(id);
        }}
        defaultOpenInquiry={briefcaseInquiryDefault}
        loadedFromToken={initialBriefcase.loadedFromToken}
      />

      {/* Live Availability 3-Click Scope Matchmaker */}
      <ScopeMatchmakerModal
        isOpen={scopeMatchmakerOpen}
        onClose={() => setScopeMatchmakerOpen(false)}
        briefcaseCount={briefcaseItems.length}
        onAttachAndOpenBriefcase={() => {
          setScopeMatchmakerOpen(false);
          setBriefcaseInquiryDefault(true);
          setBriefcaseOpen(true);
        }}
      />
    </div>
  );
}

export default App;
