import { Game } from "../src/index.js";
import type { Card, GameState, Suit } from "../src/index.js";

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
  ...game.foundations[0].cards,
  ...game.foundations[1].cards,
  ...game.foundations[2].cards,
  ...game.foundations[3].cards,
  ...game.tableau[0],
  ...game.tableau[1],
  ...game.tableau[2],
  ...game.tableau[3],
  ...game.tableau[4],
  ...game.tableau[5],
  ...game.tableau[6],
];

const getCardKey = (card: Card): string => `${card.suit}-${card.rank}`;

const expectConservedUniqueDeck = (game: Game): void => {
  const allCards = getAllCards(game);
  const uniqueCardKeys = new Set(allCards.map(getCardKey));

  expect(allCards).toHaveLength(52);
  expect(uniqueCardKeys.size).toBe(52);
};

describe("Game.create", () => {
  it("initializes tableau, stock, waste, and foundations with correct sizes", () => {
    const game = Game.create({ rng: () => 0.5 });
    const tableauSizes = game.tableau.map((pile) => pile.length);

    expect(tableauSizes).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(game.stock).toHaveLength(24);
    expect(game.waste).toHaveLength(0);
    expect(game.foundations).toHaveLength(4);
    game.foundations.forEach((foundation) => {
      expect(foundation.suit).toBeNull();
      expect(foundation.cards).toHaveLength(0);
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

    expectConservedUniqueDeck(game);
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

describe("Game immutability", () => {
  it("returns defensive copies from stock and tableau getters", () => {
    const game = Game.create({ rng: () => 0.5 });
    const stockView = game.stock as unknown as Card[];
    const tableauView = game.tableau;
    const firstTableauCard = tableauView[0][0];

    if (!firstTableauCard) {
      throw new Error("Expected at least one card in tableau pile 0");
    }

    const mutableCard = firstTableauCard as unknown as { faceUp: boolean };
    const beforeState = getStateSnapshot(game);

    stockView.push({ suit: "clubs", rank: "A", faceUp: false });
    mutableCard.faceUp = false;

    const afterState = getStateSnapshot(game);
    const freshStock = game.stock;
    const freshTopTableauCard = game.tableau[0][0];

    if (!freshTopTableauCard) {
      throw new Error("Expected at least one card in tableau pile 0");
    }

    expect(stockView).not.toBe(freshStock);
    expect(stockView).toHaveLength(25);
    expect(freshStock).toHaveLength(24);
    expect(freshTopTableauCard.faceUp).toBe(true);
    expect(afterState).toEqual(beforeState);
  });

  it("returns defensive copies from foundation getters", () => {
    const game = Game.create({ rng: () => 0.5 });
    const foundationView = game.foundations as unknown as Array<{
      suit: Suit | null;
      cards: Card[];
    }>;
    const firstFoundation = foundationView[0];
    const beforeState = getStateSnapshot(game);

    if (!firstFoundation) {
      throw new Error("Expected first foundation");
    }

    firstFoundation.suit = "hearts";
    firstFoundation.cards.push({ suit: "clubs", rank: "A", faceUp: true });

    const afterState = getStateSnapshot(game);
    const freshFoundation = game.foundations[0];

    if (!freshFoundation) {
      throw new Error("Expected first foundation");
    }

    expect(freshFoundation.suit).toBeNull();
    expect(freshFoundation.cards).toHaveLength(0);
    expect(afterState).toEqual(beforeState);
  });
});

describe("Game actions", () => {
  it("draws 3 cards from stock to waste and flips drawn cards face up", () => {
    const game = Game.create({ rng: () => 0.5 });

    const nextGame = game.draw();

    expect(nextGame.stock).toHaveLength(21);
    expect(nextGame.waste).toHaveLength(3);
    nextGame.waste.forEach((card) => {
      expect(card.faceUp).toBe(true);
    });
  });

  it("moves all stock cards to waste after 8 draws", () => {
    let game = Game.create({ rng: () => 0.5 });

    for (let drawIndex = 0; drawIndex < 8; drawIndex += 1) {
      game = game.draw();
    }

    expect(game.stock).toHaveLength(0);
    expect(game.waste).toHaveLength(24);
  });

  it("recycles waste into stock and draws in the same call", () => {
    let game = Game.create({ rng: () => 0.5 });

    for (let drawIndex = 0; drawIndex < 8; drawIndex += 1) {
      game = game.draw();
    }

    const wasteBeforeRecycle = game.waste;
    const expectedWasteKeys = wasteBeforeRecycle.slice(0, 3).map(getCardKey);

    const recycledGame = game.draw();
    const recycledWasteKeys = recycledGame.waste.map(getCardKey);

    expect(recycledGame.stock).toHaveLength(21);
    expect(recycledGame.waste).toHaveLength(3);
    expect(recycledWasteKeys).toEqual(expectedWasteKeys);
    recycledGame.waste.forEach((card) => {
      expect(card.faceUp).toBe(true);
    });
    recycledGame.stock.forEach((card) => {
      expect(card.faceUp).toBe(false);
    });
  });

  it("is a no-op by value when both stock and waste are empty", () => {
    const GameConstructor = Game as unknown as { new (state: GameState): Game };
    const emptyGame = new GameConstructor({
      stock: [],
      waste: [],
      foundations: [
        { suit: null, cards: [] },
        { suit: null, cards: [] },
        { suit: null, cards: [] },
        { suit: null, cards: [] },
      ],
      tableau: [[], [], [], [], [], [], []],
    });

    const nextGame = emptyGame.draw();

    expect(nextGame).toBe(emptyGame);
    expect(getStateSnapshot(nextGame)).toEqual(getStateSnapshot(emptyGame));
  });

  it("mutates current game state when drawing", () => {
    const game = Game.create({ rng: () => 0.5 });
    const beforeState = getStateSnapshot(game);

    const nextGame = game.draw();

    expect(nextGame).toBe(game);
    expect(getStateSnapshot(nextGame)).not.toEqual(beforeState);
  });

  it("throws Not implemented for move action methods in this branch", () => {
    const game = Game.create({ rng: () => 0.5 });

    expect(() => game.moveWasteToTableau(0)).toThrow("Not implemented");
    expect(() => game.moveWasteToFoundation(0)).toThrow("Not implemented");
    expect(() => game.moveTableauToTableau(0, 1)).toThrow("Not implemented");
    expect(() => game.moveTableauToFoundation(0, 0)).toThrow("Not implemented");
  });
});

describe("Game debug helpers", () => {
  it("returns the full game state as formatted JSON", () => {
    const game = Game.create({ rng: () => 0.5 });
    const debugOutput = game.debugString();
    const parsedState = JSON.parse(debugOutput);

    expect(parsedState).toEqual(getStateSnapshot(game));
  });
});
