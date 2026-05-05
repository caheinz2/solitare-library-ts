import { createOrderedDeck } from "../../src/deck.js";
import {
  assertConservedUniqueDeck,
  assertGameStateEquals,
} from "../test-assertions.js";
import {
  createCard,
  createFoundation,
  createFoundations,
  createGameWithNoState,
  createGameWithState,
  createTableau,
} from "../test-setup.js";
import { getStateSnapshot } from "../test-selectors.js";

describe("moveFoundationToTableau", () => {
  it("moves a king from foundation to an empty tableau pile", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("K", "clubs")]),
      }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0]).toEqual(createFoundation());
    expect(game.tableau[0]).toEqual([createCard("K", "clubs")]);
  });

  it("moves the top foundation card to a descending opposite-color tableau card", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("hearts", [createCard("6", "hearts")]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0]).toEqual(createFoundation());
    expect(game.tableau[0]).toEqual([
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
  });

  it("does not move card when the foundation is empty", () => {
    const game = createGameWithNoState();
    const beforeState = getStateSnapshot(game);

    game.moveFoundationToTableau(0, 0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move a non-king to an empty tableau pile", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("Q", "clubs")]),
      }),
    });
    const beforeState = getStateSnapshot(game);

    game.moveFoundationToTableau(0, 0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move a card onto a same-color tableau card", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("spades", [createCard("6", "spades")]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });
    const beforeState = getStateSnapshot(game);

    game.moveFoundationToTableau(0, 0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move a card when the rank is not descending by one", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("hearts", [createCard("5", "hearts")]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });
    const beforeState = getStateSnapshot(game);

    game.moveFoundationToTableau(0, 0);

    assertGameStateEquals(game, beforeState);
  });

  it("moves only the top foundation card", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("hearts", [
          createCard("5", "hearts"),
          createCard("6", "hearts"),
        ]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0]).toEqual(
      createFoundation("hearts", [createCard("5", "hearts")]),
    );
    expect(game.tableau[0]).toEqual([
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
  });

  it("clears the foundation suit when the last card is removed", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("K", "clubs")]),
      }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0]).toEqual(createFoundation());
  });

  it("preserves the foundation suit when cards remain", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("hearts", [
          createCard("5", "hearts"),
          createCard("6", "hearts"),
        ]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0].suit).toBe("hearts");
  });

  it("leaves the next foundation card face up after a successful move", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("hearts", [
          createCard("5", "hearts"),
          createCard("6", "hearts"),
        ]),
      }),
      tableau: createTableau({ 0: [createCard("7", "clubs")] }),
    });

    game.moveFoundationToTableau(0, 0);

    expect(game.foundations[0].cards).toEqual([createCard("5", "hearts")]);
  });

  it("preserves all 52 unique cards after a valid foundation-to-tableau move", () => {
    const cardToMove = createCard("K", "clubs");
    const remainingDeck = createOrderedDeck().filter(
      (card) =>
        card.rank !== cardToMove.rank || card.suit !== cardToMove.suit,
    );
    const game = createGameWithState({
      stock: [...remainingDeck],
      foundations: createFoundations({
        0: createFoundation("clubs", [cardToMove]),
      }),
    });

    game.moveFoundationToTableau(0, 0);

    assertConservedUniqueDeck(game);
  });
});
