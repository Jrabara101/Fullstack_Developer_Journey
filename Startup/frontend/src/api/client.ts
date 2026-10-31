import {
  BillingInterval,
  ConversionLeadPayload,
  PlanTierId,
  PricingCalculationResult,
  ProductFeatureBento,
  PricingTier,
  PulseMetrics,
  QuoteRecord,
  VerifiedTestimonial
} from '../types/index.js';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchFeatures(): Promise<{ features: ProductFeatureBento[] }> {
  const res = await fetch(`${API_BASE}/features`);
  if (!res.ok) throw new Error('Failed to fetch features');
  return res.json();
}

export async function fetchPricingTiers(): Promise<{ tiers: PricingTier[] }> {
  const res = await fetch(`${API_BASE}/pricing/tiers`);
  if (!res.ok) throw new Error('Failed to fetch pricing tiers');
  return res.json();
}

export async function fetchTestimonials(params?: {
  persona?: string;
  stage?: string;
  search?: string;
}): Promise<{ total: number; testimonials: VerifiedTestimonial[] }> {
  const query = new URLSearchParams();
  if (params?.persona) query.set('persona', params.persona);
  if (params?.stage) query.set('stage', params.stage);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/testimonials?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

export async function fetchPulse(): Promise<PulseMetrics> {
  const res = await fetch(`${API_BASE}/pulse`);
  if (!res.ok) throw new Error('Failed to fetch pulse metrics');
  return res.json();
}

export async function fetchFaqs(): Promise<{
  faqs: { q: string; a: string }[];
  logos: { name: string; metric: string; icon: string }[];
}> {
  const res = await fetch(`${API_BASE}/faqs`);
  if (!res.ok) throw new Error('Failed to fetch FAQs');
  return res.json();
}

export async function checkWorkspaceSlug(slug: string): Promise<{
  available: boolean;
  slug: string;
  reason?: string;
  suggestions?: string[];
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/workspaces/check-slug?slug=${encodeURIComponent(slug)}`);
  return res.json();
}

export async function calculatePricingApi(payload: {
  seats: number;
  eventsK: number;
  billingInterval: BillingInterval;
  countryCode?: string;
}): Promise<PricingCalculationResult> {
  const res = await fetch(`${API_BASE}/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to calculate pricing');
  }
  return res.json();
}

export async function generateQuoteApi(payload: {
  companyName: string;
  email: string;
  planTier: PlanTierId;
  billingInterval: BillingInterval;
  seats: number;
  eventsK: number;
  currency?: string;
  countryCode?: string;
}): Promise<{
  success: boolean;
  quoteId: string;
  quoteUrl: string;
  quote: QuoteRecord;
}> {
  const res = await fetch(`${API_BASE}/quotes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate quote');
  }
  return res.json();
}

export async function fetchQuoteById(id: string): Promise<{ quote: QuoteRecord }> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch quote');
  }
  return res.json();
}

export async function provisionWorkspaceApi(payload: ConversionLeadPayload): Promise<{
  success: boolean;
  workspaceSlug: string;
  workspaceUrl: string;
  magicLinkUrl: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/cta/provision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to provision workspace');
  }
  return res.json();
}
