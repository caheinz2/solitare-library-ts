import type { MoveHandler } from "../types/moves.js";
import type { FoundationIndex, TableauIndex } from "../types/state.js";
import {
  addCardToFoundation,
  canMoveCardToFoundation,
} from "../utils/foundation-ops.js";
import {
  flipTopCardFaceUp,
  peekTopCard,
  removeTopCard,
} from "../utils/stack-ops.js";

export const moveTableauCardToFoundation: MoveHandler<
  [TableauIndex, FoundationIndex]
> = (state, tableauIndex, foundationIndex) => {
  const sourcePile = state.tableau[tableauIndex];
  const cardToMove = peekTopCard(sourcePile);

  if (!cardToMove || !cardToMove.faceUp) {
    return state;
  }

  const targetFoundation = state.foundations[foundationIndex];

  if (!canMoveCardToFoundation(cardToMove, targetFoundation)) {
    return state;
  }

  removeTopCard(sourcePile);
  addCardToFoundation(targetFoundation, cardToMove);
  flipTopCardFaceUp(sourcePile);

  return state;
};
