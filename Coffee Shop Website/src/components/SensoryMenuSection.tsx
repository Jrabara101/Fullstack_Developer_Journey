import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import type { MoodCraving, MilkOption } from '../types';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  HeartHandshake, 
  Coffee, 
  Zap, 
  Flower2, 
  Umbrella
} from 'lucide-react';
import { PASTRY_ITEMS } from '../data/mockData';

export const SensoryMenuSection: React.FC = () => {
  const { 
    menuItems, 
    activeMood, 
    setActiveMood, 
    milkPreference, 
    setMilkPreference,
    dietaryFilter,
    setDietaryFilter,
    addToCart,
    setCupAnatomyDrink
  } = useCoffeeShop();

  // Mood filters configuration
  const moodFilters: { id: MoodCraving; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'All Creations', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'bg-canvas-parchment' },
    { id: 'rainy-day', label: 'Rainy-Day Hug', icon: <Umbrella className="w-3.5 h-3.5" />, color: 'bg-terracotta-light text-terracotta' },
    { id: 'chocolatey-nutty', label: 'Chocolatey, Nutty & Low-Acid', icon: <Coffee className="w-3.5 h-3.5" />, color: 'bg-amber-light text-amber-800' },
    { id: 'bright-floral', label: 'Bright, Floral & Tea-Like', icon: <Flower2 className="w-3.5 h-3.5" />, color: 'bg-berry-light text-berry-origin' },
    { id: 'clean-focus', label: 'Clean Focus (No Jitters)', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-matcha-light text-matcha' },
    { id: 'caffeine-free', label: 'Caffeine-Free Cozy', icon: <HeartHandshake className="w-3.5 h-3.5" />, color: 'bg-canvas-parchment text-cacao-secondary' },
  ];

  // Filter items
  const filteredItems = menuItems.filter(item => {
    // Mood filter
    if (activeMood !== 'all' && !item.moodCravings.includes(activeMood)) {
      return false;
    }
    // Dietary filter
    if (dietaryFilter === 'gluten-free' && !item.isGlutenFree) return false;
    if (dietaryFilter === 'vegan') {
      if (milkPreference === 'whole') return false;
      if (!item.isVeganByDefault && (item.id === 'drink-1' || item.id === 'drink-7')) {
        // contains raw honey
        return false;
      }
    }
    return true;
  });

  // Calculate adjusted price based on milk preference
  const getItemPrice = (basePrice: number) => {
    if (milkPreference === 'almond') return basePrice + 0.50;
    return basePrice;
  };

  // Calculate adjusted calories based on milk preference
  const getItemCalories = (baseCalories: number, category: string) => {
    if (category === 'filter') return baseCalories;
    if (milkPreference === 'almond') return Math.max(10, Math.round(baseCalories * 0.8));
    if (milkPreference === 'whole') return Math.round(baseCalories * 1.15);
    return baseCalories; // Oat standard
  };

  const renderMeterDots = (score: number, activeColor: string = 'bg-amber-honey') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`w-2 h-2 rounded-full transition-colors ${
              dot <= score ? activeColor : 'bg-espresso-primary/10'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="sensory-menu" className="py-16 sm:py-24 bg-canvas-parchment/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sensory Menu & Flavor Translator</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-espresso-primary">
            How Do You Want to Feel Today?
          </h2>
          <p className="text-sm sm:text-base text-cacao-secondary leading-relaxed">
            We tossed out cold corporate lists and intimidating jargon. Filter by the human craving you're chasing, inspect each cup's anatomy down to the ounce, and find its soulmate pastry pairing.
          </p>
        </div>

        {/* Sticky-Friendly Mood & Craving Filter Ribbon */}
        <div className="mb-8 space-y-4">
          
          {/* Mood Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {moodFilters.map((mood) => {
              const isActive = activeMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setActiveMood(mood.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                    isActive
                      ? 'bg-espresso-primary text-canvas-oat shadow-warm-md scale-105'
                      : 'bg-surface-ceramic text-espresso-primary hover:bg-white border border-linen-hairline'
                  }`}
                >
                  <span className={isActive ? 'text-amber-300' : 'text-terracotta'}>
                    {mood.icon}
                  </span>
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>

          {/* Milk & Dietary Transparency Control Bar */}
          <div className="bg-surface-ceramic border border-linen-hairline p-3 sm:p-4 rounded-2xl shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Milk Transparency Switch */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-mono font-semibold uppercase text-oat-muted shrink-0 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-terracotta" />
                Milk Standard:
              </span>
              <div className="flex bg-canvas-parchment p-1 rounded-xl">
                {(['oat', 'whole', 'almond'] as MilkOption[]).map((milk) => {
                  const isCurrent = milkPreference === milk;
                  const milkLabels: Record<string, string> = {
                    oat: 'House Oat (Free)',
                    whole: 'Local Whole',
                    almond: 'Organic Almond (+$0.50)'
                  };
                  return (
                    <button
                      key={milk}
                      onClick={() => setMilkPreference(milk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-surface-ceramic text-espresso-primary shadow-sm font-semibold'
                          : 'text-cacao-secondary hover:text-espresso-primary'
                      }`}
                    >
                      {milkLabels[milk]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Tags Switch */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs font-mono font-semibold uppercase text-oat-muted">
                Dietary:
              </span>
              <div className="flex items-center gap-1.5 bg-canvas-parchment p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'gluten-free', label: 'Gluten-Free Friendly' },
                  { id: 'vegan', label: 'Plant-Based / Vegan' }
                ].map((item) => {
                  const isSelected = dietaryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDietaryFilter(item.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-surface-ceramic text-matcha font-semibold shadow-sm'
                          : 'text-cacao-secondary hover:text-espresso-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Sensory Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const adjustedPrice = getItemPrice(item.price);
            const adjustedCalories = getItemCalories(item.calories, item.category);
            const soulmatePastry = PASTRY_ITEMS.find(p => p.id === item.soulmatePastryId);

            return (
              <div
                key={item.id}
                className="bg-surface-ceramic border border-linen-hairline hover:border-terracotta rounded-card p-5 sm:p-6 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Top Row: Seasonal Tag & Monospace Price */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-canvas-parchment text-espresso-primary">
                      {item.seasonalTag || 'House Crafted'}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-xs text-oat-muted uppercase">{item.size}</span>
                      <span className="text-xs text-oat-muted">•</span>
                      <span className="text-sm font-bold text-espresso-primary">
                        ${adjustedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Drink Title */}
                  <h3 className="font-serif text-xl font-semibold text-espresso-primary group-hover:text-terracotta transition-colors mb-2">
                    {item.name}
                  </h3>

                  {/* 3-Word Tasting Notes Strip */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {item.tastingNotes.map((note) => (
                      <span
                        key={note}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-canvas-parchment text-cacao-secondary"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {/* Short Narrative Description */}
                  <p className="text-xs text-cacao-secondary leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Interactive Cup Anatomy & Intensity Preview */}
                  <div className="bg-canvas-oat/70 border border-linen-hairline rounded-xl p-3 mb-4 space-y-2.5">
                    
                    {/* Layered Visual Proportion Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-oat-muted">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-terracotta" />
                          Cup Anatomy Proportions
                        </span>
                        <span>{item.size}</span>
                      </div>
                      
                      {/* Stacked Proportional Bar */}
                      <div className="h-4 w-full bg-white rounded-full overflow-hidden flex shadow-inner border border-linen-hairline">
                        {item.cupAnatomy.map((layer, idx) => (
                          <div
                            key={idx}
                            style={{ 
                              width: `${layer.percentage}%`, 
                              backgroundColor: layer.color 
                            }}
                            className="h-full transition-all duration-300 relative group/layer cursor-pointer"
                            title={`${layer.name} (${layer.percentage}%) - ${layer.description}`}
                          />
                        ))}
                      </div>

                      {/* Brief Ratio Summary */}
                      <div className="text-[10px] font-mono text-cacao-secondary truncate pt-0.5">
                        {item.ratioDescription}
                      </div>
                    </div>

                    {/* 3-Dot Intensity Meters: Roast, Sweetness, Caffeine */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-linen-hairline text-[10px] font-mono text-cacao-secondary">
                      <div className="flex flex-col items-center">
                        <span className="text-oat-muted">Roast</span>
                        {renderMeterDots(item.roastWarmth, 'bg-amber-800')}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-oat-muted">Sweetness</span>
                        {renderMeterDots(item.sweetness, 'bg-amber-honey')}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-oat-muted">Caffeine</span>
                        {renderMeterDots(item.caffeineKick, 'bg-terracotta')}
                      </div>
                    </div>

                    {/* View detailed layers trigger */}
                    <button
                      onClick={() => setCupAnatomyDrink(item)}
                      className="w-full text-center text-[10px] text-terracotta hover:underline font-mono pt-1"
                    >
                      + Inspect Layer Ingredients & Notes
                    </button>
                  </div>
                </div>

                {/* Bottom Dashed Ticket Footer: Soulmate Pastry Pairing + Add to Cart */}
                <div className="border-t border-craft-stamp pt-3.5 mt-2 space-y-3">
                  
                  {/* Soulmate Pastry Pairing Nudge */}
                  {soulmatePastry && (
                    <div className="flex items-center justify-between text-xs bg-canvas-parchment/60 p-2 rounded-lg">
                      <div className="truncate pr-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-terracotta block">
                          Soulmate Pairing:
                        </span>
                        <span className="font-serif text-espresso-primary truncate block text-[11px]">
                          {soulmatePastry.name} (+${soulmatePastry.price.toFixed(2)})
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart({
                          id: item.id,
                          name: item.name,
                          price: adjustedPrice,
                          itemType: 'drink',
                          milk: milkPreference,
                          pairedPastry: {
                            id: soulmatePastry.id,
                            name: soulmatePastry.name,
                            price: soulmatePastry.price
                          }
                        })}
                        className="text-[10px] font-mono font-bold uppercase text-terracotta hover:text-white hover:bg-terracotta border border-terracotta/40 px-2 py-1 rounded transition-colors shrink-0"
                        title="Add drink + paired pastry combo to pre-order"
                      >
                        + Pair Both
                      </button>
                    </div>
                  )}

                  {/* Actions: Direct Drink Add & Allergen/Calorie metadata */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] font-mono text-oat-muted">
                      <span>~{adjustedCalories} kcal</span>
                      <span className="mx-1.5">•</span>
                      <span>{item.isGlutenFree ? 'GF' : 'Wheat'}</span>
                      <span className="mx-1.5">•</span>
                      <span>{milkPreference.toUpperCase()}</span>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: adjustedPrice,
                        itemType: 'drink',
                        milk: milkPreference,
                        temp: item.temp === 'iced' ? 'iced' : 'hot'
                      })}
                      className="flex items-center gap-1.5 bg-espresso-primary hover:bg-terracotta text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-warm-sm transition-all"
                      title="Add to Walk-in Pre-order"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Empty state if filtering yields nothing */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-surface-ceramic rounded-2xl border border-linen-hairline p-8 max-w-md mx-auto">
            <Coffee className="w-10 h-10 text-oat-muted mx-auto mb-3" />
            <h4 className="font-serif text-lg font-semibold text-espresso-primary">No drinks match this exact combination</h4>
            <p className="text-xs text-cacao-secondary mt-1 mb-4">
              Try switching your milk standard or selecting "All Creations" to explore our full seasonal roster.
            </p>
            <button
              onClick={() => {
                setActiveMood('all');
                setDietaryFilter('all');
              }}
              className="bg-terracotta text-white text-xs font-medium px-4 py-2 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
