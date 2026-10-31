import { BillingInterval, PlanTierId, PricingCalculationResult } from '../types/index.js';
import { PRICING_TIERS } from '../data/seedData.js';

// Emerging market countries for Purchasing Power Parity (PPP)
const PPP_DISCOUNT_RATES: Record<string, number> = {
  IN: 40, // India: 40% discount
  BR: 35, // Brazil
  NG: 40, // Nigeria
  ID: 35, // Indonesia
  VN: 35, // Vietnam
  PH: 35, // Philippines
  TR: 30, // Turkey
  PK: 40, // Pakistan
  EG: 35, // Egypt
  MX: 25, // Mexico
  CO: 30, // Colombia
  AR: 35  // Argentina
};

export function calculatePricing(
  seats: number,
  eventsK: number,
  billingInterval: BillingInterval,
  countryCode: string = 'US'
): PricingCalculationResult {
  const pppDiscount = PPP_DISCOUNT_RATES[countryCode.toUpperCase()] || 0;
  const pppMultiplier = (100 - pppDiscount) / 100;

  // Determine recommended tier based on team volume
  let recommendedTierId: PlanTierId = 'starter';
  if (seats > 50 || eventsK > 3000) {
    recommendedTierId = 'enterprise';
  } else if (seats > 15 || eventsK > 500) {
    recommendedTierId = 'scale';
  } else if (seats > 3 || eventsK > 50) {
    recommendedTierId = 'pro';
  } else {
    recommendedTierId = 'starter';
  }

  const calculatedTiers = PRICING_TIERS.map((tier) => {
    const isRecommended = tier.id === recommendedTierId;

    // Extra seat overages
    const extraSeats = Math.max(0, seats - tier.includedSeats);
    const extraSeatCostCents = Math.round(extraSeats * tier.perExtraSeatCents * pppMultiplier);

    // Extra event overages
    const extraEventsK = Math.max(0, eventsK - tier.includedEventsThousands);
    const extraEventsCostCents = Math.round(extraEventsK * tier.perExtraThousandEventsCents * pppMultiplier);

    // Base price
    const baseMonthlyCents = Math.round(tier.baseMonthlyCents * pppMultiplier);
    const baseAnnualMonthlyCents = Math.round(tier.baseAnnualMonthlyCents * pppMultiplier);

    const monthlyPriceCents = baseMonthlyCents + extraSeatCostCents + extraEventsCostCents;
    const annualPricePerMonthCents = baseAnnualMonthlyCents + extraSeatCostCents + extraEventsCostCents;
    const annualTotalBilledCents = annualPricePerMonthCents * 12;

    return {
      id: tier.id,
      name: tier.name,
      isRecommended,
      monthlyPriceCents,
      annualPricePerMonthCents,
      annualTotalBilledCents,
      extraSeatCostCents,
      extraEventsCostCents,
      features: tier.features
    };
  });

  // Calculate Competitor Status Quo & ROI
  // Legacy competitor formula:
  // - Legacy cloud seats + tooling + management: $65/seat/mo
  // - Legacy unoptimized compute & egress: $0.85 per 1k events ($85/100k events)
  // - Developer troubleshooting friction: ~4.5 hours per seat per month lost to pipeline/env failures
  // - Cost of developer hour: $110/hr
  const legacyToolingCents = seats * 6500;
  const legacyEventsCents = eventsK * 85;
  const legacyDirectCostCents = legacyToolingCents + legacyEventsCents;

  const hoursSavedMonthly = Math.round(seats * 4.5);
  const developerCapitalSavedCents = hoursSavedMonthly * 11000;

  // Selected recommended tier pricing
  const recTierObj = calculatedTiers.find((t) => t.id === recommendedTierId)!;
  const activePlatformCostCents =
    billingInterval === 'annual' ? recTierObj.annualPricePerMonthCents : recTierObj.monthlyPriceCents;

  const directMonthlySavingsCents = Math.max(0, legacyDirectCostCents - activePlatformCostCents);
  const directAnnualSavingsCents = directMonthlySavingsCents * 12;
  const totalValueAnnualCents = directAnnualSavingsCents + developerCapitalSavedCents * 12;

  return {
    recommendedTierId,
    tiers: calculatedTiers,
    roi: {
      estimatedMonthlyCloudCostCompetitorCents: legacyDirectCostCents,
      estimatedPlatformMonthlyCostCents: activePlatformCostCents,
      monthlySavingsCents: directMonthlySavingsCents,
      annualSavingsCents: directAnnualSavingsCents,
      hoursSavedMonthly,
      estimatedValueRecoveredAnnualCents: totalValueAnnualCents,
      competitorComparisonSummary: `Replacing fragmented AWS/Datadog/PagerDuty tooling saves your team ~$${Math.round(
        directMonthlySavingsCents / 100
      ).toLocaleString()}/mo in direct infrastructure and recovers ~${hoursSavedMonthly} engineering hours monthly.`
    },
    ppp: {
      applied: pppDiscount > 0,
      countryCode: countryCode.toUpperCase(),
      discountPercent: pppDiscount
    }
  };
}
