import { SampleDataRecord } from './types';

export function generateSampleData(
  workspaceId: string,
  industryTemplate: 'saas' | 'fintech' | 'ecommerce' | 'agency'
): SampleDataRecord[] {
  const now = new Date().toISOString();

  if (industryTemplate === 'fintech') {
    return [
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Monthly Payment Volume',
        status: '+18.4% vs last mo',
        value: '$1,428,900',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Dispute & Chargeback Ratio',
        status: 'Healthy (< 0.1%)',
        value: '0.042%',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'pipeline',
        title: 'KYC Tier-2 Corporate Verification: Apex Logistics',
        status: 'Verified',
        value: '$250k Limit Approved',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'activity',
        title: 'Settled instant payout batch #8912 to Silicon Valley Bank',
        status: 'Completed',
        value: '$84,210.00',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'activity',
        title: 'Stripe Webhook: invoice.payment_succeeded for client @mercury',
        status: 'Processed',
        value: '35ms Latency',
        is_sample_data: true,
        created_at: now
      }
    ];
  }

  if (industryTemplate === 'ecommerce') {
    return [
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Gross Merchandise Value (30d)',
        status: '+24.1% MoM',
        value: '$642,350',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Cart-to-Checkout Conversion',
        status: 'Optimized',
        value: '4.82%',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'pipeline',
        title: 'High-Volume Order #10492 — Next-day Air Shipping',
        status: 'Fulfilled',
        value: '3 items • $489.00',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'activity',
        title: 'Shopify sync: Restocked 250 units in US East distribution center',
        status: 'Synchronized',
        value: 'SKU #NX-990',
        is_sample_data: true,
        created_at: now
      }
    ];
  }

  if (industryTemplate === 'agency') {
    return [
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Active Retainer Deliverables',
        status: '96% on schedule',
        value: '18 Sprints',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'metric',
        title: 'Client Satisfaction (CSAT)',
        status: 'Top decile',
        value: '4.95 / 5.0',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'pipeline',
        title: 'Design System Sprint: Q3 Rebrand for Aura Health',
        status: 'In Review',
        value: '14 Figma Components',
        is_sample_data: true,
        created_at: now
      },
      {
        id: `sd_${Math.random().toString(36).substring(2, 9)}`,
        workspace_id: workspaceId,
        entity_type: 'activity',
        title: 'Figma Webhook: Sarah uploaded 8 mobile checkout iterations',
        status: 'Approved',
        value: 'Linear Issue #DES-42',
        is_sample_data: true,
        created_at: now
      }
    ];
  }

  // Default: SaaS / Engineering / Product
  return [
    {
      id: `sd_${Math.random().toString(36).substring(2, 9)}`,
      workspace_id: workspaceId,
      entity_type: 'metric',
      title: 'Global API Latency (p99)',
      status: '-12ms improvement',
      value: '48ms',
      is_sample_data: true,
      created_at: now
    },
    {
      id: `sd_${Math.random().toString(36).substring(2, 9)}`,
      workspace_id: workspaceId,
      entity_type: 'metric',
      title: 'Active CI/CD Build Success',
      status: 'Stable',
      value: '99.4%',
      is_sample_data: true,
      created_at: now
    },
    {
      id: `sd_${Math.random().toString(36).substring(2, 9)}`,
      workspace_id: workspaceId,
      entity_type: 'pipeline',
      title: 'PR #492: Add distributed idempotency lock to Redis cluster',
      status: 'Merged',
      value: 'CI Passed • 4 Approvals',
      is_sample_data: true,
      created_at: now
    },
    {
      id: `sd_${Math.random().toString(36).substring(2, 9)}`,
      workspace_id: workspaceId,
      entity_type: 'activity',
      title: 'GitHub App: Webhook deployed revision v2.4.1 to us-east-1 production',
      status: 'Healthy',
      value: 'Zero downtime',
      is_sample_data: true,
      created_at: now
    },
    {
      id: `sd_${Math.random().toString(36).substring(2, 9)}`,
      workspace_id: workspaceId,
      entity_type: 'activity',
      title: 'PostHog Telemetry: 1,420 events captured in last 10 minutes',
      status: 'Streaming',
      value: 'Telemetry SDK v3.8',
      is_sample_data: true,
      created_at: now
    }
  ];
}
