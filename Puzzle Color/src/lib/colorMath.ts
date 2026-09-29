import { ColorData } from '../types/color';

// sRGB to CIELAB Conversion
export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  // Normalize and apply sRGB gamma inverse
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const rLinear = sR > 0.04045 ? Math.pow((sR + 0.055) / 1.055, 2.4) : sR / 12.92;
  const gLinear = sG > 0.04045 ? Math.pow((sG + 0.055) / 1.055, 2.4) : sG / 12.92;
  const bLinear = sB > 0.04045 ? Math.pow((sB + 0.055) / 1.055, 2.4) : sB / 12.92;

  // D65 Standard Observer Matrix
  const x = (rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375) * 100;
  const y = (rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750) * 100;
  const z = (rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041) * 100;

  return [x, y, z];
}

export function xyzToLab(x: number, y: number, z: number): { l: number; a: number; b: number } {
  // D65 Reference White Point
  const xN = 95.047;
  const yN = 100.0;
  const zN = 108.883;

  const xRel = x / xN;
  const yRel = y / yN;
  const zRel = z / zN;

  const fx = xRel > 0.008856 ? Math.cbrt(xRel) : 7.787 * xRel + 16 / 116;
  const fy = yRel > 0.008856 ? Math.cbrt(yRel) : 7.787 * yRel + 16 / 116;
  const fz = zRel > 0.008856 ? Math.cbrt(zRel) : 7.787 * zRel + 16 / 116;

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return {
    l: Math.round(l * 100) / 100,
    a: Math.round(a * 100) / 100,
    b: Math.round(b * 100) / 100,
  };
}

export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

export function rgbToHex(r: number, g: number, b: number): string {
  const cr = Math.min(255, Math.max(0, Math.round(r)));
  const cg = Math.min(255, Math.max(0, Math.round(g)));
  const cb = Math.min(255, Math.max(0, Math.round(b)));
  return `#${((1 << 24) + (cr << 16) + (cg << 8) + cb).toString(16).slice(1).toUpperCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function createColorData(r: number, g: number, b: number): ColorData {
  const cr = Math.min(255, Math.max(0, Math.round(r)));
  const cg = Math.min(255, Math.max(0, Math.round(g)));
  const cb = Math.min(255, Math.max(0, Math.round(b)));
  const hex = rgbToHex(cr, cg, cb);
  const lab = rgbToLab(cr, cg, cb);
  return { r: cr, g: cg, b: cb, hex, lab };
}

// Full CIELAB Delta-E 2000 (ΔE₀₀) Standard Implementation
export function calculateDeltaE2000(
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number }
): number {
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));

  const a1Prime = (1 + G) * a1;
  const a2Prime = (1 + G) * a2;

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

  let h1Prime = Math.atan2(b1, a1Prime) * rad2deg;
  if (h1Prime < 0) h1Prime += 360;

  let h2Prime = Math.atan2(b2, a2Prime) * rad2deg;
  if (h2Prime < 0) h2Prime += 360;

  const deltaLPrime = L2 - L1;
  const deltaCPrime = C2Prime - C1Prime;

  let deltahPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    const diff = h2Prime - h1Prime;
    if (Math.abs(diff) <= 180) {
      deltahPrime = diff;
    } else if (diff > 180) {
      deltahPrime = diff - 360;
    } else {
      deltahPrime = diff + 360;
    }
  }

  const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltahPrime * deg2rad) / 2);

  const LbarPrime = (L1 + L2) / 2;
  const CbarPrime = (C1Prime + C2Prime) / 2;

  let HbarPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    const sum = h1Prime + h2Prime;
    if (Math.abs(h1Prime - h2Prime) <= 180) {
      HbarPrime = sum / 2;
    } else if (sum < 360) {
      HbarPrime = (sum + 360) / 2;
    } else {
      HbarPrime = (sum - 360) / 2;
    }
  }

  const T =
    1 -
    0.17 * Math.cos((HbarPrime - 30) * deg2rad) +
    0.24 * Math.cos((2 * HbarPrime) * deg2rad) +
    0.32 * Math.cos((3 * HbarPrime + 6) * deg2rad) -
    0.2 * Math.cos((4 * HbarPrime - 63) * deg2rad);

  const deltaTheta = 30 * Math.exp(-Math.pow((HbarPrime - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(CbarPrime, 7) / (Math.pow(CbarPrime, 7) + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(LbarPrime - 50, 2)) / Math.sqrt(20 + Math.pow(LbarPrime - 50, 2));
  const SC = 1 + 0.045 * CbarPrime;
  const SH = 1 + 0.015 * CbarPrime * T;

  const RT = -Math.sin(2 * deltaTheta * deg2rad) * RC;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const termL = deltaLPrime / (kL * SL);
  const termC = deltaCPrime / (kC * SC);
  const termH = deltaHPrime / (kH * SH);

  const deltaE2000 = Math.sqrt(
    termL * termL +
    termC * termC +
    termH * termH +
    RT * termC * termH
  );

  return Math.round(deltaE2000 * 100) / 100;
}

// Convert Delta-E to intuitive human rating
export function getDeltaEInterpretation(deltaE: number): {
  rating: string;
  badgeClass: string;
  accuracy: number;
} {
  // Scale accuracy 0% to 100% where deltaE = 0 is 100%, deltaE = 20 is ~0%
  const accuracy = Math.max(0, Math.min(100, Math.round((1 - Math.min(deltaE, 20) / 20) * 1000) / 10));

  if (deltaE <= 0.8) {
    return {
      rating: 'Imperceptible Match (Perfection)',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/30',
      accuracy,
    };
  }
  if (deltaE <= 1.5) {
    return {
      rating: 'Exceptional Convergence',
      badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-cyan-500/30',
      accuracy,
    };
  }
  if (deltaE <= 2.2) {
    return {
      rating: 'Target Solved (< 2.2 ΔE)',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-yellow-500/30',
      accuracy,
    };
  }
  if (deltaE <= 5.0) {
    return {
      rating: 'Near Convergence',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/30',
      accuracy,
    };
  }
  return {
    rating: 'Spectrum Deviation',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/30',
    accuracy,
  };
}

// Kubelka-Munk (K/S) Subtractive Pigment Model
// Standard physical K (Absorption) and S (Scattering) coefficients across [R, G, B]
export interface PigmentCoefficients {
  k: [number, number, number];
  s: [number, number, number];
}

export const PIGMENT_KS: Record<string, PigmentCoefficients> = {
  // Cyan strongly absorbs Red (high Kr), low Kg/Kb, moderate scattering
  cyan: {
    k: [1.85, 0.12, 0.08],
    s: [0.35, 0.50, 0.65],
  },
  // Magenta strongly absorbs Green (high Kg)
  magenta: {
    k: [0.10, 1.95, 0.25],
    s: [0.55, 0.35, 0.50],
  },
  // Yellow strongly absorbs Blue (high Kb)
  yellow: {
    k: [0.08, 0.12, 1.92],
    s: [0.50, 0.65, 0.30],
  },
  // Carbon Black: extremely high absorption across all wavelengths, low scattering
  carbon: {
    k: [2.80, 2.80, 2.80],
    s: [0.15, 0.15, 0.15],
  },
  // Titanium White: high scattering across all wavelengths, near zero absorption
  titanium: {
    k: [0.02, 0.02, 0.02],
    s: [3.20, 3.20, 3.20],
  },
  // Neutral Base Solvent (clear/milky clean crucible baseline)
  solvent: {
    k: [0.08, 0.08, 0.08],
    s: [1.80, 1.80, 1.80],
  },
};

export function mixSubtractiveKubelkaMunk(
  pigmentVolumes: Record<string, number>,
  solventVolumeMl: number = 10.0
): ColorData {
  let totalVol = solventVolumeMl;
  Object.values(pigmentVolumes).forEach((v) => (totalVol += v));

  let mixK = [
    PIGMENT_KS.solvent.k[0] * solventVolumeMl,
    PIGMENT_KS.solvent.k[1] * solventVolumeMl,
    PIGMENT_KS.solvent.k[2] * solventVolumeMl,
  ];
  let mixS = [
    PIGMENT_KS.solvent.s[0] * solventVolumeMl,
    PIGMENT_KS.solvent.s[1] * solventVolumeMl,
    PIGMENT_KS.solvent.s[2] * solventVolumeMl,
  ];

  for (const [key, vol] of Object.entries(pigmentVolumes)) {
    if (vol <= 0) continue;
    const ks = PIGMENT_KS[key] || PIGMENT_KS.solvent;
    mixK[0] += ks.k[0] * vol;
    mixK[1] += ks.k[1] * vol;
    mixK[2] += ks.k[2] * vol;

    mixS[0] += ks.s[0] * vol;
    mixS[1] += ks.s[1] * vol;
    mixS[2] += ks.s[2] * vol;
  }

  // Kubelka-Munk reflectance: R = 1 + (K/S) - sqrt((K/S)^2 + 2*(K/S))
  const rgb: [number, number, number] = [0, 0, 0];

  for (let c = 0; c < 3; c++) {
    const kVal = mixK[c];
    const sVal = Math.max(0.001, mixS[c]);
    const ks = kVal / sVal;
    const rInf = 1 + ks - Math.sqrt(ks * ks + 2 * ks);
    // Linear reflectance to sRGB gamma (~2.2)
    const gammaC = Math.pow(Math.max(0, Math.min(1, rInf)), 1 / 2.2);
    rgb[c] = Math.round(gammaC * 255);
  }

  return createColorData(rgb[0], rgb[1], rgb[2]);
}

// Additive Optics Mixing (RGB Light Overlap)
export function mixAdditiveOptics(
  lightIntensities: { red: number; green: number; blue: number },
  ambientLumens: number = 0.05
): ColorData {
  // Max intensity is calibrated at 15.0 units for full saturation
  const scale = 255 / 15.0;
  const base = ambientLumens * 255;

  const r = Math.min(255, Math.round(base + lightIntensities.red * scale));
  const g = Math.min(255, Math.round(base + lightIntensities.green * scale));
  const b = Math.min(255, Math.round(base + lightIntensities.blue * scale));

  return createColorData(r, g, b);
}

// HSL Conversion for HUD Inspector
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr:
        h = (ng - nb) / d + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / d + 2;
        break;
      case nb:
        h = (nr - ng) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// CMYK Conversion for HUD Inspector
export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const k = 1 - Math.max(nr, ng, nb);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = (1 - nr - k) / (1 - k);
  const m = (1 - ng - k) / (1 - k);
  const y = (1 - nb - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Generate Spectral Reflectance distribution across visible wavelengths (380nm - 740nm in 10nm steps)
export function generateSpectralReflectanceCurve(color: ColorData): { wavelength: number; reflectance: number }[] {
  const points: { wavelength: number; reflectance: number }[] = [];
  const nr = color.r / 255;
  const ng = color.g / 255;
  const nb = color.b / 255;

  for (let w = 380; w <= 740; w += 15) {
    // Approximate Gaussian peaks for Blue (440nm), Green (535nm), Red (630nm)
    const blueContrib = Math.exp(-Math.pow((w - 440) / 45, 2)) * nb;
    const greenContrib = Math.exp(-Math.pow((w - 535) / 50, 2)) * ng;
    const redContrib = Math.exp(-Math.pow((w - 630) / 60, 2)) * nr;

    // Baseline reflection for lightness
    const baseline = (color.lab.l / 100) * 0.15;
    const reflectance = Math.min(1.0, Math.max(0.02, baseline + blueContrib * 0.7 + greenContrib * 0.7 + redContrib * 0.7));

    points.push({
      wavelength: w,
      reflectance: Math.round(reflectance * 100) / 100,
    });
  }

  return points;
}
