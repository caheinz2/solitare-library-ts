import { moveCursor } from "../src/cursor.js";
import type { BoardCursor, BoardView } from "../src/types/index.js";

const emptyBoard: BoardView = {
  stockCount: 0,
  waste: [],
  foundations: [
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
    { suit: null, cards: [] },
  ],
  tableau: [[], [], [], [], [], [], []],
};

describe("moveCursor", () => {
  it("moves horizontally across the top row", () => {
    expect(moveCursor({ kind: "stock" }, "right", emptyBoard)).toEqual({
      kind: "waste",
    });
    expect(moveCursor({ kind: "waste" }, "right", emptyBoard)).toEqual({
      kind: "foundation",
      foundationIndex: 0,
    });
    expect(
      moveCursor({ kind: "foundation", foundationIndex: 0 }, "left", emptyBoard),
    ).toEqual({ kind: "waste" });
  });

  it("moves horizontally across tableau piles", () => {
    const cursor: BoardCursor = {
      kind: "tableau",
      tableauIndex: 3,
      cardIndex: null,
    };

    expect(moveCursor(cursor, "left", emptyBoard)).toEqual({
      kind: "tableau",
      tableauIndex: 2,
      cardIndex: null,
    });
    expect(moveCursor(cursor, "right", emptyBoard)).toEqual({
      kind: "tableau",
      tableauIndex: 4,
      cardIndex: null,
    });
  });

  it("moves vertically only through face-up tableau cards", () => {
    const board: BoardView = {
      ...emptyBoard,
      tableau: [
        [
          { rank: "4", suit: "spades", faceUp: false },
          { rank: "5", suit: "hearts", faceUp: false },
          { rank: "6", suit: "clubs", faceUp: true },
          { rank: "7", suit: "diamonds", faceUp: true },
        ],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    };

    expect(
      moveCursor(
        { kind: "tableau", tableauIndex: 0, cardIndex: 3 },
        "up",
        board,
      ),
    ).toEqual({ kind: "tableau", tableauIndex: 0, cardIndex: 2 });

    expect(
      moveCursor(
        { kind: "tableau", tableauIndex: 0, cardIndex: 2 },
        "up",
        board,
      ),
    ).toEqual({ kind: "stock" });

    expect(
      moveCursor(
        { kind: "tableau", tableauIndex: 0, cardIndex: 2 },
        "down",
        board,
      ),
    ).toEqual({ kind: "tableau", tableauIndex: 0, cardIndex: 3 });
  });

  it("lands on the top face-up card when moving down into tableau", () => {
    const board: BoardView = {
      ...emptyBoard,
      tableau: [
        [
          { rank: "4", suit: "spades", faceUp: false },
          { rank: "5", suit: "hearts", faceUp: true },
        ],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    };

    expect(moveCursor({ kind: "stock" }, "down", board)).toEqual({
      kind: "tableau",
      tableauIndex: 0,
      cardIndex: 1,
    });
  });
});
