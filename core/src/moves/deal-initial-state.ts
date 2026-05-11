import { TABLEAU_INDICES } from "../game-constants.js";
import type { Card } from "../types/cards.js";
import type { GameState, Tableau } from "../types/state.js";
import { createEmptyFoundations } from "../utils/foundation-ops.js";
import { addCardToTop } from "../utils/stack-ops.js";

export const dealInitialState = (deck: ReadonlyArray<Card>): GameState => {
  const workingDeck = [...deck];
  const tableau: Tableau = [[], [], [], [], [], [], []];

  for (const tableauIndex of TABLEAU_INDICES) {
    const pileSize = tableauIndex + 1;
    const pile = tableau[tableauIndex];

    for (let cardIndex = 0; cardIndex < pileSize; cardIndex += 1) {
      const nextCard = workingDeck.pop();

      if (!nextCard) {
        throw new Error("Cannot initialize game with an incomplete deck");
      }

      nextCard.faceUp = cardIndex === pileSize - 1;
      addCardToTop(pile, nextCard);
    }
  }

  const stock = workingDeck;

  stock.forEach((card) => {
    card.faceUp = false;
  });

  return {
    stock,
    waste: [],
    foundations: createEmptyFoundations(),
    tableau,
  };
};
