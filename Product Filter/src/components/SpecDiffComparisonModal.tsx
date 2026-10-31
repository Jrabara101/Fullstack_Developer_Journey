import React, { useState } from 'react';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { RadarChart } from './RadarChart';
import { X, Trophy, Check, Zap, Eye, ShoppingCart } from 'lucide-react';

export const SpecDiffComparisonModal: React.FC = () => {
  const { comparisonItems, isComparisonModalOpen, setComparisonModalOpen, removeComparisonItem } = useDiscoveryStore();
  const [diffOnly, setDiffOnly] = useState(false);

  if (!isComparisonModalOpen || comparisonItems.length === 0) return null;

  // Compile list of all distinct spec keys across compared items
  const allSpecKeys = Array.from(
    new Set(comparisonItems.flatMap((item) => Object.keys(item.specs)))
  ).sort();

  // Determine winners for key metrics
  const minPriceId = [...comparisonItems].sort((a, b) => a.basePriceCents - b.basePriceCents)[0]?.id;
  const maxRatingId = [...comparisonItems].sort((a, b) => b.ratingAverage - a.ratingAverage)[0]?.id;
  const maxFitId = [...comparisonItems].sort((a, b) => (b.fitMatchPercent || 0) - (a.fitMatchPercent || 0))[0]?.id;

  // Lightest weight winner
  const itemsWithWeight = comparisonItems.filter((i) => typeof i.specs.weightGrams === 'number');
  const lightestWeightId = itemsWithWeight.length > 1
    ? [...itemsWithWeight].sort((a, b) => Number(a.specs.weightGrams) - Number(b.specs.weightGrams))[0]?.id
    : undefined;

  // Highest battery winner
  const itemsWithBattery = comparisonItems.filter((i) => typeof i.specs.batteryHours === 'number');
  const maxBatteryId = itemsWithBattery.length > 1
    ? [...itemsWithBattery].sort((a, b) => Number(b.specs.batteryHours) - Number(a.specs.batteryHours))[0]?.id
    : undefined;

  // Best performance score winner
  const maxPerfId = [...comparisonItems].sort((a, b) => b.normalizedScores.performance - a.normalizedScores.performance)[0]?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-7xl max-h-[92vh] bg-[#0F131D] border border-[#1E2638] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-[#1E2638] flex items-center justify-between bg-[#171D2B]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white">
                SPEC-DIFF COMPARISON MATRIX
              </h2>
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                {comparisonItems.length} Products Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side technical specification ledger with statistical winner detection.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Show Differences Only Switch */}
            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span>Show Differences Only</span>
            </label>

            <button
              onClick={() => setComparisonModalOpen(false)}
              className="p-1.5 rounded-lg bg-[#141A28] hover:bg-[#20283A] text-slate-400 hover:text-white transition-colors border border-[#1E2638]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            {/* Product Card Headers Column */}
            <div className="grid grid-cols-5 gap-4 pb-6 border-b border-[#1E2638]">
              {/* Left Column Spacer */}
              <div className="col-span-1 flex flex-col justify-end">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  SPECIFICATION ATTRIBUTE
                </span>
              </div>

              {/* Product Cards */}
              {comparisonItems.map((item) => (
                <div
                  key={item.id}
                  className="col-span-1 bg-[#171D2B] border border-[#1E2638] rounded-xl p-3 relative flex flex-col justify-between"
                >
                  <button
                    onClick={() => removeComparisonItem(item.id)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-full h-28 flex items-center justify-center p-2 mb-2">
                    <img
                      src={item.variants[0]?.imageUrl || item.studioAngles?.[0]}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold block">
                      {item.brand}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">
                      {item.title}
                    </h4>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        ${(item.basePriceCents / 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                        {item.fitMatchPercent || 90}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Charts Comparison Row */}
            <div className="grid grid-cols-5 gap-4 py-4 border-b border-[#1E2638] items-center">
              <div className="col-span-1 text-xs font-mono text-slate-400">
                5-Axis Spec Radar Balance
              </div>
              {comparisonItems.map((item) => (
                <div key={item.id} className="col-span-1 flex justify-center py-2 bg-[#121622] rounded-lg border border-[#1E2638]/50">
                  <RadarChart scores={item.normalizedScores} size={110} />
                </div>
              ))}
            </div>

            {/* Row 1: Base Price */}
            <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#1E2638] items-center text-xs font-mono">
              <div className="col-span-1 text-slate-400">Price (USD)</div>
              {comparisonItems.map((item) => {
                const isWinner = item.id === minPriceId && comparisonItems.length > 1;
                return (
                  <div
                    key={item.id}
                    className={`col-span-1 p-2 rounded-lg font-semibold ${
                      isWinner
                        ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500'
                        : 'text-slate-200'
                    }`}
                  >
                    ${(item.basePriceCents / 100).toFixed(2)}
                    {isWinner && <span className="ml-1 text-[10px] text-emerald-400 font-bold">★ Lowest</span>}
                  </div>
                );
              })}
            </div>

            {/* Row 2: Customer Rating */}
            <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#1E2638] items-center text-xs font-mono">
              <div className="col-span-1 text-slate-400">Average Rating</div>
              {comparisonItems.map((item) => {
                const isWinner = item.id === maxRatingId && comparisonItems.length > 1;
                return (
                  <div
                    key={item.id}
                    className={`col-span-1 p-2 rounded-lg ${
                      isWinner
                        ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500'
                        : 'text-slate-200'
                    }`}
                  >
                    ★ {item.ratingAverage.toFixed(1)} / 5.0 ({item.reviewCount})
                    {isWinner && <span className="ml-1 text-[10px] text-emerald-400 font-bold">★ Top Rated</span>}
                  </div>
                );
              })}
            </div>

            {/* Row 3: Fit Match % */}
            <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#1E2638] items-center text-xs font-mono">
              <div className="col-span-1 text-slate-400">Priority Fit Score</div>
              {comparisonItems.map((item) => {
                const isWinner = item.id === maxFitId && comparisonItems.length > 1;
                return (
                  <div
                    key={item.id}
                    className={`col-span-1 p-2 rounded-lg font-semibold ${
                      isWinner
                        ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500'
                        : 'text-slate-200'
                    }`}
                  >
                    {item.fitMatchPercent || 90}% Match
                    {isWinner && <span className="ml-1 text-[10px] text-emerald-400 font-bold">★ Best Fit</span>}
                  </div>
                );
              })}
            </div>

            {/* Row 4: Weight (Grams) */}
            {itemsWithWeight.length > 0 && (
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#1E2638] items-center text-xs font-mono">
                <div className="col-span-1 text-slate-400">Weight</div>
                {comparisonItems.map((item) => {
                  const val = item.specs.weightGrams;
                  const isWinner = item.id === lightestWeightId;
                  return (
                    <div
                      key={item.id}
                      className={`col-span-1 p-2 rounded-lg ${
                        isWinner
                          ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {val ? `${val}g` : '—'}
                      {isWinner && <span className="ml-1 text-[10px] text-emerald-400">★ Lightest</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dynamic Specification Rows */}
            {allSpecKeys
              .filter((k) => k !== 'weightGrams')
              .map((specKey) => {
                // Check if all items share the exact same value
                const values = comparisonItems.map((i) => String(i.specs[specKey] ?? '—'));
                const isDifferent = new Set(values).size > 1;

                if (diffOnly && !isDifferent) return null;

                return (
                  <div
                    key={specKey}
                    className="grid grid-cols-5 gap-4 py-3 border-b border-[#1E2638]/60 items-center text-xs font-mono"
                  >
                    <div className="col-span-1 text-slate-400 capitalize">
                      {specKey.replace(/([A-Z])/g, ' $1')}
                    </div>
                    {comparisonItems.map((item) => {
                      const val = item.specs[specKey];
                      const valStr = typeof val === 'boolean' ? (val ? 'Yes (Included)' : 'No') : val ? String(val) : '—';
                      return (
                        <div key={item.id} className="col-span-1 p-2 text-slate-200">
                          {valStr}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            {/* 5-Axis Score Breakdown */}
            <div className="mt-6 pt-4 border-t border-[#1E2638]">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                NORMALIZED 5-AXIS BENCHMARK SCORES (0 - 100)
              </span>
              {(['performance', 'portability', 'durability', 'efficiency', 'value'] as const).map((dim) => (
                <div key={dim} className="grid grid-cols-5 gap-4 py-2 border-b border-[#1E2638]/40 items-center text-xs font-mono">
                  <div className="col-span-1 text-slate-400 uppercase">{dim}</div>
                  {comparisonItems.map((item) => {
                    const score = item.normalizedScores[dim];
                    return (
                      <div key={item.id} className="col-span-1 p-1">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">{score}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#171D2B] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
