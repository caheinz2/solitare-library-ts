import type { Card } from "./types/cards.js";
import type { Foundation, GameState, Stock, Waste } from "./types/state.js";
import { DRAW_COUNT, TABLEAU_INDICES } from "./game-constants.js";

const createEmptyFoundation = (): Foundation => ({
  suit: null,
  cards: [],
});

export const dealInitialState = (deck: ReadonlyArray<Card>): GameState => {
  const workingDeck = [...deck];
  const tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  for (const tableauIndex of TABLEAU_INDICES) {
    const pileSize = tableauIndex + 1;
    const pile = tableau[tableauIndex];

    for (let cardIndex = 0; cardIndex < pileSize; cardIndex += 1) {
      const nextCard = workingDeck.pop();

      if (!nextCard) {
        throw new Error("Cannot initialize game with an incomplete deck");
      }

      pile.push({
        ...nextCard,
        faceUp: cardIndex === pileSize - 1,
      });
    }
  }

  const stock = workingDeck.map((card) => ({ ...card, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [
      createEmptyFoundation(),
      createEmptyFoundation(),
      createEmptyFoundation(),
      createEmptyFoundation(),
    ],
    tableau,
  };
};

const drawFromStock = (
  stock: Stock,
  waste: Waste,
): Pick<GameState, "stock" | "waste"> => {
  const nextStock = [...stock];
  const nextWaste = [...waste];
  const cardsToDraw = Math.min(DRAW_COUNT, nextStock.length);

  for (let drawIndex = 0; drawIndex < cardsToDraw; drawIndex += 1) {
    const drawnCard = nextStock.pop();

    if (!drawnCard) {
      break;
    }

    nextWaste.push({
      ...drawnCard,
      faceUp: true,
    });
  }

  return {
    stock: nextStock,
    waste: nextWaste,
  };
};

const moveWasteBackToStock = (state: GameState): GameState => {
  const recycledStock = [...state.waste]
    .reverse()
    .map((card) => ({ ...card, faceUp: false }));

  return {
    ...state,
    stock: recycledStock,
    waste: [],
  };
};

const isStockAndWasteEmpty = (state: GameState): boolean =>
  state.stock.length === 0 && state.waste.length === 0;

const hasCardsInStock = (state: GameState): boolean => state.stock.length > 0;

export const drawCards = (state: GameState): GameState => {
  if (isStockAndWasteEmpty(state)) {
    return state;
  }

  const drawableState = hasCardsInStock(state)
    ? state
    : moveWasteBackToStock(state);

  return {
    ...drawableState,
    ...drawFromStock(drawableState.stock, drawableState.waste),
  };
};
