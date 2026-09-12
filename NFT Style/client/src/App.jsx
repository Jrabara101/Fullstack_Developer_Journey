import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BinderView from './components/BinderView';
import PackOpener from './components/PackOpener';
import PackShop from './components/PackShop';
import P2PTradeHub from './components/P2PTradeHub';
import DeckBuilder from './components/DeckBuilder';
import FusionLab from './components/FusionLab';
import FloatingActionHub from './components/FloatingActionHub';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [activeDeck, setActiveDeck] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEth: '42.85',
    totalUsd: '142,500.00',
    totalCardsInSeries: 24,
    uniqueOwned: 12,
    syncPercentage: '50.0',
    duplicatesCount: 8,
    holoCount: 4,
    mythicCount: 1,
    legendaryCount: 1
  });

  const [currentTab, setCurrentTab] = useState('binder'); // 'binder', 'shop', 'marketplace', 'decks', 'fusion'
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeUnboxingPack, setActiveUnboxingPack] = useState(null);
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load initial data
  const fetchData = async () => {
    try {
      const [cardsRes, invRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/inventory')
      ]);
      const cardsData = await cardsRes.json();
      const invData = await invRes.json();

      if (cardsData.cards) {
        setAllCards(cardsData.cards);
        // Default selected card to first Mythic card
        const mythic = cardsData.cards.find(c => c.rarity === 'Mythic') || cardsData.cards[0];
        setSelectedCard(mythic);
      }
      if (invData.user) {
        setUser(invData.user);
        setInventory(invData.inventory || []);
        setActiveDeck(invData.activeDeck || []);
        if (invData.metrics) setMetrics(invData.metrics);
      }
    } catch (e) {
      console.error("Failed to load API data", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show Toast notification
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Pack Unboxing Handlers
  const handleStartUnboxing = (pack) => {
    sounds.playClick();
    setActiveUnboxingPack(pack);
  };

  const handleExecuteOpenPack = async (packId) => {
    setIsOpeningPack(true);
    try {
      const res = await fetch('/api/packs/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local state
        setUser(prev => ({
          ...prev,
          unopenedPacks: data.remainingPacks
        }));
        setInventory(data.inventory);
        if (data.metrics) setMetrics(data.metrics);
        return data;
      } else {
        showToast(data.error || 'Failed to open pack.');
        throw new Error(data.error);
      }
    } catch (e) {
      showToast('Network error while unboxing.');
      throw e;
    } finally {
      setIsOpeningPack(false);
    }
  };

  const handleFinishUnboxing = () => {
    setActiveUnboxingPack(null);
    setCurrentTab('binder');
    showToast('Pack contents integrated into your Vault Collection Binder!');
  };

  // Quick Liquidate duplicates
  const handleLiquidateDuplicates = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/inventory/liquidate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        sounds.playRevealRare();
        setUser(data.user);
        setInventory(data.inventory);
        setMetrics(data.metrics);
        showToast(`Liquidated ${data.liquidatedCount} duplicates for +${data.earnedAeth.toLocaleString()} $AETH!`);
      }
    } catch (e) {
      showToast('Liquidation error.');
    }
  };

  // Card Inspect Drawer actions
  const handleListMarketplace = (card) => {
    sounds.playClick();
    setCurrentTab('marketplace');
    showToast(`Navigated to P2P Trading Hub to list ${card.name}.`);
  };

  const handleAssignDeck = async (cardId) => {
    sounds.playClick();
    let newDeck = [...activeDeck];
    if (newDeck.includes(cardId)) {
      newDeck = newDeck.filter(id => id !== cardId);
      showToast("Card removed from Combat Deck.");
    } else {
      if (newDeck.length >= 5) {
        showToast("Combat Deck is full (5/5). Remove a card first.");
        return;
      }
      newDeck.push(cardId);
      showToast("Card assigned to Active Combat Deck!");
    }
    setActiveDeck(newDeck);
    try {
      await fetch('/api/decks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck: newDeck })
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col selection:bg-primary/30 selection:text-primary">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-high border border-primary text-primary px-4 py-2.5 rounded-xl shadow-[0_4px_24px_rgba(76,215,246,0.3)] font-mono text-xs flex items-center gap-2 animate-bounce-subtle">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        user={user}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPackDirect={handleStartUnboxing}
        metrics={metrics}
      />

      {/* Main View Port */}
      <main className="flex-1 w-full pt-20 pb-28 px-4 sm:px-8 max-w-[1720px] mx-auto">
        
        {currentTab === 'binder' && (
          <BinderView
            allCards={allCards}
            inventory={inventory}
            metrics={metrics}
            selectedCard={selectedCard}
            onSelectCard={(card) => setSelectedCard(card)}
            onOpenInspect={() => {}}
            onCloseInspect={() => setSelectedCard(null)}
            onListMarketplace={handleListMarketplace}
            onAssignDeck={handleAssignDeck}
            activeDeck={activeDeck}
            onOpenPacks={() => {
              if (user?.unopenedPacks?.length > 0) {
                handleStartUnboxing(user.unopenedPacks[0]);
              } else {
                setCurrentTab('shop');
              }
            }}
            onLiquidateDuplicates={handleLiquidateDuplicates}
          />
        )}

        {currentTab === 'shop' && (
          <PackShop
            userBalance={user?.aethBalance || 0}
            onBuyPack={(data) => {
              setUser(data.user);
              showToast(data.message);
            }}
            onOpenPackDirectly={handleStartUnboxing}
            onClose={() => setCurrentTab('binder')}
          />
        )}

        {currentTab === 'marketplace' && (
          <P2PTradeHub
            allCards={allCards}
            inventory={inventory}
            onExecuteTrade={(data) => {
              setInventory(data.inventory);
              if (data.metrics) setMetrics(data.metrics);
              showToast(data.message);
            }}
            onClose={() => setCurrentTab('binder')}
          />
        )}

        {currentTab === 'decks' && (
          <DeckBuilder
            allCards={allCards}
            inventory={inventory}
            activeDeck={activeDeck}
            onSaveDeck={(deck) => {
              setActiveDeck(deck);
              showToast("Active battle squad saved!");
            }}
            onClose={() => setCurrentTab('binder')}
          />
        )}

        {currentTab === 'fusion' && (
          <FusionLab
            allCards={allCards}
            inventory={inventory}
            onExecuteFusion={(data) => {
              setInventory(data.inventory);
              setUser(data.user);
              if (data.metrics) setMetrics(data.metrics);
              showToast(`Synthesized ${data.forgedCard.name}!`);
            }}
            onClose={() => setCurrentTab('binder')}
          />
        )}

      </main>

      {/* Interactive Pack Opener Modal */}
      {activeUnboxingPack && (
        <PackOpener
          pack={activeUnboxingPack}
          onOpenPack={handleExecuteOpenPack}
          onFinish={handleFinishUnboxing}
          isLoading={isOpeningPack}
        />
      )}

      {/* Floating Action Hub Pill */}
      <FloatingActionHub
        unopenedPacks={user?.unopenedPacks || []}
        duplicatesCount={metrics?.duplicatesCount || 0}
        onOpenPacksClick={() => {
          if (user?.unopenedPacks?.length > 0) {
            handleStartUnboxing(user.unopenedPacks[0]);
          } else {
            setCurrentTab('shop');
          }
        }}
        onOpenTradesClick={() => setCurrentTab('marketplace')}
        onLiquidateClick={handleLiquidateDuplicates}
      />

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-8 border-t border-surface-container-highest/60">
        <div className="w-full px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1720px] mx-auto">
          <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
            <span className="uppercase tracking-wider font-bold">Aetheria Protocol v2.4.0</span>
            <span className="text-outline-variant">//</span>
            <span>Obsidian Digital Binder Engine</span>
          </div>
          <div className="font-mono text-xs text-on-surface-variant text-center md:text-right">
            © 2026 Aetheria Cards Inc. All card rights, dynamic 3D tilt shaders, and holographic matrices reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
