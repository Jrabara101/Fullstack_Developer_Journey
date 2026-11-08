import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Sparkles, Clock, ArrowRight, Flame, CheckCircle2 } from 'lucide-react';
import { MENU_ITEMS } from '../data/mockData';

export const HeroSection: React.FC = () => {
  const { 
    timeOfDay, 
    weather, 
    addToCart, 
    setCupAnatomyDrink, 
    setIsQuizOpen 
  } = useCoffeeShop();

  // Pick suggested drink for current weather/time
  const suggestedDrink = MENU_ITEMS.find(d => d.id === weather.suggestedDrinkId) || MENU_ITEMS[0];

  // Headings based on time of day
  const greetings: Record<string, { eyebrow: string; title: string; subtitle: string; dialInNote: string }> = {
    morning: {
      eyebrow: 'Morning Rituals • 8:00 AM on the Clock',
      title: 'Morning Rituals & Crisp Pour-Overs',
      subtitle: 'Sunlight slanting across unbleached linen and warm oak. Hand-poured single origins and cardamom buns pulled hot from the oven.',
      dialInNote: 'Don Rodrigo Sánchez (Huila, Colombia) • 18g dose / 300g water @ 93°C • Floral bergamot and honey peach'
    },
    midday: {
      eyebrow: 'Midday Stroll • 1:00 PM Cafe Buzz',
      title: 'Clean Focus & Silky Nitro Extractions',
      subtitle: 'The communal table is humming with soft focus. Slow-steeped cold brews and velvety flat whites to carry your afternoon thoughts.',
      dialInNote: 'Kercha Washing Station (Guji, Ethiopia) • 20hr slow cold steep with roasted cacao nibs'
    },
    'golden-hour': {
      eyebrow: 'Golden Hour • 4:30 PM Amber Light',
      title: 'Golden Hour Decaf, Chai & Warm Loaves',
      subtitle: 'The light softens into honeyed amber. Low-acid lattes, whole-spice simmered chai, and fresh-baked spelt galettes for an unhurried sunset.',
      dialInNote: 'Swiss Water Decaf conditioned in charred bourbon casks • Gentle low-acidity extraction'
    },
    'evening-lounge': {
      eyebrow: 'Dusk Sessions • 6:30 PM Vinyl Lounge',
      title: 'Spinning Vinyl & Caffeine-Free Warmth',
      subtitle: 'Turntable spinning Bill Evans in the background. Steamed herbal clouds, smoked honey infusions, and quiet conversation by candlelight.',
      dialInNote: 'Simmered red bush rooibos with cinnamon bark and raw wildflower honey'
    }
  };

  const currentGreeting = greetings[timeOfDay] || greetings['morning'];

  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-20 paper-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left 6-7 Columns: Warm Typographic Storytelling */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Atmosphere Pill */}
            <div className="inline-flex items-center gap-2 bg-surface-ceramic border border-linen-hairline px-3.5 py-1.5 rounded-full shadow-warm-sm">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
              <span className="font-mono text-xs font-semibold text-cacao-secondary tracking-wide uppercase">
                {currentGreeting.eyebrow}
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-espresso-primary leading-[1.08]">
              {currentGreeting.title}
            </h1>

            {/* Humanized Subtitle */}
            <p className="text-base sm:text-lg text-cacao-secondary leading-relaxed max-w-2xl font-normal">
              {currentGreeting.subtitle}
            </p>

            {/* Smart Engine: "Perfect for Right Now" Weather & Palate Match Card */}
            <div className="bg-surface-ceramic border-craft-stamp p-5 rounded-2xl shadow-warm-sm relative group transition-all hover:border-terracotta">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-linen-hairline">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-terracotta uppercase">
                  <Sparkles className="w-4 h-4 text-amber-honey" />
                  <span>Right Now At This Hour • {weather.label}</span>
                </div>
                <span className="text-[11px] text-oat-muted font-mono bg-canvas-parchment px-2 py-0.5 rounded">
                  {suggestedDrink.size} • ${suggestedDrink.price.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-semibold text-espresso-primary group-hover:text-terracotta transition-colors">
                    {suggestedDrink.name}
                  </h4>
                  <p className="text-xs text-cacao-secondary line-clamp-2">
                    {weather.recommendationReason}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    {suggestedDrink.tastingNotes.slice(0, 3).map((note) => (
                      <span key={note} className="text-[10px] bg-canvas-parchment text-espresso-primary px-2 py-0.5 rounded-full font-medium">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => addToCart({
                      id: suggestedDrink.id,
                      name: suggestedDrink.name,
                      price: suggestedDrink.price,
                      itemType: 'drink'
                    })}
                    className="flex items-center justify-center gap-1.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-warm-sm transition-all"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCupAnatomyDrink(suggestedDrink)}
                    className="text-[11px] text-cacao-secondary hover:text-espresso-primary underline underline-offset-2 font-mono text-center"
                  >
                    View Cup Anatomy
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Single-Origin Dial-In Metadata Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs bg-canvas-parchment/70 border border-linen-hairline p-3.5 rounded-xl text-cacao-secondary">
              <span className="font-mono uppercase font-bold text-terracotta shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Roaster's Dial-In:
              </span>
              <span className="font-mono text-[11px] leading-relaxed">
                {currentGreeting.dialInNote}
              </span>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#sensory-menu"
                className="bg-espresso-primary hover:bg-espresso-dark text-canvas-oat px-6 py-3.5 rounded-full font-medium text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center gap-2 group"
              >
                <span>Explore Sensory Menu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="#seating-hub"
                className="bg-surface-ceramic hover:bg-canvas-parchment border border-linen-hairline text-espresso-primary px-5 py-3.5 rounded-full font-medium text-sm transition-all"
              >
                Check Seating & Outlets
              </a>

              <button
                onClick={() => setIsQuizOpen(true)}
                className="text-xs font-semibold text-terracotta hover:text-terracotta-hover flex items-center gap-1.5 px-3 py-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>"Find My Bean" 20s Quiz</span>
              </button>
            </div>

            {/* Quick Assurance Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-oat-muted pt-2 border-t border-linen-hairline">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-matcha" />
                No sterile PDF menus
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-matcha" />
                Arrival-timed warm pre-orders
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-matcha" />
                Oat & house whole milk at no upcharge
              </span>
            </div>

          </div>

          {/* Right 5-6 Columns: Archival-Framed Imagery + Overlapping Barista Polaroid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Warm Archival Photography Frame */}
              <div className="relative rounded-frame overflow-hidden shadow-warm-xl border border-linen-hairline bg-surface-ceramic aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
                  alt="Cozy sunlit coffee bar with ceramic mugs and pour-over kettle"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Subtle warm gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-dark/60 via-transparent to-transparent pointer-events-none" />

                {/* Live Steam Illusion Badge */}
                <div className="absolute top-4 left-4 bg-surface-roast/85 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
                  <div className="flex items-center text-amber-300">
                    <span className="inline-block animate-steam">~</span>
                    <span className="inline-block animate-steam delay-75">~</span>
                  </div>
                  <span>Pulling Shots on Bar</span>
                </div>

                {/* Bottom Frame Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-serif italic text-white/90">
                  "A good cup of coffee gives you a minute of quiet hospitality in an otherwise hectic world."
                </div>
              </div>

              {/* Overlapping Polaroid Spotlight: Maya's Daily Obsession */}
              <div className="absolute -bottom-8 -left-6 sm:-left-8 bg-surface-ceramic p-3 pb-5 rounded-xl shadow-warm-xl border border-linen-hairline max-w-[240px] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-canvas-parchment mb-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
                    alt="Smoked Honey Cortado in textured ceramic"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-terracotta text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                    STAFF PICK
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-serif font-bold text-espresso-primary">Maya's Cortado</span>
                    <span className="font-mono font-bold text-terracotta">$5.75</span>
                  </div>
                  <p className="text-[10px] text-cacao-secondary leading-tight line-clamp-2">
                    "Infused with charred rosemary & raw wildflower honey."
                  </p>
                  <button
                    onClick={() => addToCart({
                      id: 'drink-1',
                      name: 'Smoked Honey & Rosemary Cortado',
                      price: 5.75,
                      itemType: 'drink'
                    })}
                    className="w-full mt-2 text-[10px] font-bold uppercase tracking-wider text-terracotta hover:text-white hover:bg-terracotta border border-terracotta/40 py-1 rounded transition-colors text-center"
                  >
                    + Add to Pre-Order
                  </button>
                </div>
              </div>

              {/* Fresh Out of Oven Pill Floating Badge */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-surface-ceramic border-craft-stamp p-3 rounded-2xl shadow-warm-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-honey/20 flex items-center justify-center text-amber-700 shrink-0">
                  <Flame className="w-5 h-5 text-terracotta animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-mono uppercase font-bold text-terracotta">
                    Warm From Oven
                  </div>
                  <div className="text-xs font-serif font-semibold text-espresso-primary">
                    Cardamom Buns
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
