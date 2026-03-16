import type { Card } from "../types/cards.js";
import type { Foundation, Foundations } from "../types/state.js";
import { isAce, isNextHighestRank, isSameSuit } from "./card-ops.js";
import { addCardToTop, copyStack, peekTopCard } from "./stack-ops.js";

export const canMoveCardToFoundation = (
  card: Card,
  foundation: Foundation,
): boolean => {
  const topFoundationCard = peekTopCard(foundation.cards);

  if (!topFoundationCard) {
    return isAce(card);
  }

  return (
    isSameSuit(topFoundationCard, card) &&
    isNextHighestRank(topFoundationCard, card)
  );
};

export const addCardToFoundation = (
  foundation: Foundation,
  card: Card,
): void => {
  card.faceUp = true;
  foundation.suit ??= card.suit;
  addCardToTop(foundation.cards, card);
};

export const copyFoundation = (foundation: Foundation): Foundation => ({
  suit: foundation.suit,
  cards: copyStack(foundation.cards),
});

export const createEmptyFoundations = (): Foundations => [
  { suit: null, cards: [] },
  { suit: null, cards: [] },
  { suit: null, cards: [] },
  { suit: null, cards: [] },
];
