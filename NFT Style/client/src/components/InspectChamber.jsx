import React, { useState } from 'react';
import CardArt from './CardArt';
import { sounds } from '../utils/soundEffects';

export default function InspectChamber({
  card,
  ownedData,
  onClose,
  onListMarketplace,
  onAssignDeck,
  isInDeck = false
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const handleFlip = () => {
    sounds.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const getRarityBadge = () => {
    switch (card.rarity) {
      case 'Mythic':
        return 'bg-tertiary/20 text-tertiary ring-1 ring-tertiary/40';
      case 'Legendary':
        return 'bg-secondary-container/40 text-secondary ring-1 ring-secondary/40';
      case 'Epic':
        return 'bg-primary-container/40 text-primary ring-1 ring-primary/40';
      case 'Rare':
        return 'bg-surface-variant text-on-surface ring-1 ring-outline-variant';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  const serial = ownedData?.serial || `#${card.number} / ${card.mintLimit || 5000}`;
  const grade = ownedData?.mintGrade || 'GEM MINT 10';

  return (
    <div className="w-full lg:w-[420px] shrink-0 bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xl border border-surface-container-highest/60 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
            Holo Inspection Chamber
          </span>
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFlip}
            className="flex items-center gap-1 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-mono px-2.5 py-1 rounded-lg transition-colors border border-outline-variant/40"
            title="Flip Card 180°"
          >
            <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
            <span>{isFlipped ? 'Front' : 'Flip 180°'}</span>
          </button>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
            title="Close Chamber"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="relative w-full aspect-[5/7] max-w-[280px] mx-auto perspective-1000">
        <div
          className={`w-full h-full duration-500 preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-[0_0_36px_rgba(245,158,11,0.25)] ring-2 ring-tertiary/50 bg-surface-container-lowest flex flex-col justify-between">
            {card.image ? (
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <CardArt
                theme={card.artTheme}
                element={card.element}
                rarity={card.rarity}
                isHolo={true}
              />
            )}

            {/* Dynamic Prismatic Sheen */}
            <div className="absolute inset-0 holo-glare opacity-70 pointer-events-none" />

            {/* Serial & Grade Watermark */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-tertiary font-bold shadow">
                {grade} • {serial}
              </span>
              <span className="bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-primary font-bold shadow">
                MANA {card.mana || 5}
              </span>
            </div>
          </div>

          {/* BACK FACE (Lore & Holographic Crest) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/40 bg-surface-container-lowest p-4 flex flex-col justify-between border border-surface-container-highest text-left">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
              <span className="font-mono text-xs text-primary font-bold">AETHERIA PROTOCOL</span>
              <span className="text-[10px] font-mono text-on-surface-variant">SERIES 1</span>
            </div>

            <div className="my-auto flex flex-col gap-2">
              <span className="text-[11px] font-mono text-tertiary uppercase tracking-wider">Archival Provenance</span>
              <p className="font-sans text-xs text-on-surface-variant italic leading-relaxed bg-surface-container-high/60 p-2.5 rounded-lg border border-outline-variant/30">
                “{card.lore}”
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant pt-2">
                <span>Classification:</span>
                <span className="text-on-surface font-semibold">{card.type || 'Archetype Unit'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>Elemental Affinity:</span>
                <span className="text-primary font-semibold">{card.element}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container-highest flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
              <span>Token: {card.contract || '0x8a94...3f12'}</span>
              <span className="text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span> Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Info & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-on-surface tracking-wide">
            {card.name}
          </h3>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${getRarityBadge()}`}>
            {card.rarity.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          {card.subtitle}
        </p>
      </div>

      {/* Lore Callout */}
      <div className="bg-surface-container-high/70 p-3 rounded-xl border border-outline-variant/20">
        <p className="text-xs text-on-surface-variant italic leading-relaxed">
          “{card.lore}”
        </p>
      </div>

      {/* Combat Stat Radials & Bars */}
      <div className="grid grid-cols-4 gap-2 bg-surface-container-lowest/80 p-2.5 rounded-xl border border-surface-container-highest/60">
        <div className="flex flex-col items-center justify-center p-1 text-center">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">ATK</span>
          <span className="font-mono text-xs font-bold text-error mt-0.5">{card.atk.toLocaleString()}</span>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: `${Math.min(100, (card.atk / 10000) * 100)}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-1 text-center">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">DEF</span>
          <span className="font-mono text-xs font-bold text-primary mt-0.5">{card.def.toLocaleString()}</span>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (card.def / 10000) * 100)}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-1 text-center">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">SPEED</span>
          <span className="font-mono text-xs font-bold text-tertiary mt-0.5">{card.speed || 75}</span>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: `${card.speed || 75}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-1 text-center">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">CRIT</span>
          <span className="font-mono text-xs font-bold text-secondary mt-0.5">{card.crit || '20%'}</span>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: card.crit ? parseInt(card.crit) * 2.5 + '%' : '50%' }}></div>
          </div>
        </div>
      </div>

      {/* Provenance Metadata Block */}
      <div className="flex flex-col gap-2 text-xs font-mono bg-surface-container-high/40 p-3 rounded-xl border border-surface-container-highest">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Contract Registry</span>
          <span className="text-primary flex items-center gap-1 font-semibold">
            {card.contract || '0x8a94...3f12'}
            <span className="material-symbols-outlined text-[13px] cursor-pointer hover:text-white" title="Copy Address">content_copy</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Est. Appraisal</span>
          <span className="text-tertiary font-bold">
            {card.marketValueEth} ETH ≈ {(card.marketValueEth * 3320).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </span>
        </div>
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Vault Sync Status</span>
          <span className="text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified_user</span> Vault Confirmed
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={() => onListMarketplace && onListMarketplace(card)}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-mono text-xs font-bold py-2.5 rounded-xl shadow-[0_0_16px_rgba(76,215,246,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          List on P2P Marketplace (Est. {card.marketValueEth} ETH)
        </button>

        <button
          onClick={() => onAssignDeck && onAssignDeck(card.id)}
          className={`w-full font-mono text-xs font-bold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
            isInDeck
              ? 'bg-secondary-container/40 border-secondary text-secondary hover:bg-secondary-container/60'
              : 'bg-surface-container-high hover:bg-surface-bright border-outline-variant/30 text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isInDeck ? 'check_circle' : 'view_carousel'}
          </span>
          {isInDeck ? 'Active in Combat Deck' : 'Assign to Active Deck'}
        </button>
      </div>

    </div>
  );
}
