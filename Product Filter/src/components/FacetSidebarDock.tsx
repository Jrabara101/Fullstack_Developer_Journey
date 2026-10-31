import React, { useState } from 'react';
import { FilterQueryState, FacetBucket } from '../types';
import { PriceHistogramSlider } from './PriceHistogramSlider';
import { Search, ChevronDown, ChevronRight, Star, Check, CheckSquare, Square, Layers, ShieldCheck } from 'lucide-react';

interface FacetSidebarDockProps {
  filterState: FilterQueryState;
  onFilterChange: (patch: Partial<FilterQueryState>) => void;
  facets: {
    categories: FacetBucket[];
    brands: FacetBucket[];
    dynamicSpecs: Record<string, FacetBucket[]>;
    priceHistogram: { minCents: number; maxCents: number; count: number }[];
    ratingBuckets: { minStars: number; count: number }[];
  };
}

export const FacetSidebarDock: React.FC<FacetSidebarDockProps> = ({
  filterState,
  onFilterChange,
  facets,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [openSections, setOpenSections] = useState({
    price: true,
    categories: true,
    brands: true,
    ratings: true,
    specs: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredBrands = facets.brands.filter((b) =>
    b.label.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleToggleCategory = (cat: string) => {
    const isSelected = filterState.categories.includes(cat);
    const updated = isSelected
      ? filterState.categories.filter((c) => c !== cat)
      : [...filterState.categories, cat];
    onFilterChange({ categories: updated });
  };

  const handleToggleBrand = (brand: string) => {
    const isSelected = filterState.brands.includes(brand);
    const updated = isSelected
      ? filterState.brands.filter((b) => b !== brand)
      : [...filterState.brands, brand];
    onFilterChange({ brands: updated });
  };

  const handleToggleSpec = (key: string, value: string | boolean) => {
    const cur = filterState.specFilters[key] || [];
    const isSelected = cur.includes(value);
    const updated = isSelected
      ? cur.filter((v) => v !== value)
      : [...cur, value];

    const nextSpecFilters = { ...filterState.specFilters };
    if (updated.length > 0) {
      nextSpecFilters[key] = updated;
    } else {
      delete nextSpecFilters[key];
    }
    onFilterChange({ specFilters: nextSpecFilters });
  };

  return (
    <aside className="w-72 lg:w-80 shrink-0 bg-[#0F131D] border-r border-[#1E2638] h-[calc(100vh-120px)] sticky top-[120px] overflow-y-auto p-4 space-y-6">
      {/* 1. Price Distribution Section */}
      <div className="border-b border-[#1E2638] pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider mb-3"
        >
          <span>PRICE SPECTRUM</span>
          {openSections.price ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {openSections.price && (
          <PriceHistogramSlider
            histogram={facets.priceHistogram}
            priceRangeCents={filterState.priceRangeCents}
            onChange={(range) => onFilterChange({ priceRangeCents: range })}
          />
        )}
      </div>

      {/* 2. Categories Accordion Group */}
      <div className="border-b border-[#1E2638] pb-5">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> CATEGORIES
          </span>
          {openSections.categories ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.categories && (
          <div className="space-y-1 mt-2">
            {facets.categories.map((cat) => {
              const active = filterState.categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => handleToggleCategory(cat.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all text-left ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 font-medium'
                      : 'text-slate-300 hover:bg-[#171D2B] hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-2">
                    [{cat.count}]
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Brands Searchable Checklist */}
      <div className="border-b border-[#1E2638] pb-5">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider mb-2"
        >
          <span>MANUFACTURER / BRAND</span>
          {openSections.brands ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.brands && (
          <div className="space-y-2 mt-2">
            {/* Search within brand */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full bg-[#080A0F] border border-[#1E2638] rounded-md pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Brand Checklist with Disjunctive Counts */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredBrands.map((b) => {
                const active = filterState.brands.includes(b.value);
                return (
                  <button
                    key={b.value}
                    onClick={() => handleToggleBrand(b.value)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-[#171D2B] transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {active ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{b.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-1">
                      [{b.count}]
                    </span>
                  </button>
                );
              })}
              {filteredBrands.length === 0 && (
                <div className="text-[11px] font-mono text-slate-500 py-2 text-center">
                  No matching brands
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Minimum Customer Review Stars */}
      <div className="border-b border-[#1E2638] pb-5">
        <button
          onClick={() => toggleSection('ratings')}
          className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider mb-2"
        >
          <span>CRITIC & USER RATING</span>
          {openSections.ratings ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.ratings && (
          <div className="space-y-1 mt-2">
            {[4.8, 4.5, 4.0].map((stars) => {
              const active = filterState.minRating === stars;
              const bucket = facets.ratingBuckets.find((r) => r.minStars === stars);
              return (
                <button
                  key={stars}
                  onClick={() => onFilterChange({ minRating: active ? 0 : stars })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-600/40 font-medium'
                      : 'text-slate-300 hover:bg-[#171D2B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-mono">{stars}+ Stars</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    [{bucket?.count ?? 0}]
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Dynamic Technical Specs & Features */}
      <div>
        <button
          onClick={() => toggleSection('specs')}
          className="w-full flex items-center justify-between text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> TECHNICAL SPECS
          </span>
          {openSections.specs ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.specs && (
          <div className="space-y-3 mt-2">
            {/* Waterproof spec */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Weatherproofing</span>
              {facets.dynamicSpecs.waterproof?.map((spec) => {
                const isSelected = (filterState.specFilters.waterproof || []).includes(true);
                return (
                  <button
                    key={spec.value}
                    onClick={() => handleToggleSpec('waterproof', true)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-[#171D2B] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span>{spec.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">[{spec.count}]</span>
                  </button>
                );
              })}
            </div>

            {/* Fit profile */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Fit & Ergonomics</span>
              {facets.dynamicSpecs.fit?.map((spec) => {
                const isSelected = (filterState.specFilters.fit || []).includes(spec.value);
                return (
                  <button
                    key={spec.value}
                    onClick={() => handleToggleSpec('fit', spec.value)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-[#171D2B] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span>{spec.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">[{spec.count}]</span>
                  </button>
                );
              })}
            </div>

            {/* Wireless Connectivity */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Connectivity</span>
              {facets.dynamicSpecs.wireless?.map((spec) => {
                const isSelected = (filterState.specFilters.wireless || []).includes('wireless');
                return (
                  <button
                    key={spec.value}
                    onClick={() => handleToggleSpec('wireless', 'wireless')}
                    className="w-full flex items-center justify-between px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-[#171D2B] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span>{spec.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">[{spec.count}]</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
