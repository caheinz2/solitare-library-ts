import type { MoveHandler } from "../types/moves.js";
import type { FoundationIndex, TableauIndex } from "../types/state.js";
import { removeTopCardFromFoundation } from "../utils/foundation-ops.js";
import { peekTopCard } from "../utils/stack-ops.js";
import {
  addCardToTableau,
  canMoveCardToTableau,
} from "../utils/tableau-ops.js";

export const moveFoundationCardToTableau: MoveHandler<
  [FoundationIndex, TableauIndex]
> = (state, foundationIndex, tableauIndex) => {
  const sourceFoundation = state.foundations[foundationIndex];
  const cardToMove = peekTopCard(sourceFoundation.cards);

  if (!cardToMove) {
    return state;
  }

  const targetPile = state.tableau[tableauIndex];

  if (!canMoveCardToTableau(cardToMove, targetPile)) {
    return state;
  }

  removeTopCardFromFoundation(sourceFoundation);
  addCardToTableau(targetPile, cardToMove);

  return state;
};
