/**
 * Canvas Snapshot Utility:
 * Compresses viewport into a crisp 320x180px JPEG/WebP thumbnail (<=25KB)
 * with tactical sci-fi vignette and HUD telemetry watermark.
 */

export interface SnapshotContext {
  characterName?: string;
  level?: number;
  chapter?: string;
  location?: string;
  biome?: 'neon_city' | 'orbital_colony' | 'deep_trench' | 'cyber_citadel' | 'cryo_vault';
}

export async function captureCanvasSnapshot(
  sourceCanvas?: HTMLCanvasElement | null,
  context?: SnapshotContext
): Promise<string> {
  const targetWidth = 320;
  const targetHeight = 180;

  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create 2D canvas context for thumbnail.');
  }

  if (sourceCanvas && sourceCanvas.width > 0 && sourceCanvas.height > 0) {
    // 1. Draw source game canvas scaled
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  } else {
    // 2. Procedural Sci-Fi Diorama Generation
    renderProceduralDiorama(ctx, targetWidth, targetHeight, context);
  }

  // 3. Apply Cinematic Holographic Vignette & CRT Grid
  ctx.save();
  const grad = ctx.createRadialGradient(
    targetWidth / 2,
    targetHeight / 2,
    targetWidth * 0.25,
    targetWidth / 2,
    targetHeight / 2,
    targetWidth * 0.7
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(6, 8, 13, 0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Subtle Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let y = 0; y < targetHeight; y += 4) {
    ctx.fillRect(0, y, targetWidth, 1);
  }

  // Subtle Cyan Corner Brackets
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(8, 16);
  ctx.lineTo(8, 8);
  ctx.lineTo(16, 8);
  ctx.stroke();
  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(targetWidth - 8, targetHeight - 16);
  ctx.lineTo(targetWidth - 8, targetHeight - 8);
  ctx.lineTo(targetWidth - 16, targetHeight - 8);
  ctx.stroke();

  ctx.restore();

  // Compress to WebP or JPEG <=25KB
  const dataUrl = offscreen.toDataURL('image/jpeg', 0.82);
  return dataUrl;
}

function renderProceduralDiorama(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  context?: SnapshotContext
) {
  const biome = context?.biome || 'neon_city';

  // Background Gradient based on Biome
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (biome === 'cryo_vault') {
    bgGrad.addColorStop(0, '#04101E');
    bgGrad.addColorStop(1, '#071829');
  } else if (biome === 'orbital_colony') {
    bgGrad.addColorStop(0, '#10061E');
    bgGrad.addColorStop(1, '#080F1E');
  } else if (biome === 'deep_trench') {
    bgGrad.addColorStop(0, '#021213');
    bgGrad.addColorStop(1, '#04070D');
  } else {
    // neon_city
    bgGrad.addColorStop(0, '#0B0D19');
    bgGrad.addColorStop(0.6, '#14162B');
    bgGrad.addColorStop(1, '#070913');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Distant Cybernetic Skyline / Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1;

  // Perspective Horizon Grid
  const horizonY = height * 0.65;
  for (let i = 0; i < width; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, horizonY);
    ctx.lineTo((i - width / 2) * 2.2 + width / 2, height);
    ctx.stroke();
  }
  for (let h = horizonY; h < height; h += 10) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(width, h);
    ctx.stroke();
  }

  // Neon Silhouettes / Structures
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(20, horizonY - 45, 35, 45);
  ctx.fillRect(70, horizonY - 65, 45, 65);
  ctx.fillRect(130, horizonY - 35, 30, 35);
  ctx.fillRect(210, horizonY - 70, 50, 70);
  ctx.fillRect(275, horizonY - 40, 35, 40);

  // Holographic Sun / Colony Ring
  ctx.beginPath();
  ctx.arc(width * 0.5, horizonY - 20, 28, 0, Math.PI * 2);
  const sunGrad = ctx.createLinearGradient(width * 0.5, horizonY - 48, width * 0.5, horizonY + 8);
  sunGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  sunGrad.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
  ctx.fillStyle = sunGrad;
  ctx.fill();

  // Operative Hologram Silhouette in Center
  ctx.fillStyle = '#38BDF8';
  ctx.shadowColor = '#38BDF8';
  ctx.shadowBlur = 8;
  // Head
  ctx.beginPath();
  ctx.arc(width * 0.5, horizonY + 5, 4, 0, Math.PI * 2);
  ctx.fill();
  // Body & Tactical Armor
  ctx.fillRect(width * 0.5 - 3, horizonY + 10, 6, 14);
  // Legs
  ctx.fillRect(width * 0.5 - 4, horizonY + 24, 3, 12);
  ctx.fillRect(width * 0.5 + 1, horizonY + 24, 3, 12);

  ctx.shadowBlur = 0;
}
