import React, { useState } from 'react';
import { BookOpen, Compass, Flame, Heart, MapPin } from 'lucide-react';
import { useCoffeeShop } from '../context/CoffeeShopContext';

export const SeedToCupScrollytelling: React.FC = () => {
  const { setBrewCompanionBean, beanBags } = useCoffeeShop();
  const [activeFarmIndex, setActiveFarmIndex] = useState(0);

  const farmPostcards = [
    {
      country: 'Colombia',
      region: 'Huila, San Adolfo',
      farm: 'Finca La Violeta',
      producer: 'Don Rodrigo Sánchez',
      elevation: '1,920 MASL',
      variety: 'Pink Bourbon (Hand-Picked)',
      process: 'Washed Extended Fermentation',
      quote: '"We wait until the cherries turn a gentle salmon-pink. That is when the natural brix sugars are at their absolute peak."',
      story: 'Don Rodrigo and his family have cultivated Bourbon cultivars on the steep volcanic slopes of Huila for three generations. We purchase 100% of his Pink Bourbon lot directly at 3.5× Fair Trade minimums.',
      image: 'https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=800&q=80',
      beanBagId: 'bean-1'
    },
    {
      country: 'Ethiopia',
      region: 'Oromia, Guji Zone',
      farm: 'Smallholder Family Gardens',
      producer: 'Kercha Washing Station',
      elevation: '2,150 MASL',
      variety: 'Indigenous Heirloom & Kurume',
      process: 'Natural Anaerobic 72-Hour',
      quote: '"In the morning mist of Guji, coffee trees grow wild under the shade of native acacia and fig canopies."',
      story: 'Over 300 farming families deliver single baskets of deep ruby cherries. The anaerobic fermentation inside sealed barrels unlocks breathtaking wild blueberry and violet florals.',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
      beanBagId: 'bean-2'
    },
    {
      country: 'Guatemala',
      region: 'Huehuetenango',
      farm: 'Finca El Injerto',
      producer: 'Arturo Aguirre',
      elevation: '1,820 MASL',
      variety: 'Yellow Catuai & Red Bourbon',
      process: 'Spring-Water Washed & Patio Dried',
      quote: '"The natural mineral springs flowing from the Cuchumatanes mountains wash our parchment with crystalline purity."',
      story: 'Nestled deep in the cloud forest, El Injerto is legendary for its pristine environmental stewardship, zero chemical runoff, and rich chocolate-hazelnut body.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      beanBagId: 'bean-3'
    }
  ];

  const currentPostcard = farmPostcards[activeFarmIndex];

  return (
    <section id="seed-to-cup" className="py-20 sm:py-28 bg-surface-roast text-canvas-oat relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-honey/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <BookOpen className="w-3.5 h-3.5" />
            <span>3-Chapter Tactile Roastery Journal</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white">
            From the Earth to Your Morning Ceramic
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans">
            Great coffee isn't engineered in a laboratory. It begins with the soil, the elevation, the hands of farmers we know by name, and an unwavering commitment to craftsmanship.
          </p>
        </div>

        {/* Chapter 1: The Farmers We Know By First Name (Interactive Postcard Hub) */}
        <div className="mb-20 bg-white/5 border border-white/10 rounded-hub p-6 sm:p-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="font-mono text-xs text-amber-400 uppercase font-bold tracking-wider">Chapter 01</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium mt-1">
                The Farmers We Know by First Name
              </h3>
            </div>

            {/* Farm Selector Tabs */}
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
              {farmPostcards.map((f, idx) => (
                <button
                  key={f.country}
                  onClick={() => setActiveFarmIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeFarmIndex === idx
                      ? 'bg-terracotta text-white font-bold shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {f.country}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Postcard Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 6 Cols: Archival Travel Postcard Photo */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform -rotate-1 hover:rotate-0 transition-transform duration-500 group aspect-[4/3]">
                <img
                  src={currentPostcard.image}
                  alt={currentPostcard.farm}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Postcard Airmail Stamp Badge */}
                <div className="absolute top-4 right-4 bg-surface-ceramic/95 text-espresso-primary p-3 rounded-xl shadow-lg border border-craft-stamp max-w-[170px] text-left">
                  <div className="text-[9px] font-mono uppercase font-bold text-terracotta tracking-wider">
                    DIRECT ORIGIN HARVEST
                  </div>
                  <div className="font-serif font-bold text-xs truncate">
                    {currentPostcard.producer}
                  </div>
                  <div className="text-[10px] font-mono text-cacao-secondary">
                    {currentPostcard.elevation}
                  </div>
                </div>

                {/* Country Flag Tag */}
                <div className="absolute bottom-4 left-4 bg-surface-roast/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white flex items-center gap-1.5 border border-white/15">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentPostcard.farm} • {currentPostcard.country}</span>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Postcard Journal Notes */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <div className="font-mono text-xs text-amber-300 uppercase tracking-wider">
                  {currentPostcard.region} • {currentPostcard.elevation}
                </div>
                <h4 className="font-serif text-2xl text-white font-semibold">
                  {currentPostcard.farm}
                </h4>
                <div className="text-xs font-mono text-white/50">
                  Variety: {currentPostcard.variety} • Process: {currentPostcard.process}
                </div>
              </div>

              {/* Hand-Written Style Quote */}
              <blockquote className="border-l-2 border-amber-honey pl-4 italic text-amber-100/90 font-serif text-base leading-relaxed">
                {currentPostcard.quote}
              </blockquote>

              <p className="text-sm text-white/70 leading-relaxed font-sans">
                {currentPostcard.story}
              </p>

              {/* Action Button: Brew Recipe for this bean */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const match = beanBags.find(b => b.id === currentPostcard.beanBagId) || beanBags[0];
                    setBrewCompanionBean(match);
                  }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-full text-xs font-mono font-semibold transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Roaster's Dial-In Home Pour-Over Recipe ↗</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Chapters 2 & 3: Cast-Iron Roaster & Third Place Promise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Chapter 02: Small Batch Roasting */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 uppercase font-bold tracking-wider">
                  Chapter 02
                </span>
                <Flame className="w-4 h-4 text-terracotta" />
              </div>
              
              <h3 className="font-serif text-2xl text-white font-medium">
                Small-Batch Roasting on Our 1968 Cast-Iron Drum
              </h3>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                We roast on a lovingly restored Probat drum from Emmerich, Germany. Unlike high-speed commercial air-roasters, heavy cast iron conducts gentle, radiant warmth through the core of each bean.
              </p>

              <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs font-mono text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/40">Philosophy:</span>
                  <span className="text-amber-300">Light-to-Medium Sweetness</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Batch Size:</span>
                  <span>12 kg maximum per drop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Roast Master:</span>
                  <span>Maya Lin (Q-Grader Certified)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-white/50 font-serif italic">
              "We stop the roast the exact second the origin's natural florals blossom—never burning the character into generic ash."
            </div>
          </div>

          {/* Chapter 03: The Third Place Sanctuary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 uppercase font-bold tracking-wider">
                  Chapter 03
                </span>
                <Heart className="w-4 h-4 text-berry-origin" />
              </div>
              
              <h3 className="font-serif text-2xl text-white font-medium">
                Our "Third Place" Neighborhood Promise
              </h3>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Sociologist Ray Oldenburg coined the "Third Place"—the sanctuary between work and home where human conversation flourishes. We don't have order turnstiles or blaring TVs.
              </p>

              <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs font-mono text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/40">Music Policy:</span>
                  <span className="text-amber-300">Vinyl LP Only (Zero algorithmic ads)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Bakery Policy:</span>
                  <span>From-scratch daily at 5:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Hospitality:</span>
                  <span>Take as long as you need to sip</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-white/50 font-serif italic">
              "You are always welcomed here, whether you have 10 minutes between meetings or 3 hours with a paperback."
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
