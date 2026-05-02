import { Game } from "../../src/index.js";
import {
  expectAllCardsFaceDirection,
  expectGameStateToEqual,
} from "../test-assertions.js";
import {
  createGameWithNoState,
  getCardKey,
  getStateSnapshot,
} from "../test-setup.js";

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
    const game = createGameWithNoState();

    const beforeState = getStateSnapshot(game);

    game.draw();

    expectGameStateToEqual(game, beforeState);
  });

  it("mutates current game state", () => {
    const game = Game.create({ rng: () => 0.5 });
    const beforeState = getStateSnapshot(game);

    game.draw();

    expect(getStateSnapshot(game)).not.toEqual(beforeState);
  });
});
