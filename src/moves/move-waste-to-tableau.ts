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

export const moveWasteCardToTableau: MoveHandler<[TableauIndex]> = (
  state,
  tableauIndex,
) => {
  const cardToMove = peekTopCard(state.waste);

  if (!cardToMove) {
    return state;
  }

  const targetPile = state.tableau[tableauIndex];

  if (!canMoveCardToTableau(cardToMove, targetPile)) {
    return state;
  }

  removeTopCardAndFlipNext(state.waste);
  addCardToTableau(targetPile, cardToMove);

  return state;
};
