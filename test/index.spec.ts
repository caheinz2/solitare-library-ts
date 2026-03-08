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

const getStateSnapshot = (game: Game): GameState => ({
  stock: game.stock,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
});

const getAllCards = (game: Game): ReadonlyArray<Card> => [
  ...game.stock,
  ...game.waste,
  ...game.foundations[0],
  ...game.foundations[1],
  ...game.foundations[2],
  ...game.foundations[3],
  ...game.tableau[0],
  ...game.tableau[1],
  ...game.tableau[2],
  ...game.tableau[3],
  ...game.tableau[4],
  ...game.tableau[5],
  ...game.tableau[6],
];

describe("Game.create", () => {
  it("initializes tableau, stock, waste, and foundations with correct sizes", () => {
    const game = Game.create({ rng: () => 0.5 });
    const tableauSizes = game.tableau.map((pile) => pile.length);

    expect(tableauSizes).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(game.stock).toHaveLength(24);
    expect(game.waste).toHaveLength(0);
    expect(game.foundations).toHaveLength(4);
    game.foundations.forEach((foundationPile) => {
      expect(foundationPile).toHaveLength(0);
    });
  });

  it("sets only the top tableau card face up for each pile", () => {
    const game = Game.create({ rng: () => 0.5 });

    game.tableau.forEach((pile) => {
      pile.forEach((card, cardIndex) => {
        expect(card.faceUp).toBe(cardIndex === pile.length - 1);
      });
    });
  });

  it("keeps all stock cards face down", () => {
    const game = Game.create({ rng: () => 0.5 });

    game.stock.forEach((card) => {
      expect(card.faceUp).toBe(false);
    });
  });

  it("conserves all 52 unique cards across all piles", () => {
    const game = Game.create({ rng: () => 0.5 });
    const allCards = getAllCards(game);
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

    expect(getStateSnapshot(gameA)).toEqual(getStateSnapshot(gameB));
  });

  it("produces different initial states for different rng sequences", () => {
    const gameA = Game.create({ rng: () => 0 });
    const gameB = Game.create({ rng: () => 0.999999999 });

    expect(getStateSnapshot(gameA)).not.toEqual(getStateSnapshot(gameB));
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
