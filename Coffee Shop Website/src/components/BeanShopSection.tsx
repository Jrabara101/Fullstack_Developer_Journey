import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Coffee, Compass, Plus } from 'lucide-react';

export const BeanShopSection: React.FC = () => {
  const { beanBags, setBrewCompanionBean, addToCart } = useCoffeeShop();

  return (
    <section id="bean-shop" className="py-16 sm:py-24 bg-canvas-parchment/40 relative border-t border-linen-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
            <Coffee className="w-3.5 h-3.5" />
            <span>Whole Bean Take-Home Bags & Direct Trade Lots</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-espresso-primary">
            Bring the Roastery Home
          </h2>
          <p className="text-sm sm:text-base text-cacao-secondary leading-relaxed">
            Every bag is roasted in small batches on our vintage cast-iron drum, date-stamped, and packaged in biodegradable craft paper. Comes with full home extraction recipes for V60, AeroPress, and French Press.
          </p>
        </div>

        {/* Bean Bags Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {beanBags.map((bean) => {
            return (
              <div
                key={bean.id}
                className="bg-surface-ceramic border border-craft-stamp rounded-card p-6 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Roaster Stamp */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-linen-hairline font-mono text-xs">
                    <span className="text-terracotta font-bold uppercase tracking-wider">
                      {bean.originCountry}
                    </span>
                    <span className="bg-canvas-parchment text-espresso-primary px-2 py-0.5 rounded text-[11px] font-semibold">
                      {bean.weightGrams}g Bag
                    </span>
                  </div>

                  {/* Title & Origin Region */}
                  <h3 className="font-serif text-2xl font-bold text-espresso-primary group-hover:text-terracotta transition-colors mb-1">
                    {bean.name}
                  </h3>
                  <div className="text-xs font-mono text-oat-muted mb-3">
                    {bean.region} • {bean.elevation}
                  </div>

                  {/* Batch Stamp Badge */}
                  <div className="inline-block bg-surface-roast text-white text-[10px] font-mono px-2.5 py-1 rounded-md uppercase font-bold tracking-wider mb-4">
                    {bean.roastBatchDate}
                  </div>

                  {/* Tasting Note Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bean.tastingNotes.map((note) => (
                      <span
                        key={note}
                        className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-canvas-parchment text-espresso-primary border border-linen-hairline"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {/* Technical Specifications */}
                  <div className="bg-canvas-oat/80 p-3.5 rounded-xl border border-linen-hairline space-y-1.5 font-mono text-xs text-cacao-secondary mb-4">
                    <div className="flex justify-between">
                      <span className="text-oat-muted">Producer:</span>
                      <span className="font-semibold text-espresso-primary">{bean.producer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oat-muted">Variety:</span>
                      <span>{bean.variety}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oat-muted">Process:</span>
                      <span>{bean.processMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oat-muted">Roast Profile:</span>
                      <span className="font-semibold text-terracotta">{bean.roastProfile}</span>
                    </div>
                  </div>

                  {/* Short Narrative Story */}
                  <p className="text-xs text-cacao-secondary leading-relaxed mb-4">
                    {bean.story}
                  </p>
                </div>

                {/* Bottom Actions: Brew Recipe Drawer Trigger & Add to Cart */}
                <div className="space-y-3 pt-3 border-t border-craft-stamp">
                  
                  {/* Home Brew Recipe Companion Button */}
                  <button
                    onClick={() => setBrewCompanionBean(bean)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-honey/15 hover:bg-amber-honey/25 text-espresso-primary border border-amber-honey/30 py-2.5 px-4 rounded-xl text-xs font-mono font-semibold transition-all"
                  >
                    <Compass className="w-4 h-4 text-amber-700" />
                    <span>Open "Brew This at Home" Timer</span>
                  </button>

                  {/* Price & Add Bag Button */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-oat-muted uppercase block">Take-Home Price</span>
                      <span className="font-serif text-2xl font-bold text-espresso-primary">
                        ${bean.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: bean.id,
                        name: `${bean.name} (${bean.weightGrams}g)`,
                        price: bean.price,
                        itemType: 'bean'
                      })}
                      className="flex items-center gap-1.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-warm-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bag to Tray</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
