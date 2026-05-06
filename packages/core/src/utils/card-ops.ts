import { RANKS } from "../game-constants.js";
import type { Card } from "../types/cards.js";

export const isAce = (card: Card): boolean => card.rank === "A";

export const isKing = (card: Card): boolean => card.rank === "K";

export const isSameSuit = (leftCard: Card, rightCard: Card): boolean =>
  leftCard.suit === rightCard.suit;

const isRed = (card: Card): boolean =>
  card.suit === "diamonds" || card.suit === "hearts";

export const isOppositeColor = (leftCard: Card, rightCard: Card): boolean =>
  isRed(leftCard) !== isRed(rightCard);

export const isNextHighestRank = (
  lowerRankCard: Card,
  higherRankCard: Card,
): boolean => {
  const lowerRankIndex = RANKS.indexOf(lowerRankCard.rank);
  const higherRankIndex = RANKS.indexOf(higherRankCard.rank);

  return higherRankIndex === lowerRankIndex + 1;
};
