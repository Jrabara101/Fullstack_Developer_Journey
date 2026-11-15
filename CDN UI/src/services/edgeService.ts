import { MediaAsset, TransformationParams, NetworkPersona, SaliencyRegion } from '../types';

export interface EdgeDeliveryMetrics {
  deliveredBytes: number;
  reductionPercentage: number;
  ttfbMs: number;
  transferDurationMs: number;
  totalLoadTimeMs: number;
  perceptualBadge: string;
  perceptualScore: number; // 0 - 100
  effectiveFormat: string;
  cropWarning?: string;
  cropNudged: boolean;
}

export class EdgeService {
  /**
   * Generates production-ready CDN URL with semantic parameters
   */
  static buildCdnUrl(asset: MediaAsset, params: TransformationParams): string {
    const baseUrl = `https://cdn.edgestream.io/media/${asset.filename}`;
    const searchParams = new URLSearchParams();

    if (asset.type === 'image') {
      const format = params.saveData ? 'webp' : (params.format === 'auto' ? 'avif' : params.format);
      searchParams.set('f', format);
      
      const effectiveWidth = params.saveData ? Math.min(params.width, 1080) : params.width;
      searchParams.set('w', effectiveWidth.toString());

      const effectiveQuality = params.saveData ? Math.min(params.quality, 68) : params.quality;
      searchParams.set('q', effectiveQuality.toString());

      if (params.cropMode === 'focal') {
        const fpX = Math.round(params.focalPoint.x * 100);
        const fpY = Math.round(params.focalPoint.y * 100);
        searchParams.set('crop', 'focal');
        searchParams.set('fp', `${fpX},${fpY}`);
      } else {
        searchParams.set('crop', params.cropMode);
      }

      if (params.aspectRatio !== 'original') {
        searchParams.set('ar', params.aspectRatio);
      }

      if (params.saveData) {
        searchParams.set('savedata', '1');
      }
    } else {
      // Audio parameters
      const bitrate = params.saveData ? '48k' : params.audioBitrate;
      searchParams.set('br', bitrate);
      searchParams.set('codec', 'opus');

      if (params.normalizeLufs) {
        searchParams.set('lufs', params.targetLufs.toString());
      }

      if (params.trimEnd > params.trimStart && (params.trimStart > 0 || (asset.duration && params.trimEnd < asset.duration))) {
        searchParams.set('start', `${Math.round(params.trimStart)}s`);
        searchParams.set('end', `${Math.round(params.trimEnd)}s`);
      }
    }

    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Companion Waveform JSON URL
   */
  static getWaveformJsonUrl(asset: MediaAsset): string {
    return `https://cdn.edgestream.io/media/${asset.filename.replace(/\.[^/.]+$/, "")}.waveform.json`;
  }

  /**
   * Calculates delivered bytes, bandwidth savings, load times, and quality scores
   */
  static computeDeliveryMetrics(
    asset: MediaAsset,
    params: TransformationParams,
    network: NetworkPersona
  ): EdgeDeliveryMetrics {
    if (asset.type === 'image') {
      const origBytes = asset.originBytes;
      const targetFormat = params.saveData ? 'webp' : (params.format === 'auto' ? 'avif' : params.format);
      
      // Base format compression multiplier
      let formatMultiplier = 0.022; // AVIF baseline is ~97.8% smaller
      if (targetFormat === 'avif') formatMultiplier = 0.016;
      else if (targetFormat === 'webp') formatMultiplier = 0.048;
      else if (targetFormat === 'jpeg') formatMultiplier = 0.115;
      else if (targetFormat === 'png') formatMultiplier = 0.58;

      // Quality scale factor (default 80 = 1.0)
      const q = params.saveData ? Math.min(params.quality, 68) : params.quality;
      const qualityMultiplier = 0.4 + (q / 100) * 0.75;

      // Dimension factor
      const targetW = params.saveData ? Math.min(params.width, 1080) : params.width;
      const origW = asset.width || 2400;
      const dimensionMultiplier = Math.min(1.0, Math.max(0.2, (targetW / origW) ** 1.3));

      let deliveredBytes = Math.round(origBytes * formatMultiplier * qualityMultiplier * dimensionMultiplier);
      deliveredBytes = Math.max(12000, deliveredBytes); // min 12 KB
      const reductionPercentage = Number(((1 - deliveredBytes / origBytes) * 100).toFixed(1));

      // Network load times
      // Transfer time = bytes / bandwidth + latency
      const bandwidthBytesPerSec = (network.bandwidthMbps * 1000 * 1000) / 8;
      const transferDurationMs = Math.round((deliveredBytes / bandwidthBytesPerSec) * 1000);
      const ttfbMs = network.latencyMs;
      const totalLoadTimeMs = ttfbMs + transferDurationMs;

      // Perceptual badge
      let perceptualBadge = 'Visually Lossless on Retina Displays';
      let perceptualScore = 98;
      if (q >= 85) {
        perceptualBadge = 'Ultra-Fidelity Master (100% Crisp)';
        perceptualScore = 99;
      } else if (q >= 75) {
        perceptualBadge = 'Visually Lossless on Retina Displays';
        perceptualScore = 96;
      } else if (q >= 60) {
        perceptualBadge = 'Optimized Web Standard';
        perceptualScore = 88;
      } else {
        perceptualBadge = 'Aggressive Compression (Visible Micro-Banding)';
        perceptualScore = 72;
      }

      // Check Saliency / Broken Crop Guard
      const { cropWarning, cropNudged } = this.checkSaliencySafety(asset, params.aspectRatio, params.focalPoint);

      return {
        deliveredBytes,
        reductionPercentage,
        ttfbMs,
        transferDurationMs,
        totalLoadTimeMs,
        perceptualBadge,
        perceptualScore,
        effectiveFormat: targetFormat.toUpperCase(),
        cropWarning,
        cropNudged,
      };
    } else {
      // Audio calculation
      const origBytes = asset.originBytes;
      const bitrate = params.saveData ? '48k' : params.audioBitrate;

      let kbps = 96;
      if (bitrate === '320k') kbps = 320;
      if (bitrate === '96k') kbps = 96;
      if (bitrate === '48k') kbps = 48;

      const duration = asset.duration || 180;
      const trimStart = params.trimStart || 0;
      const trimEnd = params.trimEnd || duration;
      const activeDuration = Math.max(1, trimEnd - trimStart);
      
      // Byte size = (kbps * 1000 / 8) * seconds
      const deliveredBytes = Math.round((kbps * 1000 / 8) * activeDuration);
      const reductionPercentage = Number(((1 - deliveredBytes / origBytes) * 100).toFixed(1));

      const bandwidthBytesPerSec = (network.bandwidthMbps * 1000 * 1000) / 8;
      const transferDurationMs = Math.round((deliveredBytes / bandwidthBytesPerSec) * 1000);
      const ttfbMs = network.latencyMs;
      const totalLoadTimeMs = ttfbMs + transferDurationMs;

      let perceptualBadge = 'Studio Master Opus Stream';
      let perceptualScore = 95;
      if (bitrate === '320k') {
        perceptualBadge = 'Uncompressed High-Res Acoustic Precision';
        perceptualScore = 99;
      } else if (bitrate === '96k') {
        perceptualBadge = 'Adaptive Transparent Opus (Voice/Music)';
        perceptualScore = 94;
      } else {
        perceptualBadge = 'Commute Data-Saver (Voice Priority Bandpass)';
        perceptualScore = 80;
      }

      return {
        deliveredBytes,
        reductionPercentage,
        ttfbMs,
        transferDurationMs,
        totalLoadTimeMs,
        perceptualBadge,
        perceptualScore,
        effectiveFormat: `OPUS (${bitrate.toUpperCase()})`,
        cropNudged: false,
      };
    }
  }

  /**
   * Saliency Safe-Zone check
   * Checks if an aspect ratio crop accidentally slices through key detected subjects
   */
  private static checkSaliencySafety(
    asset: MediaAsset,
    aspectRatio: string,
    focalPoint: { x: number; y: number }
  ): { cropWarning?: string; cropNudged: boolean } {
    if (!asset.saliencyRegions || asset.saliencyRegions.length === 0 || aspectRatio === 'original') {
      return { cropNudged: false };
    }

    const faceRegion = asset.saliencyRegions.find(r => r.type === 'face');
    if (!faceRegion) return { cropNudged: false };

    // In a tall aspect ratio (e.g. 4:5 or 1:1) when focalPoint.y is placed too low, the head might get cut off
    if (aspectRatio === '4:5' && focalPoint.y > 0.65 && faceRegion.y < 0.35) {
      return {
        cropWarning: 'Subject facial region would be bisected by raw 4:5 crop. Edge auto-gravity nudged framing +18% upward to preserve head safe zone.',
        cropNudged: true,
      };
    }

    if (aspectRatio === '16:9' && (focalPoint.x < 0.2 || focalPoint.x > 0.8)) {
      return {
        cropWarning: 'Widescreen 16:9 crop is nearing frame boundary. Edge Smart-Focal locks onto subject centroid.',
        cropNudged: true,
      };
    }

    return { cropNudged: false };
  }

  /**
   * Generates responsive code snippets with zero layout shift
   */
  static generateCodeSnippets(asset: MediaAsset, params: TransformationParams) {
    const cdnUrl = this.buildCdnUrl(asset, params);
    const blurHashUri = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${asset.width || 1200} ${asset.height || 800}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${asset.dominantColors?.[0] || '#222'}' filter='url(%23b)'/%3E%3C/svg%3E`;

    const reactSnippet = `import { EdgeImage } from '@edgestream/react';

export function HeroBanner() {
  return (
    <EdgeImage
      src="${cdnUrl}"
      alt="${asset.title}"
      width={${params.width}}
      aspectRatio="${params.aspectRatio}"
      focalPoint={{ x: ${params.focalPoint.x.toFixed(2)}, y: ${params.focalPoint.y.toFixed(2)} }}
      placeholder="blur"
      blurDataURL="${blurHashUri.slice(0, 75)}..."
      priority={true}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
    />
  );
}`;

    const htmlPictureSnippet = `<picture>
  <!-- Edge AVIF Stream -->
  <source
    type="image/avif"
    srcset="
      https://cdn.edgestream.io/media/${asset.filename}?f=avif&w=640&q=${params.quality} 640w,
      https://cdn.edgestream.io/media/${asset.filename}?f=avif&w=1200&q=${params.quality} 1200w,
      https://cdn.edgestream.io/media/${asset.filename}?f=avif&w=2000&q=${params.quality} 2000w
    "
    sizes="(max-width: 768px) 100vw, 1200px"
  />
  <!-- Edge WebP Fallback -->
  <source
    type="image/webp"
    srcset="
      https://cdn.edgestream.io/media/${asset.filename}?f=webp&w=640&q=${params.quality} 640w,
      https://cdn.edgestream.io/media/${asset.filename}?f=webp&w=1200&q=${params.quality} 1200w
    "
    sizes="(max-width: 768px) 100vw, 1200px"
  />
  <!-- Standard Fallback with Zero Layout Shift dimensions -->
  <img
    src="${cdnUrl}"
    width="${asset.width || 1200}"
    height="${asset.height || 800}"
    alt="${asset.title}"
    loading="lazy"
    decoding="async"
    style="background-color: ${asset.dominantColors?.[0] || '#181C25'}; aspect-ratio: ${asset.width || 1200}/${asset.height || 800};"
  />
</picture>`;

    const reactAudioSnippet = `import { EdgeAudioPlayer } from '@edgestream/react';

export function PodcastEpisode() {
  return (
    <EdgeAudioPlayer
      src="${cdnUrl}"
      waveformUrl="${this.getWaveformJsonUrl(asset)}"
      bitrate="auto" // Automatically uses 96k Opus or 48k on Save-Data
      normalizeLufs={${params.normalizeLufs}}
      targetLufs={-16}
      trimRange={[${params.trimStart}, ${params.trimEnd}]}
      title="${asset.title}"
    />
  );
}`;

    return {
      reactImage: reactSnippet,
      htmlPicture: htmlPictureSnippet,
      reactAudio: reactAudioSnippet,
      rawUrl: cdnUrl,
      waveformUrl: this.getWaveformJsonUrl(asset),
    };
  }

  /**
   * Surrogate key invalidation tree
   */
  static getSurrogateKeyTree(asset: MediaAsset) {
    return {
      masterKey: asset.surrogateKey,
      derivatives: [
        { name: '16:9 Desktop Hero Crop (AVIF/WebP)', id: `${asset.surrogateKey}#crop_16x9`, size: '68 KB' },
        { name: '4:5 Mobile Feed Crop', id: `${asset.surrogateKey}#crop_4x5`, size: '54 KB' },
        { name: '1:1 Square Retina Thumbnail', id: `${asset.surrogateKey}#crop_1x1`, size: '32 KB' },
        { name: '1.91:1 OpenGraph Social Card', id: `${asset.surrogateKey}#crop_191x1`, size: '82 KB' },
        { name: 'Pre-computed BlurHash & Color Palette Matrix', id: `${asset.surrogateKey}#meta_blur`, size: '1.2 KB' },
        { name: 'Normalized Waveform JSON companion', id: `${asset.surrogateKey}#waveform_json`, size: '1.4 KB' },
      ]
    };
  }

  /**
   * Format bytes nicely
   */
  static formatBytes(bytes: number, decimals: number = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}

