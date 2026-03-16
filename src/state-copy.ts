import type { Card } from './types/cards.js';
import type { Foundation, Stack } from './types/state.js';

export const copyPile = (pile: Stack<Card>): Stack<Card> =>
  pile.map((card) => ({ ...card }));

export const copyFoundation = (foundation: Foundation): Foundation => ({
  suit: foundation.suit,
  cards: copyPile(foundation.cards),
});
