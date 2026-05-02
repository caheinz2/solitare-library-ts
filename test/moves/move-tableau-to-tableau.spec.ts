import { createOrderedDeck } from "../../src/deck.js";
import {
  expectConservedUniqueDeck,
  expectGameStateToEqual,
} from "../test-assertions.js";
import {
  createCard,
  createGameWithState,
  createTableau,
  getStateSnapshot,
} from "../test-setup.js";

describe("moveTableauToTableau", () => {
  it("moves a king from one tableau pile to an empty tableau pile", () => {
    const game = createGameWithState({
      tableau: createTableau({ 0: [createCard("K", "clubs")] }),
    });

    game.moveTableauToTableau(0, 1);

    expect(game.tableau[0]).toEqual([]);
    expect(game.tableau[1]).toEqual([createCard("K", "clubs")]);
  });

  it("moves the top tableau card to a descending opposite-color tableau card", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("6", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    game.moveTableauToTableau(0, 1);

    expect(game.tableau[0]).toEqual([]);
    expect(game.tableau[1]).toEqual([
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
  });

  it("moves a counted run from one tableau pile to another", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [
          createCard("9", "spades", false),
          createCard("7", "clubs"),
          createCard("6", "hearts"),
          createCard("5", "clubs"),
        ],
        1: [createCard("8", "diamonds")],
      }),
    });

    game.moveTableauToTableau(0, 1, 3);

    expect(game.tableau[0]).toEqual([createCard("9", "spades")]);
    expect(game.tableau[1]).toEqual([
      createCard("8", "diamonds"),
      createCard("7", "clubs"),
      createCard("6", "hearts"),
      createCard("5", "clubs"),
    ]);
  });

  it("only flips the newly exposed top card when face-down cards remain", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [
          createCard("10", "hearts", false),
          createCard("9", "spades", false),
          createCard("7", "clubs"),
          createCard("6", "hearts"),
          createCard("5", "clubs"),
        ],
        1: [createCard("8", "diamonds")],
      }),
    });

    game.moveTableauToTableau(0, 1, 3);

    expect(game.tableau[0]).toEqual([
      createCard("10", "hearts", false),
      createCard("9", "spades"),
    ]);
    expect(game.tableau[1]).toEqual([
      createCard("8", "diamonds"),
      createCard("7", "clubs"),
      createCard("6", "hearts"),
      createCard("5", "clubs"),
    ]);
  });

  it("does not reveal a face-down card when a face-up card remains on top", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [
          createCard("10", "hearts", false),
          createCard("8", "hearts"),
          createCard("7", "clubs"),
          createCard("6", "hearts"),
        ],
        1: [createCard("8", "diamonds")],
      }),
    });

    game.moveTableauToTableau(0, 1, 2);

    expect(game.tableau[0]).toEqual([
      createCard("10", "hearts", false),
      createCard("8", "hearts"),
    ]);
    expect(game.tableau[1]).toEqual([
      createCard("8", "diamonds"),
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
  });

  it("does not move cards when the count is zero", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("6", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1, 0);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move cards when the count exceeds the source pile size", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("6", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1, 2);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a counted run when the first moving card is face down", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("7", "clubs", false), createCard("6", "hearts")],
        1: [createCard("8", "diamonds")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1, 2);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a card when the source tableau pile is empty", () => {
    const game = createGameWithState({
      tableau: createTableau({ 1: [createCard("7", "clubs")] }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a card when the source top card is face down", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("6", "hearts", false)],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a non-king to an empty tableau pile", () => {
    const game = createGameWithState({
      tableau: createTableau({ 0: [createCard("Q", "clubs")] }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a card onto a same-color tableau card", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("6", "spades")],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a card when the rank is not descending by one", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("5", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("does not move a card to the same tableau pile", () => {
    const game = createGameWithState({
      tableau: createTableau({ 0: [createCard("K", "clubs")] }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 0);

    expectGameStateToEqual(game, beforeState);
  });

  it("flips the newly exposed source tableau card after a successful move", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("9", "clubs", false), createCard("6", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    game.moveTableauToTableau(0, 1);

    expect(game.tableau[0]).toEqual([createCard("9", "clubs")]);
    expect(game.tableau[1]).toEqual([
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
  });

  it("does not flip the next source tableau card after an invalid move", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [createCard("9", "clubs", false), createCard("5", "hearts")],
        1: [createCard("7", "clubs")],
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveTableauToTableau(0, 1);

    expectGameStateToEqual(game, beforeState);
  });

  it("preserves all 52 unique cards after a valid tableau-to-tableau move", () => {
    const cardToMove = createCard("K", "clubs");
    const remainingDeck = createOrderedDeck().filter(
      (card) =>
        card.rank !== cardToMove.rank || card.suit !== cardToMove.suit,
    );
    const game = createGameWithState({
      stock: [...remainingDeck],
      tableau: createTableau({ 0: [cardToMove] }),
    });

    game.moveTableauToTableau(0, 1);

    expectConservedUniqueDeck(game);
  });
});
