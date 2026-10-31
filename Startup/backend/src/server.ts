import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  BENTO_FEATURES,
  PRICING_TIERS,
  VERIFIED_TESTIMONIALS,
  FREQUENTLY_ASKED_QUESTIONS,
  RESERVED_SLUGS,
  TRUST_LOGOS
} from './data/seedData.js';
import {
  claimWorkspaceSlug,
  getQuoteById,
  isSlugClaimed,
  recordLeadAttribution,
  saveQuote
} from './db/database.js';
import { calculatePricing } from './services/pricingService.js';
import { BillingInterval, PlanTierId, QuoteRecord, ConversionLeadPayload } from './types/index.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '2.4.0',
    service: 'startup-conversion-backend',
    timestamp: new Date().toISOString()
  });
});

// Seed data: Features
app.get('/api/features', (req: Request, res: Response) => {
  res.json({ features: BENTO_FEATURES });
});

// Seed data: Pricing Tiers
app.get('/api/pricing/tiers', (req: Request, res: Response) => {
  res.json({ tiers: PRICING_TIERS });
});

// Seed data: Testimonials (Filterable)
app.get('/api/testimonials', (req: Request, res: Response) => {
  const { persona, stage, search } = req.query;

  let results = [...VERIFIED_TESTIMONIALS];

  if (persona && typeof persona === 'string' && persona !== 'all') {
    results = results.filter((t) => t.personaTag === persona);
  }

  if (stage && typeof stage === 'string' && stage !== 'all') {
    results = results.filter((t) => t.companyStage.toLowerCase() === stage.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.authorName.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q) ||
        t.verifiedMetric.label.toLowerCase().includes(q) ||
        t.blueprintUsed.some((b) => b.toLowerCase().includes(q))
    );
  }

  res.json({
    total: results.length,
    testimonials: results
  });
});

// Seed data: FAQs & Logos
app.get('/api/faqs', (req: Request, res: Response) => {
  res.json({ faqs: FREQUENTLY_ASKED_QUESTIONS, logos: TRUST_LOGOS });
});

// Live Pulse Telemetry (Sub-50ms lightweight endpoint with organic micro-jitter)
app.get('/api/pulse', (req: Request, res: Response) => {
  const basePipelines = 1420;
  const minuteVariation = Math.floor((Date.now() / 60000) % 60);
  const pipelinesExecuted = basePipelines + minuteVariation * 3 + Math.floor(Math.random() * 8);

  res.json({
    timestamp: new Date().toISOString(),
    pipelinesExecutedLastHour: pipelinesExecuted,
    activeEdgeNodes: 312,
    medianColdStartMs: 11.4,
    globalUptimePercent: 99.994,
    recentDeploysCount: 42 + (minuteVariation % 15),
    activeCanaries: 18,
    p99LatencyMs: 14.2
  });
});

// Pricing & ROI Calculator
const pricingQuerySchema = z.object({
  seats: z.coerce.number().min(1).default(10),
  eventsK: z.coerce.number().min(10).default(250),
  billingInterval: z.enum(['monthly', 'annual']).default('annual'),
  countryCode: z.string().optional().default('US')
});

app.post('/api/pricing/calculate', (req: Request, res: Response) => {
  try {
    const { seats, eventsK, billingInterval, countryCode } = pricingQuerySchema.parse(req.body);
    const result = calculatePricing(seats, eventsK, billingInterval as BillingInterval, countryCode);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid calculation payload' });
  }
});

// Quote Generation & Export
const generateQuoteSchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  planTier: z.enum(['starter', 'pro', 'scale', 'enterprise']),
  billingInterval: z.enum(['monthly', 'annual']),
  seats: z.number().min(1),
  eventsK: z.number().min(10),
  currency: z.string().default('USD'),
  countryCode: z.string().optional().default('US')
});

app.post('/api/quotes/generate', (req: Request, res: Response) => {
  try {
    const data = generateQuoteSchema.parse(req.body);
    const quoteId = `quote-${uuidv4().slice(0, 8)}`;

    const pricing = calculatePricing(data.seats, data.eventsK, data.billingInterval, data.countryCode);
    const tierData = pricing.tiers.find((t) => t.id === data.planTier) || pricing.tiers[0];

    const monthlyTotalCents = tierData.monthlyPriceCents;
    const annualTotalCents = tierData.annualTotalBilledCents;
    const effectiveMonthlyCents =
      data.billingInterval === 'annual' ? tierData.annualPricePerMonthCents : tierData.monthlyPriceCents;

    const savingsMonthlyCents = pricing.roi.monthlySavingsCents;
    const savingsAnnualCents = pricing.roi.annualSavingsCents;
    const hoursSavedMonthly = pricing.roi.hoursSavedMonthly;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const quoteRecord: QuoteRecord = {
      id: quoteId,
      companyName: data.companyName,
      email: data.email,
      planTier: data.planTier as PlanTierId,
      billingInterval: data.billingInterval as BillingInterval,
      seats: data.seats,
      eventsK: data.eventsK,
      monthlyTotalCents,
      annualTotalCents,
      savingsMonthlyCents,
      savingsAnnualCents,
      hoursSavedMonthly,
      effectiveMonthlyCents,
      currency: data.currency,
      pppCountry: data.countryCode,
      pppDiscountPercent: pricing.ppp.discountPercent,
      createdAt: now.toISOString(),
      expiresAt
    };

    saveQuote(quoteRecord, {
      pricingTiers: pricing.tiers,
      roi: pricing.roi,
      features: tierData.features
    });

    res.status(201).json({
      success: true,
      quoteId,
      quoteUrl: `/quote/${quoteId}`,
      quote: quoteRecord
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid quote generation payload' });
  }
});

// Retrieve Quote by ID
app.get('/api/quotes/:id', (req: Request, res: Response) => {
  const quoteId = String(req.params.id);
  const quote = getQuoteById(quoteId);
  if (!quote) {
    res.status(404).json({ error: 'Quote not found or expired' });
    return;
  }
  res.json({ quote });
});

// Debounced Real-time Workspace Handle / Slug Validation
app.get('/api/workspaces/check-slug', (req: Request, res: Response) => {
  const rawSlug = req.query.slug;
  if (!rawSlug || typeof rawSlug !== 'string') {
    res.status(400).json({ available: false, reason: 'Slug parameter is required' });
    return;
  }

  const slug = rawSlug.trim().toLowerCase();

  // Slug regex format: letters, numbers, single hyphens, 3 to 30 characters
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;

  if (slug.length < 3) {
    res.json({
      available: false,
      slug,
      reason: 'Handle must be at least 3 characters long'
    });
    return;
  }

  if (slug.length > 30) {
    res.json({
      available: false,
      slug,
      reason: 'Handle must not exceed 30 characters'
    });
    return;
  }

  if (!slugRegex.test(slug)) {
    res.json({
      available: false,
      slug,
      reason: 'Use lowercase alphanumeric characters and single hyphens only'
    });
    return;
  }

  // Check reserved keywords
  if (RESERVED_SLUGS.has(slug)) {
    res.json({
      available: false,
      slug,
      reason: `"${slug}" is a reserved system handle`,
      suggestions: [`${slug}-app`, `${slug}-hq`, `${slug}-team`, `my-${slug}`]
    });
    return;
  }

  // Check SQLite database
  if (isSlugClaimed(slug)) {
    res.json({
      available: false,
      slug,
      reason: `"${slug}" has already been claimed by another team`,
      suggestions: [`${slug}-dev`, `${slug}-io`, `${slug}-hq`, `get-${slug}`]
    });
    return;
  }

  // Handle is available!
  res.json({
    available: true,
    slug,
    message: `✓ Available! Ready to provision at app.acme.dev/${slug}`
  });
});

// Workspace Provisioning & Lead Attribution Pipeline
const provisionSchema = z.object({
  email: z.string().email(),
  workspaceSlug: z.string().min(3).max(30),
  selectedPlan: z.enum(['starter', 'pro', 'scale', 'enterprise']),
  billingInterval: z.enum(['monthly', 'annual']),
  configuredSeats: z.number().min(1),
  configuredEventsK: z.number().min(10),
  activePersonaLens: z.enum(['founder', 'engineering', 'finance']),
  sessionDurationSec: z.number().optional().default(45),
  visitedPersonas: z.array(z.enum(['founder', 'engineering', 'finance'])).optional(),
  sandboxActionsCount: z.number().optional().default(3)
});

app.post('/api/cta/provision', (req: Request, res: Response) => {
  try {
    const payload = provisionSchema.parse(req.body);
    const slug = payload.workspaceSlug.toLowerCase();

    // Check availability one more time
    if (isSlugClaimed(slug) || RESERVED_SLUGS.has(slug)) {
      res.status(409).json({
        success: false,
        error: `Handle "${slug}" was claimed in the last seconds. Please pick another handle.`
      });
      return;
    }

    const leadId = `lead-${uuidv4().slice(0, 8)}`;
    const workspaceId = `ws-${uuidv4().slice(0, 8)}`;

    // Claim slug in database
    claimWorkspaceSlug(workspaceId, slug, payload.email, payload.selectedPlan);

    // Save full telemetry attribution
    recordLeadAttribution(leadId, payload);

    const magicToken = uuidv4();
    const magicLinkUrl = `https://app.acme.dev/auth/verify?token=${magicToken}&workspace=${slug}&email=${encodeURIComponent(
      payload.email
    )}`;

    res.status(201).json({
      success: true,
      workspaceSlug: slug,
      workspaceUrl: `https://${slug}.launch.dev`,
      magicLinkUrl,
      message: `🎉 Workspace claimed! Magic link generated for ${payload.email}. Provisioning completed in 2.8s.`
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid provisioning payload' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Startup Conversion Engine Backend listening on http://localhost:${PORT}`);
  console.log(`📡 Endpoints available: /api/health, /api/pricing/calculate, /api/quotes/generate, /api/workspaces/check-slug, /api/cta/provision, /api/pulse`);
});
