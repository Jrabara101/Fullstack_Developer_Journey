import { PricingTier, ProductFeatureBento, VerifiedTestimonial } from '../types/index.js';

export const TRUST_LOGOS = [
  { name: 'Linear', metric: '⚡ 3.4x Faster Release Cycles', icon: 'zap' },
  { name: 'Supabase', metric: '🛡️ 99.999% SLA Maintained', icon: 'database' },
  { name: 'Vercel Edge', metric: '📉 -58% P99 Edge Latency', icon: 'globe' },
  { name: 'Ramp', metric: '💰 $42k/mo Cloud Savings', icon: 'dollar-sign' },
  { name: 'Retool', metric: '⏱️ 4-second Sandboxes', icon: 'clock' },
  { name: 'PostHog', metric: '📊 10M Events / sec Throughput', icon: 'bar-chart' },
  { name: 'Resend', metric: '🚀 Zero Outages in 24 Months', icon: 'shield-check' },
  { name: 'Raycast', metric: '⚡ Sub-12ms Global Routing', icon: 'cpu' }
];

export const CLIENT_BENTO_FEATURES: ProductFeatureBento[] = [
  {
    id: 'bento-terminal',
    title: 'Instant Edge Sandbox & Live CLI Terminal',
    badgeText: 'Sub-3s Provisioning',
    gridSpan: 'col-span-2',
    interactiveWidgetType: 'live-terminal',
    personaCopy: {
      founder: {
        headline: 'Ship user-facing features 4x faster with zero DevOps overhead.',
        description: 'No more waiting 3 weeks for an infra engineer to set up staging. Run one command or link GitHub, and your entire product stack is live on an isolated edge URL.',
        metricCallout: '4.2x Faster Time-to-Market'
      },
      engineering: {
        headline: 'Declarative ephemeral preview environments with zero drift.',
        description: 'Every pull request gets a production-identical clone with sanitized DB snapshots, edge middleware, and instant hot-reloading across 35 global edge regions.',
        metricCallout: 'Zero Configuration Drift'
      },
      finance: {
        headline: 'Zero idle cloud spend with automatic sleep-to-zero compute.',
        description: 'Stop paying thousands each month for persistent dev and staging servers that sit idle overnight. Sandboxes automatically spin down to $0.00 when traffic halts.',
        metricCallout: '$4,800/mo Idle Server Savings'
      }
    }
  },
  {
    id: 'bento-latency',
    title: 'Sub-12ms Edge Routing & Anomaly Guard',
    badgeText: 'P99 Optimization',
    gridSpan: 'col-span-1',
    interactiveWidgetType: 'latency-chart',
    personaCopy: {
      founder: {
        headline: 'Delight global users with instant page loads and zero lag.',
        description: 'Fast sites convert 2.8x higher. Our distributed routing places your API logic within 15 milliseconds of 92% of the global internet population.',
        metricCallout: '+34% Mobile Conversion'
      },
      engineering: {
        headline: 'Real-time telemetry with automatic p99 circuit breakers.',
        description: 'If a database query spikes beyond 100ms or an upstream API returns errors, intelligent traffic steering automatically isolates the offending pod before customers notice.',
        metricCallout: '11.4ms Median Global P99'
      },
      finance: {
        headline: 'Eliminate egress extortion with built-in smart tiering.',
        description: 'Intelligent compression and regional edge caching reduce cross-cloud bandwidth charges by up to 68% compared to traditional hyperscalers.',
        metricCallout: '-68% Egress Bandwidth Bills'
      }
    }
  },
  {
    id: 'bento-workflow',
    title: 'Zero-Downtime Rollback & Canary Automator',
    badgeText: 'One-Click Safety',
    gridSpan: 'col-span-1',
    interactiveWidgetType: 'workflow-toggle',
    personaCopy: {
      founder: {
        headline: 'Sleep soundly on Friday release afternoons.',
        description: 'No broken releases on demo days or customer pitch meetings. If an error rate crosses 0.05%, traffic seamlessly rolls back in 400 milliseconds automatically.',
        metricCallout: '99.994% Verified Uptime'
      },
      engineering: {
        headline: 'Automated 1% to 100% progressive canary pipelines.',
        description: 'Shift traffic progressively based on real user metric health checks. Integrated with OpenTelemetry, Sentry, and Datadog for instant heuristic rollbacks.',
        metricCallout: '<450ms Rollback SLA'
      },
      finance: {
        headline: 'Prevent catastrophic customer churn from unexpected outages.',
        description: 'The average enterprise outage costs $5,600 per minute in SLA credits and customer attrition. Built-in canary guards safeguard bottom-line enterprise ARR.',
        metricCallout: 'Zero Lost SLA Credits'
      }
    }
  },
  {
    id: 'bento-security',
    title: 'Continuous SOC2 & Secret Encryption Vault',
    badgeText: 'Enterprise Ready',
    gridSpan: 'col-span-2',
    interactiveWidgetType: 'security-vault',
    personaCopy: {
      founder: {
        headline: 'Pass enterprise vendor security questionnaires on day one.',
        description: 'Close 6-figure deals without getting stalled for 4 months in infosec review. Download audited evidence reports and SOC2 Type II certs with a single click.',
        metricCallout: 'Close Deals 60 Days Faster'
      },
      engineering: {
        headline: 'Hardware-backed KMS secrets and zero-trust perimeter.',
        description: 'Automated secret rotation, fine-grained RBAC permissions, and tamper-evident audit logs streamed straight into your SIEM of choice.',
        metricCallout: 'AES-256-GCM + Hardware KMS'
      },
      finance: {
        headline: 'Pass compliance audits without hiring expensive external consultants.',
        description: 'Save $45,000+ per year in security compliance prep. Continuous posture monitoring produces instant auditor-approved CSV and PDF evidence packages.',
        metricCallout: '$45k Annual Audit Savings'
      }
    }
  }
];

export const CLIENT_TESTIMONIALS: VerifiedTestimonial[] = [
  {
    id: 't-founder-1',
    authorName: 'Sarah Lin',
    authorRole: 'Founder & CEO',
    companyName: 'HyperScale AI',
    companyStage: 'Series A',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'founder',
    quote: 'Before switching, our lead dev spent 30% of his week firefighting Docker and AWS configs. Now, we ship 3 major updates every single day, and closed our $12M Series A two months early.',
    verifiedMetric: {
      label: 'Deploy Velocity',
      deltaValue: '⚡ 3.4x Faster',
      timeframe: 'First 30 days'
    },
    blueprintUsed: ['Edge Preview Sandboxes', 'Auto-Rollback Canary', 'Zero-Downtime Migrations']
  },
  {
    id: 't-eng-1',
    authorName: 'Elena Rostova',
    authorRole: 'VP of Engineering',
    companyName: 'KubeCore Systems',
    companyStage: 'Series B+',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'engineering',
    quote: 'We threw our worst synthetic spike test at this—120,000 req/sec while running a blue-green canary deployment. Zero dropped packets, P99 stayed under 18ms. It is astonishingly stable.',
    verifiedMetric: {
      label: 'P99 Latency Drop',
      deltaValue: '📉 -64% P99',
      timeframe: 'Under 120k req/s load'
    },
    blueprintUsed: ['Multi-Region Edge Mesh', 'Synthetic Load Engine', 'Global Anycast DNS']
  },
  {
    id: 't-fin-1',
    authorName: 'Marcus Vance',
    authorRole: 'Head of Finance & Operations',
    companyName: 'PayFlow Global',
    companyStage: 'Series B+',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'finance',
    quote: 'We migrated from a bloated AWS ECS cluster. Our monthly cloud bill dropped from $18,400 to $4,200 immediately. The CFO quote simulator was accurate down to within 3% of our actual invoice.',
    verifiedMetric: {
      label: 'Monthly Cloud Savings',
      deltaValue: '💰 $14,200/mo',
      timeframe: 'Saved each month'
    },
    blueprintUsed: ['Sleep-to-Zero Compute', 'Zero-Egress Tiering', 'Automatic Resource Pruning']
  },
  {
    id: 't-founder-2',
    authorName: 'Alexandre Vance',
    authorRole: 'Co-founder & CTO',
    companyName: 'VektorDB',
    companyStage: 'Seed',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'founder',
    quote: 'The live sandbox sold us in 60 seconds. We literally copy-pasted our repository URL during our pitch to Sequoia and spun up a working demo live in front of the partners.',
    verifiedMetric: {
      label: 'Demo Provision Time',
      deltaValue: '⏱️ 4.2s Provision',
      timeframe: 'Zero cold-starts'
    },
    blueprintUsed: ['Sub-12ms Edge Mesh', 'Isolated DB Branching', 'GitHub Sync']
  },
  {
    id: 't-eng-2',
    authorName: 'David Kim',
    authorRole: 'Principal Staff SRE',
    companyName: 'Archon Distributed',
    companyStage: 'Enterprise',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'engineering',
    quote: 'The automatic rollback canary saved our bacon during Black Friday. A subtle race condition triggered a 0.08% 5xx error blip; the platform severed traffic and reverted in 380ms before any alarm woke me up.',
    verifiedMetric: {
      label: 'Rollback Recovery',
      deltaValue: '🛡️ 380ms SLA',
      timeframe: 'Zero manual touch'
    },
    blueprintUsed: ['Automated Canary Gates', 'Heuristic Anomaly Trippers', 'Sentry Webhook Mesh']
  },
  {
    id: 't-fin-2',
    authorName: 'Rachel Cohen',
    authorRole: 'VP of Business Operations',
    companyName: 'DataSphere Labs',
    companyStage: 'Enterprise',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80',
    personaTag: 'finance',
    quote: 'Internal procurement used to take 6 weeks. The shareable CFO quote link allowed our finance director to review itemized usage forecasts and approve our contract in literally 18 minutes.',
    verifiedMetric: {
      label: 'Procurement Approval',
      deltaValue: '⏱️ 18 min sign-off',
      timeframe: 'Down from 6 weeks'
    },
    blueprintUsed: ['Shareable CFO Quote Link', 'Itemized Usage Forecasting', 'Consolidated Billing']
  }
];

export const CLIENT_FAQS = [
  {
    q: 'How does the un-gated live sandbox work without creating an account?',
    a: 'We allocate an ephemeral micro-container directly in our edge cluster when you interact with the sandbox. You can run real terminal commands, simulate traffic loads, toggle canary flags, and inspect live P99 latency charts without typing a single character of personal information.'
  },
  {
    q: 'What happens when my team exceeds the included seat or event limits?',
    a: 'We believe in transparent, surprise-free scaling. Unlike legacy vendors that block your traffic or demand retroactive penalty fees, we gently notify you at 80% and 95% thresholds. Extra seats and events are billed strictly at transparent tiered rates with a toggleable hard budget cap.'
  },
  {
    q: 'Can I share the generated CFO quote with my finance and legal team?',
    a: 'Yes! When you click "Export CFO-Ready Quote", our backend generates a cryptographically signed, permanent quote link valid for 30 days. It includes an itemized breakdown of team seats, projected event volumes, competitor ROI calculations, and compliance guarantees.'
  },
  {
    q: 'How does your rollback canary prevent downtime during bad deploys?',
    a: 'Every deployment is routed through our intelligent edge proxy. The platform introduces traffic progressively (1% -> 5% -> 25% -> 100%) while listening for anomalous 5xx spikes or P99 regressions. If error rates exceed 0.05%, traffic reverts back to the healthy revision in under 450ms.'
  },
  {
    q: 'Do you offer Purchasing Power Parity (PPP) for international teams?',
    a: 'Yes. Our pricing engine automatically detects country origin and applies standardized PPP discounts (up to 40% off) for emerging tech hubs across LATAM, APAC, and Eastern Europe, ensuring startup builders globally get identical enterprise-grade capabilities.'
  },
  {
    q: 'How hard is it to migrate from AWS, Vercel, or custom Kubernetes?',
    a: 'Most teams migrate in under one afternoon. Simply connect your GitHub repository; our declarative builder automatically detects your framework (Next.js, Node, Go, Python, Docker) and generates our lightweight configuration with automated database mirroring.'
  }
];
