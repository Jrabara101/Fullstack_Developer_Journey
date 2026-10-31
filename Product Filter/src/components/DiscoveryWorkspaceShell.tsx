import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterQueryState, SearchResponsePayload, ProductItem } from '../types';
import { DEFAULT_FILTER_STATE, decodeFilterStateFromURL, syncURL } from '../utils/urlSync';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { IntentSearchHeader } from './IntentSearchHeader';
import { PriorityAlchemistRibbon } from './PriorityAlchemistRibbon';
import { ActiveFilterBreadcrumbBar } from './ActiveFilterBreadcrumbBar';
import { FacetSidebarDock } from './FacetSidebarDock';
import { NearMissRecoveryBanner } from './NearMissRecoveryBanner';
import { VirtualizedProductGrid } from './VirtualizedProductGrid';
import { VirtualizedSpecTableView } from './VirtualizedSpecTableView';
import { FloatingComparisonDock } from './FloatingComparisonDock';
import { SpecDiffComparisonModal } from './SpecDiffComparisonModal';
import { ProductQuickLookSheet } from './ProductQuickLookSheet';
import { ShortlistModal } from './ShortlistModal';
import {
  Compass,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  Bookmark,
  Share2,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';

export const DiscoveryWorkspaceShell: React.FC = () => {
  // 1. Initial State from URL params
  const [filterState, setFilterState] = useState<FilterQueryState>(() => {
    if (typeof window !== 'undefined') {
      return decodeFilterStateFromURL(new URLSearchParams(window.location.search));
    }
    return DEFAULT_FILTER_STATE;
  });

  const {
    viewMode,
    setViewMode,
    savedPresets,
    setShortlistModalOpen,
    comparisonItems,
    addComparisonItem,
    clearComparison,
  } = useDiscoveryStore();

  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false);
  const [presetsDropdownOpen, setPresetsDropdownOpen] = useState(false);

  // 2. Check for shortlist URL parameter on mount (e.g. ?shortlist=PRO77X)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shortlistCode = params.get('shortlist');
    if (shortlistCode) {
      fetch(`/api/shortlists/${shortlistCode.toUpperCase()}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.filterState) {
            setFilterState(data.filterState);
          }
          if (data.comparisonItemIds && data.comparisonItemIds.length > 0) {
            // comparison item hydration
          }
        })
        .catch((e) => console.error('Failed to hydrate shortlist from URL', e));
    }
  }, []);

  // 3. Bi-directional URL synchronization
  useEffect(() => {
    syncURL(filterState);
  }, [filterState]);

  // 4. TanStack Query for debounced, flicker-free server-state fetching
  const { data: searchData, isFetching } = useQuery<SearchResponsePayload>({
    queryKey: ['products-search', filterState],
    queryFn: async () => {
      const res = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterState),
      });
      if (!res.ok) throw new Error('Failed to query products search engine');
      return res.json();
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60, // 1 min
  });

  const products = searchData?.items || [];
  const totalMatched = searchData?.totalMatched ?? 0;
  const executionLatencyMs = searchData?.executionTimeMs ?? 8;
  const parsedIntentTokens = searchData?.parsedIntentTokens || [];
  const nearMissSuggestions = searchData?.nearMissSuggestions;

  const defaultFacets = {
    categories: [],
    brands: [],
    dynamicSpecs: {},
    priceHistogram: [],
    ratingBuckets: [],
  };
  const facets = searchData?.facets || defaultFacets;

  // Filter mutation helpers
  const handleFilterPatch = (patch: Partial<FilterQueryState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  };

  const handleResetAll = () => {
    setFilterState(DEFAULT_FILTER_STATE);
  };

  const handleHydrateShortlist = (newState: FilterQueryState, comparisonIds: string[]) => {
    setFilterState(newState);
    if (comparisonIds && comparisonIds.length > 0) {
      clearComparison();
      // Look up items from currently fetched products
      comparisonIds.forEach((id) => {
        const found = products.find((p) => p.id === id);
        if (found) addComparisonItem(found);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-cyan-300">
      {/* 1. Top Intent & Command Bar (Sticky Header) */}
      <header className="sticky top-0 z-30 bg-[#0F131D]/90 backdrop-blur-xl border-b border-[#1E2638] shadow-specular">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Brand Mark & Live Catalog Counter */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-white">
                  ATELIER
                </span>
                <span className="text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  DISCOVERY DECK
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>64 SKUs Indexed • {executionLatencyMs}ms</span>
              </div>
            </div>
          </div>

          {/* Center: Natural-Language Intent-to-Facet Command Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <IntentSearchHeader
              query={filterState.q}
              onQueryChange={(q) => handleFilterPatch({ q })}
              parsedTokens={parsedIntentTokens}
              onRemoveToken={(tok) => {
                // If user removes intent token pill
                if (tok.field === 'priceRangeCents') {
                  handleFilterPatch({ priceRangeCents: [5000, 450000] });
                } else if (tok.field === 'categories') {
                  handleFilterPatch({ categories: [] });
                } else if (tok.field.startsWith('specs.')) {
                  handleFilterPatch({ specFilters: {} });
                }
              }}
              executionLatencyMs={executionLatencyMs}
              totalIndexed={64}
            />
          </div>

          {/* Right Controls: Presets, Sort, View Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Presets Dropdown */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setPresetsDropdownOpen(!presetsDropdownOpen)}
                className="text-xs font-mono px-3 py-2 rounded-xl bg-[#171D2B] hover:bg-[#20283A] text-slate-300 border border-[#1E2638] flex items-center gap-1.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saved Presets</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {presetsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F131D] border border-[#1E2638] rounded-xl shadow-2xl p-2 z-40 backdrop-blur-xl animate-fade-in">
                  <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">
                    Custom Discovery Presets
                  </div>
                  {savedPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setFilterState(preset.filterState);
                        setPresetsDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-200 hover:text-cyan-300 hover:bg-[#171D2B] transition-colors truncate"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative flex items-center bg-[#171D2B] border border-[#1E2638] rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <select
                value={filterState.sortBy}
                onChange={(e) => handleFilterPatch({ sortBy: e.target.value as any })}
                aria-label="Sort products by"
                className="bg-transparent outline-none cursor-pointer text-xs font-mono text-slate-100"
              >
                <option value="FIT_SCORE" className="bg-[#0F131D]">
                  Best Fit Match ⚡
                </option>
                <option value="PRICE_ASC" className="bg-[#0F131D]">
                  Price: Low to High
                </option>
                <option value="PRICE_DESC" className="bg-[#0F131D]">
                  Price: High to Low
                </option>
                <option value="RATING_DESC" className="bg-[#0F131D]">
                  Critic & User Rating
                </option>
                <option value="BEST_DEAL" className="bg-[#0F131D]">
                  Verified Historical Deals
                </option>
              </select>
            </div>

            {/* View Mode Segmented Switch: [⊞ Bento Grid] | [≡ Spec Table] */}
            <div className="flex items-center bg-[#171D2B] border border-[#1E2638] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bento Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-mono">Bento</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="High-Density Spec Table View"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-mono">Spec Table</span>
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#171D2B] text-slate-300 border border-[#1E2638]"
              title="Open Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="md:hidden px-4 pb-3">
          <IntentSearchHeader
            query={filterState.q}
            onQueryChange={(q) => handleFilterPatch({ q })}
            parsedTokens={parsedIntentTokens}
            executionLatencyMs={executionLatencyMs}
            totalIndexed={64}
          />
        </div>
      </header>

      {/* 2. Priority Alchemist Multi-Axis Ribbon */}
      <PriorityAlchemistRibbon
        weights={filterState.priorityWeights}
        onChange={(weights) => handleFilterPatch({ priorityWeights: weights })}
        historicalLowOnly={filterState.historicalLowOnly}
        onToggleHistoricalLow={(historicalLowOnly) => handleFilterPatch({ historicalLowOnly })}
      />

      {/* 3. Active Filter Breadcrumb Bar */}
      <ActiveFilterBreadcrumbBar
        filterState={filterState}
        onFilterChange={handleFilterPatch}
        onResetAll={handleResetAll}
        totalMatched={totalMatched}
      />

      {/* 4. Main Split Discovery Workspace */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto flex overflow-hidden">
        {/* Left Facet Sidebar Dock (Desktop) */}
        <div className="hidden md:block">
          <FacetSidebarDock
            filterState={filterState}
            onFilterChange={handleFilterPatch}
            facets={facets}
          />
        </div>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-start md:hidden">
            <div className="w-80 bg-[#0F131D] h-full overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2638] mb-4">
                  <span className="font-mono text-sm font-bold text-white">FILTERS & SPEC BAY</span>
                  <button onClick={() => setMobileFilterDrawerOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FacetSidebarDock
                  filterState={filterState}
                  onFilterChange={handleFilterPatch}
                  facets={facets}
                />
              </div>
              <button
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="w-full mt-4 py-2.5 bg-indigo-600 font-mono text-xs font-semibold text-white rounded-xl"
              >
                Apply & View ({totalMatched} Matches)
              </button>
            </div>
          </div>
        )}

        {/* Center Catalog Viewport */}
        <section className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
          {/* Near-Miss Elastic Recovery Banner */}
          <NearMissRecoveryBanner
            suggestions={nearMissSuggestions}
            onApplyPatch={handleFilterPatch}
            totalMatched={totalMatched}
          />

          {/* Zero Results Feedback if no matches */}
          {products.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0F131D] border border-dashed border-[#1E2638] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-base text-white">
                Zero Direct Matches for This Filter Combination
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 font-sans">
                Try clicking the Near-Miss relaxation suggestions above or reset your price and attribute constraints.
              </p>
              <button
                onClick={handleResetAll}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <VirtualizedProductGrid items={products} />
          ) : (
            <VirtualizedSpecTableView items={products} />
          )}
        </section>
      </main>

      {/* Floating Bottom Comparison Dock */}
      <FloatingComparisonDock />

      {/* Spec-Diff Comparison Modal */}
      <SpecDiffComparisonModal />

      {/* Product QuickLook Slide-over Sheet */}
      <ProductQuickLookSheet products={products} />

      {/* Shortlist Snapshot Modal */}
      <ShortlistModal
        filterState={filterState}
        onHydrateShortlist={handleHydrateShortlist}
      />
    </div>
  );
};
