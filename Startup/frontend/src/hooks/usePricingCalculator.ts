import { useQuery } from '@tanstack/react-query';
import { useMarketingStore } from '../store/marketingStore.js';
import { calculatePricingApi } from '../api/client.js';
import { PlanTierId, PricingCalculationResult } from '../types/index.js';

// Fast client-side fallback calculation for 0-latency 60fps slider drag response
const CLIENT_TIER_CONFIGS = [
  {
    id: 'starter' as PlanTierId,
    name: 'Developer',
    baseMonthlyCents: 2900,
    baseAnnualMonthlyCents: 2400,
    includedSeats: 3,
    perExtraSeatCents: 1200,
    includedEventsThousands: 50,
    perExtraThousandEventsCents: 25
  },
  {
    id: 'pro' as PlanTierId,
    name: 'Growth',
    baseMonthlyCents: 9900,
    baseAnnualMonthlyCents: 7900,
    includedSeats: 10,
    perExtraSeatCents: 1500,
    includedEventsThousands: 250,
    perExtraThousandEventsCents: 20
  },
  {
    id: 'scale' as PlanTierId,
    name: 'Scale',
    baseMonthlyCents: 29900,
    baseAnnualMonthlyCents: 23900,
    includedSeats: 25,
    perExtraSeatCents: 1800,
    includedEventsThousands: 1000,
    perExtraThousandEventsCents: 15
  },
  {
    id: 'enterprise' as PlanTierId,
    name: 'Enterprise',
    baseMonthlyCents: 89900,
    baseAnnualMonthlyCents: 71900,
    includedSeats: 100,
    perExtraSeatCents: 2000,
    includedEventsThousands: 10000,
    perExtraThousandEventsCents: 10
  }
];

export function usePricingCalculator() {
  const { seats, eventsK, billingInterval, selectedPlan, setSelectedPlan } = useMarketingStore();

  // Instant local computation for sub-millisecond slider updates
  const localRecommendedTierId: PlanTierId =
    seats > 50 || eventsK > 3000
      ? 'enterprise'
      : seats > 15 || eventsK > 500
      ? 'scale'
      : seats > 3 || eventsK > 50
      ? 'pro'
      : 'starter';

  const localTiers = CLIENT_TIER_CONFIGS.map((tier) => {
    const isRecommended = tier.id === localRecommendedTierId;
    const extraSeats = Math.max(0, seats - tier.includedSeats);
    const extraSeatCostCents = extraSeats * tier.perExtraSeatCents;

    const extraEventsK = Math.max(0, eventsK - tier.includedEventsThousands);
    const extraEventsCostCents = extraEventsK * tier.perExtraThousandEventsCents;

    const monthlyPriceCents = tier.baseMonthlyCents + extraSeatCostCents + extraEventsCostCents;
    const annualPricePerMonthCents = tier.baseAnnualMonthlyCents + extraSeatCostCents + extraEventsCostCents;
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
      features: []
    };
  });

  const legacyDirectCostCents = seats * 6500 + eventsK * 85;
  const hoursSavedMonthly = Math.round(seats * 4.5);
  const developerCapitalSavedCents = hoursSavedMonthly * 11000;

  const recTierObj = localTiers.find((t) => t.id === localRecommendedTierId) || localTiers[1];
  const activeCostCents =
    billingInterval === 'annual' ? recTierObj.annualPricePerMonthCents : recTierObj.monthlyPriceCents;

  const directMonthlySavingsCents = Math.max(0, legacyDirectCostCents - activeCostCents);
  const directAnnualSavingsCents = directMonthlySavingsCents * 12;
  const totalValueAnnualCents = directAnnualSavingsCents + developerCapitalSavedCents * 12;

  const fallbackResult: PricingCalculationResult = {
    recommendedTierId: localRecommendedTierId,
    tiers: localTiers,
    roi: {
      estimatedMonthlyCloudCostCompetitorCents: legacyDirectCostCents,
      estimatedPlatformMonthlyCostCents: activeCostCents,
      monthlySavingsCents: directMonthlySavingsCents,
      annualSavingsCents: directAnnualSavingsCents,
      hoursSavedMonthly,
      estimatedValueRecoveredAnnualCents: totalValueAnnualCents,
      competitorComparisonSummary: `Consolidating AWS, Datadog, and brittle scripts saves ~$${Math.round(
        directMonthlySavingsCents / 100
      ).toLocaleString()}/mo in direct infrastructure while freeing ~${hoursSavedMonthly} engineering hours every month.`
    },
    ppp: {
      applied: false,
      countryCode: 'US',
      discountPercent: 0
    }
  };

  // TanStack Query for authoritative backend pricing sync (including PPP discounts & persistent validation)
  const query = useQuery({
    queryKey: ['pricing-calculate', seats, eventsK, billingInterval],
    queryFn: () => calculatePricingApi({ seats, eventsK, billingInterval }),
    placeholderData: fallbackResult,
    staleTime: 5000
  });

  const calculation = query.data || fallbackResult;

  const formatCents = (cents: number) => {
    return `$${Math.round(cents / 100).toLocaleString()}`;
  };

  return {
    seats,
    eventsK,
    billingInterval,
    calculation,
    recommendedTierId: calculation.recommendedTierId,
    selectedPlan,
    setSelectedPlan,
    formatCents,
    isLoading: query.isFetching,
    directMonthlySavings: formatCents(calculation.roi.monthlySavingsCents),
    directAnnualSavings: formatCents(calculation.roi.annualSavingsCents),
    hoursSavedMonthly: calculation.roi.hoursSavedMonthly,
    totalAnnualValue: formatCents(calculation.roi.estimatedValueRecoveredAnnualCents)
  };
}
