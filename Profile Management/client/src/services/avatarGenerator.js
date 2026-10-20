/**
 * Multi-Style Generative Fallback Avatar Engine
 * Generates dynamic, high-aesthetic generative avatars:
 * - Geometric Gradient Meshes
 * - Clean Initials Atelier
 * - Playful Algorithmic SVG Seeds
 */

const GRADIENT_PALETTES = [
  ['#2563EB', '#7C3AED', '#EC4899'], // Cobalt into Violet & Pink
  ['#0EA5E9', '#10B981', '#F59E0B'], // Cyan into Emerald & Amber
  ['#8B5CF6', '#3B82F6', '#06B6D4'], // Indigo into Electric Blue
  ['#F43F5E', '#FB923C', '#FBBF24'], // Rose into Sunset Peach
  ['#10B981', '#059669', '#047857'], // Deep Emerald Forest
  ['#1E293B', '#334155', '#64748B'], // Modern Obsidian Slate
  ['#D946EF', '#8B5CF6', '#6366F1'], // Cyberpunk Magenta Iris
  ['#0284C7', '#0EA5E9', '#38BDF8'], // Oceanic Depth
];

function stringToSeed(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 1. Generate Geometric Gradient Mesh SVG Data URL
 */
export function generateGradientAvatar(name = 'Alex Vance', size = 256) {
  const seed = stringToSeed(name);
  const palette = GRADIENT_PALETTES[seed % GRADIENT_PALETTES.length];
  const angle = (seed * 47) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
        <stop offset="0%" stop-color="${palette[0]}" />
        <stop offset="50%" stop-color="${palette[1]}" />
        <stop offset="100%" stop-color="${palette[2]}" />
      </linearGradient>
      <radialGradient id="glow-${seed}" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad-${seed})" />
    <rect width="${size}" height="${size}" fill="url(#glow-${seed})" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * 2. Generate Clean Initials Avatar Data URL
 */
export function generateInitialsAvatar(name = 'Alex Vance', size = 256) {
  const seed = stringToSeed(name);
  const palette = GRADIENT_PALETTES[seed % GRADIENT_PALETTES.length];
  
  const parts = name.trim().split(/\s+/);
  let initials = 'A';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts[0]) {
    initials = parts[0].substring(0, 2).toUpperCase();
  }

  const fontSize = Math.round(size * 0.42);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="init-grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette[0]}" />
        <stop offset="100%" stop-color="${palette[1]}" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#init-grad-${seed})" />
    <text 
      x="50%" 
      y="54%" 
      dominant-baseline="middle" 
      text-anchor="middle" 
      fill="#ffffff" 
      font-family="Inter, -apple-system, sans-serif" 
      font-weight="600" 
      font-size="${fontSize}"
      letter-spacing="-0.02em"
    >${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * 3. Generate Algorithmic SVG Geometric Seed Avatar Data URL
 */
export function generateGeometricSeedAvatar(name = 'Alex Vance', size = 256) {
  const seed = stringToSeed(name);
  const palette = GRADIENT_PALETTES[seed % GRADIENT_PALETTES.length];
  
  // Algorithmic 4x4 matrix shapes
  const gridSize = 4;
  const cellSize = size / gridSize;
  let shapes = '';

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Mirror horizontally for aesthetic symmetry
      const mirrorX = x < 2 ? x : gridSize - 1 - x;
      const cellSeed = (seed * 13 + mirrorX * 7 + y * 19) % 100;

      if (cellSeed > 40) {
        const color = cellSeed % 2 === 0 ? palette[0] : palette[1];
        const isCircle = cellSeed % 3 === 0;
        
        if (isCircle) {
          shapes += `<circle cx="${x * cellSize + cellSize / 2}" cy="${y * cellSize + cellSize / 2}" r="${cellSize * 0.45}" fill="${color}" opacity="0.85" />`;
        } else {
          shapes += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" opacity="0.85" rx="${cellSize * 0.2}" />`;
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#0A0B0E" />
    ${shapes}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
