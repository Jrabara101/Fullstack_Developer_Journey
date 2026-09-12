import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/soundEffects';

export default function PackShop({
  userBalance,
  onBuyPack,
  onOpenPackDirectly,
  onClose
}) {
  const [packs, setPacks] = useState([]);
  const [loadingPackId, setLoadingPackId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetch('/api/packs/shop')
      .then(res => res.json())
      .then(data => {
        if (data.packs) setPacks(data.packs);
      })
      .catch(err => console.error(err));
  }, []);

  const handlePurchase = async (pack, openNow = false) => {
    sounds.playClick();
    if (userBalance < pack.priceAeth) {
      setStatusMessage(`Insufficient $AETH. You need ${pack.priceAeth.toLocaleString()} $AETH.`);
      return;
    }

    setLoadingPackId(pack.id);
    try {
      const res = await fetch('/api/packs/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packType: pack.type })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playRevealRare();
        setStatusMessage(`Successfully acquired ${pack.name}!`);
        if (onBuyPack) onBuyPack(data);

        if (openNow && data.newPack) {
          if (onOpenPackDirectly) onOpenPackDirectly(data.newPack);
        }
      } else {
        setStatusMessage(data.error || 'Purchase failed.');
      }
    } catch (e) {
      setStatusMessage('Network error during transaction.');
    } finally {
      setLoadingPackId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl border border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[26px]">storefront</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              Aetheria Minting & Mystery Pack Shop
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Sealed digital booster packs generated with provably distributed gacha probability curves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">diamond</span>
            <div className="font-mono text-xs">
              <span className="text-on-surface font-bold">{userBalance.toLocaleString()}</span>
              <span className="text-primary ml-1">$AETH</span>
            </div>
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
      </div>

      {statusMessage && (
        <div className="bg-tertiary/20 border border-tertiary text-tertiary px-4 py-3 rounded-xl font-mono text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white">✕</button>
        </div>
      )}

      {/* Probability Architecture Breakdown */}
      <div className="bg-surface-container-low/60 p-4 rounded-xl border border-surface-container-highest grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
        <div className="p-2 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
          <span className="text-on-surface-variant block text-[10px] uppercase">Common Tier</span>
          <span className="text-on-surface font-bold text-sm">~60%</span>
          <span className="text-[9px] text-on-surface-variant/70 block mt-0.5">Matte border baseline</span>
        </div>
        <div className="p-2 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
          <span className="text-on-surface-variant block text-[10px] uppercase">Uncommon Tier</span>
          <span className="text-on-surface font-bold text-sm">~25%</span>
          <span className="text-[9px] text-on-surface-variant/70 block mt-0.5">Silver foil sheen</span>
        </div>
        <div className="p-2 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
          <span className="text-on-surface block text-[10px] uppercase">Rare Tier</span>
          <span className="text-white font-bold text-sm">~10%</span>
          <span className="text-[9px] text-on-surface-variant/70 block mt-0.5">Vertical holo foil</span>
        </div>
        <div className="p-2 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
          <span className="text-primary block text-[10px] uppercase">Epic Tier</span>
          <span className="text-primary font-bold text-sm">~4%</span>
          <span className="text-[9px] text-primary/70 block mt-0.5">Prismatic glow aura</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-2 bg-surface-container-lowest/60 rounded-lg border border-tertiary/40 shadow-[0_0_12px_rgba(255,185,95,0.15)]">
          <span className="text-tertiary block text-[10px] uppercase font-bold">Mythic / Apex</span>
          <span className="text-tertiary font-bold text-sm">~1.8%</span>
          <span className="text-[9px] text-tertiary/80 block mt-0.5">Full bleed 3D tilt chime</span>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const isAffordable = userBalance >= pack.priceAeth;
          const isLoading = loadingPackId === pack.id;

          const getGlow = () => {
            if (pack.glowColor === 'amber') return 'border-tertiary/60 shadow-[0_0_30px_rgba(255,185,95,0.25)]';
            if (pack.glowColor === 'violet') return 'border-secondary/60 shadow-[0_0_30px_rgba(208,188,255,0.25)]';
            return 'border-primary/60 shadow-[0_0_30px_rgba(76,215,246,0.25)]';
          };

          return (
            <div
              key={pack.id}
              className={`bg-surface-container-low rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:scale-102 ${getGlow()}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold bg-surface-container-high px-2 py-0.5 rounded text-primary">
                    {pack.coverBadge}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px]">diamond</span>
                    <span className="font-bold">{pack.priceAeth.toLocaleString()}</span>
                    <span className="text-on-surface-variant">$AETH</span>
                  </div>
                </div>

                {/* Pack Artwork Display */}
                <div className="my-6 w-full aspect-[5/6] max-w-[220px] mx-auto rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-lowest border border-outline-variant/40 flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-xl">
                  <div className="absolute inset-0 holo-glare opacity-40 group-hover:opacity-75 transition-opacity"></div>
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-primary/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(76,215,246,0.3)]">
                    <span className="material-symbols-outlined text-primary text-[36px]">
                      inventory_2
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-center text-white">
                    {pack.name}
                  </h4>
                  <span className="font-mono text-[10px] text-tertiary mt-1">
                    5 CARDS • FOIL ENCASED
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant font-sans text-center mb-4">
                  {pack.desc}
                </p>
              </div>

              {/* Purchase Actions */}
              <div className="flex flex-col gap-2 pt-3 border-t border-surface-container-highest">
                <button
                  onClick={() => handlePurchase(pack, true)}
                  disabled={!isAffordable || isLoading}
                  className="w-full bg-gradient-to-r from-tertiary-container via-tertiary to-amber-400 text-on-tertiary-container font-display text-xs font-bold py-2.5 rounded-xl shadow-[0_0_16px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">content_cut</span>
                  <span>{isLoading ? 'Minting...' : 'Buy & Tear Open Now'}</span>
                </button>

                <button
                  onClick={() => handlePurchase(pack, false)}
                  disabled={!isAffordable || isLoading}
                  className="w-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono text-xs py-2 rounded-xl border border-outline-variant/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  <span>Buy & Save to Inventory</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
