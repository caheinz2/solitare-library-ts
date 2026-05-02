import { Game } from "../../src/index.js";
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
  getStateSnapshot,
} from "../test-setup.js";

describe("moveWasteToFoundation", () => {
  it("moves an ace from waste to an empty foundation", () => {
    const game = createGameWithState({
      waste: [createCard("A", "clubs")],
    });

    game.moveWasteToFoundation(0);

    expect(game.waste).toEqual([]);
    expect(game.foundations[0]).toEqual(
      createFoundation("clubs", [createCard("A", "clubs")]),
    );
  });

  it("moves the next same-suit rank from waste to foundation", () => {
    const game = createGameWithState({
      waste: [createCard("2", "clubs")],
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("A", "clubs")]),
      }),
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
    const game = createGameWithNoState();

    const beforeState = getStateSnapshot(game);

    game.moveWasteToFoundation(0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move card when moving a non-ace to an empty foundation", () => {
    const game = createGameWithState({
      waste: [createCard("2", "clubs")],
    });

    const beforeState = getStateSnapshot(game);

    game.moveWasteToFoundation(0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move card when the card suit does not match", () => {
    const game = createGameWithState({
      waste: [createCard("2", "hearts")],
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("A", "clubs")]),
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveWasteToFoundation(0);

    assertGameStateEquals(game, beforeState);
  });

  it("does not move card when the card rank skips the next foundation rank", () => {
    const game = createGameWithState({
      waste: [createCard("3", "clubs")],
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("A", "clubs")]),
      }),
    });

    const beforeState = getStateSnapshot(game);

    game.moveWasteToFoundation(0);

    assertGameStateEquals(game, beforeState);
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

    assertConservedUniqueDeck(game);
  });
});
