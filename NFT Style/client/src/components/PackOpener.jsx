import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import CardItem from './CardItem';
import { sounds } from '../utils/soundEffects';

export default function PackOpener({
  pack,
  onOpenPack,
  onFinish,
  isLoading
}) {
  // Stages: 'SEALED' -> 'TEARING' -> 'REVEAL_CARDS' -> 'SUMMARY'
  const [stage, setStage] = useState('SEALED');
  const [pulledCards, setPulledCards] = useState([]);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [tearProgress, setTearProgress] = useState(0);

  // Trigger pack opening
  const handleTearPack = async () => {
    sounds.playPackTear();
    setStage('TEARING');

    try {
      const result = await onOpenPack(pack.id);
      if (result && result.pulledCards) {
        setPulledCards(result.pulledCards);
        setTimeout(() => {
          setStage('REVEAL_CARDS');
        }, 1200);
      }
    } catch (e) {
      setStage('SEALED');
    }
  };

  // Reveal individual card
  const handleRevealCard = (index) => {
    if (revealedIndices.has(index)) return;

    const newRevealed = new Set(revealedIndices);
    newRevealed.add(index);
    setRevealedIndices(newRevealed);

    const card = pulledCards[index];
    if (card) {
      if (card.rarity === 'Mythic' || card.rarity === 'Legendary') {
        sounds.playRevealMythic();
        // Explosive confetti burst for the dopamine hit!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffb95f', '#4cd7f6', '#d0bcff', '#ffffff']
        });
      } else if (card.rarity === 'Epic' || card.rarity === 'Rare') {
        sounds.playRevealRare();
      } else {
        sounds.playRevealCommon();
      }
    }

    // If all cards revealed, switch to summary after slight delay
    if (newRevealed.size === pulledCards.length) {
      setTimeout(() => {
        setStage('SUMMARY');
      }, 1600);
    }
  };

  const handleRevealAll = () => {
    const all = new Set(pulledCards.map((_, i) => i));
    setRevealedIndices(all);
    sounds.playRevealMythic();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      setStage('SUMMARY');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
        <div className="w-[400px] h-[400px] rounded-full bg-tertiary/10 blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 text-center mb-6 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-surface-container-high/80 border border-outline-variant/40 px-3 py-1 rounded-full text-xs font-mono text-tertiary font-bold mb-2">
          <span className="material-symbols-outlined text-[16px] text-tertiary">inventory_2</span>
          <span>ANTICIPATION UNBOXING CHAMBER</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
          {pack.name}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {stage === 'SEALED' && "Grip and rip the sealed holographic foil strip to trigger the probability matrix."}
          {stage === 'TEARING' && "Destabilizing security seals... Quantum probability collapsing..."}
          {stage === 'REVEAL_CARDS' && "Tap each card one-by-one to reveal its rarity, stats, and mint edition."}
          {stage === 'SUMMARY' && "All cards successfully decrypted and synced to your Obsidian Vault Binder!"}
        </p>
      </div>

      {/* STAGE 1: SEALED FOIL PACK WITH TEAR STRIP */}
      {stage === 'SEALED' && (
        <div className="relative z-10 flex flex-col items-center">
          
          {/* 3D Sealed Foil Pack */}
          <div className="relative w-[300px] sm:w-[340px] aspect-[5/7.5] rounded-3xl p-3 bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-lowest shadow-[0_0_50px_rgba(76,215,246,0.25)] border-2 border-primary/40 group overflow-hidden transition-all duration-500 hover:scale-102 hover:shadow-[0_0_60px_rgba(255,185,95,0.4)]">
            
            {/* Prismatic Holo Sheen on Foil */}
            <div className="absolute inset-0 holo-glare opacity-40 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
            
            {/* Top Sealed Crimped Border */}
            <div className="w-full h-7 bg-surface-container-highest border-b border-outline-variant/60 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="w-1.5 h-3 bg-surface-container-low rounded-sm"></div>
                ))}
              </div>
            </div>

            {/* Foil Pack Center Emblem */}
            <div className="my-auto flex flex-col items-center justify-center text-center p-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary/20 via-tertiary/20 to-secondary/20 border border-primary/50 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(76,215,246,0.3)] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[52px] animate-pulse">
                  diamond
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold">
                GENESIS FIRST EDITION
              </span>
              <h3 className="font-display text-xl font-black text-white mt-1 uppercase tracking-wider">
                AETHERIA PROTOCOL
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-2 font-mono">
                Contains 5 Digital Collectibles • 1 Guaranteed Rare+
              </p>
            </div>

            {/* Interactive Tear Strip Area */}
            <div className="relative w-full mt-auto mb-2 p-2 bg-surface-container-lowest/80 rounded-2xl border border-primary/40 flex flex-col gap-2">
              <div className="foil-tear-strip h-3 rounded-full w-full opacity-80 animate-pulse"></div>
              <button
                onClick={handleTearPack}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-tertiary-container via-tertiary to-amber-400 hover:from-amber-400 hover:to-tertiary text-on-tertiary-container font-display text-sm font-bold py-3 rounded-xl shadow-[0_0_24px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] animate-bounce">
                  content_cut
                </span>
                <span>TEAR PACK OPEN NOW</span>
              </button>
            </div>

            {/* Bottom Crimped Border */}
            <div className="w-full h-7 bg-surface-container-highest border-t border-outline-variant/60 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="w-1.5 h-3 bg-surface-container-low rounded-sm"></div>
                ))}
              </div>
            </div>

          </div>

          {/* Cancel / Return Button */}
          <button
            onClick={onFinish}
            className="mt-6 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Return to Vault Binder
          </button>
        </div>
      )}

      {/* STAGE 2: TEARING & BURST ANIMATION */}
      {stage === 'TEARING' && (
        <div className="relative z-10 flex flex-col items-center justify-center py-20">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-tertiary/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse"></div>
            <span className="material-symbols-outlined text-white text-[72px] animate-spin">
              auto_awesome
            </span>
          </div>
          <span className="font-display text-xl font-bold text-tertiary mt-6 tracking-wide animate-pulse">
            TEARING FOIL MATRIX...
          </span>
          <span className="font-mono text-xs text-on-surface-variant mt-1">
            Generating variable reward rarity distributions...
          </span>
        </div>
      )}

      {/* STAGE 3: CARD-BY-CARD REVEAL FANFARE */}
      {stage === 'REVEAL_CARDS' && (
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          
          {/* Quick Reveal All Helper */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-mono text-on-surface-variant">
              Revealed: {revealedIndices.size} of {pulledCards.length} Cards
            </span>
            <button
              onClick={handleRevealAll}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Reveal All At Once
            </button>
          </div>

          {/* Cards Grid / Fanout */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {pulledCards.map((card, idx) => {
              const isRevealed = revealedIndices.has(idx);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    onClick={() => handleRevealCard(idx)}
                    className={`relative w-full aspect-[5/7] rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 ${
                      !isRevealed ? 'hover:scale-105 hover:-translate-y-2' : ''
                    }`}
                  >
                    <div
                      className={`w-full h-full duration-500 preserve-3d transition-transform ${
                        isRevealed ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD BACK (UNREVEALED) */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-lowest border-2 border-primary/40 shadow-xl flex flex-col items-center justify-center p-3 group">
                        <div className="absolute inset-0 holo-glare opacity-30"></div>
                        <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/60 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(76,215,246,0.3)] group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary text-[28px]">
                            auto_awesome
                          </span>
                        </div>
                        <span className="font-display text-xs font-bold text-white tracking-widest text-center">
                          AETHERIA
                        </span>
                        <span className="font-mono text-[9px] text-tertiary mt-2 bg-tertiary/20 px-2 py-0.5 rounded-full">
                          CLICK TO REVEAL
                        </span>
                      </div>

                      {/* CARD FRONT (REVEALED) */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180">
                        <CardItem
                          card={card}
                          ownedData={{
                            count: 1,
                            serial: card.pulledSerial,
                            mintGrade: card.pulledGrade,
                            isHolo: card.pulledHolo
                          }}
                          showHolo={card.pulledHolo}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rarity & New Badge under card */}
                  <div className="mt-2 text-center">
                    {isRevealed ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[10px] font-mono font-bold uppercase ${
                          card.rarity === 'Mythic' ? 'text-tertiary' :
                          card.rarity === 'Legendary' ? 'text-secondary' :
                          card.rarity === 'Epic' ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          {card.rarity} {card.pulledHolo ? '★ FOIL' : ''}
                        </span>
                        {card.isNew && (
                          <span className="bg-primary/20 text-primary text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                            NEW SYNC!
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-on-surface-variant">Slot #{idx + 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* STAGE 4: SUMMARY SHOWCASE */}
      {stage === 'SUMMARY' && (
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-fade-in">
          
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {pulledCards.map((card, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full aspect-[5/7]">
                  <CardItem
                    card={card}
                    ownedData={{
                      count: 1,
                      serial: card.pulledSerial,
                      mintGrade: card.pulledGrade,
                      isHolo: card.pulledHolo
                    }}
                    showHolo={card.pulledHolo}
                  />
                </div>
                <span className="font-mono text-[10px] text-tertiary font-bold mt-1.5">
                  {card.pulledGrade}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onFinish}
              className="bg-primary hover:bg-primary-container text-on-primary font-display font-bold px-8 py-3 rounded-xl shadow-[0_0_24px_rgba(76,215,246,0.4)] flex items-center gap-2 transition-all hover:scale-105 text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              <span>Sync All to Collection Binder</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
