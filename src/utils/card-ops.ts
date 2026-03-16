import { RANKS } from "../game-constants.js";
import type { Card } from "../types/cards.js";

export const isAce = (card: Card): boolean => card.rank === "A";

export const isSameSuit = (leftCard: Card, rightCard: Card): boolean =>
  leftCard.suit === rightCard.suit;

export const isNextHighestRank = (
  lowerRankCard: Card,
  higherRankCard: Card,
): boolean => {
  const lowerRankIndex = RANKS.indexOf(lowerRankCard.rank);
  const higherRankIndex = RANKS.indexOf(higherRankCard.rank);

  return higherRankIndex === lowerRankIndex + 1;
};
