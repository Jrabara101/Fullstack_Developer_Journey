export const REGIONAL_NODES = [
  {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    label: 'US-East (N. Virginia)',
    code: 'us-east-1',
    status: 'Healthy',
    latency: '18ms',
    utilization: '74%',
    nodes: 128,
    link: '#region-us-east'
  },
  {
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    label: 'EU-Central (Frankfurt)',
    code: 'eu-central-1',
    status: 'Degraded',
    latency: '142ms',
    utilization: '92%',
    nodes: 84,
    link: '#region-eu-central'
  },
  {
    image: 'https://images.unsplash.com/photo-1508873696983-2df5703bc250?auto=format&fit=crop&w=1200&q=80',
    label: 'AP-East (Tokyo)',
    code: 'ap-northeast-1',
    status: 'Healthy',
    latency: '34ms',
    utilization: '61%',
    nodes: 96,
    link: '#region-ap-east'
  },
  {
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    label: 'SA-East (São Paulo)',
    code: 'sa-east-1',
    status: 'Healthy',
    latency: '68ms',
    utilization: '58%',
    nodes: 48,
    link: '#region-sa-east'
  },
  {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    label: 'ME-South (Dubai)',
    code: 'me-south-1',
    status: 'Healthy',
    latency: '45ms',
    utilization: '43%',
    nodes: 36,
    link: '#region-me-south'
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr_01',
    name: 'Alexandre Keller',
    email: 'a.keller@meridian-tech.io',
    avatarInitials: 'AK',
    avatarColor: 'bg-primary-fixed text-on-primary-fixed',
    organization: 'Meridian Platform',
    role: 'Admin',
    status: 'Active',
    monthlySpend: 18420.00,
    apiCalls24h: 1842910,
    lastActive: '2m ago',
    region: 'US-East'
  },
  {
    id: 'usr_02',
    name: 'Sarah Lin-Chen',
    email: 'slin@quantumcloud.co',
    avatarInitials: 'SL',
    avatarColor: 'bg-secondary-container text-on-secondary-container',
    organization: 'Quantum Systems',
    role: 'Operations',
    status: 'Active',
    monthlySpend: 12850.50,
    apiCalls24h: 984210,
    lastActive: '14m ago',
    region: 'EU-Central'
  },
  {
    id: 'usr_03',
    name: 'David Wayne',
    email: 'dwayne@aeroglobal.com',
    avatarInitials: 'DW',
    avatarColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    organization: 'AeroGlobal Logistics',
    role: 'Billing',
    status: 'Pending',
    monthlySpend: 9400.00,
    apiCalls24h: 412005,
    lastActive: '1h ago',
    region: 'US-East'
  },
  {
    id: 'usr_04',
    name: 'Elena Morosova',
    email: 'elena@vanguard-ai.de',
    avatarInitials: 'EM',
    avatarColor: 'bg-surface-container-high text-on-surface',
    organization: 'Vanguard AI Labs',
    role: 'Admin',
    status: 'Active',
    monthlySpend: 31200.00,
    apiCalls24h: 3540119,
    lastActive: 'Just now',
    region: 'EU-Central'
  },
  {
    id: 'usr_05',
    name: 'Tariq Ramadan',
    email: 'tariq@hyperlane.io',
    avatarInitials: 'TR',
    avatarColor: 'bg-error-container text-on-error-container',
    organization: 'Hyperlane Infra',
    role: 'Auditor',
    status: 'Suspended',
    monthlySpend: 0.00,
    apiCalls24h: 12,
    lastActive: '3d ago',
    region: 'ME-South'
  },
  {
    id: 'usr_06',
    name: 'Maya Nakamura',
    email: 'm.nakamura@zenith-pay.jp',
    avatarInitials: 'MN',
    avatarColor: 'bg-primary-fixed-dim text-on-primary-fixed',
    organization: 'Zenith Fintech APAC',
    role: 'Operations',
    status: 'Active',
    monthlySpend: 24900.00,
    apiCalls24h: 2110480,
    lastActive: '26m ago',
    region: 'AP-East'
  },
  {
    id: 'usr_07',
    name: 'Julian Hayes',
    email: 'j.hayes@corestream.net',
    avatarInitials: 'JH',
    avatarColor: 'bg-surface-container text-on-surface',
    organization: 'CoreStream Media',
    role: 'Admin',
    status: 'Active',
    monthlySpend: 14100.80,
    apiCalls24h: 749020,
    lastActive: '48m ago',
    region: 'US-East'
  },
  {
    id: 'usr_08',
    name: 'Brittany Kovacs',
    email: 'bkovacs@shield-sec.org',
    avatarInitials: 'BK',
    avatarColor: 'bg-tertiary text-on-tertiary',
    organization: 'Shield Security Ops',
    role: 'Auditor',
    status: 'Active',
    monthlySpend: 8940.00,
    apiCalls24h: 320110,
    lastActive: '5m ago',
    region: 'EU-Central'
  },
  {
    id: 'usr_09',
    name: 'Marcus Sterling',
    email: 'msterling@apexcapital.co',
    avatarInitials: 'MS',
    avatarColor: 'bg-primary-container text-on-primary',
    organization: 'Apex Capital Ventures',
    role: 'Admin',
    status: 'Active',
    monthlySpend: 42150.00,
    apiCalls24h: 4290120,
    lastActive: '1m ago',
    region: 'US-East'
  },
  {
    id: 'usr_10',
    name: 'Priya Sharma',
    email: 'psharma@nexusedge.in',
    avatarInitials: 'PS',
    avatarColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    organization: 'Nexus Edge Compute',
    role: 'Operations',
    status: 'Pending',
    monthlySpend: 11200.00,
    apiCalls24h: 610840,
    lastActive: '2h ago',
    region: 'AP-East'
  },
  {
    id: 'usr_11',
    name: 'Lucas Silva',
    email: 'lsilva@atlantica-cloud.br',
    avatarInitials: 'LS',
    avatarColor: 'bg-secondary-container text-on-secondary-container',
    organization: 'Atlantica Cloud Services',
    role: 'Billing',
    status: 'Active',
    monthlySpend: 7850.00,
    apiCalls24h: 290100,
    lastActive: '34m ago',
    region: 'SA-East'
  },
  {
    id: 'usr_12',
    name: 'Amira Al-Mansoor',
    email: 'amira@gulftech.ae',
    avatarInitials: 'AA',
    avatarColor: 'bg-primary-fixed text-on-primary-fixed',
    organization: 'Gulf Tech Enterprises',
    role: 'Admin',
    status: 'Active',
    monthlySpend: 28400.00,
    apiCalls24h: 1980300,
    lastActive: '12m ago',
    region: 'ME-South'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    type: 'interruptive',
    severity: 'critical',
    title: 'Cluster eu-central-1 High Latency',
    message: 'Average p99 latency exceeded threshold at 142ms. 12 tenants affected.',
    timestamp: '3m ago',
    actions: [
      { id: 'triage', label: 'Triage Incident', variant: 'primary' },
      { id: 'ack', label: 'Acknowledge', variant: 'secondary' }
    ]
  },
  {
    id: 'notif_02',
    type: 'interruptive',
    severity: 'warning',
    title: 'Access Privilege Escalation Request',
    message: 'David Wayne requested role promotion to [Admin] for Meridian Platform.',
    timestamp: '15m ago',
    actions: [
      { id: 'approve_role', label: 'Approve', variant: 'success' },
      { id: 'deny_role', label: 'Deny', variant: 'danger' }
    ]
  },
  {
    id: 'notif_03',
    type: 'passive',
    severity: 'info',
    title: 'Automated Snapshot Complete',
    message: 'Encrypted backup for US-East database finished successfully (14.2 GB).',
    timestamp: '1h ago'
  },
  {
    id: 'notif_04',
    type: 'passive',
    severity: 'info',
    title: 'Monthly Invoicing Finalized',
    message: 'Batch generated 1,248 billing summaries for October 2024.',
    timestamp: '4h ago'
  }
];

export const TIME_SERIES_DATA = {
  '24H': {
    directTraffic: [35, 42, 45, 52, 60, 58, 64, 78, 88, 94, 91, 86, 75, 70, 72, 80, 85, 90, 94, 92, 85, 78, 65, 50],
    webhooks:      [20, 24, 28, 30, 38, 42, 45, 48, 55, 60, 62, 59, 50, 44, 46, 50, 56, 58, 62, 60, 52, 44, 38, 30],
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    peak: '94.2k req/s',
    avgResponse: '138ms',
    successRate: '99.98%'
  },
  '7D': {
    directTraffic: [60, 68, 72, 85, 91, 79, 88],
    webhooks:      [40, 45, 50, 58, 62, 54, 60],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    peak: '91.4k req/s',
    avgResponse: '140ms',
    successRate: '99.97%'
  },
  '30D': {
    directTraffic: [45, 55, 50, 62, 70, 65, 78, 85, 94, 88, 82, 89, 92, 95, 87, 83, 90, 94, 88, 82, 85, 91, 94, 89, 84, 88, 92, 90, 86, 82],
    webhooks:      [30, 35, 32, 40, 48, 44, 52, 58, 65, 60, 56, 61, 64, 66, 59, 57, 62, 65, 61, 56, 58, 63, 65, 61, 58, 60, 64, 62, 59, 55],
    labels: ['Oct 01', 'Oct 08', 'Oct 15', 'Oct 24 (Peak)', 'Oct 31'],
    peak: '94.2k req/s',
    avgResponse: '142ms',
    successRate: '99.96%'
  },
  '90D': {
    directTraffic: [40, 48, 55, 62, 70, 75, 82, 88, 94],
    webhooks:      [25, 30, 36, 42, 48, 52, 56, 60, 65],
    labels: ['Aug', 'Sep', 'Oct'],
    peak: '96.8k req/s',
    avgResponse: '145ms',
    successRate: '99.94%'
  }
};
