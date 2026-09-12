import React, { useState, useRef } from 'react';
import CardArt from './CardArt';
import { sounds } from '../utils/soundEffects';

export default function CardItem({
  card,
  ownedData,
  isSelected,
  onSelect,
  isLocked = false,
  slotNumber = null,
  showHolo = true
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle dynamic cursor tracking for realistic 3D perspective & holographic light refraction
  const handleMouseMove = (e) => {
    if (isLocked || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14; // tilt up/down
    const rotateY = ((x - centerX) / centerX) * 14;  // tilt left/right

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => {
    if (isLocked) return;
    setIsHovered(true);
    sounds.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  // Locked Empty Silhouette Slot: Triggers the completionist itch
  if (isLocked) {
    return (
      <div 
        onClick={() => onSelect && onSelect(card)}
        className="group relative rounded-2xl p-2.5 transition-all duration-300 bg-surface-container-low/40 border border-outline-variant/30 hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col justify-between aspect-[5/7]"
      >
        <div className="absolute inset-0 locked-slot-pattern opacity-40 group-hover:opacity-60 transition-opacity"></div>
        
        {/* Top slot header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-mono text-[11px] text-on-surface-variant/70 font-semibold">
            SLOT #{slotNumber || card?.number || '???'}
          </span>
          <span className="bg-surface-container-highest/80 text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-mono">
            {card?.rarity?.toUpperCase() || 'LOCKED'}
          </span>
        </div>

        {/* Center locked silhouette icon */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high/80 border border-outline-variant/40 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:border-primary/60 transition-all shadow-inner">
            <span className="material-symbols-outlined text-outline text-[32px] group-hover:text-primary transition-colors">
              lock
            </span>
          </div>
          <span className="font-display text-sm font-bold text-on-surface-variant/80 tracking-wider">
            [ ? ] UNKNOWN
          </span>
          <span className="text-[11px] text-on-surface-variant/60 mt-1 line-clamp-1">
            {card?.name ? `Acquire ${card.name}` : 'Awaiting Series Mint'}
          </span>
        </div>

        {/* Bottom hint */}
        <div className="relative z-10 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant/70">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error/70"></span> Unregistered
          </span>
          <span className="text-primary hover:underline font-mono">Pack Shop →</span>
        </div>
      </div>
    );
  }

  // Rarity-based border & glow styles
  const getRarityStyling = () => {
    switch (card.rarity) {
      case 'Mythic':
        return {
          cardBg: 'bg-surface-container-low ring-2 ring-tertiary shadow-[0_0_24px_rgba(255,185,95,0.25)] hover:shadow-[0_0_36px_rgba(255,185,95,0.45)]',
          badgeBg: 'bg-tertiary text-on-tertiary',
          badgeText: 'MYTHIC FOIL',
          titleColor: 'text-tertiary',
          glareGradient: 'from-tertiary/30 via-primary/30 to-secondary/40'
        };
      case 'Legendary':
        return {
          cardBg: 'bg-surface-container-low ring-1 ring-secondary/80 shadow-[0_0_20px_rgba(208,188,255,0.2)] hover:shadow-[0_0_30px_rgba(208,188,255,0.4)]',
          badgeBg: 'bg-secondary-container/80 text-secondary',
          badgeText: 'LEGENDARY',
          titleColor: 'text-secondary',
          glareGradient: 'from-secondary/30 via-primary/25 to-transparent'
        };
      case 'Epic':
        return {
          cardBg: 'bg-surface-container-low ring-1 ring-primary/70 hover:ring-primary shadow-[0_0_16px_rgba(76,215,246,0.15)] hover:shadow-[0_0_26px_rgba(76,215,246,0.35)]',
          badgeBg: 'bg-primary-container/60 text-primary',
          badgeText: 'EPIC',
          titleColor: 'text-primary',
          glareGradient: 'from-primary/30 via-blue-500/20 to-transparent'
        };
      case 'Rare':
        return {
          cardBg: 'bg-surface-container-low border border-surface-container-highest hover:border-primary/50 hover:shadow-xl',
          badgeBg: 'bg-surface-variant text-on-surface-variant',
          badgeText: 'RARE',
          titleColor: 'text-on-surface',
          glareGradient: 'from-white/10 via-primary/10 to-transparent'
        };
      default: // Common / Uncommon
        return {
          cardBg: 'bg-surface-container-low border border-surface-container-highest/60 hover:border-outline hover:shadow-md',
          badgeBg: 'bg-surface-container-highest text-on-surface-variant',
          badgeText: card.rarity.toUpperCase(),
          titleColor: 'text-on-surface',
          glareGradient: 'from-white/5 to-transparent'
        };
    }
  };

  const styling = getRarityStyling();
  const copiesCount = ownedData?.count || 1;
  const isCardHolo = ownedData?.isHolo !== undefined ? ownedData.isHolo : showHolo;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        sounds.playClick();
        onSelect && onSelect(card);
      }}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
      }}
      className={`card-item group relative rounded-2xl p-2 cursor-pointer transition-shadow duration-300 transform-gpu ${styling.cardBg} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-102' : ''
      }`}
    >
      {/* Inspected Active Pin Marker */}
      {isSelected && (
        <div className="absolute -top-2.5 -right-2 z-30 bg-primary text-on-primary text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-lg flex items-center gap-1 animate-pulse">
          <span className="material-symbols-outlined text-[13px]">visibility</span> ACTIVE
        </div>
      )}

      {/* Duplicate Badge */}
      {copiesCount > 1 && (
        <div className="absolute -top-2 -left-2 z-30 bg-surface-container-highest border border-outline-variant text-on-surface text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
          ×{copiesCount}
        </div>
      )}

      {/* Card Inner Container with Aspect Ratio */}
      <div className="relative w-full aspect-[5/7] rounded-xl overflow-hidden bg-surface-container-lowest flex flex-col justify-between">
        
        {/* Card Artwork */}
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Hide broken image and fallback to generative SVG Art
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <CardArt
            theme={card.artTheme}
            element={card.element}
            rarity={card.rarity}
            isHolo={isCardHolo}
          />
        )}

        {/* Dynamic Interactive Holographic Foil Sheen (Follows cursor light coordinates) */}
        {isCardHolo && (
          <div
            className="absolute inset-0 holo-glare pointer-events-none"
            style={{
              opacity: isHovered ? 0.9 : 0.4,
              backgroundPosition: `${tilt.glareX}% ${tilt.glareY}%`
            }}
          />
        )}

        {/* Top Mana Cost & Level Banner */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          <div className="bg-surface-container-lowest/85 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
            <span className="material-symbols-outlined text-primary text-[14px]">bolt</span>
            <span className="font-mono text-xs font-bold text-primary">{card.mana || 5}</span>
          </div>
          <div className={`${styling.badgeBg} text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow`}>
            LVL {card.level || '50'}
          </div>
        </div>

        {/* Lower Stat Overlay Banner */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/95 to-transparent flex flex-col gap-1 z-10 pointer-events-none">
          <div className="flex items-center justify-between">
            <span className={`font-display text-sm font-bold truncate ${styling.titleColor}`}>
              {card.name}
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              #{card.number}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-on-surface mt-0.5">
            <div className="flex items-center gap-1">
              <span className="text-error font-bold text-[10px]">ATK</span>
              <span className="font-semibold">{card.atk.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary font-bold text-[10px]">DEF</span>
              <span className="font-semibold">{card.def.toLocaleString()}</span>
            </div>
            <span className={`${styling.badgeBg} px-1.5 py-0.5 rounded text-[9px] font-bold`}>
              {styling.badgeText}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
