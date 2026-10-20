export const INITIAL_PREFERENCES = {
  global: {
    dndEnabled: true,
    dndStart: '22:00',
    dndEnd: '08:00',
    timezone: 'America/New_York',
    circadianMorningDigest: true,
    pushGranted: false,
    channelEscalationDelayMinutes: 30, // 30-min unread timer dispatching fallback email
    burnoutSafeguardMaxPerDay: 15,
  },
  categories: [
    {
      id: 'collaboration',
      name: 'Team & Collaboration',
      description: 'Mentions, thread replies, assigned tasks, and PR reviews',
      events: [
        { id: 'mention', label: 'Mentions in threads & documents', inApp: true, email: 'instant', push: true },
        { id: 'review_request', label: 'Pull request review requests', inApp: true, email: 'instant', push: true },
        { id: 'assignment', label: 'Task or project assignments', inApp: true, email: 'daily_digest', push: false },
        { id: 'workspace_invite', label: 'Workspace & team invitations', inApp: true, email: 'instant', push: true },
      ]
    },
    {
      id: 'security',
      name: 'System & Security',
      description: 'New session logins, password updates, and API key warnings',
      isMandatory: true,
      events: [
        { id: 'new_login', label: 'New device or unfamiliar IP logins', inApp: true, email: 'instant', emailLocked: true, push: true },
        { id: 'key_expiry', label: 'Production API keys nearing expiration', inApp: true, email: 'instant', emailLocked: true, push: true },
        { id: 'permission_change', label: 'Role elevation & permission grants', inApp: true, email: 'instant', emailLocked: true, push: false },
      ]
    },
    {
      id: 'billing',
      name: 'Billing & Usage',
      description: 'Invoices, usage threshold warnings, and payment receipts',
      events: [
        { id: 'invoice_ready', label: 'Monthly subscription invoices & receipts', inApp: true, email: 'instant', push: false },
        { id: 'usage_threshold', label: 'Usage approaching limit (80% & 100%)', inApp: true, email: 'daily_digest', push: true },
        { id: 'payment_failed', label: 'Payment processing failures', inApp: true, email: 'instant', emailLocked: true, push: true },
      ]
    },
    {
      id: 'product',
      name: 'Product Updates & Tips',
      description: 'Major release notes, performance tips, and weekly digest',
      events: [
        { id: 'feature_releases', label: 'Major product announcements & changelogs', inApp: true, email: 'daily_digest', push: false },
        { id: 'weekly_digest', label: 'Weekly workspace activity recap', inApp: false, email: 'daily_digest', push: false },
      ]
    }
  ]
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'collaboration',
    actor: {
      name: 'Sarah Lin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
      role: 'Staff Product Manager',
      email: 'sarah.lin@acme.corp'
    },
    targetEntity: {
      type: 'comment',
      name: 'Q4 Product Strategy Roadmap',
      preview: '"Can we double check the capacity estimates for the multi-region notification pipeline before tomorrow\'s executive review?"',
      url: 'https://linear.app/acme/project/roadmap-q4',
      threadContext: [
        { author: 'Marcus Thorne', time: '1h ago', text: 'Drafting initial scoping doc for notification dispatch queue.' },
        { author: 'Sarah Lin', time: '4m ago', text: 'Can we double check the capacity estimates for the multi-region notification pipeline before tomorrow\'s executive review?' }
      ]
    },
    title: 'Sarah Lin mentioned you in Q4 Product Strategy Roadmap',
    body: 'Can we double check the capacity estimates for the multi-region notification pipeline before tomorrow\'s executive review?',
    actionType: 'quick_reply', // or 'view'
    actionResolved: false,
    actionResolvedState: null,
    isRead: false,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4m ago
    deliveryRuleReason: 'Sent because you are tagged directly in this thread by a team collaborator.',
    metadata: {
      channelDelivered: ['in_app', 'email'],
      providerMessageId: 'resend_msg_01jh927bc9a',
      tokenHash: 'tok_rfc8058_sub_981a',
      priority: 'high'
    }
  },
  {
    id: 'notif-2',
    category: 'collaboration',
    actor: {
      name: 'Alex Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      role: 'Senior Systems Architect',
      email: 'alex.vance@acme.corp'
    },
    targetEntity: {
      type: 'pull_request',
      name: 'PR #412: refactor: multi-region failover cluster',
      preview: 'Replaces single Redis master with sentinel replica cluster across us-east and eu-west regions with zero-downtime failover.',
      url: 'https://github.com/acme/infra/pull/412',
      diffStats: { additions: 342, deletions: 89, filesChanged: 14 }
    },
    title: 'Alex Vance requested your review on PR #412',
    body: 'Replaces single Redis master with sentinel replica cluster across us-east and eu-west regions.',
    actionType: 'approve_pr',
    actionResolved: false,
    actionResolvedState: null,
    isRead: false,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28m ago
    deliveryRuleReason: 'Sent because you are a designated CODEOWNER for infra/redis/failover.tf.',
    metadata: {
      channelDelivered: ['in_app'],
      escalationPending: true, // Will escalate to email in 2 minutes
      escalationDueAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      priority: 'urgent'
    }
  },
  {
    id: 'notif-3',
    category: 'security',
    actor: {
      name: 'Security Shield Guardian',
      avatar: null, // will render shield icon
      role: 'Automated Threat Detection',
      email: 'security-alerts@acme.corp'
    },
    targetEntity: {
      type: 'auth_session',
      name: 'Suspicious Session Login Detected',
      preview: 'New session authenticated from Chrome 130 on Linux via IP 194.26.29.11 (Frankfurt, Germany) without known fingerprint.',
      url: 'https://app.acme.corp/settings/security/sessions',
      ip: '194.26.29.11',
      location: 'Frankfurt, Germany',
      device: 'Chrome 130 (Linux x86_64)'
    },
    title: 'New login from unrecognized IP: 194.26.29.11',
    body: 'New session opened from Frankfurt, Germany. If this was not you, terminate the session immediately and rotate credentials.',
    actionType: 'security_action',
    actionResolved: false,
    actionResolvedState: null,
    isRead: false,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(), // 52m ago
    deliveryRuleReason: 'Mandatory security protocol triggered by unrecognized geolocation and device fingerprint.',
    metadata: {
      channelDelivered: ['in_app', 'email', 'push'],
      providerMessageId: 'postmark_msg_8871ab1',
      priority: 'critical'
    }
  },
  {
    id: 'notif-4',
    category: 'collaboration',
    actor: {
      name: 'Marcus Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      role: 'VP of Design & Systems',
      email: 'marcus.thorne@acme.corp'
    },
    targetEntity: {
      type: 'workspace_invite',
      name: 'Design Systems Core Working Group',
      preview: 'You have been invited to join the private working group workspace with Owner privileges.',
      url: 'https://app.acme.corp/invites/design-systems-core'
    },
    title: 'Marcus Thorne invited you to join Design Systems Core',
    body: 'Invitation to collaborate on the universal multi-platform token repository.',
    actionType: 'accept_decline',
    actionResolved: false,
    actionResolvedState: null,
    isRead: false,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3h ago
    deliveryRuleReason: 'Sent because Marcus Thorne added you to the private workspace roster.',
    metadata: {
      channelDelivered: ['in_app', 'email'],
      priority: 'normal'
    }
  },
  {
    id: 'notif-5',
    category: 'billing',
    actor: {
      name: 'Stripe Billing System',
      avatar: null,
      role: 'Payment Gateway',
      email: 'invoicing@acme.corp'
    },
    targetEntity: {
      type: 'invoice',
      name: 'Invoice #INV-2026-089',
      preview: 'Monthly Team Enterprise Plan subscription for $240.00 was successfully charged to Visa ending in 4242.',
      url: 'https://app.acme.corp/billing/invoices/INV-2026-089',
      amount: '$240.00 USD',
      period: 'Oct 2026'
    },
    title: 'Invoice #INV-2026-089 paid ($240.00)',
    body: 'Receipt for Enterprise Plan monthly cycle. Card ending in 4242 was charged.',
    actionType: 'view',
    actionResolved: true,
    actionResolvedState: 'viewed',
    isRead: true,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // 14h ago (Today)
    deliveryRuleReason: 'Sent to account billing owner upon successful recurring subscription capture.',
    metadata: {
      channelDelivered: ['in_app', 'email'],
      providerMessageId: 'resend_inv_9981a',
      priority: 'low'
    }
  },
  {
    id: 'notif-6',
    category: 'product',
    actor: {
      name: 'Stitch Pulse Product Team',
      avatar: null,
      role: 'Changelog Release Bot',
      email: 'updates@acme.corp'
    },
    targetEntity: {
      type: 'product_release',
      name: 'Pulse v2.4 Release Notes',
      preview: 'Discover the new Cognitive Fatigue Shield, Circadian DND Schedules, and RFC 8058 compliant one-click unsubscribe links.',
      url: 'https://stitch.design/changelog/v2-4-fatigue-shield'
    },
    title: 'New: Cognitive Fatigue Shield & One-Click Unsubscribe',
    body: 'We just deployed automatic event aggregation to eliminate rapid-fire notification spam.',
    actionType: 'view',
    actionResolved: false,
    actionResolvedState: null,
    isRead: true,
    isArchived: false,
    isSnoozed: false,
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
    deliveryRuleReason: 'Subscribed to workspace product release highlights and feature changelogs.',
    metadata: {
      channelDelivered: ['in_app', 'email'],
      priority: 'low'
    }
  },
  {
    id: 'notif-7',
    category: 'collaboration',
    actor: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
      role: 'Principal Frontend Engineer',
      email: 'elena.r@acme.corp'
    },
    targetEntity: {
      type: 'comment',
      name: 'Thread: Tailwind v4 Tokens Migration',
      preview: '"Approved the color tokens PR! Merging into main branch as soon as CI passes."',
      url: 'https://github.com/acme/frontend/pull/389#issuecomment-8891'
    },
    title: 'Elena Rostova resolved comments in PR #389',
    body: 'Approved the color tokens PR! Merging into main branch as soon as CI passes.',
    actionType: 'view',
    actionResolved: true,
    actionResolvedState: 'viewed',
    isRead: true,
    isArchived: true, // Archived
    isSnoozed: false,
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(), // Older
    deliveryRuleReason: 'Sent because you participated in the thread conversation.',
    metadata: {
      channelDelivered: ['in_app'],
      priority: 'normal'
    }
  }
];
