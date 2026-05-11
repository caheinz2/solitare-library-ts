import { jest } from "@jest/globals";
import { SolitaireCliApp } from "../src/app.js";
import type {
  GameCommands,
  PlayableGame,
  RenderSink,
} from "../src/types/index.js";

const createGame = (): jest.Mocked<GameCommands> & PlayableGame => ({
  draw: jest.fn(),
  moveWasteToTableau: jest.fn(),
  moveWasteToFoundation: jest.fn(),
  moveTableauToTableau: jest.fn(),
  moveTableauToFoundation: jest.fn(),
  moveFoundationToTableau: jest.fn(),
  isWon: false,
  stock: [{ rank: "A", suit: "clubs", faceUp: false }],
  waste: [],
  foundations: [
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
  ],
  tableau: [[], [], [], [], [], [], []],
});

const createSink = (): jest.Mocked<RenderSink> => ({
  render: jest.fn(),
  exit: jest.fn(),
});

describe("SolitaireCliApp", () => {
  it("renders the initial board", () => {
    const sink = createSink();

    new SolitaireCliApp(createGame(), sink).start();

    expect(sink.render).toHaveBeenCalledWith(expect.stringContaining("Stock:"));
  });

  it("handles arrow keys and enter without a real TTY", () => {
    const game = createGame();
    const sink = createSink();
    const app = new SolitaireCliApp(game, sink);

    app.handleKey("right");
    app.handleKey("left");
    app.handleKey("return");

    expect(game.draw).toHaveBeenCalledTimes(1);
    expect(sink.render).toHaveBeenCalled();
  });

  it("exits on q", () => {
    const sink = createSink();
    const app = new SolitaireCliApp(createGame(), sink);

    app.handleKey("q");

    expect(sink.exit).toHaveBeenCalledTimes(1);
  });
});
