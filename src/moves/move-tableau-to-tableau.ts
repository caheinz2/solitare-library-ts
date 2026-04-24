import type { MoveHandler } from "../types/moves.js";
import type { TableauIndex } from "../types/state.js";
import {
  peekTopCard,
  removeTopCardAndFlipNext,
} from "../utils/stack-ops.js";
import {
  addCardToTableau,
  canMoveCardToTableau,
} from "../utils/tableau-ops.js";

export const moveTableauCardToTableau: MoveHandler<
  [TableauIndex, TableauIndex]
> = (state, from, to) => {
  if (from === to) {
    return state;
  }

  const sourcePile = state.tableau[from];
  const cardToMove = peekTopCard(sourcePile);

  if (!cardToMove || !cardToMove.faceUp) {
    return state;
  }

  const targetPile = state.tableau[to];

  if (!canMoveCardToTableau(cardToMove, targetPile)) {
    return state;
  }

  removeTopCardAndFlipNext(sourcePile);
  addCardToTableau(targetPile, cardToMove);

  return state;
};
