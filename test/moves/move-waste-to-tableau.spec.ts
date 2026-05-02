import { createOrderedDeck } from "../../src/deck.js";
import { expectConservedUniqueDeck } from "../test-assertions.js";
import {
  createCard,
  createEmptyFoundations,
  createEmptyTableau,
  createGameFromState,
  getStateSnapshot,
} from "../test-setup.js";

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

  it("does not move the top waste card when it is face down", () => {
    const game = createGameFromState({
      stock: [],
      waste: [createCard("K", "clubs", false)],
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
