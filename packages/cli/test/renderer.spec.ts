import { renderBoard } from "../src/renderer.js";
import type { Cursor, Selection } from "../src/types.js";
import {
  createCard,
  createFoundation,
  createFoundations,
  createGameView,
  createTableau,
} from "./test-setup.js";

describe("renderBoard", () => {
  const cursor: Cursor = { area: "stock" };

  it("renders stock, waste, foundations, and tableau labels", () => {
    const output = renderBoard({
      view: createGameView(),
      cursor,
      selection: null,
      status: "Ready",
    });

    expect(output).toContain("Stock");
    expect(output).toContain("Waste");
    expect(output).toContain("F1");
    expect(output).toContain("T1");
    expect(output).toContain("Ready");
  });

  it("formats face-up, face-down, and empty cards", () => {
    const output = renderBoard({
      view: createGameView({
        stock: [createCard("A", "clubs", false)],
        waste: [createCard("10", "hearts")],
        tableau: createTableau({
          0: [createCard("7", "spades", false), createCard("6", "diamonds")],
        }),
      }),
      cursor,
      selection: null,
      status: "",
    });

    expect(output).toContain("[##]");
    expect(output).toContain("[10H]");
    expect(output).toContain("[6D]");
    expect(output).toContain("[  ]");
  });

  it("renders foundation top cards", () => {
    const output = renderBoard({
      view: createGameView({
        foundations: createFoundations({
          0: createFoundation("clubs", [
            createCard("A", "clubs"),
            createCard("2", "clubs"),
          ]),
        }),
      }),
      cursor: { area: "foundation", foundationIndex: 0 },
      selection: null,
      status: "",
    });

    expect(output).toContain("F1");
    expect(output).toContain("[2C]");
  });

  it("marks the cursor and selected source", () => {
    const selection: Selection = { source: "waste" };
    const output = renderBoard({
      view: createGameView({
        waste: [createCard("Q", "spades")],
      }),
      cursor: { area: "waste" },
      selection,
      status: "",
    });

    expect(output).toContain(">[QS]<");
    expect(output).toContain("*Waste");
  });

  it("shows the win message when the game is won", () => {
    const output = renderBoard({
      view: createGameView({ isWon: true }),
      cursor,
      selection: null,
      status: "",
    });

    expect(output).toContain("You won!");
  });
});
