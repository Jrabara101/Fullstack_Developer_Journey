import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { QuoteRecord, ConversionLeadPayload } from '../types/index.js';

const dataDir = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'startup.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    owner_email TEXT NOT NULL,
    plan_tier TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_tier TEXT NOT NULL,
    billing_interval TEXT NOT NULL,
    seats INTEGER NOT NULL,
    events_k INTEGER NOT NULL,
    monthly_total_cents INTEGER NOT NULL,
    annual_total_cents INTEGER NOT NULL,
    savings_monthly_cents INTEGER NOT NULL,
    savings_annual_cents INTEGER NOT NULL,
    hours_saved_monthly INTEGER NOT NULL,
    effective_monthly_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    ppp_country TEXT,
    ppp_discount_percent INTEGER NOT NULL,
    details_json TEXT,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    workspace_slug TEXT NOT NULL,
    selected_plan TEXT NOT NULL,
    billing_interval TEXT NOT NULL,
    configured_seats INTEGER NOT NULL,
    configured_events_k INTEGER NOT NULL,
    active_persona_lens TEXT NOT NULL,
    session_duration_sec INTEGER,
    visited_personas TEXT,
    sandbox_actions_count INTEGER,
    created_at TEXT NOT NULL
  );
`);

// Seed initial claimed workspaces if empty
const countStmt = db.prepare('SELECT count(*) as count FROM workspaces');
const row = countStmt.get() as { count: number };

if (row.count === 0) {
  const insertWorkspace = db.prepare(`
    INSERT INTO workspaces (id, slug, owner_email, plan_tier, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialWorkspaces = [
    { id: 'ws-1', slug: 'acme-corp', email: 'founders@acme.dev', tier: 'pro', status: 'claimed' },
    { id: 'ws-2', slug: 'vektordb', email: 'alex@vektordb.ai', tier: 'scale', status: 'claimed' },
    { id: 'ws-3', slug: 'hyperscale', email: 'sarah@hyperscale.ai', tier: 'pro', status: 'claimed' },
    { id: 'ws-4', slug: 'payflow', email: 'ops@payflow.io', tier: 'enterprise', status: 'claimed' },
    { id: 'ws-5', slug: 'fintechedge', email: 'liam@fintechedge.com', tier: 'scale', status: 'claimed' }
  ];

  const now = new Date().toISOString();
  for (const ws of initialWorkspaces) {
    insertWorkspace.run(ws.id, ws.slug, ws.email, ws.tier, ws.status, now);
  }
}

export function isSlugClaimed(slug: string): boolean {
  const stmt = db.prepare('SELECT id FROM workspaces WHERE lower(slug) = lower(?)');
  const existing = stmt.get(slug);
  return !!existing;
}

export function claimWorkspaceSlug(id: string, slug: string, email: string, planTier: string): void {
  const stmt = db.prepare(`
    INSERT INTO workspaces (id, slug, owner_email, plan_tier, status, created_at)
    VALUES (?, lower(?), ?, ?, 'claimed', ?)
  `);
  stmt.run(id, slug, email, planTier, new Date().toISOString());
}

export function saveQuote(quote: QuoteRecord, detailsJson?: any): void {
  const stmt = db.prepare(`
    INSERT INTO quotes (
      id, company_name, email, plan_tier, billing_interval,
      seats, events_k, monthly_total_cents, annual_total_cents,
      savings_monthly_cents, savings_annual_cents, hours_saved_monthly,
      effective_monthly_cents, currency, ppp_country, ppp_discount_percent,
      details_json, created_at, expires_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    quote.id,
    quote.companyName,
    quote.email,
    quote.planTier,
    quote.billingInterval,
    quote.seats,
    quote.eventsK,
    quote.monthlyTotalCents,
    quote.annualTotalCents,
    quote.savingsMonthlyCents,
    quote.savingsAnnualCents,
    quote.hoursSavedMonthly,
    quote.effectiveMonthlyCents,
    quote.currency,
    quote.pppCountry || null,
    quote.pppDiscountPercent,
    detailsJson ? JSON.stringify(detailsJson) : null,
    quote.createdAt,
    quote.expiresAt
  );
}

export function getQuoteById(id: string): QuoteRecord | null {
  const stmt = db.prepare('SELECT * FROM quotes WHERE id = ?');
  const record = stmt.get(id) as any;
  if (!record) return null;

  return {
    id: record.id,
    companyName: record.company_name,
    email: record.email,
    planTier: record.plan_tier,
    billingInterval: record.billing_interval,
    seats: record.seats,
    eventsK: record.events_k,
    monthlyTotalCents: record.monthly_total_cents,
    annualTotalCents: record.annual_total_cents,
    savingsMonthlyCents: record.savings_monthly_cents,
    savingsAnnualCents: record.savings_annual_cents,
    hoursSavedMonthly: record.hours_saved_monthly,
    effectiveMonthlyCents: record.effective_monthly_cents,
    currency: record.currency,
    pppCountry: record.ppp_country,
    pppDiscountPercent: record.ppp_discount_percent,
    createdAt: record.created_at,
    expiresAt: record.expires_at
  };
}

export function recordLeadAttribution(id: string, payload: ConversionLeadPayload): void {
  const stmt = db.prepare(`
    INSERT INTO leads (
      id, email, workspace_slug, selected_plan, billing_interval,
      configured_seats, configured_events_k, active_persona_lens,
      session_duration_sec, visited_personas, sandbox_actions_count,
      created_at
    ) VALUES (
      ?, ?, lower(?), ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?
    )
  `);

  stmt.run(
    id,
    payload.email,
    payload.workspaceSlug,
    payload.selectedPlan,
    payload.billingInterval,
    payload.configuredSeats,
    payload.configuredEventsK,
    payload.activePersonaLens,
    payload.sessionDurationSec || 0,
    payload.visitedPersonas ? JSON.stringify(payload.visitedPersonas) : null,
    payload.sandboxActionsCount || 0,
    new Date().toISOString()
  );
}
