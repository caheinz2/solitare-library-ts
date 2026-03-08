import type { Card } from './types/cards.js';

export const copyPile = (pile: ReadonlyArray<Card>): ReadonlyArray<Card> =>
  pile.map((card) => ({ ...card }));
