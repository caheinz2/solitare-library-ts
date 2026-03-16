import type { Card } from "./types/cards.js";
import type {
  Foundation,
  FoundationIndex,
  Foundations,
  GameState,
  Stack,
  Tableau,
} from "./types/state.js";
import { canMoveCardToFoundation } from "./card-ops.js";
import { DRAW_COUNT, TABLEAU_INDICES } from "./game-constants.js";

type MoveHandler<TArgs extends ReadonlyArray<unknown> = []> = (
  state: GameState,
  ...args: TArgs
) => GameState;

const peekTopCard = <T>(pile: Stack<T>): T | undefined => pile[pile.length - 1];

const removeCardFromTop = <T>(pile: Stack<T>): T | undefined => pile.pop();

const addCardToTop = <T>(pile: Stack<T>, card: T): void => {
  pile.push(card);
};

const addCardToFoundation = (foundation: Foundation, card: Card): void => {
  card.faceUp = true;
  foundation.suit ??= card.suit;
  addCardToTop(foundation.cards, card);
};

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
      pile.push(nextCard);
    }
  }

  const stock = workingDeck;

  stock.forEach((card) => {
    card.faceUp = false;
  });

  const foundations: Foundations = [
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
  ];

  return {
    stock,
    waste: [],
    foundations,
    tableau,
  };
};

const drawFromStock = (state: GameState): GameState => {
  const cardsToDraw = Math.min(DRAW_COUNT, state.stock.length);

  for (let drawIndex = 0; drawIndex < cardsToDraw; drawIndex += 1) {
    const drawnCard = removeCardFromTop(state.stock);

    if (!drawnCard) {
      break;
    }

    drawnCard.faceUp = true;
    addCardToTop(state.waste, drawnCard);
  }

  return state;
};

const moveWasteBackToStock = (state: GameState): GameState => {
  while (state.waste.length > 0) {
    const card = removeCardFromTop(state.waste);

    if (!card) {
      break;
    }

    card.faceUp = false;
    addCardToTop(state.stock, card);
  }

  return state;
};

const isStockAndWasteEmpty = (state: GameState): boolean =>
  state.stock.length === 0 && state.waste.length === 0;

const isStockEmpty = (state: GameState): boolean => state.stock.length === 0;

export const drawCards = (state: GameState): GameState => {
  if (isStockAndWasteEmpty(state)) {
    return state;
  }

  if (isStockEmpty(state)) {
    moveWasteBackToStock(state);
  }

  drawFromStock(state);

  return state;
};

export const moveWasteCardToFoundation: MoveHandler<[FoundationIndex]> = (
  state,
  foundationIndex,
): GameState => {
  const cardToMove = peekTopCard(state.waste);

  if (!cardToMove) {
    return state;
  }

  const targetFoundation = state.foundations[foundationIndex];

  if (!canMoveCardToFoundation(cardToMove, targetFoundation)) {
    return state;
  }

  removeCardFromTop(state.waste);
  addCardToFoundation(targetFoundation, cardToMove);

  return state;
};
