// Server-side authoritative colorimetry engine

export interface ColorData {
  r: number;
  g: number;
  b: number;
  hex: string;
  lab: { l: number; a: number; b: number };
}

export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const rLinear = sR > 0.04045 ? Math.pow((sR + 0.055) / 1.055, 2.4) : sR / 12.92;
  const gLinear = sG > 0.04045 ? Math.pow((sG + 0.055) / 1.055, 2.4) : sG / 12.92;
  const bLinear = sB > 0.04045 ? Math.pow((sB + 0.055) / 1.055, 2.4) : sB / 12.92;

  const x = (rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375) * 100;
  const y = (rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750) * 100;
  const z = (rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041) * 100;

  return [x, y, z];
}

export function xyzToLab(x: number, y: number, z: number): { l: number; a: number; b: number } {
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

export function createColorData(r: number, g: number, b: number): ColorData {
  const cr = Math.min(255, Math.max(0, Math.round(r)));
  const cg = Math.min(255, Math.max(0, Math.round(g)));
  const cb = Math.min(255, Math.max(0, Math.round(b)));
  return {
    r: cr,
    g: cg,
    b: cb,
    hex: rgbToHex(cr, cg, cb),
    lab: rgbToLab(cr, cg, cb),
  };
}

// Server CIELAB Delta-E 2000
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

  const termL = deltaLPrime / SL;
  const termC = deltaCPrime / SC;
  const termH = deltaHPrime / SH;

  const deltaE2000 = Math.sqrt(
    termL * termL +
    termC * termC +
    termH * termH +
    RT * termC * termH
  );

  return Math.round(deltaE2000 * 100) / 100;
}

// Server Kubelka-Munk Subtractive Pigment Model
const PIGMENT_KS: Record<string, { k: [number, number, number]; s: [number, number, number] }> = {
  cyan: { k: [1.85, 0.12, 0.08], s: [0.35, 0.5, 0.65] },
  magenta: { k: [0.1, 1.95, 0.25], s: [0.55, 0.35, 0.5] },
  yellow: { k: [0.08, 0.12, 1.92], s: [0.5, 0.65, 0.3] },
  carbon: { k: [2.8, 2.8, 2.8], s: [0.15, 0.15, 0.15] },
  titanium: { k: [0.02, 0.02, 0.02], s: [3.2, 3.2, 3.2] },
  solvent: { k: [0.08, 0.08, 0.08], s: [1.8, 1.8, 1.8] },
};

export function mixSubtractiveKubelkaMunk(
  pigmentVolumes: Record<string, number>,
  solventVolumeMl: number = 10.0
): ColorData {
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

  const rgb: [number, number, number] = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const kVal = mixK[c];
    const sVal = Math.max(0.001, mixS[c]);
    const ks = kVal / sVal;
    const rInf = 1 + ks - Math.sqrt(ks * ks + 2 * ks);
    const gammaC = Math.pow(Math.max(0, Math.min(1, rInf)), 1 / 2.2);
    rgb[c] = Math.round(gammaC * 255);
  }

  return createColorData(rgb[0], rgb[1], rgb[2]);
}

export function mixAdditiveOptics(
  lightIntensities: { red: number; green: number; blue: number }
): ColorData {
  const scale = 255 / 15.0;
  const base = 0.05 * 255;

  const r = Math.min(255, Math.round(base + (lightIntensities.red || 0) * scale));
  const g = Math.min(255, Math.round(base + (lightIntensities.green || 0) * scale));
  const b = Math.min(255, Math.round(base + (lightIntensities.blue || 0) * scale));

  return createColorData(r, g, b);
}

// Replay action log to authorize client result
export function recomputeActionLog(
  operations: { tool: string; reagentId: string; volumeMl: number }[],
  isSubtractive: boolean = true
): { finalColor: ColorData; totalVolumeMl: number } {
  const volumes: Record<string, number> = {};

  operations.forEach((op) => {
    if (op.tool === 'flush') {
      Object.keys(volumes).forEach((k) => delete volumes[k]);
    } else {
      volumes[op.reagentId] = (volumes[op.reagentId] || 0) + op.volumeMl;
    }
  });

  if (isSubtractive) {
    const finalColor = mixSubtractiveKubelkaMunk(volumes, 10.0);
    let totalVol = 10.0;
    Object.values(volumes).forEach((v) => (totalVol += v));
    return { finalColor, totalVolumeMl: Math.round(totalVol * 10) / 10 };
  } else {
    const finalColor = mixAdditiveOptics({
      red: volumes['red'] || 0,
      green: volumes['green'] || 0,
      blue: volumes['blue'] || 0,
    });
    let totalVol = 0;
    Object.values(volumes).forEach((v) => (totalVol += v));
    return { finalColor, totalVolumeMl: Math.round(totalVol * 10) / 10 };
  }
}
