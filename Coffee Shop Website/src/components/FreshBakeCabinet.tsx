import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Flame, Clock, Plus } from 'lucide-react';

export const FreshBakeCabinet: React.FC = () => {
  const { pastryItems, pastryBakeMinutes, addToCart } = useCoffeeShop();

  const getBakeStatusBadge = (minutes: number, stock: number) => {
    if (stock <= 0) {
      return {
        label: 'Sold Out for Today — Next Batch at 6:30 AM',
        color: 'bg-oat-light text-oat-muted border-oat-muted/30',
        isWarm: false,
      };
    }
    if (minutes <= 30) {
      return {
        label: `🔥 Warm Out of the Oven (Pulled ${minutes}m ago)`,
        color: 'bg-terracotta text-white border-transparent animate-pulse',
        isWarm: true,
      };
    }
    if (minutes <= 90) {
      return {
        label: `Fresh Batch • Pulled ${minutes}m ago`,
        color: 'bg-amber-honey/20 text-amber-900 border-amber-honey/40',
        isWarm: false,
      };
    }
    return {
      label: `Available Today • Pulled ${minutes}m ago`,
      color: 'bg-canvas-parchment text-cacao-secondary border-linen-hairline',
      isWarm: false,
    };
  };

  return (
    <section id="bake-cabinet" className="py-16 sm:py-24 bg-canvas-oat relative border-t border-linen-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              <span>Small-Batch Kitchen & Oven Depletion Tracker</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-espresso-primary">
              Baked at 5:00 AM & Throughout the Day
            </h2>
            <p className="text-sm sm:text-base text-cacao-secondary leading-relaxed">
              We never ship frozen pastries or reheat yesterday's stock. Our bakers roll laminated dough by hand and pull warm cardamom knots in small trays of 12 all morning long.
            </p>
          </div>

          <div className="bg-surface-ceramic border-craft-stamp p-4 rounded-xl shadow-warm-sm shrink-0 flex items-center gap-3">
            <Clock className="w-5 h-5 text-terracotta" />
            <div className="text-xs">
              <span className="font-mono uppercase font-bold text-espresso-primary block">Next Oven Pull:</span>
              <span className="text-cacao-secondary font-mono text-[11px]">Cardamom Knots in ~18 mins (Batch #04)</span>
            </div>
          </div>
        </div>

        {/* Pastry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pastryItems.map((pastry) => {
            const minutes = pastryBakeMinutes[pastry.id] || pastry.bakedMinutesAgo;
            const status = getBakeStatusBadge(minutes, pastry.stockRemaining);
            const isSoldOut = pastry.stockRemaining <= 0;

            return (
              <div
                key={pastry.id}
                className="bg-surface-ceramic border border-linen-hairline rounded-card overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col group"
              >
                {/* Pastry Photo with Live Status Badge */}
                <div className="relative aspect-[16/10] overflow-hidden bg-canvas-parchment">
                  <img
                    src={pastry.image}
                    alt={pastry.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-md ${status.color}`}>
                      {status.label}
                    </span>

                    <span className="bg-surface-roast/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                      {pastry.bakeBatchNumber}
                    </span>
                  </div>

                  {/* Stock counter at bottom */}
                  <div className="absolute bottom-3 right-3 bg-surface-ceramic/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold text-espresso-primary border border-linen-hairline">
                    {pastry.stockRemaining > 0 ? `${pastry.stockRemaining} left in case` : 'Sold Out'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-xl font-semibold text-espresso-primary group-hover:text-terracotta transition-colors">
                        {pastry.name}
                      </h3>
                      <span className="font-mono text-base font-bold text-espresso-primary shrink-0">
                        ${pastry.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-cacao-secondary leading-relaxed">
                      {pastry.description}
                    </p>

                    {/* Dietary Badges */}
                    <div className="flex items-center gap-2 pt-1">
                      {pastry.isGlutenFree && (
                        <span className="text-[10px] font-mono font-bold text-matcha bg-matcha-light px-2 py-0.5 rounded-full">
                          Gluten-Free
                        </span>
                      )}
                      {pastry.isVegan && (
                        <span className="text-[10px] font-mono font-bold text-matcha bg-matcha-light px-2 py-0.5 rounded-full">
                          Plant-Based / Vegan
                        </span>
                      )}
                      {!pastry.isGlutenFree && (
                        <span className="text-[10px] font-mono text-oat-muted bg-canvas-parchment px-2 py-0.5 rounded-full">
                          Normandy Butter & Heritage Wheat
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer with Pairing Link & Add Button */}
                  <div className="border-t border-craft-stamp pt-3.5 flex items-center justify-between gap-3">
                    <div className="truncate text-xs">
                      <span className="text-[10px] font-mono text-oat-muted uppercase block">Ideal Sip Pairing:</span>
                      <span className="font-serif text-espresso-primary font-medium truncate block text-xs">
                        {pastry.pairingDrinkName}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: pastry.id,
                        name: pastry.name,
                        price: pastry.price,
                        itemType: 'pastry'
                      })}
                      disabled={isSoldOut}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full shadow-warm-sm transition-all ${
                        isSoldOut 
                          ? 'bg-canvas-parchment text-oat-muted cursor-not-allowed' 
                          : 'bg-terracotta hover:bg-terracotta-hover text-white hover:scale-105'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSoldOut ? 'Sold Out' : 'Add to Tray'}</span>
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
