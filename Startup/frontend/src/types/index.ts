export type PersonaLens = 'founder' | 'engineering' | 'finance';
export type BillingInterval = 'monthly' | 'annual';
export type PlanTierId = 'starter' | 'pro' | 'scale' | 'enterprise';

export interface ProductFeatureBento {
  id: string;
  title: string;
  badgeText: string;
  personaCopy: Record<PersonaLens, { headline: string; description: string; metricCallout: string }>;
  gridSpan: 'col-span-1' | 'col-span-2';
  interactiveWidgetType: 'live-terminal' | 'latency-chart' | 'workflow-toggle' | 'security-vault';
}

export interface PricingTier {
  id: PlanTierId;
  name: string;
  tagline: string;
  baseMonthlyCents: number;
  baseAnnualMonthlyCents: number;
  includedSeats: number;
  perExtraSeatCents: number;
  includedEventsThousands: number;
  perExtraThousandEventsCents: number;
  highlighted?: boolean;
  badge?: string;
  features: { label: string; tooltip: string; includedInTier: boolean }[];
}

export interface VerifiedTestimonial {
  id: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  companyStage: 'Seed' | 'Series A' | 'Series B+' | 'Enterprise';
  avatarUrl: string;
  companyLogoUrl: string;
  personaTag: PersonaLens;
  quote: string;
  verifiedMetric: {
    label: string;
    deltaValue: string;
    timeframe: string;
  };
  blueprintUsed: string[];
}

export interface ConversionLeadPayload {
  email: string;
  workspaceSlug: string;
  selectedPlan: PlanTierId;
  billingInterval: BillingInterval;
  configuredSeats: number;
  configuredEventsK: number;
  activePersonaLens: PersonaLens;
  sessionDurationSec?: number;
  visitedPersonas?: PersonaLens[];
  sandboxActionsCount?: number;
}

export interface QuoteRecord {
  id: string;
  companyName: string;
  email: string;
  planTier: PlanTierId;
  billingInterval: BillingInterval;
  seats: number;
  eventsK: number;
  monthlyTotalCents: number;
  annualTotalCents: number;
  savingsMonthlyCents: number;
  savingsAnnualCents: number;
  hoursSavedMonthly: number;
  effectiveMonthlyCents: number;
  currency: string;
  pppCountry?: string;
  pppDiscountPercent: number;
  createdAt: string;
  expiresAt: string;
}

export interface PulseMetrics {
  timestamp: string;
  pipelinesExecutedLastHour: number;
  activeEdgeNodes: number;
  medianColdStartMs: number;
  globalUptimePercent: number;
  recentDeploysCount: number;
  activeCanaries: number;
  p99LatencyMs: number;
}

export interface CalculatedTier {
  id: PlanTierId;
  name: string;
  isRecommended: boolean;
  monthlyPriceCents: number;
  annualPricePerMonthCents: number;
  annualTotalBilledCents: number;
  extraSeatCostCents: number;
  extraEventsCostCents: number;
  features: { label: string; tooltip: string; includedInTier: boolean }[];
}

export interface PricingCalculationResult {
  recommendedTierId: PlanTierId;
  tiers: CalculatedTier[];
  roi: {
    estimatedMonthlyCloudCostCompetitorCents: number;
    estimatedPlatformMonthlyCostCents: number;
    monthlySavingsCents: number;
    annualSavingsCents: number;
    hoursSavedMonthly: number;
    estimatedValueRecoveredAnnualCents: number;
    competitorComparisonSummary: string;
  };
  ppp: {
    applied: boolean;
    countryCode: string;
    discountPercent: number;
  };
}
