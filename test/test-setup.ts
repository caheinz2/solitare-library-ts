import { Game } from "../src/index.js";
import type {
  Card,
  Foundation,
  Foundations,
  GameState,
  Rank,
  Suit,
  Tableau,
} from "../src/index.js";

export const createSequenceRng = (
  values: ReadonlyArray<number>,
): (() => number) => {
  let index = 0;

  return () => {
    const value = values[index % values.length];
    index += 1;

    if (value === undefined) {
      throw new Error("RNG sequence cannot be empty");
    }

    return value;
  };
};

export const getStateSnapshot = (game: Game): GameState => ({
  stock: game.stock,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
});

export const getCardKey = (card: Card): string => `${card.suit}-${card.rank}`;

export const createCard = (rank: Rank, suit: Suit, faceUp = true): Card => ({
  suit,
  rank,
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
  foundations: Partial<Record<number, Foundation>>,
): Foundations => {
  const foundationSet = createEmptyFoundations();

  Object.entries(foundations).forEach(([foundationIndex, foundation]) => {
    const index = Number(foundationIndex);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= foundationSet.length
    ) {
      throw new Error(`Invalid foundation index: ${foundationIndex}`);
    }

    if (!foundation) {
      throw new Error(`Expected foundation for index: ${foundationIndex}`);
    }

    foundationSet[index] = {
      suit: foundation.suit,
      cards: [...foundation.cards],
    };
  });

  return foundationSet;
};

export const createTableau = (
  piles: Partial<Record<number, Card[]>>,
): Tableau => {
  const tableau = createEmptyTableau();

  Object.entries(piles).forEach(([pileIndex, cards]) => {
    const index = Number(pileIndex);

    if (!Number.isInteger(index) || index < 0 || index >= tableau.length) {
      throw new Error(`Invalid tableau pile index: ${pileIndex}`);
    }

    if (!cards) {
      throw new Error(`Expected cards for tableau pile index: ${pileIndex}`);
    }

    tableau[index] = [...cards];
  });

  return tableau;
};

export const createGameWithState = (state: Partial<GameState>): Game => {
  return createGameFromState({
    stock: [],
    waste: [],
    foundations: createEmptyFoundations(),
    tableau: createEmptyTableau(),
    ...state,
  });
};

export const createGameWithNoState = (): Game => {
  return createGameWithState({});
};

const createEmptyFoundations = (): Foundations => [
  createFoundation(),
  createFoundation(),
  createFoundation(),
  createFoundation(),
];

const createEmptyTableau = (): Tableau => [[], [], [], [], [], [], []];

const PrivateGameConstructor = Game as unknown as new (
  state: GameState,
) => Game;

const createGameFromState = (state: GameState): Game => {
  return new PrivateGameConstructor(state);
};
