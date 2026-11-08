import React, { useState } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { X, Heart, Plus, Coffee, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MENU_ITEMS } from '../data/mockData';

export const PayItForwardCorkboardModal: React.FC = () => {
  const { 
    isCorkboardOpen, 
    setIsCorkboardOpen, 
    communityCups, 
    addCommunityCup, 
    claimCommunityCup 
  } = useCoffeeShop();

  const [isAdding, setIsAdding] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [recipientNote, setRecipientNote] = useState('');
  const [selectedDrink, setSelectedDrink] = useState(MENU_ITEMS[0].name);

  // Claiming state
  const [claimingCupId, setClaimingCupId] = useState<string | null>(null);
  const [claimantName, setClaimantName] = useState('');

  if (!isCorkboardOpen) return null;

  const handlePostCup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientNote.trim()) return;

    addCommunityCup(senderName || 'A Kind Neighbor', recipientNote, selectedDrink, 5.50);
    setIsAdding(false);
    setSenderName('');
    setRecipientNote('');

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleClaimSubmit = (cupId: string) => {
    claimCommunityCup(cupId, claimantName || 'A grateful friend');
    setClaimingCupId(null);
    setClaimantName('');

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A6B53', '#D99B26', '#C86D44']
      });
    } catch (e) {}
  };

  const stickyBgClasses: Record<string, string> = {
    yellow: 'bg-[#FFF9D2] text-[#4A3D18] shadow-amber-900/10',
    peach: 'bg-[#FFE8DE] text-[#542B1A] shadow-red-900/10',
    sage: 'bg-[#E3EFE4] text-[#254228] shadow-emerald-900/10',
    amber: 'bg-[#FDF0D5] text-[#523C13] shadow-amber-900/10',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-primary/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#D4A373] border-8 border-[#8D5B4C] rounded-hub max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundImage: 'radial-gradient(rgba(141, 91, 76, 0.25) 2px, transparent 0)',
          backgroundSize: '16px 16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={() => setIsCorkboardOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface-roast/80 text-white hover:bg-surface-roast transition-colors shadow-md"
          aria-label="Close Corkboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Board Header Header */}
        <div className="bg-surface-ceramic/95 border border-linen-hairline rounded-2xl p-5 mb-6 shadow-warm-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-terracotta bg-terracotta-light px-2.5 py-0.5 rounded-full font-bold">
                Neighborhood Sanctuary Ledger
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-primary">
              The "Pay-It-Forward" Cup Board
            </h2>
            <p className="text-xs text-cacao-secondary max-w-xl">
              Buy a warm drink in advance for a tired nurse, student, or stranger having a rough week. Pin your note to the corkboard. Anyone who needs a hug in a cup can claim it.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-warm-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'Pin a $5 Cup'}</span>
          </button>
        </div>

        {/* Add Sticky Note Form Drawer */}
        {isAdding && (
          <form 
            onSubmit={handlePostCup}
            className="bg-[#FFF9D2] border-2 border-dashed border-amber-600/40 p-5 rounded-2xl mb-6 shadow-xl space-y-4 animate-in slide-in-from-top-3"
          >
            <div className="flex items-center justify-between font-serif font-bold text-amber-900 border-b border-amber-800/15 pb-2">
              <span>Pin a New Community Cup ($5.50)</span>
              <Heart className="w-4 h-4 text-terracotta" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-amber-950 mb-1">
                  From (Your Name / Regular Table):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya at the Window Bench"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white/80 border border-amber-800/20 rounded-lg p-2 text-espresso-primary text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-amber-950 mb-1">
                  Drink To Gift:
                </label>
                <select
                  value={selectedDrink}
                  onChange={(e) => setSelectedDrink(e.target.value)}
                  className="w-full bg-white/80 border border-amber-800/20 rounded-lg p-2 text-espresso-primary text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
                >
                  {MENU_ITEMS.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase font-bold text-amber-950 mb-1">
                Your Note to the Recipient:
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. For someone taking a deep breath before an interview today. You've got this!"
                value={recipientNote}
                onChange={(e) => setRecipientNote(e.target.value)}
                className="w-full bg-white/80 border border-amber-800/20 rounded-lg p-2 text-espresso-primary text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-black/5 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-terracotta hover:bg-terracotta-hover text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-warm-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note & Pay Forward</span>
              </button>
            </div>
          </form>
        )}

        {/* The Corkboard Sticky Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {communityCups.map((cup, idx) => {
            const isClaimed = cup.isClaimed;
            const bgClass = stickyBgClasses[cup.stickyColor] || stickyBgClasses.yellow;
            const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={cup.id}
                className={`p-4 rounded-xl shadow-lg border border-black/10 flex flex-col justify-between transform ${rot} hover:rotate-0 hover:scale-105 transition-all duration-200 relative group min-h-[180px] ${bgClass}`}
              >
                {/* Visual Brass Push-Pin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-700 border-2 border-amber-300 shadow-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                </div>

                {/* Content */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                    <span className="font-bold">{cup.timestamp}</span>
                    <span>${cup.amount.toFixed(2)} Pre-Paid</span>
                  </div>

                  <p className="font-serif text-xs leading-relaxed font-medium">
                    "{cup.recipientNote}"
                  </p>

                  <div className="text-[11px] font-semibold flex items-center gap-1 opacity-90 pt-1">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{cup.drinkName}</span>
                  </div>
                </div>

                {/* Footer Status or Claim Action */}
                <div className="border-t border-black/10 pt-2 mt-3 text-[10px]">
                  <div className="opacity-75 font-mono mb-2">
                    — From {cup.from}
                  </div>

                  {isClaimed ? (
                    <div className="bg-black/10 text-espresso-primary font-mono text-[9px] px-2 py-1 rounded text-center font-bold">
                      ✓ {cup.claimedBy || 'Claimed by a neighbor'}
                    </div>
                  ) : (
                    <div>
                      {claimingCupId === cup.id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Your first name"
                            value={claimantName}
                            onChange={(e) => setClaimantName(e.target.value)}
                            className="w-full bg-white text-espresso-primary p-1 rounded text-[10px] border border-black/20"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleClaimSubmit(cup.id)}
                              className="flex-1 bg-espresso-primary text-white py-1 rounded font-bold text-[9px]"
                            >
                              Confirm Claim
                            </button>
                            <button
                              onClick={() => setClaimingCupId(null)}
                              className="text-cacao-secondary text-[9px] px-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setClaimingCupId(cup.id)}
                          className="w-full bg-espresso-primary/80 hover:bg-espresso-primary text-white py-1 rounded font-semibold text-[10px] transition-colors"
                        >
                          Claim This Cup
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
