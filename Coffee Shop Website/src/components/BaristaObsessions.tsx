import React from 'react';
import { BARISTA_SPOTLIGHTS } from '../data/mockData';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Compass, Plus, Clock, Quote } from 'lucide-react';

export const BaristaObsessions: React.FC = () => {
  const { addToCart, pastryItems, menuItems } = useCoffeeShop();

  return (
    <section id="barista-picks" className="py-16 sm:py-24 bg-canvas-oat relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" />
            <span>Off-Menu Staff Creations & Secret Dial-Ins</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-espresso-primary">
            The Barista's Current Obsession
          </h2>
          <p className="text-sm sm:text-base text-cacao-secondary leading-relaxed">
            The drinks our team whips up for themselves when the rush slows down. Handcrafted off-menu tweaks, custom milk temperatures, and secret pastry pairings.
          </p>
        </div>

        {/* Polaroid Cards Shelf */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {BARISTA_SPOTLIGHTS.map((barista, index) => {
            const pairedPastry = pastryItems.find(p => p.id === barista.pairingPastryId);
            const baseDrink = menuItems.find(d => d.id === barista.favDrinkId) || menuItems[0];
            const rotations = ['-rotate-1', 'rotate-1', '-rotate-2'];
            const rotationClass = rotations[index % rotations.length];

            return (
              <div
                key={barista.id}
                className={`bg-surface-ceramic border border-linen-hairline rounded-2xl p-5 shadow-warm-lg hover:shadow-warm-xl transition-all duration-300 transform ${rotationClass} hover:rotate-0 hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  {/* Polaroid Photo Frame */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-canvas-parchment mb-4 shadow-inner">
                    <img
                      src={barista.photo}
                      alt={barista.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Shift Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-surface-roast/80 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{barista.shiftToday}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-amber-honey text-espresso-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                      ON BAR TODAY
                    </div>
                  </div>

                  {/* Barista Identity */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-espresso-primary">
                        {barista.name}
                      </h3>
                      <span className="text-xs font-mono text-terracotta font-semibold">
                        {barista.role}
                      </span>
                    </div>
                    
                    <div className="font-serif text-base font-semibold text-terracotta pt-1">
                      "{barista.favDrinkName}"
                    </div>
                  </div>

                  {/* Tasting Quote */}
                  <blockquote className="text-xs text-cacao-secondary italic bg-canvas-parchment/60 p-3 rounded-xl border border-linen-hairline relative mb-3">
                    <Quote className="w-3 h-3 text-oat-muted absolute top-2 right-2 opacity-50" />
                    "{barista.tastingQuote}"
                  </blockquote>

                  {/* Secret Modification Note */}
                  <div className="text-[11px] font-mono bg-amber-honey/10 border border-amber-honey/20 p-2.5 rounded-xl text-amber-900 mb-4">
                    <span className="font-bold uppercase text-[10px] block text-terracotta">Secret Barista Hack:</span>
                    <span>{barista.secretModification}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-craft-stamp pt-4">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-oat-muted">Secret Pairing:</span>
                    <span className="font-serif font-semibold text-espresso-primary">
                      {pairedPastry?.name}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart({
                      id: `${baseDrink.id}-barista-${barista.id}`,
                      name: barista.favDrinkName,
                      price: baseDrink.price + 0.50,
                      itemType: 'drink',
                      pairedPastry: pairedPastry ? {
                        id: pairedPastry.id,
                        name: pairedPastry.name,
                        price: pairedPastry.price
                      } : undefined
                    })}
                    className="w-full bg-espresso-primary hover:bg-terracotta text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-warm-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Order {barista.name.split(' ')[0]}'s Creation (${(baseDrink.price + 0.50).toFixed(2)})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
