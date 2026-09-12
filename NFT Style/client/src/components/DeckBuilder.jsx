import React, { useState } from 'react';
import CardItem from './CardItem';
import { sounds } from '../utils/soundEffects';

export default function DeckBuilder({
  allCards,
  inventory,
  activeDeck,
  onSaveDeck,
  onClose
}) {
  const [currentDeck, setCurrentDeck] = useState([...activeDeck]);
  const [saveStatus, setSaveStatus] = useState(null);

  const deckCards = currentDeck.map(id => allCards.find(c => c.id === id)).filter(Boolean);

  // Calculate deck combat statistics
  const totalAtk = deckCards.reduce((acc, c) => acc + (c.atk || 0), 0);
  const totalDef = deckCards.reduce((acc, c) => acc + (c.def || 0), 0);
  const avgMana = (deckCards.reduce((acc, c) => acc + (c.mana || 0), 0) / (deckCards.length || 1)).toFixed(1);

  const handleRemoveCard = (cardId) => {
    sounds.playClick();
    setCurrentDeck(currentDeck.filter(id => id !== cardId));
  };

  const handleAddCard = (cardId) => {
    sounds.playClick();
    if (currentDeck.includes(cardId)) return;
    if (currentDeck.length >= 5) {
      setSaveStatus('Deck maximum capacity is 5 cards. Remove a card first.');
      return;
    }
    setCurrentDeck([...currentDeck, cardId]);
  };

  const handleSave = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/decks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck: currentDeck })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playRevealRare();
        setSaveStatus('Deck configuration successfully deployed!');
        if (onSaveDeck) onSaveDeck(currentDeck);
      }
    } catch (e) {
      setSaveStatus('Error saving deck.');
    }
  };

  // Owned cards available in inventory
  const ownedUniqueCards = Array.from(new Set(inventory.map(i => i.cardId)))
    .map(id => allCards.find(c => c.id === id))
    .filter(Boolean);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl border border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[26px]">view_carousel</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              Active Battle Deck Builder (5 Card Squad)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Construct your primary combat formation. Balances mana curve, attack bursts, and defensive aegis arrays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-container text-on-primary font-mono text-xs font-bold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Deploy Active Deck</span>
          </button>
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

      {saveStatus && (
        <div className="bg-primary/20 border border-primary text-primary px-4 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between">
          <span>{saveStatus}</span>
          <button onClick={() => setSaveStatus(null)}>✕</button>
        </div>
      )}

      {/* Combat Analytics Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Deck Power (ATK)</span>
          <span className="font-display text-2xl font-bold text-error mt-1">{totalAtk.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Deck Armor (DEF)</span>
          <span className="font-display text-2xl font-bold text-primary mt-1">{totalDef.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Average Mana Cost</span>
          <span className="font-display text-2xl font-bold text-tertiary mt-1">{avgMana}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Squad Capacity</span>
          <span className="font-display text-2xl font-bold text-secondary mt-1">{currentDeck.length} / 5</span>
        </div>
      </div>

      {/* Current Deck Slots */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-bold">
          Active Formation ({currentDeck.length} of 5 Cards)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map(slotIdx => {
            const card = deckCards[slotIdx];
            if (card) {
              return (
                <div key={card.id} className="relative group flex flex-col items-center">
                  <div className="w-full aspect-[5/7]">
                    <CardItem
                      card={card}
                      ownedData={{ count: 1, serial: `#DECK`, mintGrade: 'MINT 9.5', isHolo: true }}
                      showHolo={true}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="mt-2 text-[11px] font-mono text-error hover:bg-error/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">remove_circle</span>
                    Remove
                  </button>
                </div>
              );
            }
            return (
              <div
                key={slotIdx}
                className="w-full aspect-[5/7] rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/40 flex flex-col items-center justify-center p-4 text-center"
              >
                <span className="material-symbols-outlined text-outline text-[32px] mb-2">add_circle_outline</span>
                <span className="font-mono text-xs text-on-surface-variant">Empty Deck Slot #{slotIdx + 1}</span>
                <span className="text-[10px] text-on-surface-variant/60 mt-1">Select from reserve below</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reserve Inventory Selection */}
      <div className="flex flex-col gap-3 pt-4 border-t border-surface-container-highest">
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-bold">
          Reserve Cards in Your Vault Binder
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {ownedUniqueCards.map(card => {
            const isInDeck = currentDeck.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => !isInDeck && handleAddCard(card.id)}
                className={`cursor-pointer transition-all ${isInDeck ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-103'}`}
              >
                <div className="w-full aspect-[5/7]">
                  <CardItem
                    card={card}
                    ownedData={{ count: 1, serial: `#RESERVE`, mintGrade: 'NM 8', isHolo: false }}
                    showHolo={false}
                  />
                </div>
                <div className="mt-1 text-center font-mono text-[10px] text-on-surface-variant">
                  {isInDeck ? 'In Deck' : '+ Add to Deck'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
