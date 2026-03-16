import type { Card } from "./types/cards.js";
import type {
  Foundation,
  FoundationIndex,
  Foundations,
  GameState,
  Tableau,
} from "./types/state.js";
import { DRAW_COUNT, RANKS, TABLEAU_INDICES } from "./game-constants.js";

type MoveHandler<TArgs extends ReadonlyArray<unknown> = []> = (
  state: GameState,
  ...args: TArgs
) => GameState;

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
    const drawnCard = state.stock.pop();

    if (!drawnCard) {
      break;
    }

    drawnCard.faceUp = true;
    state.waste.push(drawnCard);
  }

  return state;
};

const moveWasteBackToStock = (state: GameState): GameState => {
  while (state.waste.length > 0) {
    const card = state.waste.pop();

    if (!card) {
      break;
    }

    card.faceUp = false;
    state.stock.push(card);
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
  const cardToMove = state.waste[state.waste.length - 1];

  if (!cardToMove) {
    return state;
  }

  const targetFoundation = state.foundations[foundationIndex];
  const topFoundationCard =
    targetFoundation.cards[targetFoundation.cards.length - 1];

  if (!topFoundationCard && cardToMove.rank !== "A") {
    return state;
  }

  if (topFoundationCard) {
    const cardRankIndex = RANKS.indexOf(cardToMove.rank);
    const topRankIndex = RANKS.indexOf(topFoundationCard.rank);

    if (
      targetFoundation.suit !== cardToMove.suit ||
      cardRankIndex !== topRankIndex + 1
    ) {
      return state;
    }
  }

  state.waste.pop();
  cardToMove.faceUp = true;
  targetFoundation.suit ??= cardToMove.suit;
  targetFoundation.cards.push(cardToMove);

  return state;
};
