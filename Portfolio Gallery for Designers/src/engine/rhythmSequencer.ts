import type {
  ComputedArtifactMeta,
  ExhibitionRow,
  RhythmRowPattern,
} from '../types/portfolio';

/**
 * Visual Rhythm & Cross-Medium Diptych Sequencer
 *
 * Scores portfolio items by aspect ratio and visual complexity to alternate between:
 *  - Pattern A (full-stage): Single centered flagship or wide landscape plate
 *  - Pattern B (asymmetric-pair): Staggered 6/5 editorial pair with 96px downward offset
 *  - Pattern C (cross-medium-diptych): Equal-height side-by-side pairing (typically
 *    pairing design/typography/minimal work beside photography/intricate imagery)
 */
export function buildExhibitionSequence(items: ComputedArtifactMeta[]): ExhibitionRow[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ id: `row-0-${items[0].artifact.id}`, pattern: 'full-stage', items: [items[0]] }];
  }

  const remaining = [...items];
  const rows: ExhibitionRow[] = [];
  let rowIndex = 0;
  let lastPattern: RhythmRowPattern | null = null;

  while (remaining.length > 0) {
    const current = remaining.shift()!;
    const ar = current.computedAspectRatio;

    // Wide cinematic 16:9 or solo last frame -> Full Stage when appropriate
    const isFlagshipWide = ar >= 1.68;

    if (remaining.length === 0) {
      rows.push({
        id: `row-${rowIndex}-${current.artifact.id}`,
        pattern: 'full-stage',
        items: [current],
      });
      break;
    }

    if (isFlagshipWide && lastPattern !== 'full-stage') {
      rows.push({
        id: `row-${rowIndex}-${current.artifact.id}`,
        pattern: 'full-stage',
        items: [current],
      });
      lastPattern = 'full-stage';
      rowIndex++;
      continue;
    }

    // Score remaining candidates to find best partner for either Cross-Medium Diptych or Asymmetric Pair
    let bestCandidateIdx = 0;
    let bestScore = -Infinity;

    // Search next up to 4 items to preserve curated ranking while optimizing visual rhythm
    const searchWindow = Math.min(remaining.length, 4);
    for (let i = 0; i < searchWindow; i++) {
      const candidate = remaining[i];
      let score = 0;

      // Cross-medium contrast bonus (Design <-> Photography)
      if (candidate.artifact.kind !== current.artifact.kind) {
        score += 3.5;
      }

      // Visual complexity balance (Minimal paired with Intricate/Moderate)
      if (
        (current.artifact.complexity === 'minimal' && candidate.artifact.complexity !== 'minimal') ||
        (current.artifact.complexity !== 'minimal' && candidate.artifact.complexity === 'minimal')
      ) {
        score += 2.2;
      }

      // Equal-height aspect ratio synergy for side-by-side layout (ideal combined AR ~ 1.4 to 2.6)
      const combinedAr = ar + candidate.computedAspectRatio;
      if (combinedAr >= 1.4 && combinedAr <= 2.65) {
        score += 2.5;
      }

      // Slight penalty for jumping too far ahead of sequence
      score -= i * 0.6;

      if (score > bestScore) {
        bestScore = score;
        bestCandidateIdx = i;
      }
    }

    const partner = remaining.splice(bestCandidateIdx, 1)[0];
    const combinedAr = current.computedAspectRatio + partner.computedAspectRatio;

    // Choose Cross-Medium Diptych vs Asymmetric Editorial Pair
    const isCrossMedium = current.artifact.kind !== partner.artifact.kind;
    let chosenPattern: RhythmRowPattern;

    if (lastPattern === 'cross-medium-diptych') {
      chosenPattern = 'asymmetric-pair';
    } else if (lastPattern === 'asymmetric-pair' && combinedAr <= 2.9) {
      chosenPattern = 'cross-medium-diptych';
    } else if (isCrossMedium && combinedAr <= 2.85) {
      chosenPattern = 'cross-medium-diptych';
    } else {
      chosenPattern = rowIndex % 2 === 1 ? 'cross-medium-diptych' : 'asymmetric-pair';
    }

    rows.push({
      id: `row-${rowIndex}-${current.artifact.id}-${partner.artifact.id}`,
      pattern: chosenPattern,
      items: [current, partner],
      caption:
        chosenPattern === 'cross-medium-diptych'
          ? `${current.artifact.primaryDiscipline} × ${partner.artifact.primaryDiscipline} — Matched-Height Diptych`
          : undefined,
    });

    lastPattern = chosenPattern;
    rowIndex++;
  }

  return rows;
}

