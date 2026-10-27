-- ============================================================================
-- AetherCRM / Relational Revenue Suite: Database Schema & Automations
-- PostgreSQL / Supabase Architecture
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom ENUM types
CREATE TYPE company_tier AS ENUM ('enterprise', 'mid_market', 'smb');
CREATE TYPE lifecycle_stage AS ENUM ('prospect', 'active_customer', 'churned');
CREATE TYPE deal_stage AS ENUM (
  'lead', 
  'discovery', 
  'demo', 
  'proposal', 
  'negotiation', 
  'closed_won', 
  'closed_lost'
);
CREATE TYPE forecast_category AS ENUM ('pipeline', 'best_case', 'commit', 'closed');
CREATE TYPE stakeholder_role AS ENUM (
  'champion', 
  'economic_buyer', 
  'technical_evaluator', 
  'procurement', 
  'blocker'
);
CREATE TYPE stakeholder_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE interaction_type AS ENUM (
  'email', 
  'meeting', 
  'call', 
  'note', 
  'stage_transition', 
  'system_signal'
);
CREATE TYPE interaction_direction AS ENUM ('inbound', 'outbound', 'internal');

-- ----------------------------------------------------------------------------
-- 1. COMPANIES (Accounts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  industry TEXT,
  employee_range TEXT,
  annual_revenue_cents BIGINT DEFAULT 0,
  tier company_tier DEFAULT 'smb',
  lifecycle_stage lifecycle_stage DEFAULT 'prospect',
  health_score INT DEFAULT 85 CHECK (health_score BETWEEN 0 AND 100),
  enriched_metadata JSONB DEFAULT '{}'::jsonb,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_tier ON companies(tier);

-- ----------------------------------------------------------------------------
-- 2. CONTACTS (People)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  job_title TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  location_timezone TEXT DEFAULT 'America/New_York',
  relationship_score INT DEFAULT 50 CHECK (relationship_score BETWEEN 0 AND 100),
  keep_in_touch_days INT DEFAULT 30,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_score ON contacts(relationship_score);

-- ----------------------------------------------------------------------------
-- 3. DEALS (Opportunities)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  amount_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  win_probability INT DEFAULT 50 CHECK (win_probability BETWEEN 0 AND 100),
  forecast_category forecast_category NOT NULL DEFAULT 'pipeline',
  expected_close_date DATE,
  next_step_action TEXT,
  next_step_due_date DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
  lost_reason TEXT,
  sort_order FLOAT DEFAULT 1000.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);

-- ----------------------------------------------------------------------------
-- 4. DEAL STAKEHOLDERS (Buying Committee Graph)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deal_stakeholders (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  buying_role stakeholder_role NOT NULL DEFAULT 'champion',
  sentiment stakeholder_sentiment NOT NULL DEFAULT 'positive',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (deal_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_deal_id ON deal_stakeholders(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_contact_id ON deal_stakeholders(contact_id);

-- ----------------------------------------------------------------------------
-- 5. INTERACTIONS (Omnichannel Timeline Feed)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  actor_user_id UUID,
  type interaction_type NOT NULL,
  direction interaction_direction DEFAULT 'internal',
  subject TEXT,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_company_id ON interactions(company_id);
CREATE INDEX IF NOT EXISTS idx_interactions_deal_id ON interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_interactions_occurred_at ON interactions(occurred_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TEAM CONNECTION EDGES (Warm Intro Pathfinder Graph)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_connection_edges (
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_count INT DEFAULT 1,
  strength_score NUMERIC(5,2) DEFAULT 75.00,
  last_contacted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (user_id, contact_id)
);

-- ============================================================================
-- DATABASE AUTOMATIONS & REVENUE SAFEGUARDS
-- ============================================================================

-- Function 1: Stage Transition Audit Trigger & Stage SLA Reset
CREATE OR REPLACE FUNCTION trg_deal_stage_transition_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.stage IS DISTINCT FROM NEW.stage) THEN
    -- Reset stage timestamp
    NEW.stage_entered_at := NOW();

    -- Automatically log immutable stage transition event into interactions
    INSERT INTO interactions (
      company_id,
      deal_id,
      actor_user_id,
      type,
      direction,
      subject,
      body,
      metadata,
      occurred_at
    ) VALUES (
      NEW.company_id,
      NEW.id,
      NEW.owner_id,
      'stage_transition',
      'internal',
      'Stage Transitioned: ' || UPPER(OLD.stage::TEXT) || ' -> ' || UPPER(NEW.stage::TEXT),
      'Deal moved from ' || OLD.stage::TEXT || ' to ' || NEW.stage::TEXT || 
      COALESCE(' with next action: ' || NEW.next_step_action, ''),
      jsonb_build_object(
        'from_stage', OLD.stage,
        'to_stage', NEW.stage,
        'amount_cents', NEW.amount_cents,
        'next_step_action', NEW.next_step_action,
        'next_step_due_date', NEW.next_step_due_date
      ),
      NOW()
    );
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deals_stage_audit ON deals;
CREATE TRIGGER trg_deals_stage_audit
BEFORE UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION trg_deal_stage_transition_audit();

-- Function 2: Contact Touchpoint Updater
CREATE OR REPLACE FUNCTION trg_update_contact_touchpoint()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE contacts
    SET 
      last_interaction_at = NEW.occurred_at,
      relationship_score = LEAST(100, relationship_score + 10),
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interactions_touchpoint ON interactions;
CREATE TRIGGER trg_interactions_touchpoint
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_contact_touchpoint();

-- Function 3: Relationship Decay & Rot Sentinel (Scheduled Cron Function)
CREATE OR REPLACE FUNCTION cron_recalculate_relationship_decay_and_rot()
RETURNS void AS $$
DECLARE
  v_decay_rate FLOAT := 0.035; -- decay half-life factor
BEGIN
  -- 1. Exponential relationship score decay based on days idle
  UPDATE contacts
  SET relationship_score = GREATEST(
    5,
    ROUND(100 * EXP(-v_decay_rate * EXTRACT(DAY FROM (NOW() - COALESCE(last_interaction_at, created_at)))))
  );

  -- 2. Audit team connection edges
  UPDATE team_connection_edges
  SET strength_score = GREATEST(
    10.0,
    ROUND((100 * EXP(-v_decay_rate * EXTRACT(DAY FROM (NOW() - COALESCE(last_contacted_at, NOW())))))::numeric, 2)
  );
END;
$$ LANGUAGE plpgsql;

-- Helper View: Rotting Deals Sentinel
CREATE OR REPLACE VIEW v_deal_rot_sentinel AS
SELECT 
  d.id AS deal_id,
  d.deal_code,
  d.title,
  d.stage,
  d.amount_cents,
  c.name AS company_name,
  EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) AS days_in_stage,
  CASE 
    WHEN d.stage = 'lead' AND EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) > 7 THEN true
    WHEN d.stage = 'discovery' AND EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) > 14 THEN true
    WHEN d.stage = 'demo' AND EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) > 10 THEN true
    WHEN d.stage = 'proposal' AND EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) > 10 THEN true
    WHEN d.stage = 'negotiation' AND EXTRACT(DAY FROM (NOW() - d.stage_entered_at)) > 14 THEN true
    ELSE false
  END AS is_rotting,
  (
    SELECT COUNT(*) 
    FROM deal_stakeholders ds 
    WHERE ds.deal_id = d.id
  ) AS stakeholder_count,
  EXISTS (
    SELECT 1 FROM deal_stakeholders ds
    WHERE ds.deal_id = d.id AND ds.buying_role = 'economic_buyer'
  ) AS has_economic_buyer,
  (d.next_step_action IS NULL OR d.next_step_due_date < CURRENT_DATE) AS has_stale_next_step
FROM deals d
JOIN companies c ON c.id = d.company_id
WHERE d.stage NOT IN ('closed_won', 'closed_lost');

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_connection_edges ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full collaborative workspace access
CREATE POLICY "Allow collaborative read on companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow collaborative write on companies" ON companies FOR ALL USING (true);

CREATE POLICY "Allow collaborative read on contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow collaborative write on contacts" ON contacts FOR ALL USING (true);

CREATE POLICY "Allow collaborative read on deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Allow collaborative write on deals" ON deals FOR ALL USING (true);

CREATE POLICY "Allow collaborative read on interactions" ON interactions FOR SELECT USING (true);
CREATE POLICY "Allow collaborative write on interactions" ON interactions FOR ALL USING (true);
