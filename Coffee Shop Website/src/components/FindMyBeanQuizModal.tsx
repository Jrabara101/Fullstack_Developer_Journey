import React, { useState } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { Sparkles, X, ArrowRight, RotateCcw, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COFFEE_BEANS } from '../data/mockData';
import type { CoffeeBeanBag } from '../types';

export const FindMyBeanQuizModal: React.FC = () => {
  const { isQuizOpen, setIsQuizOpen, addToCart, setBrewCompanionBean } = useCoffeeShop();

  const [step, setStep] = useState(1);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);

  if (!isQuizOpen) return null;

  const resetQuiz = () => {
    setStep(1);
    setQ1(null);
    setQ2(null);
    setQ3(null);
  };

  const handleFinish = (finalQ3: string) => {
    setQ3(finalQ3);
    setStep(4);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C86D44', '#D99B26', '#4A6B53', '#FAF6F0']
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Match recommendation logic
  const getRecommendation = (): { bean: CoffeeBeanBag; drinkName: string; reason: string } => {
    if (q1 === 'black' || q2 === 'lemon' || q2 === 'berry') {
      return {
        bean: COFFEE_BEANS[0], // Pink Bourbon Colombia
        drinkName: 'Finca La Violeta Washed Pour-Over',
        reason: 'You appreciate clean acidity, sparkling fruit notes, and tea-like elegance. The Pink Bourbon elevation delivers bright nectarine and bergamot sweetness with zero bitterness.'
      };
    }
    if (q1 === 'sweet' || q2 === 'chocolate' || q3 === 'kick') {
      return {
        bean: COFFEE_BEANS[2], // Third Place Espresso Blend
        drinkName: 'Smoked Honey & Rosemary Cortado',
        reason: 'You love syrupy body, toasted hazelnut, and deep dark chocolate. Our Third Place blend cuts through milk or stands alone as a rich, velvety ristretto.'
      };
    }
    // Default to Ethiopian Guji
    return {
      bean: COFFEE_BEANS[1], // Guji Kercha
      drinkName: 'Wild Blackberry & Cacao Nitro Cold Brew',
      reason: 'You love complex floral fruitiness, wild blueberry compote, and juicy natural sweetness. A transcendent brew both hot on V60 and over ice.'
    };
  };

  const rec = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-primary/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-ceramic border border-linen-hairline rounded-hub max-w-lg w-full p-6 sm:p-8 shadow-warm-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsQuizOpen(false);
            resetQuiz();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-cacao-secondary hover:text-espresso-primary hover:bg-canvas-parchment transition-colors"
          aria-label="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-mono text-oat-muted uppercase mb-2">
              <span>Question {step} of 3</span>
              <span>20-Second Palate Matcher</span>
            </div>
            <div className="w-full bg-canvas-parchment h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-terracotta h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Question 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-wider text-terracotta font-semibold">
                Step 1: Your Morning Ritual
              </span>
              <h3 className="font-serif text-2xl font-semibold text-espresso-primary">
                How do you typically take your coffee?
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'black', title: 'Black, Clean & Unadorned', desc: 'I want to taste the terroir, florals, and delicate acidity like fine tea.' },
                { id: 'oat', title: 'Silky with Oat or Whole Milk', desc: 'I love a creamy flat white or cortado where coffee and milk harmonize.' },
                { id: 'sweet', title: 'Sweet, Spiced & Comforting', desc: 'Cardamom, raw honey, smoked syrups, or rich dark chocolate comfort.' },
                { id: 'strong', title: 'Bold, Dark & Syrupy', desc: 'Heavy mouthfeel, low acid, dark cacao, and a punchy kick to start my day.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setQ1(opt.id);
                    setStep(2);
                  }}
                  className="text-left p-3.5 rounded-xl border border-linen-hairline hover:border-terracotta hover:bg-canvas-parchment/60 transition-all group"
                >
                  <div className="font-serif font-bold text-sm text-espresso-primary group-hover:text-terracotta">
                    {opt.title}
                  </div>
                  <div className="text-xs text-cacao-secondary mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-wider text-terracotta font-semibold">
                Step 2: Flavor Association
              </span>
              <h3 className="font-serif text-2xl font-semibold text-espresso-primary">
                Pick a dessert you can never say no to:
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'lemon', title: 'Meyer Lemon Tart or Jasmine Peach Sorbet', desc: 'Vibrant, citrusy, sparkling and refreshing.' },
                { id: 'chocolate', title: 'Sea-Salt Dark Chocolate Fudge or Hazelnut Torte', desc: 'Deep, decadent roasted cacao and toasted nuts.' },
                { id: 'cardamom', title: 'Warm Cinnamon Cardamom Bun', desc: 'Aromatic bakery spices, brown butter, and unbleached sweetness.' },
                { id: 'berry', title: 'Wild Blackberry Crumble with Vanilla Cream', desc: 'Jammy, sweet-tart purple fruit and comforting crumble.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setQ2(opt.id);
                    setStep(3);
                  }}
                  className="text-left p-3.5 rounded-xl border border-linen-hairline hover:border-terracotta hover:bg-canvas-parchment/60 transition-all group"
                >
                  <div className="font-serif font-bold text-sm text-espresso-primary group-hover:text-terracotta">
                    {opt.title}
                  </div>
                  <div className="text-xs text-cacao-secondary mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-wider text-terracotta font-semibold">
                Step 3: Energy & Caffeine
              </span>
              <h3 className="font-serif text-2xl font-semibold text-espresso-primary">
                What kind of energy do you want?
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'kick', title: 'A Vigorous Morning Awakening', desc: 'Full caffeine kick to propel me into a demanding work day.' },
                { id: 'focus', title: 'Smooth, Gentle Flow (Zero Jitters)', desc: 'Clean, steady concentration without the racing heart.' },
                { id: 'decaf', title: 'Naturally Gentle or Caffeine-Free', desc: 'Low-acid and soothing on my stomach, pure flavor without the buzz.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleFinish(opt.id)}
                  className="text-left p-3.5 rounded-xl border border-linen-hairline hover:border-terracotta hover:bg-canvas-parchment/60 transition-all group"
                >
                  <div className="font-serif font-bold text-sm text-espresso-primary group-hover:text-terracotta">
                    {opt.title}
                  </div>
                  <div className="text-xs text-cacao-secondary mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result Celebration & Match */}
        {step === 4 && (
          <div className="space-y-5 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase font-bold text-matcha bg-matcha-light px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Palate Match Found</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-espresso-primary">
                Your Soulmate Coffee
              </h3>
            </div>

            {/* Matched Bean Card */}
            <div className="bg-canvas-parchment/70 border border-craft-stamp rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-terracotta font-bold uppercase">
                <span>{rec.bean.originCountry} • {rec.bean.elevation}</span>
                <span>{rec.bean.weightGrams}g Bag • ${rec.bean.price.toFixed(2)}</span>
              </div>

              <h4 className="font-serif text-xl font-bold text-espresso-primary">
                {rec.bean.name}
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {rec.bean.tastingNotes.map((note) => (
                  <span key={note} className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-linen-hairline">
                    {note}
                  </span>
                ))}
              </div>

              <p className="text-xs text-cacao-secondary leading-relaxed">
                {rec.reason}
              </p>

              <div className="pt-2 border-t border-espresso-primary/10 text-xs font-mono text-cacao-secondary flex justify-between items-center">
                <span>Suggested In-Store Sip:</span>
                <span className="font-serif font-bold text-espresso-primary">{rec.drinkName}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  addToCart({
                    id: rec.bean.id,
                    name: `${rec.bean.name} (Whole Bean)`,
                    price: rec.bean.price,
                    itemType: 'bean'
                  });
                  setIsQuizOpen(false);
                  resetQuiz();
                }}
                className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3 px-6 rounded-full font-semibold text-sm shadow-warm-md flex items-center justify-center gap-2"
              >
                <span>Add Recommended Bean Bag (${rec.bean.price.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsQuizOpen(false);
                  setBrewCompanionBean(rec.bean);
                }}
                className="w-full bg-canvas-parchment hover:bg-white border border-linen-hairline text-espresso-primary py-2.5 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Home Brew Dial-In Recipe</span>
              </button>

              <button
                onClick={resetQuiz}
                className="w-full text-center text-xs text-oat-muted hover:text-espresso-primary py-1 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake Palate Quiz</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
