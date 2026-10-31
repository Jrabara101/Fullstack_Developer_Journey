import React, { useState } from 'react';
import { ProductItem, ProductVariant } from '../types';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { RadarChart } from './RadarChart';
import { Check, Plus, Star, Eye, TrendingDown, Zap, Shield, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  item: ProductItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { comparisonItems, addComparisonItem, removeComparisonItem, setQuickLookProductId } = useDiscoveryStore();
  
  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(item.variants[0] || {
    id: 'default',
    sku: 'DEF',
    colorName: 'Standard',
    colorHex: '#334155',
    sizeOrCapacity: 'Standard',
    priceCents: item.basePriceCents,
    stockCount: 10,
    status: 'IN_STOCK',
    imageUrl: item.studioAngles?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  });

  // Hover scrub state for Hover X-Ray
  const [isHovered, setIsHovered] = useState(false);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  const isCompared = comparisonItems.some((c) => c.id === item.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeComparisonItem(item.id);
    } else {
      addComparisonItem(item);
    }
  };

  const angles = item.studioAngles && item.studioAngles.length > 0
    ? item.studioAngles
    : [selectedVariant.imageUrl];

  const currentDisplayImage = isHovered && angles[activeAngleIndex]
    ? angles[activeAngleIndex]
    : selectedVariant.imageUrl;

  const fitMatch = item.fitMatchPercent || 92;
  const isHighFit = fitMatch >= 95;

  // Mini sparkline for 30-day trend
  const sparklinePrices = item.priceHistory30d.map(p => p.priceCents);
  const minPrice = Math.min(...sparklinePrices);
  const maxPrice = Math.max(...sparklinePrices, minPrice + 1);
  const sparklinePoints = sparklinePrices.map((val, idx) => {
    const x = (idx / (sparklinePrices.length - 1)) * 50;
    const y = 14 - ((val - minPrice) / (maxPrice - minPrice)) * 12;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveAngleIndex(0);
      }}
      className={`group relative flex flex-col bg-[#0F131D] border rounded-2xl overflow-hidden transition-all duration-300 shadow-specular hover:shadow-2xl ${
        isCompared
          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
          : 'border-[#1E2638] hover:border-slate-600'
      }`}
    >
      {/* 1. Top Badges & Compare Action Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Fit Match Pill */}
        <div
          className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg pointer-events-auto transition-transform ${
            isHighFit
              ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-indigo-950/85 text-indigo-300 border border-indigo-500/50'
          }`}
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>{fitMatch}% MATCH</span>
        </div>

        {/* Compare Toggle Button */}
        <button
          onClick={handleToggleCompare}
          className={`pointer-events-auto flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg backdrop-blur-md transition-all ${
            isCompared
              ? 'bg-indigo-600 text-white font-semibold scale-105 shadow-[0_0_14px_rgba(99,102,241,0.5)]'
              : 'bg-[#141A29]/80 hover:bg-[#1E2638] text-slate-300 border border-[#1E2638]'
          }`}
        >
          {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span>{isCompared ? 'Compared' : 'Compare'}</span>
        </button>
      </div>

      {/* 2. Media Stage with Radial Studio Lighting & Hover X-Ray Overlay */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-[#171D2B]/80 to-[#0F131D] overflow-hidden flex items-center justify-center p-4">
        {/* Subtle radial studio glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />

        <img
          src={currentDisplayImage}
          alt={item.title}
          loading="lazy"
          className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover X-Ray Radar Overlay (Upper-right overlay on hover) */}
        {isHovered && (
          <div className="absolute bottom-3 right-3 z-30 bg-[#080A0F]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2 shadow-cyan-glow animate-fade-in pointer-events-none">
            <div className="text-[9px] font-mono text-cyan-300 mb-1 font-semibold flex items-center gap-1">
              <span>HOVER X-RAY</span>
              <span className="text-slate-400 font-normal">vs Median</span>
            </div>
            <RadarChart scores={item.normalizedScores} size={110} />
          </div>
        )}

        {/* Quick Angle Scrub Dots */}
        {angles.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#080A0F]/60 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
            {angles.map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setActiveAngleIndex(i)}
                aria-label={`View product angle ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeAngleIndex === i ? 'bg-cyan-400 w-3.5' : 'bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* QuickLook Button (Center overlay) */}
        <button
          onClick={() => setQuickLookProductId(item.id)}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
          title="Open QuickLook Telemetry"
        >
          <span className="text-xs font-mono bg-white text-slate-900 font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform">
            <Eye className="w-3.5 h-3.5" /> QuickLook Telemetry
          </span>
        </button>
      </div>

      {/* 3. Inline Variant Swatches Row & Warehouse Stock Velocity */}
      <div className="px-4 py-2 border-t border-[#1E2638] bg-[#121622] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {item.variants.map((v) => {
            const isSelected = v.id === selectedVariant.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                title={`${v.colorName} - ${v.sizeOrCapacity} ($${Math.round(v.priceCents / 100)})`}
                className={`w-4 h-4 rounded-full border transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0F131D] scale-110 border-white'
                    : 'border-white/20 hover:scale-105'
                }`}
                style={{ backgroundColor: v.colorHex }}
              />
            );
          })}
        </div>

        {/* Warehouse Velocity status badge */}
        <div className="text-[10px] font-mono flex items-center gap-1">
          {selectedVariant.status === 'IN_STOCK' ? (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {selectedVariant.stockCount > 8 ? 'In Stock (14+)' : `${selectedVariant.stockCount} Left`}
            </span>
          ) : selectedVariant.status === 'LOW_STOCK' ? (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Low Stock: {selectedVariant.stockCount}
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              Backorder
            </span>
          )}
        </div>
      </div>

      {/* 4. Product Body & Specifications Telemetry */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="font-semibold text-cyan-400">{item.brand}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{item.ratingAverage.toFixed(1)}</span>
              <span className="text-slate-500">({item.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-display font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Key monospaced spec pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {item.specs.weightGrams !== undefined && (
              <span className="text-[10px] font-mono bg-[#171D2B] text-slate-300 border border-[#1E2638] px-1.5 py-0.5 rounded">
                {item.specs.weightGrams}g
              </span>
            )}
            {item.specs.waterproof && (
              <span className="text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                WATERPROOF
              </span>
            )}
            {item.specs.batteryHours !== undefined && (
              <span className="text-[10px] font-mono bg-[#171D2B] text-slate-300 border border-[#1E2638] px-1.5 py-0.5 rounded">
                {item.specs.batteryHours}h Battery
              </span>
            )}
            {item.specs.switchType && (
              <span className="text-[10px] font-mono bg-[#171D2B] text-slate-300 border border-[#1E2638] px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {String(item.specs.switchType)}
              </span>
            )}
            {item.specs.panelType && (
              <span className="text-[10px] font-mono bg-[#171D2B] text-slate-300 border border-[#1E2638] px-1.5 py-0.5 rounded">
                {String(item.specs.panelType)}
              </span>
            )}
          </div>
        </div>

        {/* 5. Pricing, Historical Sparkline & True Deal Verdict */}
        <div className="pt-3 border-t border-[#1E2638] flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold text-slate-100">
                ${(selectedVariant.priceCents / 100).toFixed(2)}
              </span>
              {selectedVariant.compareAtPriceCents && selectedVariant.compareAtPriceCents > selectedVariant.priceCents && (
                <span className="font-mono text-xs text-slate-500 line-through">
                  ${(selectedVariant.compareAtPriceCents / 100).toFixed(0)}
                </span>
              )}
            </div>

            {/* Historical Deal Tag */}
            <div className="mt-1">
              {item.dealVerdict === 'HISTORICAL_LOW' && (
                <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                  ★ HISTORICAL LOW
                </span>
              )}
              {item.dealVerdict === 'GREAT_VALUE' && (
                <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5 rounded">
                  GREAT VALUE
                </span>
              )}
              {item.dealVerdict === 'INFLATED_MSRP' && (
                <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 rounded">
                  INFLATED MSRP
                </span>
              )}
            </div>
          </div>

          {/* 30-Day Mini Price Trend Sparkline */}
          <div className="flex flex-col items-end">
            <svg width="50" height="16" className="overflow-visible">
              <polyline
                fill="none"
                stroke={item.dealVerdict === 'HISTORICAL_LOW' ? '#10B981' : '#6366F1'}
                strokeWidth="1.5"
                points={sparklinePoints}
              />
            </svg>
            <span className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-0.5">
              <TrendingDown className="w-2.5 h-2.5 text-emerald-400" /> 30d Trend
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
