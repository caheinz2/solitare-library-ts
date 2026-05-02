import type { MoveHandler } from "../types/moves.js";
import type { TableauIndex } from "../types/state.js";
import {
  addCardsToTableau,
  canMoveTableauRunToTableau,
  removeTableauRun,
  revealTopTableauCard,
} from "../utils/tableau-ops.js";

export const moveTableauCardsToTableau: MoveHandler<
  [TableauIndex, TableauIndex, number?]
> = (state, from, to, count = 1) => {
  if (from === to) {
    return state;
  }

  const sourcePile = state.tableau[from];
  const targetPile = state.tableau[to];

  if (!canMoveTableauRunToTableau(sourcePile, targetPile, count)) {
    return state;
  }

  const movingCards = removeTableauRun(sourcePile, count);
  revealTopTableauCard(sourcePile);
  addCardsToTableau(targetPile, movingCards);

  return state;
};
