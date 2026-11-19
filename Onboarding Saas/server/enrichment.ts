export interface EnrichedCompany {
  domain: string;
  name: string;
  slug: string;
  brandColor: string;
  logoUrl: string;
  industry: 'saas' | 'fintech' | 'ecommerce' | 'agency';
  teamSize: string;
  description: string;
  teammatesAvailable: Array<{ name: string; email: string; avatar: string; role: string }>;
}

const CATALOG: Record<string, Partial<EnrichedCompany>> = {
  'vercel.com': {
    name: 'Vercel Inc.',
    slug: 'vercel-team',
    brandColor: '#000000',
    logoUrl: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
    industry: 'saas',
    teamSize: '250-500 employees',
    description: 'Develop. Preview. Ship. Frontend Cloud & Next.js platform.',
    teammatesAvailable: [
      { name: 'Guillermo Rauch', email: 'guillermo@vercel.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces', role: 'Executive' },
      { name: 'Lee Robinson', email: 'lee@vercel.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces', role: 'VP Developer Experience' },
      { name: 'Delba de Oliveira', email: 'delba@vercel.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces', role: 'Staff Engineer' }
    ]
  },
  'stripe.com': {
    name: 'Stripe',
    slug: 'stripe-workspace',
    brandColor: '#635BFF',
    logoUrl: 'https://images.ctfassets.net/f60q1anpxzid/asset-stripe-logo/stripe-logo.svg',
    industry: 'fintech',
    teamSize: '5,000+ employees',
    description: 'Financial infrastructure for the internet.',
    teammatesAvailable: [
      { name: 'Patrick Collison', email: 'patrick@stripe.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces', role: 'CEO' },
      { name: 'Claire Hughes', email: 'claire@stripe.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces', role: 'Head of Infrastructure' },
      { name: 'David Zhang', email: 'david@stripe.com', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=faces', role: 'Staff Payments Architect' }
    ]
  },
  'linear.app': {
    name: 'Linear',
    slug: 'linear-orbit',
    brandColor: '#5E6AD2',
    logoUrl: 'https://linear.app/static/favicon.svg',
    industry: 'saas',
    teamSize: '50-100 employees',
    description: 'The issue tracking and modern software delivery tool designed for high-performing teams.',
    teammatesAvailable: [
      { name: 'Karri Saarinen', email: 'karri@linear.app', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces', role: 'Design Lead' },
      { name: 'Tuomas Artman', email: 'artman@linear.app', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces', role: 'CTO' }
    ]
  },
  'notion.so': {
    name: 'Notion Labs',
    slug: 'notion-hq',
    brandColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo-svg.svg',
    industry: 'saas',
    teamSize: '500-1000 employees',
    description: 'The connected workspace where better, faster work happens.',
    teammatesAvailable: [
      { name: 'Ivan Zhao', email: 'ivan@notion.so', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop&crop=faces', role: 'Founder' },
      { name: 'Akshay Kothari', email: 'akshay@notion.so', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces', role: 'COO' }
    ]
  },
  'ramp.com': {
    name: 'Ramp Financial',
    slug: 'ramp-finance',
    brandColor: '#299764',
    logoUrl: 'https://ramp.com/favicon.ico',
    industry: 'fintech',
    teamSize: '500-1,000 employees',
    description: 'Finance automation platform designed to save businesses time and money.',
    teammatesAvailable: [
      { name: 'Eric Glyman', email: 'eric@ramp.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=faces', role: 'CEO' },
      { name: 'Gene Lee', email: 'gene@ramp.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces', role: 'Engineering Director' }
    ]
  },
  'posthog.com': {
    name: 'PostHog',
    slug: 'posthog-cloud',
    brandColor: '#F54E00',
    logoUrl: 'https://posthog.com/favicon.ico',
    industry: 'saas',
    teamSize: '100-250 employees',
    description: 'Product analytics, session recording, feature flags and heatmaps in one platform.',
    teammatesAvailable: [
      { name: 'James Hawkins', email: 'james@posthog.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=faces', role: 'CEO' },
      { name: 'Tim Glaser', email: 'tim@posthog.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces', role: 'CTO' }
    ]
  },
  'shopify.com': {
    name: 'Shopify Global',
    slug: 'shopify-hub',
    brandColor: '#96BF48',
    logoUrl: 'https://cdn.shopify.com/assets/images/logos/shopify-bag.png',
    industry: 'ecommerce',
    teamSize: '10,000+ employees',
    description: 'The global commerce platform built for all scales of business.',
    teammatesAvailable: [
      { name: 'Tobi Lütke', email: 'tobi@shopify.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces', role: 'Founder & CEO' },
      { name: 'Harley Finkelstein', email: 'harley@shopify.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces', role: 'President' }
    ]
  }
};

const COMMON_CONSUMER_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'aol.com', 'mail.com'
]);

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#2563EB', // Blue
    '#7C3AED', // Violet
    '#DB2777', // Pink
    '#D97706', // Amber
    '#0891B2', // Cyan
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function enrichCorporateDomain(rawDomainOrEmail: string): EnrichedCompany | null {
  if (!rawDomainOrEmail) return null;
  
  let domain = rawDomainOrEmail.trim().toLowerCase();
  if (domain.includes('@')) {
    domain = domain.split('@')[1];
  }
  // Strip trailing slashes or protocols if any
  domain = domain.replace(/^https?:\/\//, '').split('/')[0];

  if (COMMON_CONSUMER_DOMAINS.has(domain)) {
    return null; // Return null so UI prompts for custom company name
  }

  // Check verified catalog
  if (CATALOG[domain]) {
    const entry = CATALOG[domain];
    return {
      domain,
      name: entry.name || domain,
      slug: entry.slug || domain.split('.')[0],
      brandColor: entry.brandColor || '#4F46E5',
      logoUrl: entry.logoUrl || `https://logo.clearbit.com/${domain}`,
      industry: entry.industry || 'saas',
      teamSize: entry.teamSize || '50-250 employees',
      description: entry.description || `Workspace for ${domain}`,
      teammatesAvailable: entry.teammatesAvailable || []
    };
  }

  // Algorithmic intelligent fallback for any custom domain
  const domainParts = domain.split('.');
  const primaryName = domainParts[0] || 'My Company';
  const formattedName = primaryName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let industry: 'saas' | 'fintech' | 'ecommerce' | 'agency' = 'saas';
  if (/pay|bank|fund|capital|invest|finance|crypto|coin|ledger/i.test(domain)) {
    industry = 'fintech';
  } else if (/shop|store|cart|retail|market|wear|brand|apparel/i.test(domain)) {
    industry = 'ecommerce';
  } else if (/agency|design|studio|creative|media|consult/i.test(domain)) {
    industry = 'agency';
  }

  const brandColor = hashStringToColor(domain);

  return {
    domain,
    name: formattedName,
    slug: primaryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    brandColor,
    logoUrl: `https://avatar.vercel.sh/${domain}.svg?text=${formattedName.slice(0, 2).toUpperCase()}`,
    industry,
    teamSize: '10-50 employees',
    description: `Workspace platform for ${formattedName}`,
    teammatesAvailable: [
      { name: 'Sarah Connor', email: `sarah@${domain}`, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces', role: 'Product Lead' },
      { name: 'Alex Miller', email: `alex@${domain}`, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces', role: 'Principal Architect' }
    ]
  };
}
