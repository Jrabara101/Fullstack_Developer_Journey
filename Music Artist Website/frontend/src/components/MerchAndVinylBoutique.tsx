import React, { useState } from 'react';
import {
  Disc,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check,
  Package,
  QrCode,
  Zap,
  Volume2,
  Tag
} from 'lucide-react';
import { MerchProduct, MerchVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useAudioEngine } from '../context/AudioEngineContext';

interface MerchBoutiqueProps {
  products: MerchProduct[];
}

export const MerchAndVinylBoutique: React.FC<MerchBoutiqueProps> = ({ products }) => {
  const { addItem, openCart, fulfillmentMode, setFulfillmentMode } = useCart();
  const { playTrack, currentTrack } = useAudioEngine();

  const [activeCategory, setActiveCategory] = useState<'all' | 'vinyl' | 'apparel' | 'poster_zine' | 'bundle'>('all');
  const [selectedVinylVariantIndex, setSelectedVinylVariantIndex] = useState(0);
  const [selectedApparelSizes, setSelectedApparelSizes] = useState<Record<string, string>>({});

  const flagshipVinyl = products.find(p => p.category === 'vinyl') || products[0];
  const otherProducts = products.filter(p => p.id !== flagshipVinyl.id);

  const filteredOther = otherProducts.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const activeVariant = flagshipVinyl.variants[selectedVinylVariantIndex] || flagshipVinyl.variants[0];

  const handleAddFlagshipVinyl = () => {
    addItem(flagshipVinyl, activeVariant, 1);
    openCart();
  };

  const handleAddOtherProduct = (product: MerchProduct) => {
    let chosenVariant = product.variants[0];
    const sizeSelected = selectedApparelSizes[product.id];
    if (sizeSelected) {
      const match = product.variants.find(v => v.variant_name.toLowerCase().includes(sizeSelected.toLowerCase()));
      if (match) chosenVariant = match;
    }
    addItem(product, chosenVariant, 1);
    openCart();
  };

  return (
    <section id="merch" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[var(--era-accent)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>03 // Direct-to-Fan Vinyl Pressing Matrix & Atelier</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--era-accent)] animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase text-white tracking-tight">
            Vinyl Pressings & Tour Apparel
          </h2>
          <p className="mt-2 text-zinc-400 font-editorial italic text-base sm:text-lg">
            Limited numbered editions, Japanese obi-strip imports, and heavyweight organic garments.
          </p>
        </div>

        {/* Fulfillment Mode Switcher */}
        <div className="flex p-1.5 rounded-2xl bg-[#101216] border border-white/10 font-mono text-xs">
          <button
            onClick={() => setFulfillmentMode('ship_to_address')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              fulfillmentMode === 'ship_to_address'
                ? 'bg-white/15 text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ship Worldwide</span>
          </button>
          <button
            onClick={() => setFulfillmentMode('venue_pickup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              fulfillmentMode === 'venue_pickup'
                ? 'bg-signal-emerald/20 text-signal-emerald border border-signal-emerald/40 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-signal-emerald" />
            <span>Pick Up at Venue Tonight (Booth #2)</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        {[
          { key: 'all', label: `All Items (${products.length})` },
          { key: 'vinyl', label: '180g Vinyl & Cassettes' },
          { key: 'apparel', label: 'Heavyweight Tour Apparel' },
          { key: 'poster_zine', label: 'Posters & Zines' },
          { key: 'bundle', label: '💰 Value Bundles (Save 15%)' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key as any)}
            className={`px-3.5 py-1.5 rounded-xl border transition-colors whitespace-nowrap ${
              activeCategory === cat.key
                ? 'bg-[var(--era-accent)] text-white border-[var(--era-accent)] font-semibold'
                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FLAGSHIP VINYL PRESSING CARD (Spans 2 columns on desktop) */}
        {(activeCategory === 'all' || activeCategory === 'vinyl') && (
          <div className="lg:col-span-2 rounded-3xl border border-white/15 bg-[#101216] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-2xl relative overflow-hidden group">
            {/* Left Media Stage (6 Cols) */}
            <div className="md:col-span-6 flex flex-col items-center">
              {/* Gatefold Jacket with interactive sliding vinyl */}
              <div className="relative w-full max-w-[320px] aspect-square">
                {/* Protruding vinyl disc reflecting active swatch */}
                <div
                  className="absolute top-0 right-0 w-full h-full rounded-full vinyl-grooves border-2 border-white/20 transition-all duration-700 ease-out translate-x-12 group-hover:translate-x-16 rotate-12 flex items-center justify-center shadow-2xl"
                  style={{
                    boxShadow: `0 0 30px ${activeVariant.color_hex || '#8B0000'}40`
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-full border border-black/40 flex flex-col items-center justify-center text-center text-white"
                    style={{
                      background: `radial-gradient(circle, ${activeVariant.color_hex || '#FF3366'} 0%, #111 100%)`
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-black mb-1" />
                    <span className="text-[7px] font-mono font-bold uppercase tracking-wider">
                      {activeVariant.texture_name || 'MASTER'}
                    </span>
                  </div>
                </div>

                {/* Gatefold Jacket Cover */}
                <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                  <img
                    src={flagshipVinyl.images[0]}
                    alt={flagshipVinyl.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-zinc-300">
                    CAT-026LP • STERLING MASTER
                  </div>
                </div>
              </div>

              {/* Swatch Selector */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                {flagshipVinyl.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVinylVariantIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] transition-all ${
                      selectedVinylVariantIndex === idx
                        ? 'border-[var(--era-accent)] bg-white/10 text-white font-bold'
                        : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: variant.color_hex || '#333' }}
                    />
                    <span>{variant.variant_name.split(' ')[0]} {variant.variant_name.split(' ')[1] || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Pressing Specs & Add to Bag (6 Cols) */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-signal-amber/15 border border-signal-amber/30 text-[10px] font-mono text-signal-amber font-bold mb-3">
                  <Tag className="w-3 h-3" />
                  <span>LIMITED FIRST PRESSING • #{flagshipVinyl.copies_remaining} / {flagshipVinyl.edition_total} REMAINING</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-white tracking-tight leading-tight">
                  {flagshipVinyl.title}
                </h3>

                <div className="mt-2 text-2xl font-mono font-bold text-white tabular-nums">
                  ${(activeVariant.price_cents / 100).toFixed(2)}
                  <span className="text-xs text-zinc-400 font-normal ml-2 font-mono">
                    [{activeVariant.variant_name}]
                  </span>
                </div>

                <p className="mt-3 text-xs text-zinc-300 font-editorial italic leading-relaxed">
                  "{flagshipVinyl.description}"
                </p>

                {/* Included Perks Checklist */}
                <div className="mt-4 space-y-2 text-xs font-mono text-zinc-300">
                  {flagshipVinyl.perks?.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-signal-emerald flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Cluster */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
                <button
                  onClick={handleAddFlagshipVinyl}
                  className="w-full py-3.5 rounded-xl bg-[var(--era-accent)] hover:opacity-90 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-xl shadow-[var(--era-accent)]/20 active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Vinyl to Bag • ${(activeVariant.price_cents / 100).toFixed(2)}</span>
                </button>

                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span>✨ Bundle with Tour Hoodie to save 15%</span>
                  <span className="text-signal-emerald font-bold">Auto-applied in Bag</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTHER MERCH PRODUCTS (Apparel, Posters, Cassettes, Bundles) */}
        {filteredOther.map(product => {
          const isApparel = product.category === 'apparel';
          const defaultVariant = product.variants[0];
          const selectedSize = selectedApparelSizes[product.id] || (isApparel ? 'M' : '');

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-white/15 bg-[#101216] p-5 flex flex-col justify-between hover:border-white/30 transition-all shadow-xl group"
            >
              <div>
                {/* Product Image */}
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 relative bg-black">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.is_limited_edition && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono border border-white/20 text-signal-amber font-bold">
                      Limited Edition ({product.copies_remaining} Left)
                    </div>
                  )}
                  {product.includes_instant_digital_album && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-signal-emerald/90 text-black text-[9px] font-mono font-bold">
                      Instant Lossless Vault Token
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[var(--era-accent)] uppercase">
                    {product.category.toUpperCase()}
                  </span>
                  <span className="text-base font-mono font-bold text-white tabular-nums">
                    ${(defaultVariant.price_cents / 100).toFixed(2)}
                  </span>
                </div>

                <h4 className="text-base font-display font-extrabold uppercase text-white tracking-tight leading-snug">
                  {product.title}
                </h4>

                {product.garment_specs && (
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    {product.garment_specs.fabric}
                  </div>
                )}

                {/* Size Pills for Apparel */}
                {isApparel && (
                  <div className="mt-3 flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-[10px] text-zinc-400 mr-1">Size:</span>
                    {['S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedApparelSizes(prev => ({ ...prev, [product.id]: size }))
                        }
                        className={`w-7 h-7 rounded-lg border text-center text-xs transition-colors ${
                          selectedSize === size
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAddOtherProduct(product)}
                className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag • ${(defaultVariant.price_cents / 100).toFixed(2)}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

