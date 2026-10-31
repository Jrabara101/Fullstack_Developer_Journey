import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductItem } from '../types';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { Check, Plus, Star, Eye, Zap } from 'lucide-react';

interface VirtualizedSpecTableViewProps {
  items: ProductItem[];
}

export const VirtualizedSpecTableView: React.FC<VirtualizedSpecTableViewProps> = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { comparisonItems, addComparisonItem, removeComparisonItem, setQuickLookProductId } = useDiscoveryStore();

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="w-full h-[calc(100vh-190px)] overflow-x-auto overflow-y-auto bg-[#0F131D] border border-[#1E2638] rounded-2xl shadow-specular"
    >
      <div className="min-w-[1100px]">
        {/* Table Header */}
        <div className="sticky top-0 z-20 bg-[#171D2B] border-b border-[#1E2638] text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center px-4 py-2.5">
          <div className="w-10">CMP</div>
          <div className="w-64">PRODUCT / BRAND</div>
          <div className="w-48">CATEGORY</div>
          <div className="w-32">FIT MATCH</div>
          <div className="w-32">BASE PRICE</div>
          <div className="w-24">WEIGHT</div>
          <div className="w-44">KEY SPECS</div>
          <div className="w-28">USER RATING</div>
          <div className="w-20 text-right">ACTION</div>
        </div>

        {/* Virtualized Rows */}
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const isCompared = comparisonItems.some((c) => c.id === item.id);
            const fitMatch = item.fitMatchPercent || 90;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={`absolute top-0 left-0 w-full flex items-center px-4 py-2 border-b border-[#1E2638]/70 hover:bg-[#141A28] transition-colors ${
                  isCompared ? 'bg-indigo-950/20' : ''
                }`}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {/* Checkbox */}
                <div className="w-10">
                  <button
                    onClick={() => (isCompared ? removeComparisonItem(item.id) : addComparisonItem(item))}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isCompared
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-600 hover:border-slate-400 bg-transparent'
                    }`}
                  >
                    {isCompared && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Product Thumbnail + Brand + Title */}
                <div className="w-64 flex items-center gap-3 pr-3">
                  <img
                    src={item.variants[0]?.imageUrl || item.studioAngles?.[0]}
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-contain bg-[#171D2B] p-1 border border-[#1E2638]"
                  />
                  <div className="truncate">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block font-semibold">
                      {item.brand}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 truncate block hover:text-cyan-300">
                      {item.title}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="w-48 text-xs font-mono text-slate-400 truncate pr-3">
                  <span className="text-slate-300">{item.subcategory}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{item.category}</span>
                </div>

                {/* Fit Match */}
                <div className="w-32">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      fitMatch >= 95
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    {fitMatch}%
                  </span>
                </div>

                {/* Price & Deal */}
                <div className="w-32 font-mono">
                  <div className="text-sm font-bold text-white">
                    ${(item.basePriceCents / 100).toFixed(2)}
                  </div>
                  {item.dealVerdict === 'HISTORICAL_LOW' && (
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase">
                      Historical Low
                    </span>
                  )}
                  {item.dealVerdict === 'GREAT_VALUE' && (
                    <span className="text-[9px] text-cyan-400 font-semibold uppercase">
                      Great Value
                    </span>
                  )}
                </div>

                {/* Weight */}
                <div className="w-24 text-xs font-mono text-slate-300">
                  {item.specs.weightGrams ? `${item.specs.weightGrams}g` : '—'}
                </div>

                {/* Specs */}
                <div className="w-44 text-xs font-mono text-slate-300 truncate pr-2">
                  {item.specs.waterproof ? 'Waterproof • ' : ''}
                  {item.specs.batteryHours ? `${item.specs.batteryHours}h Bat • ` : ''}
                  {item.specs.material ? String(item.specs.material).slice(0, 20) : ''}
                </div>

                {/* Rating */}
                <div className="w-28 flex items-center gap-1 text-xs font-mono text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{item.ratingAverage.toFixed(1)}</span>
                  <span className="text-slate-500">({item.reviewCount})</span>
                </div>

                {/* QuickLook trigger */}
                <div className="w-20 text-right">
                  <button
                    onClick={() => setQuickLookProductId(item.id)}
                    className="p-1.5 rounded-lg bg-[#171D2B] hover:bg-[#20283A] text-slate-400 hover:text-white transition-colors border border-[#1E2638]"
                    title="View Technical Telemetry"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
