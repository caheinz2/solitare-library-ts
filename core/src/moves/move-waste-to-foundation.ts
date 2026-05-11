import type { MoveHandler } from "../types/moves.js";
import type { FoundationIndex } from "../types/state.js";
import {
  addCardToFoundation,
  canMoveCardToFoundation,
} from "../utils/foundation-ops.js";
import { peekTopCard, removeTopCard } from "../utils/stack-ops.js";

export const moveWasteCardToFoundation: MoveHandler<[FoundationIndex]> = (
  state,
  foundationIndex,
) => {
  const cardToMove = peekTopCard(state.waste);

  if (!cardToMove) {
    return state;
  }

  const targetFoundation = state.foundations[foundationIndex];

  if (!canMoveCardToFoundation(cardToMove, targetFoundation)) {
    return state;
  }

  removeTopCard(state.waste);
  addCardToFoundation(targetFoundation, cardToMove);

  return state;
};
