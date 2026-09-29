import { MixOperation, ColorData } from '../types/color';

// Reagent emoji symbols
const REAGENT_EMOJIS: Record<string, string> = {
  cyan: '🟦',
  magenta: '🟪',
  yellow: '🟨',
  carbon: '⬛',
  titanium: '⬜',
  red: '🟥',
  green: '🟩',
  blue: '🟦',
};

export function generateShareString(
  puzzleId: string,
  history: MixOperation[],
  deltaE: number,
  movesUsed: number,
  maxMoves: number,
  timeElapsedMs: number,
  isDaily: boolean = true,
  isVerified: boolean = true
): string {
  const seconds = Math.floor(timeElapsedMs / 1000);
  const timeFormatted = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  // Build emoji trail (max 8 emojis)
  const trail = history
    .slice(0, 10)
    .map((op) => REAGENT_EMOJIS[op.reagentId] || '🧪')
    .join(' ');

  const ratingEmoji = deltaE <= 0.8 ? '🏆' : deltaE <= 1.5 ? '⭐' : '🧪';
  const matchPercent = Math.max(0, Math.min(100, Math.round((1 - Math.min(deltaE, 20) / 20) * 1000) / 10));

  return [
    `🧪 ChromaLab ${isDaily ? `Daily [${puzzleId}]` : `Lab [${puzzleId}]`}`,
    `${ratingEmoji} Precision: ${matchPercent}% (ΔE ${deltaE.toFixed(2)})`,
    `⚖️ Moves: ${movesUsed}/${maxMoves} • Time: ${timeFormatted}`,
    `🔬 Formulation:`,
    `${trail} 🧪`,
    isVerified ? `🛡️ Server-Authoritative Certified ✓` : `Client Synthesized`,
  ].join('\n');
}
