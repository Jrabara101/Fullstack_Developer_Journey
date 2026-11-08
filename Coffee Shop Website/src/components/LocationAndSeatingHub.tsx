import React from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { 
  MapPin, 
  Wifi, 
  Zap, 
  Sun, 
  Volume2, 
  Dog, 
  Clock, 
  Bike, 
  Coffee, 
  Navigation,
  Compass
} from 'lucide-react';

export const LocationAndSeatingHub: React.FC = () => {
  const { selectedZone, setSelectedZone, allZones } = useCoffeeShop();

  return (
    <section id="seating-hub" className="py-16 sm:py-24 bg-canvas-parchment/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Floorplan & Seating Intelligence</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-espresso-primary">
            Know Before You Walk Over
          </h2>
          <p className="text-sm sm:text-base text-cacao-secondary leading-relaxed">
            Whether you need a quiet corner for a chapter of your novel, an outlet-packed oak slab for your laptop, or a sun-dappled patio for your pup—explore each corner before you step outside.
          </p>
        </div>

        {/* 12-Column Split Hub Container */}
        <div className="bg-surface-ceramic border border-linen-hairline rounded-hub p-6 sm:p-10 shadow-warm-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left 7 Columns: Illustrated Floorplan & Nook Explorer */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-espresso-primary">
                    Architectural Cafe Floorplan
                  </h3>
                  <p className="text-xs text-cacao-secondary mt-0.5">
                    Click any zone pin to preview live atmosphere, outlet counts & comfort levels.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-matcha bg-matcha-light px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-matcha animate-ping"></span>
                  <span>Live Sensors Active</span>
                </div>
              </div>

              {/* Architectural Illustrated SVG Cafe Canvas */}
              <div className="relative aspect-[16/11] bg-canvas-parchment/80 rounded-2xl border-2 border-dashed border-espresso-primary/15 p-4 sm:p-6 overflow-hidden flex flex-col justify-between shadow-inner">
                
                {/* SVG Blueprint Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#231915" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Subtle architectural wall outlines */}
                  <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#231915" strokeWidth="2" strokeDasharray="6,4" />
                  <path d="M 35% 5% L 35% 75% M 65% 5% L 65% 75%" stroke="#231915" strokeWidth="1.5" />
                </svg>

                {/* Zone Labels on Floorplan */}
                <div className="relative z-10 flex justify-between text-[11px] font-mono text-oat-muted uppercase">
                  <span>Front Porch & Mullioned Windows</span>
                  <span>Back Courtyard & Maple Garden</span>
                </div>

                {/* Floorplan Graphical Zones */}
                <div className="relative z-10 grid grid-cols-3 gap-3 my-auto h-3/4">
                  
                  {/* Zone 1: Window Bench Visual Block */}
                  <div 
                    onClick={() => setSelectedZone(allZones[0])}
                    className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                      selectedZone.id === 'zone-window' 
                        ? 'bg-amber-honey/20 border-terracotta ring-2 ring-terracotta/30 shadow-md' 
                        : 'bg-white/60 border-espresso-primary/10 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-terracotta bg-terracotta/15 w-6 h-6 rounded-full flex items-center justify-center">1</span>
                      <Sun className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-espresso-primary">Window Bench</div>
                      <div className="text-[10px] font-mono text-oat-muted">6 seats • Street View</div>
                    </div>
                  </div>

                  {/* Zone 2 & 4 Center Column */}
                  <div className="flex flex-col gap-3">
                    {/* Zone 2: Communal Oak Table */}
                    <div 
                      onClick={() => setSelectedZone(allZones[1])}
                      className={`flex-1 cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                        selectedZone.id === 'zone-oak-table' 
                          ? 'bg-amber-honey/20 border-terracotta ring-2 ring-terracotta/30 shadow-md' 
                          : 'bg-white/60 border-espresso-primary/10 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-terracotta bg-terracotta/15 w-6 h-6 rounded-full flex items-center justify-center">2</span>
                        <Zap className="w-4 h-4 text-terracotta" />
                      </div>
                      <div>
                        <div className="font-serif font-bold text-xs sm:text-sm text-espresso-primary">Oak Table</div>
                        <div className="text-[10px] font-mono text-oat-muted">12 seats • 8 AC Outlets</div>
                      </div>
                    </div>

                    {/* Zone 4: Espresso Bar */}
                    <div 
                      onClick={() => setSelectedZone(allZones[3])}
                      className={`cursor-pointer rounded-xl border p-2.5 flex items-center justify-between transition-all ${
                        selectedZone.id === 'zone-espresso-bar' 
                          ? 'bg-amber-honey/20 border-terracotta ring-2 ring-terracotta/30 shadow-md' 
                          : 'bg-white/60 border-espresso-primary/10 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-terracotta bg-terracotta/15 w-5 h-5 rounded-full flex items-center justify-center">4</span>
                        <div className="text-left">
                          <div className="font-serif font-bold text-xs text-espresso-primary">Brew Bar</div>
                          <div className="text-[9px] font-mono text-oat-muted">Travertine Counter</div>
                        </div>
                      </div>
                      <Coffee className="w-3.5 h-3.5 text-cacao-secondary" />
                    </div>
                  </div>

                  {/* Zone 3: Garden Patio Visual Block */}
                  <div 
                    onClick={() => setSelectedZone(allZones[2])}
                    className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                      selectedZone.id === 'zone-garden-patio' 
                        ? 'bg-amber-honey/20 border-terracotta ring-2 ring-terracotta/30 shadow-md' 
                        : 'bg-white/60 border-espresso-primary/10 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-terracotta bg-terracotta/15 w-6 h-6 rounded-full flex items-center justify-center">3</span>
                      <Dog className="w-4 h-4 text-matcha" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-espresso-primary">Garden Patio</div>
                      <div className="text-[10px] font-mono text-oat-muted">16 seats • Dog Friendly</div>
                    </div>
                  </div>

                </div>

                <div className="relative z-10 flex justify-between text-[10px] font-mono text-cacao-secondary/70 pt-2 border-t border-espresso-primary/10">
                  <span>Front Entrance (Stroller / ADA Ramp)</span>
                  <span>Roastery Drums & Restrooms ↗</span>
                </div>
              </div>

              {/* Selected Zone Deep Dive Card */}
              <div className="bg-canvas-oat border border-linen-hairline rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={selectedZone.image}
                    alt={selectedZone.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-semibold text-espresso-primary">
                      {selectedZone.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-matcha bg-matcha-light px-2.5 py-0.5 rounded-full">
                      {selectedZone.currentOccupancyPct}% Occupied ({Math.round(selectedZone.totalSeats * (1 - selectedZone.currentOccupancyPct / 100))} seats open)
                    </span>
                  </div>

                  <p className="text-xs text-cacao-secondary leading-relaxed">
                    {selectedZone.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px] text-cacao-secondary">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-terracotta" />
                      {selectedZone.outletsCount} Outlets
                    </span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-700" />
                      {selectedZone.noiseLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-matcha" />
                      Fast Fiber
                    </span>
                    <span className="flex items-center gap-1">
                      <Dog className="w-3 h-3 text-cacao-secondary" />
                      {selectedZone.dogFriendly ? 'Dogs Welcomed' : 'Service Animals'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Hospitality, Practical Logistics & Neighborhood Guide */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Address & Walking Directions */}
              <div className="bg-canvas-parchment/60 p-5 rounded-2xl border border-linen-hairline space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-terracotta">
                  <MapPin className="w-4 h-4" />
                  <span>Sanctuary Coordinates</span>
                </div>
                
                <div>
                  <h4 className="font-serif text-xl font-semibold text-espresso-primary">
                    424 Vesterbrogade • Stumptown Corner
                  </h4>
                  <p className="text-xs sm:text-sm text-cacao-secondary mt-1 leading-relaxed">
                    2 blocks east of the Saturday Farmers Market • Between the old brick bakery and the botanical florist.
                  </p>
                </div>

                <div className="text-xs font-mono bg-white/70 p-3 rounded-xl border border-linen-hairline space-y-1.5 text-cacao-secondary">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-terracotta" />
                    <span>Transit: 4-min walk from Central Station (Lines 2 & 14)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bike className="w-3.5 h-3.5 text-terracotta" />
                    <span>Cycling: Covered 12-bike rack & free floor pump right out front</span>
                  </div>
                </div>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
                >
                  <span>Open in Apple / Google Maps ↗</span>
                </a>
              </div>

              {/* Laptop & Study Hours Transparency Badge */}
              <div className="bg-canvas-oat p-5 rounded-2xl border border-craft-stamp space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-espresso-primary">
                    <Clock className="w-4 h-4 text-terracotta" />
                    <span>Laptop & Study Etiquette Timeline</span>
                  </div>
                  <span className="text-[10px] font-mono text-matcha bg-matcha-light px-2 py-0.5 rounded-full font-bold">
                    No Awkward Surprises
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-linen-hairline">
                    <div className="font-semibold text-espresso-primary flex items-center justify-between">
                      <span>Mon – Fri • All Day (7am – 6pm)</span>
                      <span className="text-[10px] text-matcha font-mono">💻 Laptops Welcomed</span>
                    </div>
                    <p className="text-[11px] text-cacao-secondary mt-0.5">
                      Spread out at the Communal Oak Table or window bar with 8 high-speed power outlets and quiet focus.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-linen-hairline">
                    <div className="font-semibold text-espresso-primary flex items-center justify-between">
                      <span>Sat – Sun • 10:00 AM – 2:00 PM</span>
                      <span className="text-[10px] text-terracotta font-mono">✨ Screen-Free Brunch</span>
                    </div>
                    <p className="text-[11px] text-cacao-secondary mt-0.5">
                      Oak tables convert to shared community dining and conversation. Books, sketches, and newspapers always encouraged!
                    </p>
                  </div>
                </div>
              </div>

              {/* Neighborhood Perks */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold uppercase text-oat-muted">
                  Neighborhood Hospitality Perks:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-cacao-secondary font-medium">
                  <div className="flex items-center gap-2 bg-canvas-parchment/60 p-2.5 rounded-xl border border-linen-hairline">
                    <Dog className="w-4 h-4 text-matcha shrink-0" />
                    <span>Free Pup-Cups on Patio</span>
                  </div>
                  <div className="flex items-center gap-2 bg-canvas-parchment/60 p-2.5 rounded-xl border border-linen-hairline">
                    <Coffee className="w-4 h-4 text-amber-honey shrink-0" />
                    <span>25¢ BYO Tumbler Discount</span>
                  </div>
                  <div className="flex items-center gap-2 bg-canvas-parchment/60 p-2.5 rounded-xl border border-linen-hairline">
                    <Bike className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Covered Bike Racks</span>
                  </div>
                  <div className="flex items-center gap-2 bg-canvas-parchment/60 p-2.5 rounded-xl border border-linen-hairline">
                    <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>65W USB-C Ports</span>
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
