import express from 'express';
import cors from 'cors';
import { CARDS } from './data/cards.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory state initialized with realistic starter data
let state = {
  user: {
    handle: "NEONBLADE",
    level: 48,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuACxretPhYFYzT-QSM1bWr4ztVDyYn7DEVMcWg4PfoT2MUMKXxXq1GA1rvh3_iSsaU61CwOyEc7Y2RsNMi5QocTgCpqHWmX2rPoXT7EJcFNsL0oUE9yRTLUMaYXM1ztFrspK7nNNwfpYxGHigv6F7RDP9qHLlvmKFqAqd-5dXtUHK5UThF3lSo-yyq8pd7-PMDHMSrY3wnRDpV4VddcloS8JGxSjpGULFwL_kZBMMVjlBp026rjDMHvoQ",
    aethBalance: 14850,
    prismBalance: 320,
    unopenedPacks: [
      { id: "pack-1", name: "Aetheria Genesis Foil Pack", type: "genesis", cardsCount: 5, tier: "gold" },
      { id: "pack-2", name: "Solar Surge Mystery Pack", type: "solar", cardsCount: 5, tier: "amber" }
    ]
  },
  // User's owned card copies
  inventory: [
    { cardId: "solaris-archon", count: 1, serial: "#004 / 500", mintGrade: "GEM MINT 10", isHolo: true, acquiredAt: "2024-03-10" },
    { cardId: "aether-leviathan", count: 1, serial: "#089 / 750", mintGrade: "MINT 9.5", isHolo: true, acquiredAt: "2024-03-12" },
    { cardId: "void-stalker-nyx", count: 2, serial: "#142 / 2500", mintGrade: "MINT 9", isHolo: true, acquiredAt: "2024-03-15" },
    { cardId: "chrono-weaver", count: 1, serial: "#167 / 2500", mintGrade: "MINT 9", isHolo: true, acquiredAt: "2024-03-18" },
    { cardId: "abyssal-pyromancer", count: 3, serial: "#201 / 5000", mintGrade: "NM 8.5", isHolo: false, acquiredAt: "2024-03-20" },
    { cardId: "glitch-chimera", count: 2, serial: "#224 / 5000", mintGrade: "NM 8", isHolo: false, acquiredAt: "2024-03-22" },
    { cardId: "obsidian-sentry", count: 5, serial: "#248 / 50000", mintGrade: "NM 8", isHolo: false, acquiredAt: "2024-03-25" },
    { cardId: "neon-scavenger", count: 4, serial: "#249 / 50000", mintGrade: "EX 7.5", isHolo: false, acquiredAt: "2024-03-28" },
    { cardId: "patrol-bot", count: 3, serial: "#310 / 50000", mintGrade: "NM 8", isHolo: false, acquiredAt: "2024-04-01" },
    { cardId: "plasma-spark", count: 2, serial: "#404 / 50000", mintGrade: "NM 8", isHolo: false, acquiredAt: "2024-04-03" },
    { cardId: "arcane-adept", count: 1, serial: "#512 / 10000", mintGrade: "MINT 9", isHolo: false, acquiredAt: "2024-04-05" },
    { cardId: "shield-drone", count: 1, serial: "#680 / 10000", mintGrade: "NM 8.5", isHolo: false, acquiredAt: "2024-04-07" }
  ],
  activeDeck: ["solaris-archon", "aether-leviathan", "void-stalker-nyx", "chrono-weaver", "abyssal-pyromancer"],
  // P2P Marketplace active trade listings
  marketTrades: [
    {
      id: "trade-101",
      trader: "CipherGhost",
      traderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CipherGhost",
      traderLevel: 54,
      offerCardId: "chronos-sovereign", // Mythic
      offerCardSerial: "#029 / 500",
      requestCardIds: ["aether-leviathan", "abyssal-pyromancer"],
      expiresIn: "4 hours",
      status: "OPEN"
    },
    {
      id: "trade-102",
      trader: "Valkyrie_X",
      traderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie_X",
      traderLevel: 39,
      offerCardId: "omni-drake-ignis", // Legendary
      offerCardSerial: "#076 / 600",
      requestCardIds: ["chrono-weaver", "glitch-chimera"],
      expiresIn: "12 hours",
      status: "OPEN"
    },
    {
      id: "trade-103",
      trader: "ZeroKool",
      traderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZeroKool",
      traderLevel: 41,
      offerCardId: "valkyrie-prime", // Epic
      offerCardSerial: "#530 / 2500",
      requestCardIds: ["abyssal-pyromancer"],
      expiresIn: "1 day",
      status: "OPEN"
    },
    {
      id: "trade-104",
      trader: "Aegis_Null",
      traderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aegis_Null",
      traderLevel: 62,
      offerCardId: "genesis-matrix-core", // Legendary
      offerCardSerial: "#112 / 1000",
      requestCardIds: ["void-stalker-nyx", "chrono-weaver"],
      expiresIn: "2 days",
      status: "OPEN"
    }
  ]
};

// Helper: calculate vault appraisal & stats
function calculateVaultMetrics() {
  let totalEth = 0;
  let totalAeth = 0;
  let mythicCount = 0;
  let legendaryCount = 0;
  let epicCount = 0;
  let rareCount = 0;
  let commonCount = 0;
  let holoCount = 0;
  let duplicatesCount = 0;

  const uniqueOwnedCardIds = new Set();

  state.inventory.forEach(item => {
    uniqueOwnedCardIds.add(item.cardId);
    const card = CARDS.find(c => c.id === item.cardId);
    if (card) {
      totalEth += card.marketValueEth * item.count;
      totalAeth += card.marketValueAeth * item.count;
      if (item.count > 1) {
        duplicatesCount += (item.count - 1);
      }
      if (item.isHolo) holoCount += item.count;

      if (card.rarity === "Mythic") mythicCount += item.count;
      else if (card.rarity === "Legendary") legendaryCount += item.count;
      else if (card.rarity === "Epic") epicCount += item.count;
      else if (card.rarity === "Rare") rareCount += item.count;
      else commonCount += item.count;
    }
  });

  const totalCardsInSeries = CARDS.length;
  const uniqueOwned = uniqueOwnedCardIds.size;
  const syncPercentage = ((uniqueOwned / totalCardsInSeries) * 100).toFixed(1);

  return {
    totalEth: totalEth.toFixed(2),
    totalUsd: (totalEth * 3320).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    totalAeth,
    totalCardsInSeries,
    uniqueOwned,
    totalCardsOwned: state.inventory.reduce((acc, i) => acc + i.count, 0),
    syncPercentage,
    duplicatesCount,
    holoCount,
    mythicCount,
    legendaryCount,
    epicCount,
    rareCount,
    commonCount
  };
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Card Catalog
app.get('/api/cards', (req, res) => {
  res.json({ cards: CARDS });
});

// 3. User Inventory & Profile
app.get('/api/inventory', (req, res) => {
  const metrics = calculateVaultMetrics();
  res.json({
    user: state.user,
    inventory: state.inventory,
    activeDeck: state.activeDeck,
    metrics
  });
});

// 4. Shop Packs Catalog
app.get('/api/packs/shop', (req, res) => {
  const packs = [
    {
      id: "pack-genesis",
      name: "Aetheria Genesis Foil Pack",
      desc: "5 Cards • 1 Guaranteed Rare or higher • 1.8% Mythic Apex Chance • Prismatic Sheen Boost",
      priceAeth: 2500,
      pricePrism: 50,
      type: "genesis",
      cardsCount: 5,
      coverBadge: "SERIES 1 FIRST ED",
      glowColor: "cyan"
    },
    {
      id: "pack-solar",
      name: "Solar Surge Mystery Pack",
      desc: "5 Cards • Boosted Divine & Fire Elements • High Epic Rate • Holo Foil Guaranteed",
      priceAeth: 3500,
      pricePrism: 70,
      type: "solar",
      cardsCount: 5,
      coverBadge: "SOLAR FORGED",
      glowColor: "amber"
    },
    {
      id: "pack-void",
      name: "Void Singularity Prismatic Pack",
      desc: "5 Cards • 2 Guaranteed Epics • 4.5% Mythic Drop Rate • Prismatic Full Bleed",
      priceAeth: 6000,
      pricePrism: 120,
      type: "void",
      cardsCount: 5,
      coverBadge: "APEX TIER EXCLUSIVE",
      glowColor: "violet"
    }
  ];
  res.json({ packs });
});

// 5. Buy Pack
app.post('/api/packs/buy', (req, res) => {
  const { packType, currency } = req.body;
  
  let costAeth = 2500;
  let packName = "Aetheria Genesis Foil Pack";
  if (packType === 'solar') {
    costAeth = 3500;
    packName = "Solar Surge Mystery Pack";
  } else if (packType === 'void') {
    costAeth = 6000;
    packName = "Void Singularity Prismatic Pack";
  }

  if (state.user.aethBalance < costAeth) {
    return res.status(400).json({ error: "Insufficient $AETH balance to purchase pack." });
  }

  state.user.aethBalance -= costAeth;
  const newPack = {
    id: `pack-${Date.now()}`,
    name: packName,
    type: packType || "genesis",
    cardsCount: 5,
    tier: packType === 'void' ? 'violet' : (packType === 'solar' ? 'amber' : 'gold')
  };
  state.user.unopenedPacks.push(newPack);

  res.json({
    success: true,
    message: `Acquired 1x ${packName}`,
    user: state.user,
    newPack
  });
});

// 6. Open Pack (The Anticipation Gacha Drop Algorithm)
app.post('/api/packs/open', (req, res) => {
  if (state.user.unopenedPacks.length === 0) {
    return res.status(400).json({ error: "No unopened packs available in your inventory." });
  }

  const { packId } = req.body;
  const packIndex = packId 
    ? state.user.unopenedPacks.findIndex(p => p.id === packId)
    : 0;

  if (packIndex === -1) {
    return res.status(404).json({ error: "Specified pack not found." });
  }

  const openedPack = state.user.unopenedPacks.splice(packIndex, 1)[0];

  // Rarity Drop Rate Algorithm
  // Common (~60%), Uncommon (~25%), Rare (~10%), Epic (~4%), Mythic (~1%)
  // Void packs boost Epic and Mythic rates
  const pulledCards = [];
  const cardCount = openedPack.cardsCount || 5;

  const mythicCards = CARDS.filter(c => c.rarity === "Mythic");
  const legendCards = CARDS.filter(c => c.rarity === "Legendary");
  const epicCards = CARDS.filter(c => c.rarity === "Epic");
  const rareCards = CARDS.filter(c => c.rarity === "Rare");
  const uncommonCards = CARDS.filter(c => c.rarity === "Uncommon");
  const commonCards = CARDS.filter(c => c.rarity === "Common");

  const grades = ["GEM MINT 10", "MINT 9.5", "MINT 9", "NM 8.5", "NM 8"];

  for (let i = 0; i < cardCount; i++) {
    const roll = Math.random() * 100;
    let selectedPool = commonCards;
    let isHolo = false;

    // Last card slot in pack has guaranteed Rare+ protection
    const isGuaranteedSlot = (i === cardCount - 1);

    let mythicThreshold = openedPack.type === 'void' ? 4.5 : 1.5;
    let epicThreshold = openedPack.type === 'void' ? 18.0 : 5.5;
    let rareThreshold = openedPack.type === 'void' ? 45.0 : 16.0;
    let uncommonThreshold = 40.0;

    if (roll < mythicThreshold) {
      selectedPool = Math.random() < 0.5 ? mythicCards : legendCards;
      isHolo = true;
    } else if (roll < epicThreshold) {
      selectedPool = epicCards;
      isHolo = Math.random() < 0.7;
    } else if (roll < rareThreshold || (isGuaranteedSlot && roll >= rareThreshold)) {
      selectedPool = rareCards;
      isHolo = Math.random() < 0.4;
    } else if (roll < uncommonThreshold) {
      selectedPool = uncommonCards;
      isHolo = Math.random() < 0.2;
    } else {
      selectedPool = commonCards;
      isHolo = Math.random() < 0.05;
    }

    const card = selectedPool[Math.floor(Math.random() * selectedPool.length)];
    const serialNum = Math.floor(Math.random() * (card.mintLimit || 5000)) + 1;
    const serial = `#${String(serialNum).padStart(3, '0')} / ${card.mintLimit || 5000}`;
    const grade = grades[Math.floor(Math.random() * grades.length)];

    const pulledItem = {
      ...card,
      pulledSerial: serial,
      pulledGrade: grade,
      pulledHolo: isHolo,
      isNew: !state.inventory.some(inv => inv.cardId === card.id)
    };
    pulledCards.push(pulledItem);

    // Update inventory
    const existing = state.inventory.find(inv => inv.cardId === card.id);
    if (existing) {
      existing.count += 1;
    } else {
      state.inventory.push({
        cardId: card.id,
        count: 1,
        serial,
        mintGrade: grade,
        isHolo,
        acquiredAt: new Date().toISOString().split('T')[0]
      });
    }
  }

  const metrics = calculateVaultMetrics();

  res.json({
    success: true,
    openedPack,
    pulledCards,
    remainingPacks: state.user.unopenedPacks,
    inventory: state.inventory,
    metrics
  });
});

// 7. P2P Marketplace Trades
app.get('/api/trades', (req, res) => {
  res.json({
    trades: state.marketTrades,
    cards: CARDS
  });
});

// 8. Execute P2P Trade Swap
app.post('/api/trades/swap', (req, res) => {
  const { tradeId, yourCardId } = req.body;
  const tradeIndex = state.marketTrades.findIndex(t => t.id === tradeId);
  if (tradeIndex === -1) {
    return res.status(404).json({ error: "Trade listing has expired or was removed." });
  }

  const trade = state.marketTrades[tradeIndex];
  
  // Verify user owns yourCardId
  const ownedItem = state.inventory.find(inv => inv.cardId === yourCardId);
  if (!ownedItem || ownedItem.count <= 0) {
    return res.status(400).json({ error: "You do not possess the required card for this swap." });
  }

  // Deduct your card
  if (ownedItem.count === 1) {
    state.inventory = state.inventory.filter(inv => inv.cardId !== yourCardId);
  } else {
    ownedItem.count -= 1;
  }

  // Add offered card from trade
  const targetCard = CARDS.find(c => c.id === trade.offerCardId);
  const existingOfferCard = state.inventory.find(inv => inv.cardId === trade.offerCardId);
  if (existingOfferCard) {
    existingOfferCard.count += 1;
  } else {
    state.inventory.push({
      cardId: trade.offerCardId,
      count: 1,
      serial: trade.offerCardSerial || "#100 / 1000",
      mintGrade: "MINT 9.5",
      isHolo: targetCard ? (targetCard.rarity === "Mythic" || targetCard.rarity === "Legendary") : false,
      acquiredAt: new Date().toISOString().split('T')[0]
    });
  }

  // Remove trade from active market
  state.marketTrades.splice(tradeIndex, 1);
  const metrics = calculateVaultMetrics();

  res.json({
    success: true,
    message: `Swapped with ${trade.trader}! Received ${targetCard?.name}.`,
    receivedCard: targetCard,
    inventory: state.inventory,
    metrics,
    remainingTrades: state.marketTrades
  });
});

// 9. Fusion Forge (Combine 3 duplicate cards into 1 higher tier card + PRISM essence)
app.post('/api/fusion', (req, res) => {
  const { cardId } = req.body;
  const owned = state.inventory.find(inv => inv.cardId === cardId);
  
  if (!owned || owned.count < 3) {
    return res.status(400).json({ error: "Requires at least 3 copies of the card to execute matrix fusion." });
  }

  const baseCard = CARDS.find(c => c.id === cardId);
  owned.count -= 3;
  if (owned.count === 0) {
    state.inventory = state.inventory.filter(inv => inv.cardId !== cardId);
  }

  // Determine forged tier
  let forgePool = CARDS.filter(c => c.rarity === "Rare");
  let prismReward = 25;
  if (baseCard.rarity === "Common") {
    forgePool = CARDS.filter(c => c.rarity === "Uncommon" || c.rarity === "Rare");
    prismReward = 20;
  } else if (baseCard.rarity === "Uncommon") {
    forgePool = CARDS.filter(c => c.rarity === "Rare" || c.rarity === "Epic");
    prismReward = 45;
  } else if (baseCard.rarity === "Rare") {
    forgePool = CARDS.filter(c => c.rarity === "Epic" || c.rarity === "Legendary");
    prismReward = 90;
  } else {
    forgePool = CARDS.filter(c => c.rarity === "Mythic" || c.rarity === "Legendary");
    prismReward = 200;
  }

  const forgedCard = forgePool[Math.floor(Math.random() * forgePool.length)];
  const serial = `#FORGED-${Math.floor(Math.random() * 900) + 100}`;
  
  // Add to inventory
  const existing = state.inventory.find(inv => inv.cardId === forgedCard.id);
  if (existing) {
    existing.count += 1;
  } else {
    state.inventory.push({
      cardId: forgedCard.id,
      count: 1,
      serial,
      mintGrade: "GEM MINT 10",
      isHolo: true,
      acquiredAt: new Date().toISOString().split('T')[0]
    });
  }

  state.user.prismBalance += prismReward;
  const metrics = calculateVaultMetrics();

  res.json({
    success: true,
    forgedCard,
    prismReward,
    inventory: state.inventory,
    user: state.user,
    metrics
  });
});

// 10. Quick Liquidate Duplicates
app.post('/api/inventory/liquidate', (req, res) => {
  let liquidatedCount = 0;
  let earnedAeth = 0;

  state.inventory.forEach(item => {
    if (item.count > 1) {
      const dups = item.count - 1;
      liquidatedCount += dups;
      const card = CARDS.find(c => c.id === item.cardId);
      const cardVal = card ? card.marketValueAeth : 300;
      earnedAeth += Math.floor(cardVal * 0.7) * dups;
      item.count = 1;
    }
  });

  state.user.aethBalance += earnedAeth;
  const metrics = calculateVaultMetrics();

  res.json({
    success: true,
    liquidatedCount,
    earnedAeth,
    user: state.user,
    inventory: state.inventory,
    metrics
  });
});

// 11. Save Deck
app.post('/api/decks/save', (req, res) => {
  const { deck } = req.body;
  if (!Array.isArray(deck) || deck.length === 0) {
    return res.status(400).json({ error: "Deck must contain at least 1 card." });
  }
  state.activeDeck = deck;
  res.json({ success: true, activeDeck: state.activeDeck });
});

app.listen(PORT, () => {
  console.log(`[AETHERIA SERVER] Listening on port ${PORT}`);
});
