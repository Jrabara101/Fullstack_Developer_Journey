import React, { useState, useEffect } from 'react';
import CardItem from './CardItem';
import { sounds } from '../utils/soundEffects';

export default function P2PTradeHub({
  allCards,
  inventory,
  onExecuteTrade,
  onClose
}) {
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedMyCardId, setSelectedMyCardId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);

  useEffect(() => {
    fetch('/api/trades')
      .then(res => res.json())
      .then(data => {
        if (data.trades) {
          setTrades(data.trades);
          if (data.trades.length > 0) {
            setSelectedTrade(data.trades[0]);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Filter owned cards that user can trade
  const tradeableInventory = inventory.map(inv => {
    const card = allCards.find(c => c.id === inv.cardId);
    return { ...inv, card };
  }).filter(item => item.card);

  // Set default offered card when trade changes
  useEffect(() => {
    if (selectedTrade && tradeableInventory.length > 0) {
      // Prefer requested card if owned
      const matched = tradeableInventory.find(item => selectedTrade.requestCardIds.includes(item.cardId));
      if (matched) {
        setSelectedMyCardId(matched.cardId);
      } else {
        setSelectedMyCardId(tradeableInventory[0].cardId);
      }
    }
  }, [selectedTrade]);

  if (!selectedTrade && trades.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container-low rounded-2xl">
        <span className="material-symbols-outlined text-outline text-[48px]">sync_disabled</span>
        <p className="font-mono text-sm text-on-surface-variant mt-2">No active P2P trade offers available right now.</p>
      </div>
    );
  }

  const traderCard = allCards.find(c => c.id === selectedTrade?.offerCardId);
  const myOfferedCard = allCards.find(c => c.id === selectedMyCardId);
  const myOfferedInv = inventory.find(inv => inv.cardId === selectedMyCardId);

  // Fairness Evaluation Algorithm
  const calculateFairness = () => {
    if (!traderCard || !myOfferedCard) return { badge: 'Pending Selection', color: 'bg-surface-variant text-on-surface-variant', ratio: 1 };
    
    const theirVal = traderCard.marketValueEth;
    const myVal = myOfferedCard.marketValueEth;
    const ratio = myVal / theirVal;

    if (ratio >= 0.85 && ratio <= 1.25) {
      return {
        badge: 'FAIR & BALANCED SWAP',
        sub: 'Optimal value parity between collectors',
        color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        ratio
      };
    } else if (ratio > 1.25) {
      return {
        badge: 'FAVORABLE TO THEM (+ Overpay)',
        sub: `You are offering ${(ratio * 100 - 100).toFixed(0)}% more market value`,
        color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
        ratio
      };
    } else {
      return {
        badge: 'HIGH VALUE DISCREPANCY (- Underpay)',
        sub: `Your offer is ${((1 - ratio) * 100).toFixed(0)}% below their appraised market rate`,
        color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        ratio
      };
    }
  };

  const fairness = calculateFairness();

  const handleConfirmSwap = async () => {
    if (!selectedTrade || !selectedMyCardId) return;
    setIsSubmitting(true);
    sounds.playClick();

    try {
      const res = await fetch('/api/trades/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: selectedTrade.id,
          yourCardId: selectedMyCardId
        })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playRevealRare();
        setTradeMessage(`Swap successful! You received ${traderCard.name}!`);
        if (onExecuteTrade) onExecuteTrade(data);
        // Refresh listings
        setTrades(data.remainingTrades || []);
        if (data.remainingTrades && data.remainingTrades.length > 0) {
          setSelectedTrade(data.remainingTrades[0]);
        } else {
          setSelectedTrade(null);
        }
      } else {
        setTradeMessage(data.error || 'Failed to complete trade swap.');
      }
    } catch (e) {
      setTradeMessage('Network error processing swap.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-surface-container-highest">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">currency_exchange</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              Peer-to-Peer Trading Hub
            </h2>
            <span className="bg-primary/15 text-primary text-[11px] font-mono px-2 py-0.5 rounded-full font-bold">
              ZERO GAS FEE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Swap cards directly with other verified collectors. The algorithm validates fair parity in real-time.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-center font-mono text-xs text-on-surface-variant hover:text-on-surface bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/30 transition-colors"
          >
            ← Back to Binder
          </button>
        )}
      </div>

      {tradeMessage && (
        <div className="bg-primary/20 border border-primary text-primary px-4 py-3 rounded-xl font-mono text-xs flex items-center justify-between">
          <span>{tradeMessage}</span>
          <button onClick={() => setTradeMessage(null)} className="text-white">✕</button>
        </div>
      )}

      {/* Main Trading Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Trade Listings Selector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-bold">
            Available Market Proposals ({trades.length})
          </span>

          <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto pr-1">
            {trades.map(t => {
              const offering = allCards.find(c => c.id === t.offerCardId);
              const isSelected = selectedTrade?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    sounds.playHover();
                    setSelectedTrade(t);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-surface-container-high border-primary ring-1 ring-primary shadow-lg'
                      : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.traderAvatar}
                      alt={t.trader}
                      className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-on-surface">{t.trader}</span>
                        <span className="text-[10px] font-mono text-on-surface-variant">LVL {t.traderLevel}</span>
                      </div>
                      <span className="text-xs text-primary font-bold font-display">
                        Offers: {offering?.name || 'Card'}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {offering?.rarity} • {offering?.marketValueEth} ETH
                      </span>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison Drawer (8 cols) */}
        {selectedTrade && (
          <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-4 sm:p-6 border border-surface-container-highest flex flex-col gap-6 shadow-xl">
            
            {/* Drawer Top Strip: Trader Info & Validation Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTrade.traderAvatar}
                  alt={selectedTrade.trader}
                  className="w-11 h-11 rounded-full border border-primary object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-on-surface">{selectedTrade.trader}</span>
                    <span className="text-[10px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
                      Expires in {selectedTrade.expiresIn}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Requested Cards: {selectedTrade.requestCardIds.join(', ')}
                  </p>
                </div>
              </div>

              {/* Dynamic Value Validation Badge */}
              <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex flex-col items-end text-right ${fairness.color}`}>
                <span>{fairness.badge}</span>
                <span className="text-[10px] font-normal opacity-90">{fairness.sub}</span>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns: Their Offer vs Your Offer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Their Offer */}
              <div className="flex flex-col items-center p-4 bg-surface-container-lowest/60 rounded-2xl border border-surface-container-highest">
                <span className="font-mono text-xs text-tertiary font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">call_received</span>
                  Their Offer (You Receive)
                </span>
                {traderCard && (
                  <div className="w-[200px] aspect-[5/7]">
                    <CardItem
                      card={traderCard}
                      ownedData={{
                        count: 1,
                        serial: selectedTrade.offerCardSerial,
                        mintGrade: 'MINT 9.5',
                        isHolo: true
                      }}
                      showHolo={true}
                    />
                  </div>
                )}
                <div className="w-full mt-3 pt-3 border-t border-surface-container-highest flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Market Value:</span>
                  <span className="text-tertiary font-bold">{traderCard?.marketValueEth} ETH</span>
                </div>
              </div>

              {/* Your Offer */}
              <div className="flex flex-col items-center p-4 bg-surface-container-lowest/60 rounded-2xl border border-surface-container-highest">
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">call_made</span>
                  Your Offer (You Give)
                </span>

                {myOfferedCard ? (
                  <div className="w-[200px] aspect-[5/7]">
                    <CardItem
                      card={myOfferedCard}
                      ownedData={myOfferedInv}
                      showHolo={myOfferedInv?.isHolo}
                    />
                  </div>
                ) : (
                  <div className="w-[200px] aspect-[5/7] rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center text-center p-4">
                    <span className="text-xs font-mono text-on-surface-variant">Select a card from your inventory below</span>
                  </div>
                )}

                <div className="w-full mt-3 pt-3 border-t border-surface-container-highest flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Market Value:</span>
                  <span className="text-primary font-bold">{myOfferedCard ? `${myOfferedCard.marketValueEth} ETH` : '0 ETH'}</span>
                </div>
              </div>

            </div>

            {/* Inventory Selector for Your Card */}
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-container-highest">
              <span className="font-mono text-xs text-on-surface-variant">
                Select Your Card to Swap from Inventory:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {tradeableInventory.map(item => {
                  const isSelected = item.cardId === selectedMyCardId;
                  const isPreferred = selectedTrade.requestCardIds.includes(item.cardId);
                  return (
                    <button
                      key={item.cardId}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedMyCardId(item.cardId);
                      }}
                      className={`shrink-0 px-3 py-2 rounded-xl text-left border font-mono text-xs transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary shadow'
                          : 'bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-outline'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{item.card.name}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          {item.card.rarity} • {item.card.marketValueEth} ETH {isPreferred ? '★ WANTED' : ''}
                        </span>
                      </div>
                      {isPreferred && (
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Final Action CTA */}
            <button
              onClick={handleConfirmSwap}
              disabled={isSubmitting || !selectedMyCardId}
              className="w-full bg-gradient-to-r from-primary-container via-primary to-cyan-400 text-on-primary font-display text-sm font-bold py-3.5 rounded-xl shadow-[0_0_24px_rgba(76,215,246,0.35)] hover:scale-101 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              <span>{isSubmitting ? 'Confirming Protocol Swap...' : `Execute P2P Swap with ${selectedTrade.trader}`}</span>
            </button>

          </div>
        )}

      </div>

    </div>
  );
}
