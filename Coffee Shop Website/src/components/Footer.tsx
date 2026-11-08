import React, { useState } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Heart, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsQuizOpen, setIsCorkboardOpen } = useCoffeeShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-surface-roast text-canvas-oat border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Philosophy (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                KÖPA
              </span>
              <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Roastery & Bakery • Est. 2019
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-sm">
              An unhurried neighborhood sanctuary inspired by Copenhagen bakeries and vintage Japanese kissaten jazz cafes. Small-batch light roasting, scratch bakes, and analog warmth.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsQuizOpen(true)}
                className="text-xs font-mono font-semibold text-amber-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/15 transition-all"
              >
                Find My Morning Bean ↗
              </button>

              <button
                onClick={() => setIsCorkboardOpen(true)}
                className="text-xs font-mono font-semibold text-terracotta hover:text-white bg-terracotta/20 hover:bg-terracotta/30 px-3 py-1.5 rounded-full border border-terracotta/30 transition-all"
              >
                Pay-It-Forward Board ↗
              </button>
            </div>
          </div>

          {/* Column 2: Hours & Sanctuary Policy (3 Cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs font-mono">
            <h4 className="font-serif text-base font-semibold text-white tracking-normal font-sans">
              Hours & Warm Welcome
            </h4>

            <div className="space-y-1.5 text-white/70">
              <div className="flex justify-between">
                <span>Mon – Fri:</span>
                <span className="text-white font-medium">7:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sat – Sun:</span>
                <span className="text-white font-medium">8:00 AM – 5:00 PM</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-white/50 leading-relaxed border-t border-white/10">
              Fresh bakes pull from the oven at 7:15 AM, 9:30 AM & 1:00 PM daily. Espresso bar closes 15 mins before sunset.
            </div>
          </div>

          {/* Column 3: Newsletter for Fresh Roast Drops (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-normal font-sans">
              The Sunday Morning Drop
            </h4>
            
            <p className="text-xs text-white/70 leading-relaxed">
              Every other Sunday, we release 30 bags of rare microlots (Geisha, anaerobic naturals, and pink bourbons). No promotional spam, ever.
            </p>

            {subscribed ? (
              <div className="p-3 bg-matcha/20 border border-matcha/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-matcha" />
                <span>You're on the list! Welcome to the roastery family.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-honey flex-1"
                />
                <button
                  type="submit"
                  className="bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Credits & Ethos */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div className="flex items-center gap-2">
            <span>424 Vesterbrogade • Stumptown Corner</span>
            <span>•</span>
            <span>Covered Bike Rack • Dog Friendly Patio</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
            <span>for human-centric third-place sanctuaries</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
