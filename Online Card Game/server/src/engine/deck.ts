import crypto from 'crypto';
import { Card, CardColor, CardType } from '../types.js';

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Generates a full Uno/Poker hybrid deck with cryptographic Fisher-Yates shuffle.
 */
export function generateShuffledDeck(): Card[] {
  const cards: Card[] = [];
  let cardSeq = 1;

  for (const color of COLORS) {
    // 0 once per color
    cards.push({
      id: `c_${cardSeq++}`,
      color,
      value: 0,
      type: 'number'
    });

    // 1-9 twice per color
    for (let v = 1; v <= 9; v++) {
      cards.push({
        id: `c_${cardSeq++}`,
        color,
        value: v,
        type: 'number'
      });
      cards.push({
        id: `c_${cardSeq++}`,
        color,
        value: v,
        type: 'number'
      });
    }

    // Action cards: Draw Two, Skip, Reverse (2 of each per color)
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `c_${cardSeq++}`,
        color,
        value: 10,
        type: 'draw_two'
      });
      cards.push({
        id: `c_${cardSeq++}`,
        color,
        value: 11,
        type: 'skip'
      });
      cards.push({
        id: `c_${cardSeq++}`,
        color,
        value: 12,
        type: 'reverse'
      });
    }
  }

  // Wild cards (4 standard Wild, 4 Wild Ante)
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `c_${cardSeq++}`,
      color: 'wild',
      value: 13,
      type: 'wild'
    });
    cards.push({
      id: `c_${cardSeq++}`,
      color: 'wild',
      value: 14,
      type: 'wild_ante'
    });
  }

  // Cryptographic Fisher-Yates Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }

  return cards;
}

/**
 * Validates whether a played card is legally playable against the top discard and active color.
 */
export function isPlayLegal(
  card: Card,
  topDiscard: Card | null,
  activeColor: CardColor
): boolean {
  if (!topDiscard) return true;

  // Wild cards can always be played
  if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_ante') {
    return true;
  }

  // Color matches active color
  if (card.color === activeColor) {
    return true;
  }

  // Value matches top discard value (e.g., Red 7 on Blue 7)
  if (card.value === topDiscard.value) {
    return true;
  }

  // Type matches for actions (e.g. Red Skip on Green Skip)
  if (card.type !== 'number' && card.type === topDiscard.type) {
    return true;
  }

  return false;
}
