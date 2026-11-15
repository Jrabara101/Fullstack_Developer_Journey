export type MediaType = 'image' | 'audio';

export type ImageFormat = 'auto' | 'avif' | 'webp' | 'jpeg' | 'png';
export type AudioBitrate = '320k' | '96k' | '48k';
export type CropMode = 'focal' | 'smart' | 'fill' | 'fit';

export interface SaliencyRegion {
  id: string;
  label: string;
  type: 'face' | 'text' | 'product';
  x: number; // 0 to 1
  y: number; // 0 to 1
  width: number; // 0 to 1
  height: number; // 0 to 1
}

export interface MediaAsset {
  id: string;
  title: string;
  filename: string;
  type: MediaType;
  originUrl: string;
  originFormat: string;
  originBytes: number;
  width?: number;
  height?: number;
  duration?: number; // seconds for audio
  blurHash?: string;
  dominantColors?: string[];
  focalPoint?: { x: number; y: number };
  saliencyRegions?: SaliencyRegion[];
  waveform?: number[]; // 120-point normalized amplitude (0 to 1)
  originalLufs?: number; // e.g. -23.4 LUFS
  surrogateKey: string;
  etag: string;
  version: number;
  lastUpdated: string;
  edgeHitRatio: number; // e.g. 99.4
  originWakeupsToday: number;
  totalRequestsMonth: number;
}

export interface TransformationParams {
  // Common
  format: ImageFormat;
  quality: number; // 30 - 100
  saveData: boolean;

  // Image specific
  width: number;
  height?: number;
  cropMode: CropMode;
  focalPoint: { x: number; y: number };
  aspectRatio: string; // '16:9' | '4:5' | '1:1' | '1.91:1' | 'original'

  // Audio specific
  audioBitrate: AudioBitrate;
  normalizeLufs: boolean;
  targetLufs: number; // standard -16
  trimStart: number; // seconds
  trimEnd: number; // seconds
}

export interface NetworkPersona {
  id: string;
  name: string;
  location: string;
  flag: string;
  networkType: '5G' | 'Wi-Fi' | '3G';
  latencyMs: number;
  bandwidthMbps: number;
  packetLoss: number;
  description: string;
}

export type PlaceholderMode = 'blurhash' | 'palette' | 'silhouette' | 'audio-buffer';

export interface CachePreset {
  id: 'immutable' | 'stale-while-revalidate' | 'dynamic';
  title: string;
  subtitle: string;
  description: string;
  ttlSeconds: number;
  headerString: string;
  badge: string;
}

export interface PoPRegion {
  id: string;
  name: string;
  cluster: string;
  status: 'synced' | 'purging' | 'revalidating' | 'hit';
  latencyMs: number;
  hitRatio: number;
}

export interface HotlinkDomain {
  domain: string;
  avatar: string;
  requestsCount: number;
  bandwidthBytes: number;
  status: 'blocked' | 'watermarked' | 'whitelisted';
  threatLevel: 'high' | 'medium' | 'partner';
  lastAttempt: string;
}

export interface AssetVersion {
  version: number;
  hash: string;
  timestamp: string;
  bytes: number;
  summary: string;
  isCurrent: boolean;
}

