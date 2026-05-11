import { jest } from "@jest/globals";
import { SolitaireCliApp, type RenderSink } from "../src/app.js";
import type { BoardView } from "../src/render-board.js";
import type { GameLike } from "../src/commands.js";

const board: BoardView = {
  stockCount: 1,
  waste: [],
  foundations: [
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
  ],
  tableau: [[], [], [], [], [], [], []],
};

const createGame = (): jest.Mocked<GameLike> & { isWon: boolean } => ({
  draw: jest.fn(),
  moveWasteToTableau: jest.fn(),
  moveWasteToFoundation: jest.fn(),
  moveTableauToTableau: jest.fn(),
  moveTableauToFoundation: jest.fn(),
  moveFoundationToTableau: jest.fn(),
  isWon: false,
});

const createSink = (): jest.Mocked<RenderSink> => ({
  render: jest.fn(),
  exit: jest.fn(),
});

describe("SolitaireCliApp", () => {
  it("renders the initial board", () => {
    const sink = createSink();

    new SolitaireCliApp(createGame(), () => board, sink).start();

    expect(sink.render).toHaveBeenCalledWith(expect.stringContaining("Stock:"));
  });

  it("handles arrow keys and enter without a real TTY", () => {
    const game = createGame();
    const sink = createSink();
    const app = new SolitaireCliApp(game, () => board, sink);

    app.handleKey("right");
    app.handleKey("left");
    app.handleKey("return");

    expect(game.draw).toHaveBeenCalledTimes(1);
    expect(sink.render).toHaveBeenCalled();
  });

  it("exits on q", () => {
    const sink = createSink();
    const app = new SolitaireCliApp(createGame(), () => board, sink);

    app.handleKey("q");

    expect(sink.exit).toHaveBeenCalledTimes(1);
  });
});
