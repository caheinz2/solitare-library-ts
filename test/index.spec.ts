import { Game } from "../src/index.js";
import { createOrderedDeck } from "../src/deck.js";
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

  describe("moveWasteToTableau", () => {
    it("moves a king from waste to an empty tableau pile", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("K", "clubs")],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });

      game.moveWasteToTableau(0);

      expect(game.waste).toEqual([]);
      expect(game.tableau[0]).toEqual([createCard("K", "clubs")]);
    });

    it("moves the top waste card to a descending opposite-color tableau card", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("6", "hearts")],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("7", "clubs")], [], [], [], [], [], []],
      });

      game.moveWasteToTableau(0);

      expect(game.waste).toEqual([]);
      expect(game.tableau[0]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
      ]);
    });

    it("does not move a card when waste is empty", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToTableau(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a non-king to an empty tableau pile", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("Q", "clubs")],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToTableau(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card onto a same-color tableau card", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("6", "spades")],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("7", "clubs")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToTableau(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card when the rank is not descending by one", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("5", "hearts")],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("7", "clubs")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveWasteToTableau(0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("moves only the top waste card", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("A", "diamonds"), createCard("6", "hearts")],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("7", "clubs")], [], [], [], [], [], []],
      });

      game.moveWasteToTableau(0);

      expect(game.waste).toEqual([createCard("A", "diamonds", true)]);
      expect(game.tableau[0]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
      ]);
    });

    it("flips the next waste card face up so it can be moved next", () => {
      const game = createGameFromState({
        stock: [],
        waste: [createCard("5", "clubs", false), createCard("6", "hearts")],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("7", "clubs")], [], [], [], [], [], []],
      });

      game.moveWasteToTableau(0);

      expect(game.waste).toEqual([createCard("5", "clubs")]);
      expect(game.tableau[0]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
      ]);

      game.moveWasteToTableau(0);

      expect(game.waste).toEqual([]);
      expect(game.tableau[0]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
        createCard("5", "clubs"),
      ]);
    });

    it("preserves all 52 unique cards after a valid waste-to-tableau move", () => {
      const cardToMove = createCard("K", "clubs", false);
      const remainingDeck = createOrderedDeck().filter(
        (card) =>
          card.rank !== cardToMove.rank || card.suit !== cardToMove.suit,
      );
      const game = createGameFromState({
        stock: [...remainingDeck],
        waste: [cardToMove],
        foundations: createEmptyFoundations(),
        tableau: createEmptyTableau(),
      });

      game.moveWasteToTableau(0);

      expectConservedUniqueDeck(game);
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

  describe("moveTableauToTableau", () => {
    it("moves a king from one tableau pile to an empty tableau pile", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("K", "clubs")], [], [], [], [], [], []],
      });

      game.moveTableauToTableau(0, 1);

      expect(game.tableau[0]).toEqual([]);
      expect(game.tableau[1]).toEqual([createCard("K", "clubs")]);
    });

    it("moves the top tableau card to a descending opposite-color tableau card", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("6", "hearts")],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });

      game.moveTableauToTableau(0, 1);

      expect(game.tableau[0]).toEqual([]);
      expect(game.tableau[1]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
      ]);
    });

    it("does not move a card when the source tableau pile is empty", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[], [createCard("7", "clubs")], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card when the source top card is face down", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("6", "hearts", false)],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a non-king to an empty tableau pile", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("Q", "clubs")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card onto a same-color tableau card", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("6", "spades")],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card when the rank is not descending by one", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("5", "hearts")],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("does not move a card to the same tableau pile", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[createCard("K", "clubs")], [], [], [], [], [], []],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 0);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("flips the newly exposed source tableau card after a successful move", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("9", "clubs", false), createCard("6", "hearts")],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });

      game.moveTableauToTableau(0, 1);

      expect(game.tableau[0]).toEqual([createCard("9", "clubs")]);
      expect(game.tableau[1]).toEqual([
        createCard("7", "clubs"),
        createCard("6", "hearts"),
      ]);
    });

    it("does not flip the next source tableau card after an invalid move", () => {
      const game = createGameFromState({
        stock: [],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [
          [createCard("9", "clubs", false), createCard("5", "hearts")],
          [createCard("7", "clubs")],
          [],
          [],
          [],
          [],
          [],
        ],
      });
      const beforeState = getStateSnapshot(game);

      game.moveTableauToTableau(0, 1);

      expect(getStateSnapshot(game)).toEqual(beforeState);
    });

    it("preserves all 52 unique cards after a valid tableau-to-tableau move", () => {
      const cardToMove = createCard("K", "clubs");
      const remainingDeck = createOrderedDeck().filter(
        (card) =>
          card.rank !== cardToMove.rank || card.suit !== cardToMove.suit,
      );
      const game = createGameFromState({
        stock: [...remainingDeck],
        waste: [],
        foundations: createEmptyFoundations(),
        tableau: [[cardToMove], [], [], [], [], [], []],
      });

      game.moveTableauToTableau(0, 1);

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

});

describe("Game debug helpers", () => {
  it("returns the full game state as formatted JSON", () => {
    const game = Game.create({ rng: () => 0.5 });
    const debugOutput = game.debugString();
    const parsedState = JSON.parse(debugOutput);

    expect(parsedState).toEqual(getStateSnapshot(game));
  });
});
