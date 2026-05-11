import { jest } from "@jest/globals";
import {
  handleCommand,
  type AppState,
  type GameCommands,
} from "../src/commands.js";
import type { BoardView } from "../src/render-board.js";

const board: BoardView = {
  stockCount: 24,
  waste: [{ rank: "A", suit: "clubs", faceUp: true }],
  foundations: [
    { suit: "hearts", cards: [{ rank: "A", suit: "hearts", faceUp: true }] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
  ],
  tableau: [
    [{ rank: "K", suit: "spades", faceUp: true }],
    [
      { rank: "4", suit: "spades", faceUp: false },
      { rank: "5", suit: "hearts", faceUp: true },
      { rank: "6", suit: "clubs", faceUp: true },
    ],
    [],
    [],
    [],
    [],
    [],
  ],
};

const createGame = (): jest.Mocked<GameCommands> => ({
  draw: jest.fn(),
  moveWasteToTableau: jest.fn(),
  moveWasteToFoundation: jest.fn(),
  moveTableauToTableau: jest.fn(),
  moveTableauToFoundation: jest.fn(),
  moveFoundationToTableau: jest.fn(),
});

describe("handleCommand", () => {
  it("draws when pressing enter on stock", () => {
    const game = createGame();
    const state: AppState = {
      cursor: { kind: "stock" },
      selection: null,
      status: "",
    };

    const nextState = handleCommand("enter", state, board, game);

    expect(game.draw).toHaveBeenCalledTimes(1);
    expect(nextState.selection).toBeNull();
    expect(nextState.status).toBe("Drew from stock.");
  });

  it("moves waste to tableau after selecting waste and targeting tableau", () => {
    const game = createGame();
    const selected = handleCommand(
      "enter",
      { cursor: { kind: "waste" }, selection: null, status: "" },
      board,
      game,
    );

    const nextState = handleCommand(
      "enter",
      {
        ...selected,
        cursor: { kind: "tableau", tableauIndex: 0, cardIndex: 0 },
      },
      board,
      game,
    );

    expect(game.moveWasteToTableau).toHaveBeenCalledWith(0);
    expect(nextState.selection).toBeNull();
  });

  it("moves tableau runs using the selected card as the run start", () => {
    const game = createGame();
    const selected = handleCommand(
      "enter",
      {
        cursor: { kind: "tableau", tableauIndex: 1, cardIndex: 1 },
        selection: null,
        status: "",
      },
      board,
      game,
    );

    handleCommand(
      "enter",
      {
        ...selected,
        cursor: { kind: "tableau", tableauIndex: 0, cardIndex: 0 },
      },
      board,
      game,
    );

    expect(game.moveTableauToTableau).toHaveBeenCalledWith(1, 0, 2);
  });

  it("moves single tableau cards to foundations", () => {
    const game = createGame();
    const selected = handleCommand(
      "enter",
      {
        cursor: { kind: "tableau", tableauIndex: 1, cardIndex: 2 },
        selection: null,
        status: "",
      },
      board,
      game,
    );

    handleCommand(
      "enter",
      {
        ...selected,
        cursor: { kind: "foundation", foundationIndex: 0 },
      },
      board,
      game,
    );

    expect(game.moveTableauToFoundation).toHaveBeenCalledWith(1, 0);
  });

  it("clears selection with escape", () => {
    const game = createGame();
    const state: AppState = {
      cursor: { kind: "waste" },
      selection: { kind: "waste" },
      status: "Selected waste.",
    };

    const nextState = handleCommand("escape", state, board, game);

    expect(nextState.selection).toBeNull();
    expect(nextState.status).toBe("Selection cleared.");
  });
});
