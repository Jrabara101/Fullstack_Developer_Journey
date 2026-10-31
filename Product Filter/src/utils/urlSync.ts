import { FilterQueryState } from '../types';

export const DEFAULT_FILTER_STATE: FilterQueryState = {
  q: '',
  categories: [],
  brands: [],
  priceRangeCents: [5000, 450000],
  minRating: 0,
  inStockOnly: false,
  historicalLowOnly: false,
  specFilters: {},
  priorityWeights: {
    performance: 50,
    portability: 50,
    durability: 50,
    value: 50,
  },
  sortBy: 'FIT_SCORE',
};

export function decodeFilterStateFromURL(searchParams: URLSearchParams): FilterQueryState {
  const q = searchParams.get('q') || '';
  const categories = searchParams.get('cat') ? searchParams.get('cat')!.split(',').filter(Boolean) : [];
  const brands = searchParams.get('brand') ? searchParams.get('brand')!.split(',').filter(Boolean) : [];
  
  const minP = searchParams.get('minP') ? parseInt(searchParams.get('minP')!) : 5000;
  const maxP = searchParams.get('maxP') ? parseInt(searchParams.get('maxP')!) : 450000;
  
  const minRating = searchParams.get('stars') ? parseFloat(searchParams.get('stars')!) : 0;
  const inStockOnly = searchParams.get('stock') === '1';
  const historicalLowOnly = searchParams.get('deals') === '1';
  
  // Weights e.g. "80,75,90,60"
  let priorityWeights = { ...DEFAULT_FILTER_STATE.priorityWeights };
  const weightsParam = searchParams.get('weights');
  if (weightsParam) {
    const parts = weightsParam.split(',').map(n => parseInt(n));
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      priorityWeights = {
        performance: parts[0],
        portability: parts[1],
        durability: parts[2],
        value: parts[3],
      };
    }
  }

  const sortBy = (searchParams.get('sort') as FilterQueryState['sortBy']) || 'FIT_SCORE';

  // Spec filters
  let specFilters: Record<string, (string | number | boolean)[]> = {};
  const specsParam = searchParams.get('specs');
  if (specsParam) {
    try {
      specFilters = JSON.parse(decodeURIComponent(specsParam));
    } catch (e) {
      // Ignore malformed spec filters
    }
  }

  return {
    q,
    categories,
    brands,
    priceRangeCents: [minP, maxP],
    minRating,
    inStockOnly,
    historicalLowOnly,
    specFilters,
    priorityWeights,
    sortBy,
  };
}

export function encodeFilterStateToParams(state: FilterQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.q) params.set('q', state.q);
  if (state.categories.length > 0) params.set('cat', state.categories.join(','));
  if (state.brands.length > 0) params.set('brand', state.brands.join(','));

  if (state.priceRangeCents[0] !== 5000) params.set('minP', state.priceRangeCents[0].toString());
  if (state.priceRangeCents[1] !== 450000) params.set('maxP', state.priceRangeCents[1].toString());

  if (state.minRating > 0) params.set('stars', state.minRating.toString());
  if (state.inStockOnly) params.set('stock', '1');
  if (state.historicalLowOnly) params.set('deals', '1');

  const { performance, portability, durability, value } = state.priorityWeights;
  if (performance !== 50 || portability !== 50 || durability !== 50 || value !== 50) {
    params.set('weights', `${performance},${portability},${durability},${value}`);
  }

  if (state.sortBy !== 'FIT_SCORE') params.set('sort', state.sortBy);

  if (Object.keys(state.specFilters).length > 0) {
    params.set('specs', encodeURIComponent(JSON.stringify(state.specFilters)));
  }

  return params;
}

export function syncURL(state: FilterQueryState): void {
  const params = encodeFilterStateToParams(state);
  const newQuery = params.toString();
  const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}
