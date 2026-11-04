import React, { useState, useEffect, useMemo } from 'react';
import {
  MEDIA_CATALOG,
  HOUSEHOLD_PROFILES,
  CATEGORY_DEFINITIONS
} from './data/mockData';
import { MediaItem, TimeBucket, MoodCategory } from './types';
import { useLiveClock } from './hooks/useLiveClock';
import { evaluateTimeContext } from './services/timeSwimlaneOrchestrator';
import { executeTasteIntersection } from './services/tasteIntersectionEngine';
import { AmbientGlow } from './components/AmbientGlow';
import { Navbar } from './components/Navbar';
import { AntiFatigueRibbon } from './components/AntiFatigueRibbon';
import { HeroBillboard } from './components/HeroBillboard';
import { HorizontalSwimlane } from './components/HorizontalSwimlane';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { PickForUsModal } from './components/PickForUsModal';
import { ShortlistDrawer } from './components/ShortlistDrawer';
import { DetailModal } from './components/DetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { BlenderBanner } from './components/BlenderBanner';

  export const App: React.FC = () => {
    // Profiles State
    const [activeProfileIds, setActiveProfileIds] = useState<string[]>(['alex']);

    // Navigation & Tabs
    const [activeTab, setActiveTab] = useState<string>('Home');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filters State
    const [selectedTime, setSelectedTime] = useState<TimeBucket | 'all'>('all');
    const [selectedMood, setSelectedMood] = useState<MoodCategory | 'all'>('all');

    // Tonight's Shortlist Queue (pre-populate with 2 titles for instant discovery)
    const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
      try {
        const saved = localStorage.getItem('velvet_shortlist');
        return saved ? JSON.parse(saved) : ['midnight-audit', 'escape-to-cabo'];
      } catch {
        return ['midnight-audit', 'escape-to-cabo'];
      }
    });

    // Audio mute persistent memory
    const [isMuted, setIsMuted] = useState<boolean>(() => {
      try {
        return localStorage.getItem('velvet_muted') === 'true';
      } catch {
        return false;
      }
    });

    // Modals & Drawers
    const [isShortlistOpen, setIsShortlistOpen] = useState(false);
    const [isPickForUsOpen, setIsPickForUsOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
    const [activeVideoItem, setActiveVideoItem] = useState<MediaItem | null>(null);

    // Hero Carousel Index (3 featured cinematic titles)
    const [heroIndex, setHeroIndex] = useState(0);

    // Hovered card for ambient glow shift
    const [hoveredCard, setHoveredCard] = useState<MediaItem | null>(null);

    // Time Orchestrator Simulation
    const [simulatedHour, setSimulatedHour] = useState<number>(-1); // -1 = live real clock

    // Live Synchronized Clock Hook
    const { clock: referenceTime } = useLiveClock(simulatedHour);

    // Save shortlist to localStorage
    useEffect(() => {
      try {
        localStorage.setItem('velvet_shortlist', JSON.stringify(shortlistIds));
      } catch (e) {
        console.error(e);
      }
    }, [shortlistIds]);

    // Save mute preference
    const toggleMute = () => {
      setIsMuted(prev => {
        const next = !prev;
        try {
          localStorage.setItem('velvet_muted', String(next));
        } catch { }
        return next;
      });
    };

    // Toggle Profile in Household Blender
    const toggleProfile = (id: string) => {
      setActiveProfileIds(prev => {
        if (prev.includes(id)) {
          if (prev.length === 1) return prev; // Keep at least one profile
          return prev.filter(p => p !== id);
        } else {
          return [...prev, id];
        }
      });
    };

    // Shortlist helpers
    const toggleShortlist = (item: MediaItem) => {
      setShortlistIds(prev =>
        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
      );
    };

    const removeItemFromShortlist = (id: string) => {
      setShortlistIds(prev => prev.filter(item => item !== id));
    };

    const clearShortlist = () => {
      setShortlistIds([]);
    };

    // Evaluate Time Context & Swimlane Order
    const timeContext = useMemo(() => {
      return evaluateTimeContext(simulatedHour);
    }, [simulatedHour]);

    // Multi-Profile Taste Intersection Engine
    const blenderSynthesis = useMemo(() => {
      return executeTasteIntersection(activeProfileIds, MEDIA_CATALOG);
    }, [activeProfileIds]);

    // Joint match scores map
    const jointScoresMap = useMemo(() => {
      const map: Record<string, number> = {};
      blenderSynthesis.blendedTitles.forEach(t => {
        map[t.title.id] = t.jointScore;
      });
      return map;
    }, [blenderSynthesis]);

    // Featured Hero titles
    const featuredHeroTitles = useMemo(() => {
      return [
        MEDIA_CATALOG.find(t => t.id === 'signal-zero')!,
        MEDIA_CATALOG.find(t => t.id === 'midnight-audit')!,
        MEDIA_CATALOG.find(t => t.id === 'solstice-protocol')!
      ].filter(Boolean);
    }, []);

    const activeHero = featuredHeroTitles[heroIndex] || featuredHeroTitles[0];

    // Active dominant ambient glow color
    const activeGlowColor = hoveredCard ? hoveredCard.dominantColor : activeHero.dominantColor;

    // Filter Catalog by Active Tab, Search, Time & Mood
    const filteredCatalog = useMemo(() => {
      return MEDIA_CATALOG.filter(item => {
        // Tab filter
        if (activeTab === 'Series' && item.type !== 'series') return false;
        if (activeTab === 'Movies' && item.type !== 'movie') return false;

        // Time Available filter
        if (selectedTime === 'under30' && item.timeBucket !== 'under30') return false;
        if (selectedTime === 'under90' && item.timeBucket !== 'under30' && item.timeBucket !== 'under90') return false;
        if (selectedTime === 'fullNight' && item.timeBucket !== 'fullNight') return false;

        // Mood filter
        if (selectedMood !== 'all' && !item.moods.includes(selectedMood)) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesCast = item.cast.some(c => c.toLowerCase().includes(q));
          const matchesTags = item.pacingTags.some(t => t.toLowerCase().includes(q));
          const matchesHook = item.editorialHook.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCast && !matchesTags && !matchesHook) return false;
        }

        return true;
      });
    }, [activeTab, selectedTime, selectedMood, searchQuery]);

    // Continue Watching items
    const continueWatchingItems = useMemo(() => {
      return MEDIA_CATALOG.filter(t => Boolean(t.progress));
    }, []);

    // Queued Shortlist Media Items
    const shortlistItems = useMemo(() => {
      return shortlistIds
        .map(id => MEDIA_CATALOG.find(t => t.id === id))
        .filter((item): item is MediaItem => Boolean(item));
    }, [shortlistIds]);

    const hasActiveFilters = selectedTime !== 'all' || selectedMood !== 'all' || searchQuery.trim().length > 0;

    const clearAllFilters = () => {
      setSelectedTime('all');
      setSelectedMood('all');
      setSearchQuery('');
    };

    return (
            <div className="relative min-h-screen bg-[#0B0C0E] text-[#F8FAFC] selection:bg-[#E50914]/30 selection:text-white">
              {/* 1. Dynamic Ambient Cinema Glow */}
              <AmbientGlow dominantColor={activeGlowColor} />

              {/* 2. Sticky Glass Header & Anti-Fatigue Filter Ribbon */}
              <Navbar
                activeProfileIds={activeProfileIds}
                onToggleProfile={toggleProfile}
                shortlistCount={shortlistIds.length}
                onOpenShortlist={() => setIsShortlistOpen(true)}
                onOpenPickForUs={() => setIsPickForUsOpen(true)}
                currentTimeBadge={timeContext.timeSlotBadge}
                simulatedHour={simulatedHour}
                onSelectTimeSimulation={(h) => setSimulatedHour(h)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />

              <AntiFatigueRibbon
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
                onOpenPickForUs={() => setIsPickForUsOpen(true)}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearAllFilters}
                totalMatchesCount={filteredCatalog.length}
              />

              <main className="relative z-10">
                {/* 3. Hero Billboard Stage (Full bleed, 78vh) */}
                {!hasActiveFilters && (
                  <HeroBillboard
                    item={activeHero}
                    featuredItems={featuredHeroTitles}
                    currentIndex={heroIndex}
                    onSelectIndex={setHeroIndex}
                    onPlay={(item) => setActiveVideoItem(item)}
                    onToggleShortlist={toggleShortlist}
                    isInShortlist={shortlistIds.includes(activeHero.id)}
                    onOpenDetails={(item) => setDetailItem(item)}
                    referenceTime={referenceTime}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                  />
                )}

                {/* Co-Watching Taste Blender Banner */}
                <BlenderBanner
                  synthesis={blenderSynthesis}
                  onResetToSingle={() => setActiveProfileIds(['alex'])}
                />

                {/* Filter Results Headline if active */}
                {hasActiveFilters && (
                  <div className="max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-4">
                    <h2 className="font-display font-extrabold text-2xl text-white">
                      Showing {filteredCatalog.length} curated {filteredCatalog.length === 1 ? 'title' : 'titles'}
                    </h2>
                    <p className="text-xs text-white/50 mt-1">
                      Filtered for zero decision fatigue: matching your active time, mood, and search criteria.
                    </p>
                  </div>
                )}

                {/* 4. Overlapping Swimlane Stack */}
                <div className={!hasActiveFilters ? "-mt-24 sm:-mt-28 relative z-20" : ""}>
                  {/* Continue Watching with 15-Sec Story Recap */}
                  {!hasActiveFilters && (
                    <ContinueWatchingRow
                      items={continueWatchingItems}
                      onPlay={(item) => setActiveVideoItem(item)}
                      onOpenDetails={(item) => setDetailItem(item)}
                      onToggleShortlist={toggleShortlist}
                      shortlistIds={shortlistIds}
                      referenceTime={referenceTime}
                    />
                  )}

                  {/* Dynamic Carousel Rows (Orchestrated by Time of Day & Household Blender) */}
                  {timeContext.recommendedCategoryOrder.map((catId) => {
                    const catDef = CATEGORY_DEFINITIONS.find(c => c.id === catId);
                    if (!catDef || catId === 'continue-watching') return null;

                    // Handle special Co-Watch Shared Taste row
                    if (catId === 'shared-taste') {
                      if (activeProfileIds.length <= 1) return null; // Only show if co-watching
                      const sharedItems = blenderSynthesis.blendedTitles.slice(0, 8).map(t => t.title);
                      return (
                        <HorizontalSwimlane
                          key={catId}
                          id={catId}
                          title={`Shared Harmony (${blenderSynthesis.profileNamesFormatted})`}
                          subtitle={`Consensus titles calibrated with zero spoilers and high mutual enjoyment`}
                          items={sharedItems}
                          iconName={catDef.icon}
                          jointScores={jointScoresMap}
                          onPlay={(item) => setActiveVideoItem(item)}
                          onToggleShortlist={toggleShortlist}
                          shortlistIds={shortlistIds}
                          onOpenDetails={(item) => setDetailItem(item)}
                          onHoverCard={setHoveredCard}
                          referenceTime={referenceTime}
                        />
                      );
                    }

                    // Normal Category Swimlanes filtered by active filters
                    const itemsInCat = filteredCatalog.filter(item => {
                      if (catId === 'household-top10') return Boolean(item.isTop10);
                      return item.categories.includes(catId);
                    });

                    if (itemsInCat.length === 0) return null;

                    return (
                      <HorizontalSwimlane
                        key={catId}
                        id={catId}
                        title={catDef.title}
                        subtitle={catDef.subtitle}
                        items={itemsInCat}
                        iconName={catDef.icon}
                        jointScores={jointScoresMap}
                        onPlay={(item) => setActiveVideoItem(item)}
                        onToggleShortlist={toggleShortlist}
                        shortlistIds={shortlistIds}
                        onOpenDetails={(item) => setDetailItem(item)}
                        onHoverCard={setHoveredCard}
                        referenceTime={referenceTime}
                        isRanked={catId === 'household-top10'}
                      />
                    );
                  })}
                </div>
              </main>

              {/* FOOTER */}
              <footer className="mt-20 border-t border-white/10 py-12 px-4 sm:px-8 lg:px-12 max-w-[1760px] mx-auto text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white tracking-wider">VELVET STREAM</span>
                  <span>•</span>
                  <span>Human-Centric Zero-Fatigue Cinema</span>
                </div>
                <div>
                  <span>Crafted with ambient dynamic backlighting & spoiler-locked memory recall.</span>
                </div>
            </footer>

            {/* MODALS & DRAWERS */}
            {/* 1. "Pick For Us" 3-Card Showdown Modal */}
            <PickForUsModal
              isOpen={isPickForUsOpen}
              onClose={() => setIsPickForUsOpen(false)}
              catalog={filteredCatalog.length >= 3 ? filteredCatalog : MEDIA_CATALOG}
              onPlay={(item) => setActiveVideoItem(item)}
              onToggleShortlist={toggleShortlist}
              shortlistIds={shortlistIds}
              referenceTime={referenceTime}
            />

            {/* 2. Tonight's Shortlist Queue Drawer */}
            <ShortlistDrawer
              isOpen={isShortlistOpen}
              onClose={() => setIsShortlistOpen(false)}
              shortlistItems={shortlistItems}
              onRemoveItem={removeItemFromShortlist}
              onClearAll={clearShortlist}
              onPlay={(item) => setActiveVideoItem(item)}
              referenceTime={referenceTime}
            />

          {/* 3. Detail & Pacing Modal */}
          <DetailModal
            item={detailItem}
            isOpen={Boolean(detailItem)}
            onClose={() => setDetailItem(null)}
            onPlay={(item) => setActiveVideoItem(item)}
            onToggleShortlist={toggleShortlist}
            isInShortlist={detailItem ? shortlistIds.includes(detailItem.id) : false}
            referenceTime={referenceTime}
          />

          {/* 4. Full-Screen Interactive Video Player Modal */}
          <VideoPlayerModal
            item={activeVideoItem}
            isOpen={Boolean(activeVideoItem)}
            onClose={() => setActiveVideoItem(null)}
            referenceTime={referenceTime}
          />
        </div>
        );
};

        export default App;
