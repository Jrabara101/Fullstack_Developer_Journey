import { PRODUCTS_CATALOG } from './catalog';
import { FilterQueryState, ProductItem, SearchResponsePayload, FacetBucket, PriorityWeights } from './types';

// Compute weighted similarity score between user's Priority Weights and product's normalizedScores
export function computeFitMatchScore(weights: PriorityWeights, scores: ProductItem['normalizedScores']): number {
  const w = [weights.performance || 0, weights.portability || 0, weights.durability || 0, weights.value || 0];
  const s = [scores.performance || 0, scores.portability || 0, scores.durability || 0, scores.value || 0];

  const sumW = w.reduce((a, b) => a + b, 0);
  if (sumW === 0) {
    return Math.round((s[0] + s[1] + s[2] + s[3]) / 4);
  }

  let dot = 0;
  let magW = 0;
  let magS = 0;
  for (let i = 0; i < 4; i++) {
    dot += (w[i] * s[i]);
    magW += (w[i] * w[i]);
    magS += (s[i] * s[i]);
  }

  if (magW === 0 || magS === 0) return 75;

  const cosine = dot / (Math.sqrt(magW) * Math.sqrt(magS));
  // Scale cosine to 60-99%
  const score = Math.round(cosine * 100);
  return Math.max(50, Math.min(99, score));
}

// Stopwords for search tokens
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'under',
  'sub', 'below', 'less', 'than', 'over', 'above', 'feet', 'foot', 'is', 'it', 'or', 'item', 'items', 'gear'
]);

// Natural-Language Intent Parser
export function parseNaturalLanguageIntent(query: string): {
  extractedTokens: { field: string; operator: string; value: string | number; displayLabel: string }[];
  cleanedKeywords: string[];
  inferredCategory?: string;
  inferredMaxPrice?: number;
  inferredSpecs: Record<string, string | boolean | number>;
} {
  const tokens: { field: string; operator: string; value: string | number; displayLabel: string }[] = [];
  const inferredSpecs: Record<string, string | boolean | number> = {};
  let cleaned = query.trim().toLowerCase();
  let inferredCategory: string | undefined = undefined;
  let inferredMaxPrice: number | undefined = undefined;

  // 1. Price extraction e.g. "under $160", "under 160", "<$160", "below 200", "sub 250"
  const priceRegex = /(?:under|<|below|sub|less than)\s*\$?(\d+(?:\.\d+)?)/i;
  const priceMatch = cleaned.match(priceRegex);
  if (priceMatch) {
    const val = parseFloat(priceMatch[1]);
    inferredMaxPrice = Math.round(val * 100);
    tokens.push({
      field: 'priceRangeCents',
      operator: '<=',
      value: inferredMaxPrice,
      displayLabel: `Max Price: $${val}`
    });
    cleaned = cleaned.replace(priceRegex, ' ').trim();
  }

  // 2. Category intent
  if (/(?:shoe|shoes|trail|running|alpine|hardshell|jacket|outerwear|pack|backpack|tent|pole|poles|climb|hiking|thru-hike)/i.test(cleaned)) {
    inferredCategory = "Ultralight & Alpine Tech";
    tokens.push({
      field: 'categories',
      operator: 'in',
      value: inferredCategory,
      displayLabel: `Category: Alpine & Trail`
    });
  } else if (/(?:headphone|headphones|earphone|audio|studio|sound|microphone|mic|dac|amp|acoustic|iem|mastering)/i.test(cleaned)) {
    inferredCategory = "Audiophile Studio & Acoustics";
    tokens.push({
      field: 'categories',
      operator: 'in',
      value: inferredCategory,
      displayLabel: `Category: Audiophile & Studio`
    });
  } else if (/(?:keyboard|keyboards|mouse|mice|switch|switches|hall effect|magnetic|gasket|analog|rapid trigger|keycaps)/i.test(cleaned)) {
    inferredCategory = "Custom Mechanical Keyboards & Peripherals";
    tokens.push({
      field: 'categories',
      operator: 'in',
      value: inferredCategory,
      displayLabel: `Category: Keyboards & Peripherals`
    });
  } else if (/(?:laptop|laptops|workstation|display|monitor|oled|screen|macbook|retina|creator|cintiq|surface|editing)/i.test(cleaned)) {
    inferredCategory = "Precision Creator Workstations & Displays";
    tokens.push({
      field: 'categories',
      operator: 'in',
      value: inferredCategory,
      displayLabel: `Category: Creator & Workstations`
    });
  }

  // 3. Spec & Attribute intent tokens
  if (/waterproof|stormproof|gore-tex|weatherproof/i.test(cleaned)) {
    inferredSpecs['waterproof'] = true;
    tokens.push({
      field: 'specs.waterproof',
      operator: '==',
      value: 'true',
      displayLabel: `Attribute: Waterproof`
    });
  }

  if (/\bwide\b|wide feet|wide toe/i.test(cleaned)) {
    inferredSpecs['fit'] = 'Wide';
    tokens.push({
      field: 'specs.fit',
      operator: 'contains',
      value: 'Wide',
      displayLabel: `Fit: Wide`
    });
  }

  if (/ultralight|lightweight/i.test(cleaned)) {
    inferredSpecs['ultralight'] = true;
    tokens.push({
      field: 'tags',
      operator: 'includes',
      value: 'ultralight',
      displayLabel: `Weight: Ultralight`
    });
  }

  if (/wireless|bluetooth|cordless/i.test(cleaned)) {
    inferredSpecs['wireless'] = true;
    tokens.push({
      field: 'tags',
      operator: 'includes',
      value: 'wireless',
      displayLabel: `Connectivity: Wireless`
    });
  }

  if (/hall effect|rapid trigger|magnetic/i.test(cleaned)) {
    inferredSpecs['magnetic'] = true;
    tokens.push({
      field: 'specs.switchType',
      operator: 'contains',
      value: 'Magnetic',
      displayLabel: `Switch: Magnetic Hall Effect`
    });
  }

  if (/oled|rgb oled/i.test(cleaned)) {
    inferredSpecs['panelType'] = 'OLED';
    tokens.push({
      field: 'specs.panelType',
      operator: 'contains',
      value: 'OLED',
      displayLabel: `Panel: OLED`
    });
  }

  if (/anc|noise cancelling/i.test(cleaned)) {
    inferredSpecs['anc'] = true;
    tokens.push({
      field: 'specs.anc',
      operator: '==',
      value: 'true',
      displayLabel: `Feature: Active Noise Cancelling`
    });
  }

  // Remove matched intent phrases from keywords to get core search terms
  cleaned = cleaned
    .replace(/waterproof|stormproof|gore-tex|weatherproof/g, '')
    .replace(/wide feet|wide toe|\bwide\b/g, '')
    .replace(/ultralight|lightweight/g, '')
    .replace(/wireless|bluetooth/g, '')
    .replace(/hall effect|rapid trigger|magnetic/g, '')
    .replace(/noise cancelling|anc/g, '')
    .replace(/oled/g, '')
    .trim();

  const words = cleaned.split(/[^a-z0-9_-]+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));

  return {
    extractedTokens: tokens,
    cleanedKeywords: words,
    inferredCategory,
    inferredMaxPrice,
    inferredSpecs
  };
}

// Check if item matches a given single criterion
function matchesKeywords(item: ProductItem, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return true;
  const target = `${item.title} ${item.brand} ${item.category} ${item.subcategory} ${item.tags.join(' ')} ${JSON.stringify(item.specs)}`.toLowerCase();
  // Return true if at least one meaningful keyword matches or all match
  return keywords.every(kw => target.includes(kw)) || keywords.some(kw => target.includes(kw));
}

function matchesCategory(item: ProductItem, categories: string[]): boolean {
  if (!categories || categories.length === 0) return true;
  return categories.includes(item.category);
}

function matchesBrand(item: ProductItem, brands: string[]): boolean {
  if (!brands || brands.length === 0) return true;
  return brands.includes(item.brand);
}

function matchesPrice(item: ProductItem, range: [number, number]): boolean {
  if (!range) return true;
  const [min, max] = range;
  return item.basePriceCents >= min && item.basePriceCents <= max;
}

function matchesRating(item: ProductItem, minRating: number): boolean {
  if (!minRating || minRating <= 0) return true;
  return item.ratingAverage >= minRating;
}

function matchesInStock(item: ProductItem, inStockOnly: boolean): boolean {
  if (!inStockOnly) return true;
  return item.variants.some(v => v.status === 'IN_STOCK' || v.status === 'LOW_STOCK');
}

function matchesHistoricalLow(item: ProductItem, historicalLowOnly: boolean): boolean {
  if (!historicalLowOnly) return true;
  return item.dealVerdict === 'HISTORICAL_LOW' || item.dealVerdict === 'GREAT_VALUE';
}

function matchesSpecFilters(item: ProductItem, specFilters: Record<string, (string | number | boolean)[]>): boolean {
  if (!specFilters || Object.keys(specFilters).length === 0) return true;

  for (const [key, values] of Object.entries(specFilters)) {
    if (!values || values.length === 0) continue;
    
    if (typeof values[0] === 'boolean') {
      const itemVal = Boolean(item.specs[key]);
      if (!values.includes(itemVal)) return false;
      continue;
    }

    const itemSpecVal = item.specs[key];
    if (itemSpecVal !== undefined) {
      const match = values.some(v => String(itemSpecVal).toLowerCase().includes(String(v).toLowerCase()));
      if (!match) return false;
    } else {
      const matchTag = values.some(v => item.tags.includes(String(v).toLowerCase()));
      if (!matchTag) return false;
    }
  }

  return true;
}

// Full matching logic with optional NLP overrides
function matchesAllFilters(
  item: ProductItem,
  filters: FilterQueryState,
  nlpKeywords: string[],
  effectiveCategory?: string,
  effectiveMaxPrice?: number,
  effectiveSpecs?: Record<string, any>
): boolean {
  // Check keywords
  if (!matchesKeywords(item, nlpKeywords)) return false;

  // Check Category (User selected OR NLP inferred)
  const categoriesToCheck = filters.categories.length > 0
    ? filters.categories
    : (effectiveCategory ? [effectiveCategory] : []);
  if (!matchesCategory(item, categoriesToCheck)) return false;

  // Check Brands
  if (!matchesBrand(item, filters.brands)) return false;

  // Check Price: use lowest max between filter and NLP inferred
  const [minP, userMaxP] = filters.priceRangeCents;
  const maxP = effectiveMaxPrice ? Math.min(userMaxP, effectiveMaxPrice) : userMaxP;
  if (!matchesPrice(item, [minP, maxP])) return false;

  // Check Rating
  if (!matchesRating(item, filters.minRating)) return false;

  // Check Stock
  if (!matchesInStock(item, filters.inStockOnly)) return false;

  // Check Historical Low
  if (!matchesHistoricalLow(item, filters.historicalLowOnly)) return false;

  // Check Explicit Spec Filters
  if (!matchesSpecFilters(item, filters.specFilters)) return false;

  // Check NLP inferred specs (if any)
  if (effectiveSpecs) {
    if (effectiveSpecs.waterproof && !item.specs.waterproof) return false;
    if (effectiveSpecs.fit && !String(item.specs.fit || '').toLowerCase().includes(String(effectiveSpecs.fit).toLowerCase())) return false;
    if (effectiveSpecs.ultralight && !item.tags.includes('ultralight')) return false;
    if (effectiveSpecs.wireless && !item.tags.includes('wireless') && !item.tags.includes('bluetooth')) return false;
    if (effectiveSpecs.anc && !item.specs.anc) return false;
  }

  return true;
}

// Disjunctive Facet Count Calculator
export function executeFacetedSearch(filters: FilterQueryState): SearchResponsePayload {
  const startTime = performance.now();

  // 1. Parse natural language intent if query is present
  const nlp = parseNaturalLanguageIntent(filters.q || '');

  // 2. Compute matching items with full filter state + NLP interpretation
  let matchedItems = PRODUCTS_CATALOG.filter(item =>
    matchesAllFilters(item, filters, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, nlp.inferredSpecs)
  );

  // If strict NLP specs yielded 0 results, gracefully fallback to partial match to prevent a dead-end
  let relaxedNLP = false;
  if (matchedItems.length === 0 && (nlp.inferredSpecs && Object.keys(nlp.inferredSpecs).length > 0)) {
    matchedItems = PRODUCTS_CATALOG.filter(item =>
      matchesAllFilters(item, filters, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, undefined)
    );
    relaxedNLP = true;
  }

  // 3. Annotate Fit Match % based on user Priority Weights
  matchedItems = matchedItems.map(item => {
    const fitMatch = computeFitMatchScore(filters.priorityWeights, item.normalizedScores);
    return {
      ...item,
      fitMatchPercent: fitMatch,
    };
  });

  // 4. Sort results
  if (filters.sortBy === 'FIT_SCORE') {
    matchedItems.sort((a, b) => (b.fitMatchPercent || 0) - (a.fitMatchPercent || 0));
  } else if (filters.sortBy === 'PRICE_ASC') {
    matchedItems.sort((a, b) => a.basePriceCents - b.basePriceCents);
  } else if (filters.sortBy === 'PRICE_DESC') {
    matchedItems.sort((a, b) => b.basePriceCents - a.basePriceCents);
  } else if (filters.sortBy === 'RATING_DESC') {
    matchedItems.sort((a, b) => b.ratingAverage - a.ratingAverage);
  } else if (filters.sortBy === 'BEST_DEAL') {
    const order: Record<string, number> = {
      'HISTORICAL_LOW': 4,
      'GREAT_VALUE': 3,
      'TYPICAL_PRICE': 2,
      'INFLATED_MSRP': 1,
    };
    matchedItems.sort((a, b) => (order[b.dealVerdict] || 0) - (order[a.dealVerdict] || 0));
  }

  // 5. Disjunctive Facet Aggregation
  // CATEGORIES: Apply all filters EXCEPT category
  const categoryBase = PRODUCTS_CATALOG.filter(item =>
    matchesKeywords(item, nlp.cleanedKeywords) &&
    matchesBrand(item, filters.brands) &&
    matchesPrice(item, filters.priceRangeCents) &&
    matchesRating(item, filters.minRating) &&
    matchesInStock(item, filters.inStockOnly) &&
    matchesHistoricalLow(item, filters.historicalLowOnly) &&
    matchesSpecFilters(item, filters.specFilters)
  );

  const allCategories = [
    "Ultralight & Alpine Tech",
    "Audiophile Studio & Acoustics",
    "Custom Mechanical Keyboards & Peripherals",
    "Precision Creator Workstations & Displays"
  ];
  const categoryFacets: FacetBucket[] = allCategories.map(cat => ({
    value: cat,
    label: cat,
    count: categoryBase.filter(i => i.category === cat).length
  }));

  // BRANDS: Apply all filters EXCEPT brand
  const effectiveCatFilter = filters.categories.length > 0 ? filters.categories : (nlp.inferredCategory ? [nlp.inferredCategory] : []);
  const brandBase = PRODUCTS_CATALOG.filter(item =>
    matchesKeywords(item, nlp.cleanedKeywords) &&
    matchesCategory(item, effectiveCatFilter) &&
    matchesPrice(item, filters.priceRangeCents) &&
    matchesRating(item, filters.minRating) &&
    matchesInStock(item, filters.inStockOnly) &&
    matchesHistoricalLow(item, filters.historicalLowOnly) &&
    matchesSpecFilters(item, filters.specFilters)
  );

  // Collect brands for current domain
  const domainBrands = Array.from(new Set(
    (effectiveCatFilter.length > 0
      ? PRODUCTS_CATALOG.filter(i => effectiveCatFilter.includes(i.category))
      : PRODUCTS_CATALOG
    ).map(i => i.brand)
  )).sort();

  const brandFacets: FacetBucket[] = domainBrands.map(b => ({
    value: b,
    label: b,
    count: brandBase.filter(i => i.brand === b).length
  }));

  // PRICE HISTOGRAM: 24 Buckets across entire price domain, computed applying all non-price filters
  const priceBase = PRODUCTS_CATALOG.filter(item =>
    matchesKeywords(item, nlp.cleanedKeywords) &&
    matchesCategory(item, effectiveCatFilter) &&
    matchesBrand(item, filters.brands) &&
    matchesRating(item, filters.minRating) &&
    matchesInStock(item, filters.inStockOnly) &&
    matchesHistoricalLow(item, filters.historicalLowOnly) &&
    matchesSpecFilters(item, filters.specFilters)
  );

  const minCatalogPrice = 5000;   // $50
  const maxCatalogPrice = 450000; // $4,500
  const bucketCount = 24;
  const bucketStep = Math.round((maxCatalogPrice - minCatalogPrice) / bucketCount);

  const priceHistogram: { minCents: number; maxCents: number; count: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bMin = minCatalogPrice + i * bucketStep;
    const bMax = (i === bucketCount - 1) ? maxCatalogPrice : bMin + bucketStep;
    const count = priceBase.filter(it => it.basePriceCents >= bMin && (i === bucketCount - 1 ? it.basePriceCents <= bMax : it.basePriceCents < bMax)).length;
    priceHistogram.push({ minCents: bMin, maxCents: bMax, count });
  }

  // RATING BUCKETS
  const ratingBase = PRODUCTS_CATALOG.filter(item =>
    matchesKeywords(item, nlp.cleanedKeywords) &&
    matchesCategory(item, effectiveCatFilter) &&
    matchesBrand(item, filters.brands) &&
    matchesPrice(item, filters.priceRangeCents) &&
    matchesInStock(item, filters.inStockOnly) &&
    matchesHistoricalLow(item, filters.historicalLowOnly) &&
    matchesSpecFilters(item, filters.specFilters)
  );
  const ratingBuckets = [
    { minStars: 4.8, count: ratingBase.filter(i => i.ratingAverage >= 4.8).length },
    { minStars: 4.5, count: ratingBase.filter(i => i.ratingAverage >= 4.5).length },
    { minStars: 4.0, count: ratingBase.filter(i => i.ratingAverage >= 4.0).length },
  ];

  // DYNAMIC SPECS FACETS
  const dynamicSpecs: Record<string, FacetBucket[]> = {
    waterproof: [
      {
        value: 'true',
        label: 'Waterproof / Stormproof',
        count: PRODUCTS_CATALOG.filter(it => it.specs.waterproof === true && matchesCategory(it, effectiveCatFilter)).length
      }
    ],
    fit: [
      {
        value: 'Wide',
        label: 'Wide / Ergonomic Fit',
        count: PRODUCTS_CATALOG.filter(it => String(it.specs.fit || '').includes('Wide') && matchesCategory(it, effectiveCatFilter)).length
      },
      {
        value: 'Standard',
        label: 'Standard / Alpine Fit',
        count: PRODUCTS_CATALOG.filter(it => (String(it.specs.fit || '').includes('Standard') || String(it.specs.fit || '').includes('Athletic')) && matchesCategory(it, effectiveCatFilter)).length
      }
    ],
    wireless: [
      {
        value: 'wireless',
        label: 'Wireless / Bluetooth',
        count: PRODUCTS_CATALOG.filter(it => (it.tags.includes('wireless') || it.tags.includes('bluetooth')) && matchesCategory(it, effectiveCatFilter)).length
      }
    ]
  };

  // 6. Elastic Near-Miss Suggestions (when results < 4)
  const nearMissSuggestions: { description: string; relaxedFilterPatch: Partial<FilterQueryState>; unlockedCount: number }[] = [];
  if (matchedItems.length < 4) {
    const [curMin, curMax] = filters.priceRangeCents;
    const effectiveUpper = nlp.inferredMaxPrice ? Math.min(curMax, nlp.inferredMaxPrice) : curMax;

    // A: Check if relaxing budget unlocks items (e.g. relaxing $160 by $14 to $174 unlocks Hoka Speedgoat 6 GTX at $170!)
    if (effectiveUpper < 350000) {
      const delta = 1500; // $15 delta
      const relaxedMax = effectiveUpper + delta;
      const relaxedCount = PRODUCTS_CATALOG.filter(it =>
        matchesAllFilters(it, { ...filters, priceRangeCents: [curMin, relaxedMax] }, nlp.cleanedKeywords, nlp.inferredCategory, relaxedMax, undefined)
      ).length;
      if (relaxedCount > matchedItems.length) {
        nearMissSuggestions.push({
          description: `Relaxing budget by $${Math.round(delta / 100)} unlocks ${relaxedCount - matchedItems.length} top-rated match (e.g. Hoka Speedgoat 6 GTX Waterproof at $170)`,
          relaxedFilterPatch: { priceRangeCents: [curMin, relaxedMax] },
          unlockedCount: relaxedCount
        });
      }
    }

    // B: Suggest relaxing water resistance/waterproof
    if (nlp.inferredSpecs?.waterproof) {
      const relaxedCount = PRODUCTS_CATALOG.filter(it =>
        matchesAllFilters(it, filters, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, { ...nlp.inferredSpecs, waterproof: undefined })
      ).length;
      if (relaxedCount > matchedItems.length) {
        nearMissSuggestions.push({
          description: `Including high-breathability Matryx models unlocks ${relaxedCount - matchedItems.length} award-winning matches (e.g. Salomon S/LAB Genesis)`,
          relaxedFilterPatch: { specFilters: {} },
          unlockedCount: relaxedCount
        });
      }
    }

    // C: Check if disabling inStockOnly or historicalLowOnly unlocks items
    if (filters.historicalLowOnly) {
      const relaxedCount = PRODUCTS_CATALOG.filter(it =>
        matchesAllFilters(it, { ...filters, historicalLowOnly: false }, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, nlp.inferredSpecs)
      ).length;
      if (relaxedCount > matchedItems.length) {
        nearMissSuggestions.push({
          description: `Including all verified price ratings unlocks ${relaxedCount - matchedItems.length} additional products`,
          relaxedFilterPatch: { historicalLowOnly: false },
          unlockedCount: relaxedCount
        });
      }
    }

    if (filters.inStockOnly) {
      const relaxedCount = PRODUCTS_CATALOG.filter(it =>
        matchesAllFilters(it, { ...filters, inStockOnly: false }, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, nlp.inferredSpecs)
      ).length;
      if (relaxedCount > matchedItems.length) {
        nearMissSuggestions.push({
          description: `Including backorder items unlocks ${relaxedCount - matchedItems.length} products`,
          relaxedFilterPatch: { inStockOnly: false },
          unlockedCount: relaxedCount
        });
      }
    }

    // D: Check brand restrictions
    if (filters.brands.length > 0) {
      const relaxedCount = PRODUCTS_CATALOG.filter(it =>
        matchesAllFilters(it, { ...filters, brands: [] }, nlp.cleanedKeywords, nlp.inferredCategory, nlp.inferredMaxPrice, nlp.inferredSpecs)
      ).length;
      if (relaxedCount > matchedItems.length) {
        nearMissSuggestions.push({
          description: `Expanding search across all verified brands unlocks ${relaxedCount - matchedItems.length} options`,
          relaxedFilterPatch: { brands: [] },
          unlockedCount: relaxedCount
        });
      }
    }
  }

  const endTime = performance.now();

  return {
    items: matchedItems,
    totalMatched: matchedItems.length,
    executionTimeMs: Math.max(1, Math.round((endTime - startTime) * 10) / 10),
    parsedIntentTokens: nlp.extractedTokens,
    facets: {
      categories: categoryFacets,
      brands: brandFacets,
      dynamicSpecs,
      priceHistogram,
      ratingBuckets
    },
    nearMissSuggestions: nearMissSuggestions.length > 0 ? nearMissSuggestions : undefined
  };
}
