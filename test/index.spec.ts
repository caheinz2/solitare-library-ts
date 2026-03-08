import { Game } from "../src/index.js";
import type { Card, GameState } from "../src/index.js";

const createSequenceRng = (values: ReadonlyArray<number>): (() => number) => {
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

const getAllCards = (state: GameState): ReadonlyArray<Card> => [
  ...state.stock,
  ...state.waste,
  ...state.foundations[0],
  ...state.foundations[1],
  ...state.foundations[2],
  ...state.foundations[3],
  ...state.tableau[0],
  ...state.tableau[1],
  ...state.tableau[2],
  ...state.tableau[3],
  ...state.tableau[4],
  ...state.tableau[5],
  ...state.tableau[6],
];

describe("Game.create", () => {
  it("initializes tableau, stock, waste, and foundations with correct sizes", () => {
    const game = Game.create({ rng: () => 0.5 });
    const tableauSizes = game.state.tableau.map((pile) => pile.length);

    expect(tableauSizes).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(game.state.stock).toHaveLength(24);
    expect(game.state.waste).toHaveLength(0);
    expect(game.state.foundations).toHaveLength(4);
    game.state.foundations.forEach((foundationPile) => {
      expect(foundationPile).toHaveLength(0);
    });
  });

  it("sets only the top tableau card face up for each pile", () => {
    const game = Game.create({ rng: () => 0.5 });

    game.state.tableau.forEach((pile) => {
      pile.forEach((card, cardIndex) => {
        expect(card.faceUp).toBe(cardIndex === pile.length - 1);
      });
    });
  });

  it("keeps all stock cards face down", () => {
    const game = Game.create({ rng: () => 0.5 });

    game.state.stock.forEach((card) => {
      expect(card.faceUp).toBe(false);
    });
  });

  it("conserves all 52 unique cards across all piles", () => {
    const game = Game.create({ rng: () => 0.5 });
    const allCards = getAllCards(game.state);
    const uniqueCardKeys = new Set(
      allCards.map((card) => `${card.suit}-${card.rank}`),
    );

    expect(allCards).toHaveLength(52);
    expect(uniqueCardKeys.size).toBe(52);
  });

  it("is deterministic with the same rng sequence", () => {
    const rngValues = [0.12, 0.87, 0.33, 0.74];
    const gameA = Game.create({ rng: createSequenceRng(rngValues) });
    const gameB = Game.create({ rng: createSequenceRng(rngValues) });

    expect(gameA.state).toEqual(gameB.state);
  });

  it("produces different initial states for different rng sequences", () => {
    const gameA = Game.create({ rng: () => 0 });
    const gameB = Game.create({ rng: () => 0.999999999 });

    expect(gameA.state).not.toEqual(gameB.state);
  });
});

describe("Game actions", () => {
  it("throws Not implemented for action methods in this branch", () => {
    const game = Game.create({ rng: () => 0.5 });

    expect(() => game.draw()).toThrow("Not implemented");
    expect(() => game.moveWasteToTableau(0)).toThrow("Not implemented");
    expect(() => game.moveWasteToFoundation(0)).toThrow("Not implemented");
    expect(() => game.moveTableauToTableau(0, 1)).toThrow("Not implemented");
    expect(() => game.moveTableauToFoundation(0, 0)).toThrow("Not implemented");
  });
});
