import type { Card } from "../types/cards.js";
import type { TableauPile } from "../types/state.js";
import {
  isKing,
  isNextHighestRank,
  isOppositeColor,
} from "./card-ops.js";
import { addCardToTop, peekTopCard } from "./stack-ops.js";

export const canMoveCardToTableau = (
  card: Card,
  tableauPile: TableauPile,
): boolean => {
  const topTableauCard = peekTopCard(tableauPile);

  if (!topTableauCard) {
    return isKing(card);
  }

  return (
    topTableauCard.faceUp &&
    isOppositeColor(card, topTableauCard) &&
    isNextHighestRank(card, topTableauCard)
  );
};

export const addCardToTableau = (
  tableauPile: TableauPile,
  card: Card,
): void => {
  card.faceUp = true;
  addCardToTop(tableauPile, card);
};
