import { DRAW_COUNT } from "../game-constants.js";
import { addCardToTop, removeTopCard } from "../utils/stack-ops.js";
import { isStockAndWasteEmpty, isStockEmpty } from "../utils/state-ops.js";
import type { MoveHandler } from "../types/moves.js";
import { GameState } from "../types/state.js";

const moveWasteBackToStock = (state: GameState) => {
  while (state.waste.length > 0) {
    const card = removeTopCard(state.waste);

    if (!card) {
      break;
    }

    card.faceUp = false;
    addCardToTop(state.stock, card);
  }

  return state;
};

const drawFromStock = (state: GameState) => {
  const cardsToDraw = Math.min(DRAW_COUNT, state.stock.length);

  for (let drawIndex = 0; drawIndex < cardsToDraw; drawIndex += 1) {
    const drawnCard = removeTopCard(state.stock);

    if (!drawnCard) {
      break;
    }

    drawnCard.faceUp = true;
    addCardToTop(state.waste, drawnCard);
  }

  return state;
};

export const drawCards: MoveHandler = (state) => {
  if (isStockAndWasteEmpty(state)) {
    return state;
  }

  if (isStockEmpty(state)) {
    moveWasteBackToStock(state);
  }

  return drawFromStock(state);
};
