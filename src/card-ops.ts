import { RANKS } from "./game-constants.js";
import type { Card } from "./types/cards.js";
import type { Foundation } from "./types/state.js";

const isAce = (card: Card): boolean => card.rank === "A";

const isSameSuit = (leftCard: Card, rightCard: Card): boolean =>
  leftCard.suit === rightCard.suit;

const isNextHighestRank = (lowerRankCard: Card, higherRankCard: Card): boolean => {
  const lowerRankIndex = RANKS.indexOf(lowerRankCard.rank);
  const higherRankIndex = RANKS.indexOf(higherRankCard.rank);

  return higherRankIndex === lowerRankIndex + 1;
};

export const canMoveCardToFoundation = (
  card: Card,
  foundation: Foundation,
): boolean => {
  const topFoundationCard = foundation.cards[foundation.cards.length - 1];

  if (!topFoundationCard) {
    return isAce(card);
  }

  return isSameSuit(topFoundationCard, card) && isNextHighestRank(topFoundationCard, card);
};
