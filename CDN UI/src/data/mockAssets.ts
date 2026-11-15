import { MediaAsset, NetworkPersona, CachePreset, HotlinkDomain, AssetVersion } from '../types';

// Generate 120-point realistic waveform for audio
const generatePodcastWaveform = (): number[] => {
  const points: number[] = [];
  for (let i = 0; i < 120; i++) {
    // Generate organic speech-like waveform with quiet pauses and vocal peaks
    const voiceMod = Math.sin(i / 5) * 0.35 + Math.cos(i / 11) * 0.25;
    const noise = Math.random() * 0.25;
    const pause = (i % 25 < 3) ? 0.08 : 1.0;
    const val = Math.min(1.0, Math.max(0.05, (Math.abs(voiceMod) + noise + 0.15) * pause));
    points.push(Number(val.toFixed(3)));
  }
  return points;
};

const generateLofiWaveform = (): number[] => {
  const points: number[] = [];
  for (let i = 0; i < 120; i++) {
    // Rhythmically pulsing drum beat + mellow pad waveform
    const beat = (i % 8 === 0 || i % 8 === 3) ? 0.85 : 0.35;
    const ambient = Math.sin(i / 4) * 0.2 + 0.3;
    const noise = (Math.random() - 0.5) * 0.1;
    const val = Math.min(1.0, Math.max(0.1, beat * 0.5 + ambient + noise));
    points.push(Number(val.toFixed(3)));
  }
  return points;
};

export const MOCK_ASSETS: MediaAsset[] = [
  {
    id: 'asset-img-1',
    title: 'Autumn Campaign Hero — Editorial Portrait',
    filename: 'autumn-campaign-hero.png',
    type: 'image',
    originUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2400&q=100',
    originFormat: 'PNG (24-bit RGB)',
    originBytes: 4820000, // 4.82 MB
    width: 2400,
    height: 1600,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    dominantColors: ['#B86B4F', '#2C2B30', '#E5A988', '#63473D', '#F4EDE4'],
    focalPoint: { x: 0.62, y: 0.38 }, // Subject's eyes/face
    saliencyRegions: [
      {
        id: 'sal-1',
        label: 'Model Portrait (Primary Subject)',
        type: 'face',
        x: 0.48,
        y: 0.20,
        width: 0.28,
        height: 0.38
      },
      {
        id: 'sal-2',
        label: 'Autumn Fashion Trench (Brand Subject)',
        type: 'product',
        x: 0.38,
        y: 0.48,
        width: 0.44,
        height: 0.50
      }
    ],
    surrogateKey: 'sk_img_autumn_hero_8f3a',
    etag: '"8f3a9021cb7419e"',
    version: 3,
    lastUpdated: '12 minutes ago',
    edgeHitRatio: 99.4,
    originWakeupsToday: 0,
    totalRequestsMonth: 412800,
  },
  {
    id: 'asset-img-2',
    title: 'Hyper-Sonic Studio ANC Headphones',
    filename: 'hyper-sonic-headphones.png',
    type: 'image',
    originUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2400&q=100',
    originFormat: 'PNG (RGBA Alpha)',
    originBytes: 6180000, // 6.18 MB
    width: 2400,
    height: 2400,
    blurHash: 'L6PZfSjE00ay~qj[00ay00j[4nay',
    dominantColors: ['#12161F', '#F59E0B', '#06B6D4', '#2C3440', '#E2E8F0'],
    focalPoint: { x: 0.50, y: 0.46 }, // Headphone headband/earcup center
    saliencyRegions: [
      {
        id: 'sal-prod',
        label: 'Acoustic Driver & Headband',
        type: 'product',
        x: 0.25,
        y: 0.22,
        width: 0.50,
        height: 0.52
      }
    ],
    surrogateKey: 'sk_img_headphones_22e9',
    etag: '"22e947b11c99f01"',
    version: 1,
    lastUpdated: '2 hours ago',
    edgeHitRatio: 99.8,
    originWakeupsToday: 0,
    totalRequestsMonth: 689000,
  },
  {
    id: 'asset-img-3',
    title: 'Neo-Tokyo Cyberpunk Skyscraper Skyline',
    filename: 'neo-tokyo-nightscape.png',
    type: 'image',
    originUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2400&q=100',
    originFormat: 'PNG (Uncompressed HDR)',
    originBytes: 5540000, // 5.54 MB
    width: 2400,
    height: 1500,
    blurHash: 'U25#=Xof00ay_3j[4nay00j[?bj[',
    dominantColors: ['#0B0D11', '#8B5CF6', '#06B6D4', '#EC4899', '#1E293B'],
    focalPoint: { x: 0.70, y: 0.48 }, // Illuminated Tower
    saliencyRegions: [
      {
        id: 'sal-city',
        label: 'Tokyo Central Tower Beacon',
        type: 'product',
        x: 0.62,
        y: 0.25,
        width: 0.18,
        height: 0.55
      }
    ],
    surrogateKey: 'sk_img_neotokyo_991c',
    etag: '"991ca4798e2251a"',
    version: 2,
    lastUpdated: 'Yesterday',
    edgeHitRatio: 98.9,
    originWakeupsToday: 2,
    totalRequestsMonth: 295400,
  },
  {
    id: 'asset-aud-1',
    title: 'The Edge Architect Podcast — Ep. 42 (Master Interview)',
    filename: 'founders-podcast-ep42.wav',
    type: 'audio',
    originUrl: '', // Synthesized in browser Web Audio
    originFormat: 'WAV (24-bit 48kHz PCM Stereo)',
    originBytes: 64200000, // 64.2 MB
    duration: 228, // 3 mins 48 secs
    waveform: generatePodcastWaveform(),
    originalLufs: -23.4, // Raw speech needing normalization to -16 LUFS
    surrogateKey: 'sk_aud_ep42_7c1b',
    etag: '"7c1bf209930ba6d"',
    version: 4,
    lastUpdated: '45 minutes ago',
    edgeHitRatio: 99.2,
    originWakeupsToday: 0,
    totalRequestsMonth: 184500,
  },
  {
    id: 'asset-aud-2',
    title: 'Lofi Chill Edge Drift — Ambient Studio Master',
    filename: 'lofi-chill-drift.flac',
    type: 'audio',
    originUrl: '', // Synthesized in browser Web Audio
    originFormat: 'FLAC (Lossless 44.1kHz Stereo)',
    originBytes: 42800000, // 42.8 MB
    duration: 135, // 2 mins 15 secs
    waveform: generateLofiWaveform(),
    originalLufs: -19.2,
    surrogateKey: 'sk_aud_lofi_44b0',
    etag: '"44b01e9a97bc11e"',
    version: 1,
    lastUpdated: '3 days ago',
    edgeHitRatio: 99.6,
    originWakeupsToday: 0,
    totalRequestsMonth: 122000,
  }
];

export const NETWORK_PERSONAS: NetworkPersona[] = [
  {
    id: 'tokyo-5g',
    name: 'Tokyo Fiber 5G',
    location: 'Tokyo, Japan',
    flag: '🗼',
    networkType: '5G',
    latencyMs: 14,
    bandwidthMbps: 450,
    packetLoss: 0,
    description: 'Instant edge cache hit (NRT PoP), sub-20ms first-byte delivery',
  },
  {
    id: 'lisbon-wifi',
    name: 'Lisbon Cafe Wi-Fi',
    location: 'Lisbon, Portugal',
    flag: '☕',
    networkType: 'Wi-Fi',
    latencyMs: 88,
    bandwidthMbps: 22,
    packetLoss: 0.8,
    description: 'Moderate jitter, shared coffee shop public router (LIS/MAD PoP)',
  },
  {
    id: 'subway-3g',
    name: 'NYC Subway Congested 3G',
    location: 'New York, USA',
    flag: '🚇',
    networkType: '3G',
    latencyMs: 410,
    bandwidthMbps: 1.8,
    packetLoss: 3.5,
    description: 'Heavy cell congestion, high packet loss, activates Data-Saver empathy',
  }
];

export const CACHE_PRESETS: CachePreset[] = [
  {
    id: 'immutable',
    title: 'Permanent Brand Asset',
    subtitle: 'Cache for 1 Year (Immutable Edge Lock)',
    description: 'Guarantees sub-15ms edge hits worldwide. Perfect for versioned product imagery, logos, and podcast episodes with content hashes.',
    ttlSeconds: 31536000,
    headerString: 'public, max-age=31536000, immutable',
    badge: '1 YEAR IMMUTABLE'
  },
  {
    id: 'stale-while-revalidate',
    title: 'Evolving Campaign Media',
    subtitle: 'Instant Background Refresh (Zero-Wait Stale)',
    description: 'Serves instantaneous cached file from nearest edge while revalidating origin in the background when revisions are detected.',
    ttlSeconds: 86400,
    headerString: 'public, max-age=3600, stale-while-revalidate=86400',
    badge: 'STALE-WHILE-REVALIDATE'
  },
  {
    id: 'dynamic',
    title: 'Live Event / Dynamic Feed',
    subtitle: 'Re-check Origin Every 60 Seconds',
    description: 'Designed for breaking news graphics, sports scores, and rapidly updating live broadcast streams.',
    ttlSeconds: 60,
    headerString: 'public, s-maxage=60, must-revalidate',
    badge: '60s MICRO-CACHE'
  }
];

export const POP_REGIONS = [
  { id: 'iad', name: 'Americas (US East / SFO / GRU)', cluster: 'IAD-Cluster', status: 'synced', latencyMs: 18, hitRatio: 99.6 },
  { id: 'fra', name: 'Europe (Frankfurt / LHR / AMS)', cluster: 'FRA-Cluster', status: 'synced', latencyMs: 24, hitRatio: 99.4 },
  { id: 'nrt', name: 'Asia-Pacific (Tokyo / SIN / SYD)', cluster: 'NRT-Cluster', status: 'synced', latencyMs: 14, hitRatio: 99.8 },
  { id: 'jnb', name: 'Global Frontier (Mumbai / JNB)', cluster: 'BOM-Cluster', status: 'synced', latencyMs: 42, hitRatio: 98.7 },
];

export const HOTLINK_DOMAINS: HotlinkDomain[] = [
  {
    domain: 'scraper-aggregator.xyz',
    avatar: '🕷️',
    requestsCount: 14200,
    bandwidthBytes: 18200000000, // 18.2 GB
    status: 'blocked',
    threatLevel: 'high',
    lastAttempt: '4 mins ago'
  },
  {
    domain: 'unauthorized-repost-blog.net',
    avatar: '📋',
    requestsCount: 8940,
    bandwidthBytes: 9400000000, // 9.4 GB
    status: 'watermarked',
    threatLevel: 'medium',
    lastAttempt: '18 mins ago'
  },
  {
    domain: 'authorized-partner-store.com',
    avatar: '🛍️',
    requestsCount: 42000,
    bandwidthBytes: 38500000000, // 38.5 GB
    status: 'whitelisted',
    threatLevel: 'partner',
    lastAttempt: 'Just now'
  }
];

export const INITIAL_ASSET_VERSIONS: Record<string, AssetVersion[]> = {
  'asset-img-1': [
    {
      version: 3,
      hash: 'sha256_8f3a9021cb7419e48c1b',
      timestamp: 'Today, 09:12 AM',
      bytes: 4820000,
      summary: 'Retouched warm tonal curves + updated trench coat metadata',
      isCurrent: true
    },
    {
      version: 2,
      hash: 'sha256_51e847c0a9117f302b1c',
      timestamp: 'Nov 11, 2026, 04:30 PM',
      bytes: 5120000,
      summary: 'Initial high-res 4K camera master upload',
      isCurrent: false
    },
    {
      version: 1,
      hash: 'sha256_10a9f39002bb5d49aa01',
      timestamp: 'Nov 08, 2026, 11:15 AM',
      bytes: 6400000,
      summary: 'Uncompressed RAW studio export',
      isCurrent: false
    }
  ]
};

