import type {
  ColorHarmonyId,
  ColorHarmonySwatch,
  ComputedArtifactMeta,
  PortfolioArtifact,
} from '../types/portfolio';

export const COLOR_HARMONIES: ColorHarmonySwatch[] = [
  {
    id: 'terracotta',
    label: 'Warm Terracotta',
    hex: '#C66B45',
    description: 'Sunbaked plaster, ochre dunes & Kyoto cedar warmth',
  },
  {
    id: 'cobalt',
    label: 'Swiss Cobalt',
    hex: '#2454A6',
    description: 'Alpine daylight, optical glass & crisp interface blues',
  },
  {
    id: 'monochrome',
    label: 'Silver Monochrome',
    hex: '#8A8984',
    description: 'Anodized aluminum, silver-gelatin paper & carbon ink',
  },
  {
    id: 'sage',
    label: 'Botanical Sage',
    hex: '#5E7661',
    description: 'Nordic glasshouses, limestone & muted eucalyptus',
  },
  {
    id: 'obsidian-amber',
    label: 'Obsidian Amber',
    hex: '#C88D32',
    description: 'Nocturnal rain reflections, brass dials & darkroom OLEDs',
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [24, 24, 22];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/**
 * Computes WCAG 2.1 relative luminance (0 = pure black, 1 = pure white).
 */
export function computeRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes WCAG contrast ratio between two hex colors (1 to 21).
 */
export function computeContrastRatio(hexA: string, hexB: string): number {
  const l1 = computeRelativeLuminance(hexA);
  const l2 = computeRelativeLuminance(hexB);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function blendHex(baseHex: string, tintHex: string, weight: number): string {
  const [r1, g1, b1] = hexToRgb(baseHex);
  const [r2, g2, b2] = hexToRgb(tintHex);
  return rgbToHex(
    r1 * (1 - weight) + r2 * weight,
    g1 * (1 - weight) + g2 * weight,
    b1 * (1 - weight) + b2 * weight
  );
}

/**
 * Computes museum-grade 300 DPI maximum physical print dimensions.
 */
export function computeMaxPrint300Dpi(widthPx: number, heightPx: number) {
  const widthIn = Math.round((widthPx / 300) * 10) / 10;
  const heightIn = Math.round((heightPx / 300) * 10) / 10;
  const widthCm = Math.round(widthIn * 2.54 * 10) / 10;
  const heightCm = Math.round(heightIn * 2.54 * 10) / 10;
  return {
    widthIn,
    heightIn,
    widthCm,
    heightCm,
    formattedIn: `${widthIn} × ${heightIn} IN`,
    formattedCm: `${widthCm} × ${heightCm} CM`,
  };
}

/**
 * Computes perceptual palette metadata and ambient lightbox matting for an artifact
 * before rendering so high-key and low-key plates sit naturally in the inspection stage.
 */
export function computeArtifactMeta(artifact: PortfolioArtifact): ComputedArtifactMeta {
  const [primaryHex, secondaryHex] = artifact.dominantHexes;
  const primaryLum = computeRelativeLuminance(primaryHex);
  const secondaryLum = computeRelativeLuminance(secondaryHex);
  const avgLum = Number(((primaryLum * 0.65 + secondaryLum * 0.35)).toFixed(3));
  const isHighKey = avgLum > 0.34;

  // Ambient matting blends subtle tonal warmth/coolness from the work into darkroom obsidian
  const mattingTintSource = isHighKey ? secondaryHex : primaryHex;
  const ambientMattingHex = blendHex('#0D0E10', mattingTintSource, isHighKey ? 0.12 : 0.16);
  const ambientMattingBorder = blendHex('#24262A', primaryHex, 0.22);

  const computedAspectRatio = Number((artifact.nativeWidth / artifact.nativeHeight).toFixed(4));

  const maxPrint300Dpi =
    artifact.photoSpec
      ? computeMaxPrint300Dpi(
          artifact.photoSpec.sourceResolutionPx.width,
          artifact.photoSpec.sourceResolutionPx.height
        )
      : undefined;

  return {
    artifact,
    computedAspectRatio,
    luminance: avgLum,
    isHighKey,
    contrastWithDarkroom: computeContrastRatio(primaryHex, '#0D0E10'),
    contrastWithCotton: computeContrastRatio(primaryHex, '#F6F4F0'),
    ambientMattingHex,
    ambientMattingBorder,
    maxPrint300Dpi,
  };
}

export function getHarmonyLabel(id: ColorHarmonyId): string {
  return COLOR_HARMONIES.find((c) => c.id === id)?.label ?? id;
}

