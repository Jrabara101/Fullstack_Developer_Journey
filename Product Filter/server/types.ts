export type StockBadge = 'IN_STOCK' | 'LOW_STOCK' | 'BACKORDER' | 'OUT_OF_STOCK';
export type DealVerdict = 'HISTORICAL_LOW' | 'GREAT_VALUE' | 'TYPICAL_PRICE' | 'INFLATED_MSRP';

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  sizeOrCapacity: string;
  priceCents: number;
  compareAtPriceCents?: number;
  stockCount: number;
  status: StockBadge;
  imageUrl: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  basePriceCents: number;
  historicalLowCents: number;
  dealVerdict: DealVerdict;
  ratingAverage: number;
  reviewCount: number;
  fitMatchPercent?: number;
  specs: Record<string, string | number | boolean>;
  normalizedScores: {
    performance: number; // 0 - 100
    portability: number;
    durability: number;
    efficiency: number;
    value: number;
  };
  variants: ProductVariant[];
  priceHistory30d: { date: string; priceCents: number }[];
  tags: string[];
  studioAngles?: string[];
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
  isExcluded?: boolean;
}

export interface SearchResponsePayload {
  items: ProductItem[];
  totalMatched: number;
  executionTimeMs: number;
  parsedIntentTokens?: { field: string; operator: string; value: string | number; displayLabel: string }[];
  facets: {
    categories: FacetBucket[];
    brands: FacetBucket[];
    dynamicSpecs: Record<string, FacetBucket[]>;
    priceHistogram: { minCents: number; maxCents: number; count: number }[];
    ratingBuckets: { minStars: number; count: number }[];
  };
  nearMissSuggestions?: {
    description: string;
    relaxedFilterPatch: Partial<FilterQueryState>;
    unlockedCount: number;
  }[];
}

export interface PriorityWeights {
  performance: number;
  portability: number;
  durability: number;
  value: number;
}

export interface FilterQueryState {
  q: string;
  categories: string[];
  brands: string[];
  priceRangeCents: [number, number];
  minRating: number;
  inStockOnly: boolean;
  historicalLowOnly: boolean;
  specFilters: Record<string, (string | number | boolean)[]>;
  priorityWeights: PriorityWeights;
  sortBy: 'FIT_SCORE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC' | 'BEST_DEAL';
}

export interface TelemetryPayload {
  productId: string;
  title: string;
  historicalLowCents: number;
  allTimeHighCents: number;
  average90dCents: number;
  dealVerdict: DealVerdict;
  warehouseStockVelocity: {
    totalStock: number;
    status: StockBadge;
    unitsSoldLast7d: number;
    restockLeadDays: number;
    reservedCount: number;
  };
  priceHistory90d: { date: string; priceCents: number; msrpCents: number }[];
}

export interface ShortlistSnapshot {
  code: string;
  createdAt: string;
  filterState: FilterQueryState;
  comparisonItemIds: string[];
}
