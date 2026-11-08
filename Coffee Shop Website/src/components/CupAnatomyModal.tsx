import React, { useState } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import type { MilkOption } from '../types';
import { X, Layers, Plus } from 'lucide-react';
import { PASTRY_ITEMS } from '../data/mockData';

export const CupAnatomyModal: React.FC = () => {
  const { 
    cupAnatomyDrink, 
    setCupAnatomyDrink, 
    milkPreference, 
    addToCart 
  } = useCoffeeShop();

  const [selectedMilk, setSelectedMilk] = useState<MilkOption>(milkPreference);
  const [selectedTemp, setSelectedTemp] = useState<'hot' | 'iced'>('hot');

  if (!cupAnatomyDrink) return null;

  const item = cupAnatomyDrink;
  const soulmatePastry = PASTRY_ITEMS.find(p => p.id === item.soulmatePastryId);

  const finalPrice = selectedMilk === 'almond' ? item.price + 0.50 : item.price;

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: finalPrice,
      itemType: 'drink',
      milk: selectedMilk,
      temp: selectedTemp
    });
    setCupAnatomyDrink(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-ceramic border border-linen-hairline rounded-hub max-w-xl w-full p-6 sm:p-8 shadow-warm-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={() => setCupAnatomyDrink(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-cacao-secondary hover:text-espresso-primary hover:bg-canvas-parchment transition-colors"
          aria-label="Close Cup Anatomy"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-terracotta bg-terracotta-light px-2.5 py-0.5 rounded-full font-semibold">
              Cup Anatomy & Ratio Breakdown
            </span>
            <span className="font-mono text-xs text-oat-muted">
              {item.size}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-espresso-primary">
            {item.name}
          </h2>
          <p className="text-xs sm:text-sm text-cacao-secondary leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Visual Layered Cross-Section Diagram */}
        <div className="mt-6 mb-6 bg-canvas-parchment/60 p-5 rounded-2xl border border-linen-hairline space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-cacao-secondary font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-terracotta" />
              Ingredient Proportion Spectrum
            </span>
            <span>100% Handcrafted</span>
          </div>

          {/* Large Stacked Bar with percentages */}
          <div className="h-8 w-full rounded-xl overflow-hidden flex shadow-inner border border-espresso-primary/10">
            {item.cupAnatomy.map((layer, idx) => (
              <div
                key={idx}
                style={{ width: `${layer.percentage}%`, backgroundColor: layer.color }}
                className="h-full flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm overflow-hidden text-ellipsis whitespace-nowrap px-1"
                title={`${layer.name}: ${layer.percentage}%`}
              >
                {layer.percentage >= 15 ? `${layer.percentage}%` : ''}
              </div>
            ))}
          </div>

          {/* Granular Layer Breakdown Details */}
          <div className="space-y-2.5 pt-2">
            {item.cupAnatomy.map((layer, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/70 p-2.5 rounded-xl border border-linen-hairline">
                <span 
                  className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-black/10" 
                  style={{ backgroundColor: layer.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-xs sm:text-sm text-espresso-primary">
                      {layer.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-terracotta">
                      {layer.percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-cacao-secondary mt-0.5">
                    {layer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Sensory Intensity Meters */}
        <div className="grid grid-cols-3 gap-3 bg-canvas-oat p-4 rounded-xl border border-linen-hairline text-center">
          <div>
            <span className="block font-mono text-[11px] text-oat-muted uppercase">Roast Warmth</span>
            <div className="flex justify-center gap-1 my-1.5">
              {[1, 2, 3].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= item.roastWarmth ? 'bg-amber-900' : 'bg-espresso-primary/10'}`} />
              ))}
            </div>
            <span className="text-[10px] text-cacao-secondary">
              {item.roastWarmth === 1 ? 'Bright & Light' : item.roastWarmth === 2 ? 'Medium Silk' : 'Deep & Toasted'}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[11px] text-oat-muted uppercase">Natural Sweetness</span>
            <div className="flex justify-center gap-1 my-1.5">
              {[1, 2, 3].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= item.sweetness ? 'bg-amber-honey' : 'bg-espresso-primary/10'}`} />
              ))}
            </div>
            <span className="text-[10px] text-cacao-secondary">
              {item.sweetness === 1 ? 'Zero Sugar' : item.sweetness === 2 ? 'Subtle Honeyed' : 'Sweet Treat'}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[11px] text-oat-muted uppercase">Caffeine Kick</span>
            <div className="flex justify-center gap-1 my-1.5">
              {[1, 2, 3].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= item.caffeineKick ? 'bg-terracotta' : 'bg-espresso-primary/10'}`} />
              ))}
            </div>
            <span className="text-[10px] text-cacao-secondary">
              {item.caffeineKick === 1 ? 'Decaf/Gentle' : item.caffeineKick === 2 ? 'Balanced Focus' : 'Vibrant Kick'}
            </span>
          </div>
        </div>

        {/* Barista Commentary if available */}
        {item.baristaNote && (
          <div className="mt-4 p-3 bg-amber-honey/10 border border-amber-honey/30 rounded-xl text-xs text-cacao-secondary italic">
            {item.baristaNote}
          </div>
        )}

        {/* Soulmate Pastry Pairing */}
        {soulmatePastry && (
          <div className="mt-4 p-3 bg-canvas-parchment/80 border border-linen-hairline rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-terracotta block">
                Recommended Bakery Pairing:
              </span>
              <span className="font-serif font-semibold text-espresso-primary">
                {soulmatePastry.name} (+${soulmatePastry.price.toFixed(2)})
              </span>
            </div>
            <button
              onClick={() => {
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: finalPrice,
                  itemType: 'drink',
                  milk: selectedMilk,
                  temp: selectedTemp,
                  pairedPastry: {
                    id: soulmatePastry.id,
                    name: soulmatePastry.name,
                    price: soulmatePastry.price
                  }
                });
                setCupAnatomyDrink(null);
              }}
              className="font-mono text-[10px] font-bold uppercase text-terracotta hover:bg-terracotta hover:text-white border border-terracotta/40 px-2.5 py-1 rounded-lg transition-colors"
            >
              + Pair with Drink
            </button>
          </div>
        )}

        {/* Customization & Add to Cart Bar */}
        <div className="mt-6 pt-5 border-t border-linen-hairline space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Milk Option */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-oat-muted uppercase font-bold">
                Milk Selection:
              </label>
              <div className="flex gap-1.5 bg-canvas-parchment p-1 rounded-xl">
                {(['oat', 'whole', 'almond'] as MilkOption[]).map((milk) => (
                  <button
                    key={milk}
                    onClick={() => setSelectedMilk(milk)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      selectedMilk === milk
                        ? 'bg-surface-ceramic text-espresso-primary font-bold shadow-sm'
                        : 'text-cacao-secondary hover:text-espresso-primary'
                    }`}
                  >
                    {milk === 'oat' ? 'House Oat' : milk === 'whole' ? 'Organic Whole' : 'Almond (+50¢)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Option */}
            {item.temp === 'both' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-oat-muted uppercase font-bold">
                  Temperature:
                </label>
                <div className="flex gap-1.5 bg-canvas-parchment p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedTemp('hot')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      selectedTemp === 'hot'
                        ? 'bg-surface-ceramic text-espresso-primary font-bold shadow-sm'
                        : 'text-cacao-secondary hover:text-espresso-primary'
                    }`}
                  >
                    🔥 Steamed Hot
                  </button>
                  <button
                    onClick={() => setSelectedTemp('iced')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      selectedTemp === 'iced'
                        ? 'bg-surface-ceramic text-espresso-primary font-bold shadow-sm'
                        : 'text-cacao-secondary hover:text-espresso-primary'
                    }`}
                  >
                    ❄️ Over Ice
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="text-[11px] font-mono text-oat-muted">Walk-In Pre-Order</div>
              <div className="font-serif text-2xl font-bold text-espresso-primary">
                ${finalPrice.toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3.5 px-6 rounded-full font-semibold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Walk-In Tray</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
