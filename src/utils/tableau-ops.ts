import type { Card } from "../types/cards.js";
import type { TableauPile } from "../types/state.js";
import { isKing, isNextHighestRank, isOppositeColor } from "./card-ops.js";
import { addCardToTop, peekTopCard } from "./stack-ops.js";

export const canMoveCardToTableau = (
  card: Card,
  tableauPile: TableauPile,
): boolean => {
  const topTableauCard = peekTopCard(tableauPile);

  if (!topTableauCard) {
    return isKing(card);
  }

  if (!topTableauCard.faceUp) {
    return false;
  }

  return (
    isOppositeColor(card, topTableauCard) &&
    isNextHighestRank(card, topTableauCard)
  );
};

export const canMoveTableauRunToTableau = (
  sourcePile: TableauPile,
  targetPile: TableauPile,
  count: number,
): boolean => {
  if (!isValidTableauRunCount(sourcePile, count)) {
    return false;
  }

  const firstMovingCard = sourcePile[sourcePile.length - count];

  return (
    !!firstMovingCard?.faceUp &&
    canMoveCardToTableau(firstMovingCard, targetPile)
  );
};

export const addCardToTableau = (
  tableauPile: TableauPile,
  card: Card,
): void => {
  card.faceUp = true;
  addCardToTop(tableauPile, card);
};

export const addCardsToTableau = (
  tableauPile: TableauPile,
  cards: TableauPile,
): void => {
  tableauPile.push(...cards);
};

export const removeTableauRun = (
  tableauPile: TableauPile,
  count: number,
): TableauPile => {
  return tableauPile.splice(tableauPile.length - count);
};

export const revealTopTableauCard = (tableauPile: TableauPile): void => {
  const topCard = peekTopCard(tableauPile);

  if (!topCard) {
    return;
  }

  topCard.faceUp = true;
};

const isValidTableauRunCount = (
  tableauPile: TableauPile,
  count: number,
): boolean => count >= 1 && tableauPile.length >= count;
