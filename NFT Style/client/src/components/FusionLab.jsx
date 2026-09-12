import React, { useState } from 'react';
import CardItem from './CardItem';
import { sounds } from '../utils/soundEffects';

export default function FusionLab({
  allCards,
  inventory,
  onExecuteFusion,
  onClose
}) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isForging, setIsForging] = useState(false);
  const [forgedResult, setForgedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Cards with at least 3 copies eligible for fusion
  const fusableCards = inventory
    .filter(item => item.count >= 3)
    .map(item => ({
      ...item,
      card: allCards.find(c => c.id === item.cardId)
    }))
    .filter(item => item.card);

  const selectedCardItem = fusableCards.find(item => item.cardId === selectedCardId) || fusableCards[0];

  const handleStartFusion = async () => {
    if (!selectedCardItem) return;
    setIsForging(true);
    setErrorMsg(null);
    sounds.playPackTear();

    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: selectedCardItem.cardId })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playRevealMythic();
        setForgedResult(data);
        if (onExecuteFusion) onExecuteFusion(data);
      } else {
        setErrorMsg(data.error || 'Fusion failed.');
      }
    } catch (e) {
      setErrorMsg('Network error during fusion.');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl border border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[26px]">cyclone</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              Aetheria Fusion Lab & Essence Forge
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Burn 3 duplicate matrices of any collectible card to transmute them into a higher-tier holographic card + PRISM crystals.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-mono text-on-surface-variant hover:text-on-surface bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/30 transition-colors"
          >
            ← Back to Binder
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-error/20 border border-error text-error px-4 py-3 rounded-xl font-mono text-xs">
          {errorMsg}
        </div>
      )}

      {forgedResult && (
        <div className="bg-secondary-container/30 border border-secondary p-6 rounded-2xl flex flex-col items-center text-center animate-fade-in">
          <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
            TRANSFORMATION COMPLETE • FORGED APEX CARD
          </span>
          <h3 className="font-display text-2xl font-bold text-white mt-1">
            {forgedResult.forgedCard.name}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 mb-4">
            Earned +{forgedResult.prismReward} PRISM Essence!
          </p>
          <div className="w-[200px] aspect-[5/7] mb-4">
            <CardItem
              card={forgedResult.forgedCard}
              ownedData={{ count: 1, serial: '#FORGED-GEM', mintGrade: 'GEM MINT 10', isHolo: true }}
              showHolo={true}
            />
          </div>
          <button
            onClick={() => setForgedResult(null)}
            className="bg-secondary hover:bg-secondary/90 text-on-secondary font-mono text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
          >
            Forge Another Matrix
          </button>
        </div>
      )}

      {/* Main Alchemical Forge Table */}
      {!forgedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Eligible Duplicate Cards */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              Cards Eligible for Fusion (≥ 3 Copies)
            </span>

            {fusableCards.length === 0 ? (
              <div className="p-6 bg-surface-container-low rounded-xl text-center font-mono text-xs text-on-surface-variant">
                No cards currently possess 3+ duplicate copies. Open more packs or swap in the P2P Hub to accumulate fusion fuel!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {fusableCards.map(item => {
                  const isSelected = selectedCardItem?.cardId === item.cardId;
                  return (
                    <div
                      key={item.cardId}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCardId(item.cardId);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-secondary-container/25 border-secondary ring-1 ring-secondary'
                          : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-display text-sm font-bold text-on-surface">{item.card.name}</span>
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {item.card.rarity} • {item.count} Copies Owned
                        </span>
                      </div>
                      <span className="bg-secondary/20 text-secondary text-xs font-mono font-bold px-2 py-1 rounded-lg">
                        ×{item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Fusion Crucible Chamber */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest flex flex-col items-center justify-center gap-6">
            
            {selectedCardItem ? (
              <>
                <div className="flex items-center gap-4">
                  {/* 3 Burn copies representation */}
                  <div className="flex -space-x-12">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="w-[140px] aspect-[5/7] transform hover:-translate-y-2 transition-transform shadow-xl">
                        <CardItem
                          card={selectedCardItem.card}
                          ownedData={{ count: 1, serial: `#SAMPLE`, mintGrade: 'NM 8', isHolo: false }}
                          showHolo={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center max-w-md">
                  <h4 className="font-display text-base font-bold text-white">
                    Burn 3 Copies of {selectedCardItem.card.name}
                  </h4>
                  <p className="font-mono text-xs text-on-surface-variant mt-1">
                    Matrix will distill into 1 higher-tier card ({selectedCardItem.card.rarity === 'Common' ? 'Uncommon/Rare' : 'Epic/Legendary'}) + 25-90 PRISM.
                  </p>
                </div>

                <button
                  onClick={handleStartFusion}
                  disabled={isForging}
                  className="bg-gradient-to-r from-secondary-container via-purple-600 to-secondary text-white font-display text-sm font-bold px-10 py-3.5 rounded-xl shadow-[0_0_24px_rgba(208,188,255,0.4)] hover:scale-102 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    {isForging ? 'cyclone' : 'local_fire_department'}
                  </span>
                  <span>{isForging ? 'Transmuting Matrices...' : 'Ignite Alchemical Fusion'}</span>
                </button>
              </>
            ) : (
              <div className="py-16 text-center text-on-surface-variant font-mono text-xs">
                Select a duplicate card with 3+ copies from the left to load into the crucible.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
