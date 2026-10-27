// ============================================================================
// AetherCRM Initial Seed Data
// Rich B2B SaaS Accounts, Contacts, Deals, Buying Committee & Interactions
// ============================================================================

export const INITIAL_COMPANIES = [
  {
    id: 'comp-1',
    name: 'Stripe',
    domain: 'stripe.com',
    logo_url: 'https://logo.clearbit.com/stripe.com',
    favicon: '💳',
    industry: 'FinTech • Payments Infrastructure',
    employee_range: '7,000+ employees',
    annual_revenue_cents: 1400000000000, // $14B
    tier: 'enterprise',
    lifecycle_stage: 'active_customer',
    health_score: 94,
    owner_name: 'Alex Rivera',
    owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Series I ($6.5B raised)',
      headquarters: 'San Francisco, CA & Dublin, Ireland',
      timezone: 'America/Los_Angeles',
      tech_stack: ['React', 'Ruby', 'AWS', 'Snowflake', 'Kafka', 'Kubernetes'],
      social: {
        twitter: '@stripe',
        linkedin: 'linkedin.com/company/stripe'
      }
    }
  },
  {
    id: 'comp-2',
    name: 'Vercel',
    domain: 'vercel.com',
    logo_url: 'https://logo.clearbit.com/vercel.com',
    favicon: '▲',
    industry: 'Cloud Infrastructure • Developer Platforms',
    employee_range: '500 - 1,000 employees',
    annual_revenue_cents: 12000000000, // $120M
    tier: 'enterprise',
    lifecycle_stage: 'prospect',
    health_score: 82,
    owner_name: 'Alex Rivera',
    owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Series E ($250M at $3.25B val)',
      headquarters: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      tech_stack: ['Next.js', 'Turborepo', 'AWS Lambda', 'Edge Middleware', 'Tailwind CSS'],
      social: {
        twitter: '@vercel',
        linkedin: 'linkedin.com/company/vercel'
      }
    }
  },
  {
    id: 'comp-3',
    name: 'Linear',
    domain: 'linear.app',
    logo_url: 'https://logo.clearbit.com/linear.app',
    favicon: '⚡',
    industry: 'Productivity • Issue Tracking & Roadmaps',
    employee_range: '50 - 100 employees',
    annual_revenue_cents: 3500000000, // $35M
    tier: 'mid_market',
    lifecycle_stage: 'prospect',
    health_score: 89,
    owner_name: 'Elena Rostova',
    owner_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Series B ($35M led by Accel)',
      headquarters: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      tech_stack: ['React', 'TypeScript', 'GraphQL', 'SQLite', 'WebSockets'],
      social: {
        twitter: '@linear',
        linkedin: 'linkedin.com/company/linear-app'
      }
    }
  },
  {
    id: 'comp-4',
    name: 'Snowflake',
    domain: 'snowflake.com',
    logo_url: 'https://logo.clearbit.com/snowflake.com',
    favicon: '❄️',
    industry: 'Data Cloud & Analytics',
    employee_range: '6,500+ employees',
    annual_revenue_cents: 280000000000, // $2.8B
    tier: 'enterprise',
    lifecycle_stage: 'prospect',
    health_score: 68,
    owner_name: 'Marcus Vance',
    owner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Public (NYSE: SNOW)',
      headquarters: 'Bozeman, MT',
      timezone: 'America/Denver',
      tech_stack: ['Java', 'C++', 'AWS', 'Azure', 'GCP', 'Iceberg'],
      social: {
        twitter: '@SnowflakeDB',
        linkedin: 'linkedin.com/company/snowflake-computing'
      }
    }
  },
  {
    id: 'comp-5',
    name: 'Retool',
    domain: 'retool.com',
    logo_url: 'https://logo.clearbit.com/retool.com',
    favicon: '🛠️',
    industry: 'Developer Tools • Internal App Platform',
    employee_range: '300 - 500 employees',
    annual_revenue_cents: 8500000000, // $85M
    tier: 'mid_market',
    lifecycle_stage: 'active_customer',
    health_score: 91,
    owner_name: 'Sarah Jenkins',
    owner_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Series C ($45M at $3.2B val)',
      headquarters: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Temporal'],
      social: {
        twitter: '@retool',
        linkedin: 'linkedin.com/company/retool-inc'
      }
    }
  },
  {
    id: 'comp-6',
    name: 'Figma',
    domain: 'figma.com',
    logo_url: 'https://logo.clearbit.com/figma.com',
    favicon: '🎨',
    industry: 'Design & Collaboration Software',
    employee_range: '1,500+ employees',
    annual_revenue_cents: 60000000000, // $600M
    tier: 'enterprise',
    lifecycle_stage: 'active_customer',
    health_score: 96,
    owner_name: 'Alex Rivera',
    owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Private ($20B tender valuation)',
      headquarters: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      tech_stack: ['WebAssembly', 'C++', 'WebGL', 'TypeScript', 'Rust'],
      social: {
        twitter: '@figma',
        linkedin: 'linkedin.com/company/figma'
      }
    }
  },
  {
    id: 'comp-7',
    name: 'Supabase',
    domain: 'supabase.com',
    logo_url: 'https://logo.clearbit.com/supabase.com',
    favicon: '⚡',
    industry: 'Database & Open Source Backend',
    employee_range: '100 - 250 employees',
    annual_revenue_cents: 2500000000, // $25M
    tier: 'mid_market',
    lifecycle_stage: 'prospect',
    health_score: 87,
    owner_name: 'Elena Rostova',
    owner_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    enriched_metadata: {
      funding_round: 'Series B ($80M led by Felicis)',
      headquarters: 'Singapore & Remote',
      timezone: 'Asia/Singapore',
      tech_stack: ['PostgreSQL', 'Elixir', 'Go', 'Deno', 'Docker'],
      social: {
        twitter: '@supabase',
        linkedin: 'linkedin.com/company/supabase'
      }
    }
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'cont-1',
    company_id: 'comp-1',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@stripe.com',
    phone: '+1 (415) 890-3321',
    job_title: 'VP of Platform Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/elenarostova-tech',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 92, // 🔥 Strong
    keep_in_touch_days: 21,
    last_interaction_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
  },
  {
    id: 'cont-2',
    company_id: 'comp-1',
    first_name: 'David',
    last_name: 'Chen',
    email: 'david.chen@stripe.com',
    phone: '+1 (415) 890-4412',
    job_title: 'Chief Financial Officer (CFO)',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/davidchen-cfo',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 65, // 🌤 Warm
    keep_in_touch_days: 30,
    last_interaction_at: new Date(Date.now() - 6 * 86400 * 1000).toISOString(), // 6d ago
  },
  {
    id: 'cont-3',
    company_id: 'comp-1',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@stripe.com',
    phone: '+1 (415) 890-7789',
    job_title: 'Head of InfoSec & Compliance',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/marcusvance-infosec',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 84, // 🔥 Strong
    keep_in_touch_days: 14,
    last_interaction_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-4',
    company_id: 'comp-2',
    first_name: 'Guillermo',
    last_name: 'Rauch',
    email: 'guillermo@vercel.com',
    phone: '+1 (415) 555-0199',
    job_title: 'Chief Executive Officer',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/rauchg',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 74, // 🌤 Warm
    keep_in_touch_days: 30,
    last_interaction_at: new Date(Date.now() - 11 * 86400 * 1000).toISOString(), // 11d ago
  },
  {
    id: 'cont-5',
    company_id: 'comp-2',
    first_name: 'Malte',
    last_name: 'Ubl',
    email: 'malte@vercel.com',
    phone: '+1 (415) 555-0182',
    job_title: 'Chief Technology Officer',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/cramforce',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 68,
    keep_in_touch_days: 30,
    last_interaction_at: new Date(Date.now() - 12 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-6',
    company_id: 'comp-3',
    first_name: 'Karri',
    last_name: 'Saarinen',
    email: 'karri@linear.app',
    phone: '+1 (415) 761-9011',
    job_title: 'CEO & Co-founder',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/karrisaarinen',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 79,
    keep_in_touch_days: 21,
    last_interaction_at: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-7',
    company_id: 'comp-4',
    first_name: 'Christian',
    last_name: 'Kleinerman',
    email: 'christian.k@snowflake.com',
    phone: '+1 (406) 555-8832',
    job_title: 'EVP of Product Management',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/christiankleinerman',
    location_timezone: 'America/Denver',
    relationship_score: 42, // ❄️ Cooling
    keep_in_touch_days: 14,
    last_interaction_at: new Date(Date.now() - 16 * 86400 * 1000).toISOString(), // 16d ago - ROTTING
  },
  {
    id: 'cont-8',
    company_id: 'comp-5',
    first_name: 'David',
    last_name: 'Hsu',
    email: 'david@retool.com',
    phone: '+1 (415) 321-7890',
    job_title: 'CEO & Founder',
    avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/david-hsu-retool',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 88,
    keep_in_touch_days: 30,
    last_interaction_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-9',
    company_id: 'comp-6',
    first_name: 'Dylan',
    last_name: 'Field',
    email: 'dylan@figma.com',
    phone: '+1 (415) 902-1234',
    job_title: 'CEO & Co-founder',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/dylanfield',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 95,
    keep_in_touch_days: 14,
    last_interaction_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-10',
    company_id: 'comp-7',
    first_name: 'Ant',
    last_name: 'Wilson',
    email: 'ant@supabase.com',
    phone: '+65 6789 0123',
    job_title: 'CTO & Co-founder',
    avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/antwilson',
    location_timezone: 'Asia/Singapore',
    relationship_score: 72,
    keep_in_touch_days: 28,
    last_interaction_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
  {
    id: 'cont-11',
    company_id: 'comp-2',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@openai.com', // Job change radar target!
    phone: '+1 (415) 782-9901',
    job_title: 'VP of Product (formerly Head of Developer Growth at Vercel)',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
    linkedin_url: 'https://linkedin.com/in/sarahjenkins-product',
    location_timezone: 'America/Los_Angeles',
    relationship_score: 36, // ❄️ Cooling!
    keep_in_touch_days: 30,
    last_interaction_at: new Date(Date.now() - 34 * 86400 * 1000).toISOString(), // 34d ago
  }
];

export const INITIAL_DEALS = [
  {
    id: 'deal-1',
    deal_code: 'DEAL-409',
    title: 'Stripe — Global Core Platform License',
    company_id: 'comp-1',
    owner_id: 'usr-1',
    owner_name: 'Alex Rivera',
    stage: 'negotiation', // late stage multi-threaded
    amount_cents: 14500000, // $145,000 ARR
    currency: 'USD',
    win_probability: 85,
    forecast_category: 'commit',
    expected_close_date: '2026-11-15',
    next_step_action: 'Send revised MSA redlines to Legal & sync with David Chen',
    next_step_due_date: '2026-10-27',
    stage_entered_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(), // 5d ago (Healthy)
    lost_reason: null,
    sort_order: 1000.0,
    stakeholder_ids: ['cont-1', 'cont-2', 'cont-3'],
  },
  {
    id: 'deal-2',
    deal_code: 'DEAL-382',
    title: 'Vercel — Enterprise Seat Expansion Q4',
    company_id: 'comp-2',
    owner_id: 'usr-1',
    owner_name: 'Alex Rivera',
    stage: 'proposal',
    amount_cents: 6800000, // $68,000 ARR
    currency: 'USD',
    win_probability: 60,
    forecast_category: 'best_case',
    expected_close_date: '2026-11-30',
    next_step_action: 'Follow up on pricing tier breakdown with @malte',
    next_step_due_date: '2026-10-26',
    stage_entered_at: new Date(Date.now() - 13 * 86400 * 1000).toISOString(), // 13d ago (ROTTING > 10d!)
    lost_reason: null,
    sort_order: 1100.0,
    stakeholder_ids: ['cont-4', 'cont-5'],
  },
  {
    id: 'deal-3',
    deal_code: 'DEAL-290',
    title: 'Snowflake — Analytics Telemetry Pipeline Integration',
    company_id: 'comp-4',
    owner_id: 'usr-3',
    owner_name: 'Marcus Vance',
    stage: 'negotiation',
    amount_cents: 8500000, // $85,000 ARR
    currency: 'USD',
    win_probability: 70,
    forecast_category: 'pipeline',
    expected_close_date: '2026-12-10',
    next_step_action: null, // NO NEXT STEP SET -> SINGLE THREADED WARNING & ROT RISK!
    next_step_due_date: null,
    stage_entered_at: new Date(Date.now() - 18 * 86400 * 1000).toISOString(), // 18d ago (CRITICAL ROT!)
    lost_reason: null,
    sort_order: 1200.0,
    stakeholder_ids: ['cont-7'], // ONLY 1 CONTACT -> SINGLE THREADED RISK!
  },
  {
    id: 'deal-4',
    deal_code: 'DEAL-445',
    title: 'Linear — Team Workspace & API Sync Tier',
    company_id: 'comp-3',
    owner_id: 'usr-2',
    owner_name: 'Elena Rostova',
    stage: 'demo',
    amount_cents: 4200000, // $42,000 ARR
    currency: 'USD',
    win_probability: 50,
    forecast_category: 'pipeline',
    expected_close_date: '2026-12-20',
    next_step_action: 'Demonstrate bi-directional webhook latency & rate limiting',
    next_step_due_date: '2026-10-29',
    stage_entered_at: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    lost_reason: null,
    sort_order: 1300.0,
    stakeholder_ids: ['cont-6'],
  },
  {
    id: 'deal-5',
    deal_code: 'DEAL-198',
    title: 'Figma — Enterprise Security & SSO Migration',
    company_id: 'comp-6',
    owner_id: 'usr-1',
    owner_name: 'Alex Rivera',
    stage: 'closed_won',
    amount_cents: 22000000, // $220,000 ARR
    currency: 'USD',
    win_probability: 100,
    forecast_category: 'closed',
    expected_close_date: '2026-10-14',
    next_step_action: 'Execute CSM onboarding handoff session w/ SecOps team',
    next_step_due_date: '2026-10-28',
    stage_entered_at: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    lost_reason: null,
    sort_order: 1400.0,
    stakeholder_ids: ['cont-9'],
  },
  {
    id: 'deal-6',
    deal_code: 'DEAL-312',
    title: 'Retool — Multi-Region Database Replica Cluster',
    company_id: 'comp-5',
    owner_id: 'usr-4',
    owner_name: 'Sarah Jenkins',
    stage: 'closed_won',
    amount_cents: 18000000, // $180,000 ARR
    currency: 'USD',
    win_probability: 100,
    forecast_category: 'closed',
    expected_close_date: '2026-10-02',
    next_step_action: 'Quarterly business review scheduling',
    next_step_due_date: '2026-11-12',
    stage_entered_at: new Date(Date.now() - 22 * 86400 * 1000).toISOString(),
    lost_reason: null,
    sort_order: 1500.0,
    stakeholder_ids: ['cont-8'],
  },
  {
    id: 'deal-7',
    deal_code: 'DEAL-504',
    title: 'Supabase — Distributed Edge Storage Connector',
    company_id: 'comp-7',
    owner_id: 'usr-2',
    owner_name: 'Elena Rostova',
    stage: 'discovery',
    amount_cents: 5400000, // $54,000 ARR
    currency: 'USD',
    win_probability: 40,
    forecast_category: 'pipeline',
    expected_close_date: '2026-12-31',
    next_step_action: 'Initial discovery call with Ant Wilson & infrastructure leads',
    next_step_due_date: '2026-10-30',
    stage_entered_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    lost_reason: null,
    sort_order: 1600.0,
    stakeholder_ids: ['cont-10'],
  }
];

export const INITIAL_STAKEHOLDERS = [
  {
    deal_id: 'deal-1',
    contact_id: 'cont-1',
    buying_role: 'champion', // 🏆 Champion
    sentiment: 'positive',   // 🟢 Advocate
    notes: 'Strong executive sponsor. Spearheaded initial internal pilot across 4 pods.',
    last_touch: '2h ago'
  },
  {
    deal_id: 'deal-1',
    contact_id: 'cont-2',
    buying_role: 'economic_buyer', // 💼 Economic Buyer
    sentiment: 'neutral',          // 🟡 Neutral
    notes: 'Requested 15% discount for 2-year prepaid commit. Awaiting final pricing model.',
    last_touch: '6d ago',
    alert: '⚠️ Has not attended live architecture demo'
  },
  {
    deal_id: 'deal-1',
    contact_id: 'cont-3',
    buying_role: 'technical_evaluator', // 🛡 Technical Gatekeeper
    sentiment: 'positive',               // 🟢 Advocate
    notes: 'Completed SOC-2 Type II audit review. Signed off on data residency safeguards.',
    last_touch: '1d ago'
  },
  {
    deal_id: 'deal-2',
    contact_id: 'cont-4',
    buying_role: 'economic_buyer',
    sentiment: 'positive',
    notes: 'Interested in reducing edge cold-start compute costs.',
    last_touch: '11d ago'
  },
  {
    deal_id: 'deal-2',
    contact_id: 'cont-5',
    buying_role: 'technical_evaluator',
    sentiment: 'neutral',
    notes: 'Evaluating latency benchmarks vs in-house edge proxy.',
    last_touch: '12d ago'
  },
  {
    deal_id: 'deal-3',
    contact_id: 'cont-7',
    buying_role: 'champion',
    sentiment: 'neutral',
    notes: 'Single stakeholder mapped! Economic buyer or security lead not engaged.',
    last_touch: '16d ago',
    alert: '🚨 Single-Threaded: Need CFO / Procurement contact'
  }
];

export const INITIAL_INTERACTIONS = [
  {
    id: 'int-1',
    company_id: 'comp-1',
    deal_id: 'deal-1',
    contact_id: 'cont-1',
    actor_user_id: 'usr-1',
    actor_name: 'Alex Rivera',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    type: 'email',
    direction: 'inbound',
    subject: 'Re: Revised Enterprise MSA Redlines & SLA Terms',
    body: 'Alex, legal has completed redlines on Section 8 (Data Protection). The terms look solid now. David Chen reviewed the financial amortization schedule and is ready for the sign-off call Thursday afternoon once you update the seat allocation table.',
    metadata: {
      opened_count: 4,
      attachments: ['Stripe_MSA_Final_Redline_v3.pdf'],
      thread_id: 'th-stripe-409'
    },
    occurred_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'int-2',
    company_id: 'comp-1',
    deal_id: 'deal-1',
    contact_id: 'cont-3',
    actor_user_id: 'usr-1',
    actor_name: 'Alex Rivera',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    type: 'meeting',
    direction: 'internal',
    subject: 'Technical Architecture & SecOps Deep Dive',
    body: 'Met with Marcus Vance and 3 senior infrastructure engineers. Walked through the multi-tenant isolation model, KMS envelope encryption keys, and zero-egress data policy. Marcus formally stamped security approval for Q4.',
    metadata: {
      duration_minutes: 45,
      attendees: ['Elena Rostova', 'Marcus Vance', 'Alex Rivera', 'Devin Cole (Solutions Arch)'],
      sentiment_score: 0.95
    },
    occurred_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
  },
  {
    id: 'int-3',
    company_id: 'comp-1',
    deal_id: 'deal-1',
    contact_id: null,
    actor_user_id: 'usr-1',
    actor_name: 'Alex Rivera',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    type: 'stage_transition',
    direction: 'internal',
    subject: 'Stage Transition: PROPOSAL -> NEGOTIATION',
    body: 'Deal advanced from Proposal Sent to Negotiation. ARR confirmed at $145,000 / yr. Win probability bumped from 60% to 85%.',
    metadata: {
      from_stage: 'proposal',
      to_stage: 'negotiation',
      amount_cents: 14500000
    },
    occurred_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: 'int-4',
    company_id: 'comp-1',
    deal_id: 'deal-1',
    contact_id: null,
    actor_user_id: 'system',
    actor_name: 'Telemetry Sentinel',
    actor_avatar: null,
    type: 'system_signal',
    direction: 'inbound',
    subject: '⚡ Usage Signal: Stripe Production Sandbox Reached 96% Capacity',
    body: 'Automated product telemetry detected 42 active developers and 1.8M API requests in Stripe sandbox environment over the last 7 days. License limit warning threshold triggered.',
    metadata: {
      metric: 'seat_capacity_utilization',
      value: '96%',
      trigger: 'expansion_opportunity'
    },
    occurred_at: new Date(Date.now() - 6 * 86400 * 1000).toISOString(),
  },
  {
    id: 'int-5',
    company_id: 'comp-2',
    deal_id: 'deal-2',
    contact_id: 'cont-4',
    actor_user_id: 'usr-1',
    actor_name: 'Alex Rivera',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    type: 'call',
    direction: 'outbound',
    subject: 'Executive Catchup w/ Guillermo Rauch',
    body: 'Discussed next-gen frontend compilation workloads and upcoming edge rendering rollout. Guillermo indicated positive sentiment but mentioned budget freeze until end of October review.',
    metadata: {
      duration_minutes: 25,
      sentiment: 'warm'
    },
    occurred_at: new Date(Date.now() - 11 * 86400 * 1000).toISOString(),
  }
];

export const INITIAL_TEAM_CONNECTIONS = [
  {
    user_id: 'usr-3',
    user_name: 'Marcus Vance',
    contact_id: 'cont-1',
    contact_name: 'Elena Rostova',
    interaction_count: 17,
    strength_score: 94.0,
    last_contacted_at: '2026-10-22T14:00:00Z',
    relationship_context: 'Co-spoke at Strange Loop 2024; shared 14 direct emails and 3 technical working sessions over past 60 days.'
  },
  {
    user_id: 'usr-4',
    user_name: 'Sarah Jenkins',
    contact_id: 'cont-2',
    contact_name: 'David Chen',
    interaction_count: 9,
    strength_score: 88.0,
    last_contacted_at: '2026-10-18T09:30:00Z',
    relationship_context: 'Served on Silicon Valley CFO Tech Advisory Council together for 2 years.'
  },
  {
    user_id: 'usr-1',
    user_name: 'Alex Rivera',
    contact_id: 'cont-4',
    contact_name: 'Guillermo Rauch',
    interaction_count: 12,
    strength_score: 82.0,
    last_contacted_at: '2026-10-13T16:45:00Z',
    relationship_context: 'Early Next.js contributor; maintained quarterly founder exchange.'
  }
];

export const INITIAL_JOB_CHANGE_ALERTS = [
  {
    id: 'jc-1',
    contact_id: 'cont-11',
    contact_name: 'Sarah Jenkins',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
    previous_company: 'Vercel',
    previous_title: 'Head of Developer Growth',
    new_company: 'OpenAI',
    new_title: 'VP of Product',
    detected_at: '2 days ago',
    impact_level: 'High Opportunity 🔥',
    summary: 'Key champion moved from Vercel to OpenAI. OpenAI currently has 0 enterprise active deals with us.',
    suggested_action: 'Send warm congratulations & request 15-min product intro'
  }
];
