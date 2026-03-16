import { Game } from "../src/index.js";
import {
  expectAllCardsFaceDirection,
  expectConservedUniqueDeck,
} from "./test-assertions.js";
import {
  createCard,
  createEmptyFoundations,
  createEmptyTableau,
  createFoundation,
  createGameFromState,
  createSequenceRng,
  getCardKey,
  getStateSnapshot,
} from "./test-setup.js";

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

    expectAllCardsFaceDirection(game.stock, "down");
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
    const stockView = game.stock;
    const tableauView = game.tableau;
    const firstTableauCard = tableauView[0][0];

    if (!firstTableauCard) {
      throw new Error("Expected at least one card in tableau pile 0");
    }

    const beforeState = getStateSnapshot(game);

    stockView.push({ suit: "clubs", rank: "A", faceUp: false });
    firstTableauCard.faceUp = false;

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
    const foundationView = game.foundations;
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
  describe("drawCards", () => {
    it("draws 3 cards from stock to waste and flips drawn cards face up", () => {
      const game = Game.create({ rng: () => 0.5 });

      game.draw();

      expect(game.stock).toHaveLength(21);
      expect(game.waste).toHaveLength(3);
      expectAllCardsFaceDirection(game.waste, "up");
    });

    it("moves all stock cards to waste after 8 draws", () => {
      const game = Game.create({ rng: () => 0.5 });

      for (let drawIndex = 0; drawIndex < 8; drawIndex += 1) {
        game.draw();
      }

      expect(game.stock).toHaveLength(0);
      expect(game.waste).toHaveLength(24);
    });

    it("recycles waste into stock and draws in the same call", () => {
      const game = Game.create({ rng: () => 0.5 });

      for (let drawIndex = 0; drawIndex < 8; drawIndex += 1) {
        game.draw();
      }

      const wasteBeforeRecycle = game.waste;
      const expectedWasteKeys = wasteBeforeRecycle.slice(0, 3).map(getCardKey);

      game.draw();
      const recycledWasteKeys = game.waste.map(getCardKey);

      expect(game.stock).toHaveLength(21);
      expect(game.waste).toHaveLength(3);
      expect(recycledWasteKeys).toEqual(expectedWasteKeys);
      expectAllCardsFaceDirection(game.waste, "up");
      expectAllCardsFaceDirection(game.stock, "down");
    });

    it("does not draw cards when both stock and waste are empty", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.draw();

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("mutates current game state", () => {
      const game = Game.create({ rng: () => 0.5 });
      const beforeState = getStateSnapshot(game);

      game.draw();

      expect(getStateSnapshot(game)).not.toEqual(beforeState);
    });
  });

  describe("moveWasteToFoundation", () => {
    it("moves an ace from waste to an empty foundation", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("A", "clubs")],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });

      game.moveWasteToFoundation(0);

      expect(game.waste).toEqual([]);
      expect(game.foundations[0]).toEqual(
        createFoundation("clubs", [createCard("A", "clubs")]),
      );
    });

    it("moves the next same-suit rank from waste to foundation", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("2", "clubs")],
        foundations: [
          createFoundation("clubs", [createCard("A", "clubs")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: createEmptyTableau(),
      });

      game.moveWasteToFoundation(0);

      expect(game.waste).toEqual([]);
      expect(game.foundations[0]).toEqual(
        createFoundation("clubs", [
          createCard("A", "clubs"),
          createCard("2", "clubs"),
        ]),
      );
    });

    it("does not move card when waste is empty", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToFoundation(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when moving a non-ace to an empty foundation", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("2", "clubs")],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToFoundation(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when the card suit does not match", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("2", "hearts")],
        foundations: [
          createFoundation("clubs", [createCard("A", "clubs")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToFoundation(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when the card rank skips the next foundation rank", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("3", "clubs")],
        foundations: [
          createFoundation("clubs", [createCard("A", "clubs")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToFoundation(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("preserves all 52 unique cards after a valid waste-to-foundation move", () => {
      // TODO: revisit this test - not all rng seeds should pass, seems to indicate an issue with shuffling.
      const game = Game.create({ rng: () => 0.5 });

      for (let drawIndex = 0; drawIndex < 24; drawIndex += 1) {
        const topWasteCard = game.waste[game.waste.length - 1];

        if (topWasteCard?.rank === "A") {
          break;
        }

        game.draw();
      }

      const topWasteCard = game.waste[game.waste.length - 1];

      if (!topWasteCard || topWasteCard.rank !== "A") {
        throw new Error("Expected to find an ace on top of waste");
      }

      game.moveWasteToFoundation(0);

      expectConservedUniqueDeck(game);
    });
  });

  describe("moveTableauToFoundation", () => {
    it("moves an ace from tableau to an empty foundation", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("A", "hearts")], [], [], [], [], [], []],
      });

      game.moveTableauToFoundation(0, 0);

      expect(game.tableau[0]).toEqual([]);
      expect(game.foundations[0]).toEqual(
        createFoundation("hearts", [createCard("A", "hearts")]),
      );
    });

    it("moves the next same-suit rank from tableau to foundation", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: [
          createFoundation("hearts", [createCard("A", "hearts")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: [[createCard("2", "hearts")], [], [], [], [], [], []],
      });

      game.moveTableauToFoundation(0, 0);

      expect(game.tableau[0]).toEqual([]);
      expect(game.foundations[0]).toEqual(
        createFoundation("hearts", [
          createCard("A", "hearts"),
          createCard("2", "hearts"),
        ]),
      );
    });

    it("does not move card when the tableau pile is empty", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToFoundation(0, 0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when the tableau top card is face down", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("A", "hearts", false)], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToFoundation(0, 0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when the card suit does not match", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: [
          createFoundation("clubs", [createCard("A", "clubs")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: [[createCard("2", "hearts")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToFoundation(0, 0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move card when the card rank skips the next foundation rank", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: [
          createFoundation("hearts", [createCard("A", "hearts")]),
          createFoundation(),
          createFoundation(),
          createFoundation(),
        ],
        tableau: [[createCard("3", "hearts")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToFoundation(0, 0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("flips the newly exposed tableau top card after a successful move", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("4", "clubs", false), createCard("A", "hearts")],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
      });

      game.moveTableauToFoundation(0, 0);

      expect(game.tableau[0]).toEqual([createCard("4", "clubs")]);
      expect(game.foundations[0]).toEqual(
        createFoundation("hearts", [createCard("A", "hearts")]),
      );
    });

    it("does not flip the next tableau card after an invalid move", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("4", "clubs", false), createCard("2", "hearts")],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
      });

      game.moveTableauToFoundation(0, 0);

      expect(game.tableau[0]).toEqual([
        createCard("4", "clubs", false),
        createCard("2", "hearts"),
      ]);
      expect(game.foundations[0]).toEqual(createFoundation());
    });

    it("preserves all 52 unique cards after a valid tableau-to-foundation move", () => {
      const game = Game.create({ rng: () => 0.5 });

      game.moveTableauToFoundation(0, 0);

      expectConservedUniqueDeck(game);
    });
  });

  it("still throws Not implemented for move action methods not in scope", () => {
    const game = Game.create({ rng: () => 0.5 });

    expect(() => game.moveWasteToTableau(0)).toThrow("Not implemented");
    expect(() => game.moveTableauToTableau(0, 1)).toThrow("Not implemented");
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
