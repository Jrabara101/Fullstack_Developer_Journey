import React, { useState, useMemo } from 'react';
import CardItem from './CardItem';
import InspectChamber from './InspectChamber';
import { sounds } from '../utils/soundEffects';

export default function BinderView({
  allCards,
  inventory,
  metrics,
  selectedCard,
  onSelectCard,
  onOpenInspect,
  onCloseInspect,
  onListMarketplace,
  onAssignDeck,
  activeDeck,
  onOpenPacks,
  onLiquidateDuplicates
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rarity-desc');
  const [viewMode, setViewMode] = useState('4-grid'); // '4-grid', 'dense', '3x3-book'
  const [holoEnabled, setHoloEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = viewMode === '3x3-book' ? 9 : 24;

  // Inventory Map for quick lookup
  const inventoryMap = useMemo(() => {
    const map = new Map();
    inventory.forEach(inv => {
      map.set(inv.cardId, inv);
    });
    return map;
  }, [inventory]);

  // Combine full series roster with ownership status
  const roster = useMemo(() => {
    return allCards.map((card, idx) => {
      const owned = inventoryMap.get(card.id);
      return {
        card,
        ownedData: owned || null,
        isOwned: !!owned,
        slotNumber: card.number || String(idx + 1).padStart(3, '0')
      };
    });
  }, [allCards, inventoryMap]);

  // Filter and Sort
  const filteredRoster = useMemo(() => {
    let list = roster.filter(({ card, isOwned }) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = card.name.toLowerCase().includes(q);
        const matchElement = card.element?.toLowerCase().includes(q);
        const matchType = card.type?.toLowerCase().includes(q);
        const matchNum = card.number?.toLowerCase().includes(q);
        if (!matchName && !matchElement && !matchType && !matchNum) return false;
      }
      // Rarity
      if (rarityFilter !== 'All') {
        if (card.rarity !== rarityFilter) return false;
      }
      return true;
    });

    // Sorting
    const rarityRank = { 'Mythic': 5, 'Legendary': 4, 'Epic': 3, 'Rare': 2, 'Uncommon': 1, 'Common': 0 };

    list.sort((a, b) => {
      if (sortBy === 'rarity-desc') {
        return (rarityRank[b.card.rarity] || 0) - (rarityRank[a.card.rarity] || 0);
      }
      if (sortBy === 'rarity-asc') {
        return (rarityRank[a.card.rarity] || 0) - (rarityRank[b.card.rarity] || 0);
      }
      if (sortBy === 'atk-desc') {
        return (b.card.atk || 0) - (a.card.atk || 0);
      }
      if (sortBy === 'def-desc') {
        return (b.card.def || 0) - (a.card.def || 0);
      }
      if (sortBy === 'mana-asc') {
        return (a.card.mana || 0) - (b.card.mana || 0);
      }
      // Default: slot number
      return parseInt(a.slotNumber) - parseInt(b.slotNumber);
    });

    return list;
  }, [roster, searchQuery, rarityFilter, sortBy]);

  // Pagination for 3x3 Book or large sets
  const totalPages = Math.ceil(filteredRoster.length / cardsPerPage) || 1;
  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredRoster.slice(start, start + cardsPerPage);
  }, [filteredRoster, currentPage, cardsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      sounds.playCardFlip();
      setCurrentPage(newPage);
    }
  };

  const rarityPills = [
    { label: 'All', count: allCards.length },
    { label: 'Mythic', count: allCards.filter(c => c.rarity === 'Mythic').length, color: 'text-tertiary', dot: true },
    { label: 'Legendary', count: allCards.filter(c => c.rarity === 'Legendary').length, color: 'text-secondary' },
    { label: 'Epic', count: allCards.filter(c => c.rarity === 'Epic').length, color: 'text-primary' },
    { label: 'Rare', count: allCards.filter(c => c.rarity === 'Rare').length, color: 'text-on-surface-variant' },
    { label: 'Common', count: allCards.filter(c => c.rarity === 'Common').length, color: 'text-on-surface-variant' }
  ];

  const selectedCardOwnedData = selectedCard ? inventoryMap.get(selectedCard.id) : null;
  const isSelectedInDeck = selectedCard ? activeDeck?.includes(selectedCard.id) : false;

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 1. TOP COLLECTOR PORTFOLIO & METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Stat 1: Collection Progress */}
        <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group border border-surface-container-highest/60">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Vault Registry
            </span>
            <span className="bg-primary/15 text-primary text-[11px] font-mono px-2 py-0.5 rounded font-bold">
              Series 1 Genesis
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-display">
              <span className="text-3xl font-bold text-on-surface">{metrics.uniqueOwned}</span>
              <span className="text-sm font-sans text-on-surface-variant">/ {metrics.totalCardsInSeries}</span>
            </div>
            <span className="font-mono text-xs font-bold text-primary">{metrics.syncPercentage}% Sync</span>
          </div>
          {/* Progress track */}
          <div className="w-full bg-surface-container-highest h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-container via-primary to-secondary h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.syncPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 2: Vault Appraisal */}
        <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group border border-surface-container-highest/60">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Est. Vault Appraisal
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">trending_up</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5 font-display">
              <span className="text-3xl font-bold text-on-surface">{metrics.totalEth}</span>
              <span className="font-mono text-sm text-tertiary font-bold">ETH</span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono mt-1">
              ≈ ${metrics.totalUsd} USD <span className="text-primary font-bold ml-1">+8.4% 7d</span>
            </p>
          </div>
        </div>

        {/* Stat 3: Apex Tier Rarity */}
        <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group border border-surface-container-highest/60">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary/15 rounded-full blur-2xl group-hover:bg-secondary/25 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Mythic & Legendary
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">stars</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-display">
              <span className="text-3xl font-bold text-on-surface">
                {(metrics.mythicCount || 0) + (metrics.legendaryCount || 0)}
              </span>
              <span className="text-xs text-on-surface-variant">Cards</span>
            </div>
            <div className="flex gap-1.5 font-mono text-[10px] font-bold">
              <span className="bg-tertiary/20 text-tertiary px-2 py-0.5 rounded">
                {metrics.mythicCount || 0} Mythic
              </span>
              <span className="bg-secondary-container/40 text-secondary px-2 py-0.5 rounded">
                {metrics.legendaryCount || 0} Legend
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Holographic Sheen & Duplicates */}
        <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group border border-surface-container-highest/60">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Holographic Matrices
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-display">
              <span className="text-3xl font-bold text-on-surface">{metrics.holoCount}</span>
              <span className="text-xs text-on-surface-variant">Foil Editions</span>
            </div>
            {metrics.duplicatesCount > 0 ? (
              <button
                onClick={onLiquidateDuplicates}
                className="font-mono text-[10px] bg-primary/15 text-primary hover:bg-primary/25 px-2 py-0.5 rounded transition-colors font-bold"
                title="Quick Liquidate Duplicate Cards"
              >
                {metrics.duplicatesCount} Dups (Liquidate)
              </button>
            ) : (
              <span className="font-mono text-[10px] text-on-surface-variant">No Duplicates</span>
            )}
          </div>
        </div>

      </div>

      {/* 2. CONTROLS BAR: SEARCH, RARITY CHIPS, VIEW MODE, HOLO TOGGLE */}
      <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl border border-surface-container-highest/60">
        
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search card by name, element, attribute, or slot #..."
            className="w-full bg-surface-container-high text-on-surface placeholder:text-on-surface-variant font-sans text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-transparent focus:border-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Rarity Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {rarityPills.map(pill => {
            const isSelected = rarityFilter === pill.label;
            return (
              <button
                key={pill.label}
                onClick={() => {
                  sounds.playClick();
                  setRarityFilter(pill.label);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary/20 text-primary font-bold border border-primary/40 shadow-[0_0_12px_rgba(76,215,246,0.25)]'
                    : 'bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                }`}
              >
                {pill.dot && <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>}
                <span>{pill.label}</span>
                <span className="opacity-70 text-[10px]">({pill.count})</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Sort, Holo Toggle, View Switcher */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-surface-container-highest">
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-mono text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">swap_vert</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-on-surface focus:outline-none cursor-pointer text-xs"
            >
              <option value="rarity-desc" className="bg-surface-container-high">Rarity: High → Low</option>
              <option value="rarity-asc" className="bg-surface-container-high">Rarity: Low → High</option>
              <option value="atk-desc" className="bg-surface-container-high">Power (ATK) ↓</option>
              <option value="def-desc" className="bg-surface-container-high">Armor (DEF) ↓</option>
              <option value="mana-asc" className="bg-surface-container-high">Mana Cost ↑</option>
              <option value="slot-asc" className="bg-surface-container-high">Slot Number</option>
            </select>
          </div>

          {/* Holo Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={holoEnabled}
              onChange={(e) => setHoloEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-container relative"></div>
            <span className="font-mono text-[11px] text-on-surface-variant hidden sm:inline">Holo</span>
          </label>

          {/* View Mode Switcher */}
          <div className="bg-surface-container-highest p-0.5 rounded-xl flex items-center border border-outline-variant/20">
            <button
              onClick={() => setViewMode('4-grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === '4-grid' ? 'bg-surface-container text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Responsive 4-Grid"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('dense')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'dense' ? 'bg-surface-container text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Dense Tile Matrix"
            >
              <span className="material-symbols-outlined text-[18px]">view_comfy</span>
            </button>
            <button
              onClick={() => {
                setViewMode('3x3-book');
                setCurrentPage(1);
              }}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === '3x3-book' ? 'bg-surface-container text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Physical 3x3 Binder Book (9 cards/page)"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. MAIN DYNAMIC AREA: CARD BINDER MATRIX & INTERACTIVE INSPECTION CHAMBER */}
      <div className="flex flex-col lg:flex-row gap-6 items-start relative">
        
        {/* Binder Grid Area */}
        <div className="flex-1 w-full flex flex-col gap-4">
          
          {/* View Mode Notification & Pagination Header */}
          {viewMode === '3x3-book' && (
            <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-highest flex items-center justify-between font-mono text-xs">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                <span>Physical Binder Book: Page {currentPage} of {totalPages} (9 Slots)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright disabled:opacity-30 text-on-surface flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span> Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright disabled:opacity-30 text-on-surface flex items-center gap-1"
                >
                  Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          {/* Card Items Grid */}
          <div
            className={`grid gap-4 ${
              viewMode === '3x3-book'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : viewMode === 'dense'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            }`}
          >
            {paginatedRoster.map(({ card, ownedData, isOwned, slotNumber }) => {
              const isSelected = selectedCard?.id === card.id;

              return (
                <CardItem
                  key={card.id}
                  card={card}
                  ownedData={ownedData}
                  isLocked={!isOwned}
                  slotNumber={slotNumber}
                  isSelected={isSelected}
                  onSelect={() => onSelectCard(card)}
                  showHolo={holoEnabled}
                />
              );
            })}
          </div>

          {paginatedRoster.length === 0 && (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-surface-container-highest">
              <span className="material-symbols-outlined text-outline text-[48px]">search_off</span>
              <p className="font-mono text-sm text-on-surface mt-2 font-bold">No cards match the active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRarityFilter('All');
                }}
                className="mt-3 text-xs font-mono text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Book View Bottom Page Navigation */}
          {viewMode === '3x3-book' && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(76,215,246,0.3)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Slide-out Inspection Chamber Drawer */}
        {selectedCard && (
          <InspectChamber
            card={selectedCard}
            ownedData={selectedCardOwnedData}
            onClose={onCloseInspect}
            onListMarketplace={onListMarketplace}
            onAssignDeck={onAssignDeck}
            isInDeck={isSelectedInDeck}
          />
        )}

      </div>

    </div>
  );
}
