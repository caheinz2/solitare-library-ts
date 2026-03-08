import type { Card } from './types/cards.js';
import { RANKS, SUITS } from './game-constants.js';

export const createOrderedDeck = (): ReadonlyArray<Card> => {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }

  return deck;
};

export const shuffleDeck = (
  deck: ReadonlyArray<Card>,
  rng: () => number,
): ReadonlyArray<Card> => {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled;
};
