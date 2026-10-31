import React, { useEffect, useState } from 'react';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { TelemetryPayload, ProductItem } from '../types';
import { RadarChart } from './RadarChart';
import { X, TrendingDown, Clock, ShieldCheck, Zap, AlertTriangle, Check, Package, Sparkles } from 'lucide-react';

interface ProductQuickLookSheetProps {
  products: ProductItem[];
}

export const ProductQuickLookSheet: React.FC<ProductQuickLookSheetProps> = ({ products }) => {
  const { quickLookProductId, setQuickLookProductId, addComparisonItem, comparisonItems } = useDiscoveryStore();
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const product = products.find((p) => p.id === quickLookProductId);
  const isCompared = product ? comparisonItems.some((c) => c.id === product.id) : false;

  useEffect(() => {
    if (!quickLookProductId) {
      setTelemetry(null);
      return;
    }

    setLoading(true);
    fetch(`/api/products/${quickLookProductId}/telemetry`)
      .then((r) => r.json())
      .then((data) => {
        setTelemetry(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load telemetry:', err);
        setLoading(false);
      });
  }, [quickLookProductId]);

  if (!quickLookProductId || !product) return null;

  // Build SVG path for 90-day price history
  const history = telemetry?.priceHistory90d || [];
  const prices = history.map((h) => h.priceCents);
  const minP = Math.min(...prices, product.historicalLowCents);
  const maxP = Math.max(...prices, product.basePriceCents * 1.15);

  const sparklinePoints = history
    .map((item, idx) => {
      const x = (idx / (history.length - 1)) * 360;
      const y = 80 - ((item.priceCents - minP) / (maxP - minP || 1)) * 65;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md animate-fade-in flex justify-end">
      <div className="w-full max-w-2xl bg-[#0F131D] border-l border-[#1E2638] h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-slide-up">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {product.subcategory}
              </span>
            </div>
            <button
              onClick={() => setQuickLookProductId(null)}
              className="p-1.5 rounded-lg bg-[#171D2B] hover:bg-[#20283A] text-slate-400 hover:text-white transition-colors border border-[#1E2638]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="font-display font-bold text-xl text-white mt-4">
            {product.title}
          </h2>

          {/* Pricing & Stock status */}
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                ${(product.basePriceCents / 100).toFixed(2)}
              </span>
              <span className="font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                True Historical Low: ${(product.historicalLowCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-mono text-cyan-400 font-semibold">
              ⚡ {product.fitMatchPercent || 92}% Fit Score
            </div>
          </div>

          {/* 90-Day Price Telemetry Sparkline & Verification */}
          <div className="mt-6 bg-[#080A0F] border border-[#1E2638] rounded-xl p-4 shadow-specular">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> 90-DAY PRICE VERIFICATION LEDGER
              </span>
              <span className="text-slate-500">MSRP Verified</span>
            </div>

            {loading ? (
              <div className="h-24 flex items-center justify-center text-xs font-mono text-slate-500">
                Querying price telemetry...
              </div>
            ) : (
              <div className="relative">
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 360 85" preserveAspectRatio="none">
                  {/* Subtle grid line */}
                  <line x1="0" y1="20" x2="360" y2="20" stroke="#1E2638" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="360" y2="50" stroke="#1E2638" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="360" y2="80" stroke="#1E2638" />

                  {/* Sparkline curve */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                  />
                </svg>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                  <span>90 Days Ago</span>
                  <span>Average: ${telemetry ? (telemetry.average90dCents / 100).toFixed(0) : '—'}</span>
                  <span className="text-emerald-400 font-semibold">Current Price</span>
                </div>
              </div>
            )}
          </div>

          {/* Warehouse Stock Velocity Ledger */}
          {telemetry && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-[#171D2B] border border-[#1E2638] rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Stock</span>
                <span className="text-base font-mono font-bold text-white mt-1 block">
                  {telemetry.warehouseStockVelocity.totalStock} Units
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Ready to dispatch
                </span>
              </div>

              <div className="bg-[#171D2B] border border-[#1E2638] rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">7d Velocity</span>
                <span className="text-base font-mono font-bold text-cyan-300 mt-1 block">
                  {telemetry.warehouseStockVelocity.unitsSoldLast7d} Sold
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  High demand
                </span>
              </div>

              <div className="bg-[#171D2B] border border-[#1E2638] rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Reserved</span>
                <span className="text-base font-mono font-bold text-slate-200 mt-1 block">
                  {telemetry.warehouseStockVelocity.reservedCount} Active
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  Cart reservations
                </span>
              </div>
            </div>
          )}

          {/* 5-Axis Radar Diagram */}
          <div className="mt-6 flex flex-col items-center bg-[#080A0F] border border-[#1E2638] rounded-xl p-4">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Multi-Axis Radar Balance vs Category Median
            </span>
            <RadarChart scores={product.normalizedScores} size={200} showLabels={true} />
          </div>

          {/* Specification Table */}
          <div className="mt-6">
            <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
              FULL TECHNICAL SPECIFICATIONS
            </h3>
            <div className="space-y-1.5">
              {Object.entries(product.specs).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs font-mono py-1.5 px-3 bg-[#171D2B] rounded-lg border border-[#1E2638]/60"
                >
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-white font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[#1E2638] mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (!isCompared) addComparisonItem(product);
            }}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              isCompared
                ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500/50'
                : 'bg-[#171D2B] hover:bg-[#20283A] text-slate-200 border-[#1E2638]'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{isCompared ? 'Added to Comparison Dock' : 'Add to Comparison Dock'}</span>
          </button>

          <button
            onClick={() => setQuickLookProductId(null)}
            className="py-2.5 px-6 rounded-xl font-mono text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
