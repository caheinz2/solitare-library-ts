import { Game } from "../../src/index.js";
import { expectConservedUniqueDeck } from "../test-assertions.js";
import {
  createCard,
  createEmptyFoundations,
  createEmptyTableau,
  createFoundation,
  createGameFromState,
  getStateSnapshot,
} from "../test-setup.js";

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
