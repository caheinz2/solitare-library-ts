import type {
  Card,
  Foundation,
  Foundations,
  GameView,
  Rank,
  Suit,
  Tableau,
} from "../src/types.js";

export const createCard = (rank: Rank, suit: Suit, faceUp = true): Card => ({
  rank,
  suit,
  faceUp,
});

export const createFoundation = (
  suit: Suit | null = null,
  cards: Card[] = [],
): Foundation => ({
  suit,
  cards,
});

export const createFoundations = (
  foundations: Partial<Record<number, Foundation>> = {},
): Foundations => {
  const foundationSet: Foundations = [
    createFoundation(),
    createFoundation(),
    createFoundation(),
    createFoundation(),
  ];

  Object.entries(foundations).forEach(([key, foundation]) => {
    foundationSet[Number(key) as 0 | 1 | 2 | 3] = foundation;
  });

  return foundationSet;
};

export const createTableau = (
  piles: Partial<Record<number, Card[]>> = {},
): Tableau => {
  const tableau: Tableau = [[], [], [], [], [], [], []];

  Object.entries(piles).forEach(([key, cards]) => {
    tableau[Number(key) as 0 | 1 | 2 | 3 | 4 | 5 | 6] = cards;
  });

  return tableau;
};

export const createGameView = (
  overrides: Partial<GameView> = {},
): GameView => ({
  stock: [],
  waste: [],
  foundations: createFoundations(),
  tableau: createTableau(),
  isWon: false,
  ...overrides,
});
