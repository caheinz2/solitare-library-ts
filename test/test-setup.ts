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

export const createEmptyFoundations = (): Foundations => [
  createFoundation(),
  createFoundation(),
  createFoundation(),
  createFoundation(),
];

export const createEmptyTableau = (): Tableau => [[], [], [], [], [], [], []];

const PrivateGameConstructor = Game as unknown as new (
  state: GameState,
) => Game;

export const createGameFromState = (state: GameState): Game => {
  return new PrivateGameConstructor(state);
};
