import express from 'express';
import cors from 'cors';
import { executeFacetedSearch } from './searchEngine';
import { PRODUCTS_CATALOG } from './catalog';
import { FilterQueryState, ShortlistSnapshot, TelemetryPayload } from './types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// In-memory Shortlist Store (for 6-character snapshot links)
const shortlistStore = new Map<string, ShortlistSnapshot>();

// Seed a demo shortlist for instant exploration
const demoShortlistCode = 'PRO77X';
shortlistStore.set(demoShortlistCode, {
  code: demoShortlistCode,
  createdAt: new Date().toISOString(),
  comparisonItemIds: ['prod-alpine-01', 'prod-alpine-02', 'prod-alpine-03'],
  filterState: {
    q: '',
    categories: ['Ultralight & Alpine Tech'],
    brands: [],
    priceRangeCents: [5000, 100000],
    minRating: 4.5,
    inStockOnly: true,
    historicalLowOnly: false,
    specFilters: {},
    priorityWeights: {
      performance: 80,
      portability: 85,
      durability: 90,
      value: 65,
    },
    sortBy: 'FIT_SCORE'
  }
});

// 1. Faceted Search & Disjunctive Aggregation Engine
app.post('/api/products/search', (req, res) => {
  try {
    const raw = req.body || {};
    const defaultWeights = { performance: 50, portability: 50, durability: 50, value: 50 };

    const filterState: FilterQueryState = {
      q: typeof raw.q === 'string' ? raw.q : '',
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      brands: Array.isArray(raw.brands) ? raw.brands : [],
      priceRangeCents: Array.isArray(raw.priceRangeCents) && raw.priceRangeCents.length === 2
        ? [Number(raw.priceRangeCents[0]), Number(raw.priceRangeCents[1])]
        : [5000, 450000],
      minRating: typeof raw.minRating === 'number' ? raw.minRating : 0,
      inStockOnly: Boolean(raw.inStockOnly),
      historicalLowOnly: Boolean(raw.historicalLowOnly),
      specFilters: raw.specFilters && typeof raw.specFilters === 'object' ? raw.specFilters : {},
      priorityWeights: raw.priorityWeights && typeof raw.priorityWeights === 'object'
        ? {
            performance: Number(raw.priorityWeights.performance ?? 50),
            portability: Number(raw.priorityWeights.portability ?? 50),
            durability: Number(raw.priorityWeights.durability ?? 50),
            value: Number(raw.priorityWeights.value ?? 50),
          }
        : defaultWeights,
      sortBy: raw.sortBy || 'FIT_SCORE'
    };

    const searchResponse = executeFacetedSearch(filterState);
    res.json(searchResponse);
  } catch (err: any) {
    console.error('Search engine error:', err);
    res.status(500).json({ error: 'Search aggregation failed', message: err.message });
  }
});

// 2. Product Telemetry & Price History
app.get('/api/products/:id/telemetry', (req, res) => {
  const { id } = req.params;
  const product = PRODUCTS_CATALOG.find(p => p.id === id || p.slug === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Generate 90-day comprehensive telemetry
  const days = 90;
  const priceHistory90d: { date: string; priceCents: number; msrpCents: number }[] = [];
  const now = new Date();
  let sumPrice = 0;
  let allTimeHigh = product.basePriceCents;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    let price = product.basePriceCents;

    if (i > 80) {
      price = Math.round(product.basePriceCents * 1.08); // Slight inflation 3 months ago
    } else if (i >= 30 && i <= 36) {
      price = product.historicalLowCents; // Historic flash promo
    } else if (i % 6 === 0) {
      price = Math.round(product.basePriceCents * 0.95);
    } else {
      const wobble = Math.sin(i * 0.3) * 0.04 + 1;
      price = Math.round(product.basePriceCents * wobble);
    }

    price = Math.max(product.historicalLowCents, price);
    if (price > allTimeHigh) allTimeHigh = price;
    sumPrice += price;

    const msrp = Math.round(product.basePriceCents * 1.15);
    priceHistory90d.push({ date: dateStr, priceCents: price, msrpCents: msrp });
  }

  const average90dCents = Math.round(sumPrice / days);

  const totalVariantStock = product.variants.reduce((acc, v) => acc + v.stockCount, 0);
  const stockBadge = totalVariantStock > 8 ? 'IN_STOCK' : totalVariantStock > 0 ? 'LOW_STOCK' : 'BACKORDER';

  const telemetry: TelemetryPayload = {
    productId: product.id,
    title: product.title,
    historicalLowCents: product.historicalLowCents,
    allTimeHighCents: allTimeHigh,
    average90dCents,
    dealVerdict: product.dealVerdict,
    warehouseStockVelocity: {
      totalStock: totalVariantStock,
      status: stockBadge,
      unitsSoldLast7d: Math.floor(Math.random() * 45) + 12,
      restockLeadDays: totalVariantStock < 5 ? 3 : 0,
      reservedCount: Math.floor(Math.random() * 5) + 1,
    },
    priceHistory90d
  };

  res.json(telemetry);
});

// 3. Shortlist Snapshot Generation (6-character code)
app.post('/api/shortlists', (req, res) => {
  try {
    const { filterState, comparisonItemIds } = req.body;
    
    // Generate 6-char alphanumeric code (e.g. K9X2P4)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const snapshot: ShortlistSnapshot = {
      code,
      createdAt: new Date().toISOString(),
      filterState: filterState || {},
      comparisonItemIds: Array.isArray(comparisonItemIds) ? comparisonItemIds : []
    };

    shortlistStore.set(code, snapshot);
    res.json({ code, snapshot });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create shortlist snapshot', message: err.message });
  }
});

// 4. Shortlist Snapshot Hydration
app.get('/api/shortlists/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const snapshot = shortlistStore.get(code);

  if (!snapshot) {
    return res.status(404).json({ error: 'Shortlist not found or expired' });
  }

  res.json(snapshot);
});

app.listen(PORT, () => {
  console.log(`[Precision Engine API] Server active on http://localhost:${PORT}`);
  console.log(`[Catalog Ledger] ${PRODUCTS_CATALOG.length} SKUs indexed across 4 categories.`);
});
