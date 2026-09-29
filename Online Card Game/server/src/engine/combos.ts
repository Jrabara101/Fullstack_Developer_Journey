import { Card, CardColor } from '../types.js';

export interface MeldEvaluation {
  isMeld: boolean;
  name: string;
  potMultiplier: number;
  bonusChips: number;
  description: string;
}

/**
 * Evaluates a set of cards played together as a Poker-Uno Meld.
 */
export function evaluateMeld(cards: Card[]): MeldEvaluation {
  if (cards.length < 2) {
    return {
      isMeld: false,
      name: 'Single Card',
      potMultiplier: 1.0,
      bonusChips: 0,
      description: 'Standard single card play'
    };
  }

  const count = cards.length;
  const colors = cards.map(c => c.color).filter(c => c !== 'wild');
  const values = cards.map(c => c.value).sort((a, b) => a - b);

  const allSameColor = colors.length > 0 && colors.every(c => c === colors[0]);
  const colorName = allSameColor ? `${colors[0].toUpperCase()} ` : '';

  // Check for Straight (numerical consecutive sequence)
  const isNumberOnly = cards.every(c => c.type === 'number');
  let isStraight = isNumberOnly;
  if (isStraight) {
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        isStraight = false;
        break;
      }
    }
  }

  // Check for all same values (Pairs, Triples, Quads)
  const allSameValue = values.every(v => v === values[0]);

  // 1. Straight Flush (3+ consecutive numbers of the SAME color)
  if (isStraight && allSameColor && count >= 3) {
    return {
      isMeld: true,
      name: `${colorName}Straight Flush (${count}x)`,
      potMultiplier: 2.5,
      bonusChips: count * 50,
      description: `Incredible! ${count} consecutive ${colorName.toLowerCase()} cards sweeping massive pot shares.`
    };
  }

  // 2. Pure Flush (3+ cards of identical color)
  if (allSameColor && count >= 3) {
    return {
      isMeld: true,
      name: `${colorName}Flush (${count}-Card)`,
      potMultiplier: 2.0,
      bonusChips: count * 35,
      description: `${count} matching ${colorName.toLowerCase()} cards combined into a pot-sweeping flush.`
    };
  }

  // 3. Multi-Value Set (Pair, Trips, Quads)
  if (allSameValue) {
    const setName = count === 2 ? 'Pair' : count === 3 ? 'Three-of-a-Kind' : 'Four-of-a-Kind';
    return {
      isMeld: true,
      name: `${setName} of [${values[0]}]`,
      potMultiplier: count === 2 ? 1.2 : count === 3 ? 1.8 : 2.5,
      bonusChips: count * 25,
      description: `Matched ${count} cards of rank ${values[0]}!`
    };
  }

  // 4. Rainbow Straight (3+ consecutive numbers across different colors)
  if (isStraight && count >= 3) {
    return {
      isMeld: true,
      name: `Rainbow Straight (${count}-Run)`,
      potMultiplier: 1.6,
      bonusChips: count * 30,
      description: `${count} sequential number cards crossing multiple suits.`
    };
  }

  // 5. Dual Flush (2 cards same color)
  if (allSameColor && count === 2) {
    return {
      isMeld: true,
      name: `${colorName}Mini Flush`,
      potMultiplier: 1.2,
      bonusChips: 20,
      description: `Dual ${colorName.toLowerCase()} card combo.`
    };
  }

  return {
    isMeld: false,
    name: 'Uncoordinated Meld',
    potMultiplier: 1.0,
    bonusChips: 0,
    description: 'Cards do not form a recognized poker meld'
  };
}
