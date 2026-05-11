import { renderBoard, type BoardView } from "../src/render-board.js";

describe("renderBoard", () => {
  it("renders stock, top waste, foundation tops, and tableau columns", () => {
    const board: BoardView = {
      stockCount: 24,
      waste: [{ rank: "7", suit: "hearts", faceUp: true }],
      foundations: [
        { suit: "clubs", cards: [{ rank: "A", suit: "clubs", faceUp: true }] },
        { suit: null, cards: [] },
        { suit: null, cards: [] },
        { suit: null, cards: [] },
      ],
      tableau: [
        [{ rank: "K", suit: "hearts", faceUp: true }],
        [
          { rank: "4", suit: "spades", faceUp: false },
          { rank: "6", suit: "clubs", faceUp: true },
        ],
        [{ rank: "5", suit: "diamonds", faceUp: true }],
        [],
        [],
        [],
        [],
      ],
    };

    const output = renderBoard(board);

    expect(output).toContain("Stock: [##] 24");
    expect(output).toContain("Waste: 7H (1)");
    expect(output).toContain("Foundations: AC [ ] [ ] [ ]");
    expect(output).toContain("T1");
    expect(output).toContain("T7");
    expect(output).toContain("KH");
    expect(output).toContain("##        5D");
    expect(output).toContain("          6C");
  });

  it("renders empty stock and waste placeholders", () => {
    const board: BoardView = {
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

    const output = renderBoard(board);

    expect(output).toContain("Stock: [ ] 0");
    expect(output).toContain("Waste: [ ] (0)");
  });
});
